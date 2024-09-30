import { invoke } from "@tauri-apps/api/tauri";
import { createContext, createEffect, createSignal, ParentProps, useContext } from "solid-js";
import { musicInPlaylist } from "~/store/store";
import { Music } from "~/utils/types";

interface AudioContextType {
  activeAudio: () => Music;
  loading: () => boolean; 
  audioUrl: () => string;
  trackProgress: () => number;
  isAudioPlaying: () => boolean;
  audioDuration: () => number;
  togglePlay: () => void;
  handleSkipForward: () => void;
  handleSkipBackward: () => void;
  // eslint-disable-next-line no-unused-vars
  handleTrackChange: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  handleVolumeChange: (event: Event) => void;
  // eslint-disable-next-line no-unused-vars
  setActiveAudio: (audio: Music) => void;
}

const AudioContext = createContext<AudioContextType>();


export const AudioProvider  = (props: ParentProps) => {
  const [audioUrl, setAudioUrl] = createSignal("");
  const [trackProgress, setTrackProgress] = createSignal(0);
  let audioRef: HTMLAudioElement | undefined;
  const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
  const [audioDuration, setAudioDuration] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [activeAudio, setActiveAudio] = createSignal<Music>({} as Music);
  const [activePlaylist, setActivePlaylist] = createSignal<Music[]>([]);

  createEffect(async () => {
    if(activeAudio) {
      try {
        setLoading(true);
        setActivePlaylist(() => musicInPlaylist);
        const audioData: string = await invoke("get_audio_data", { filePath: activeAudio()?.path });
        // Decode the base64 string to binary
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
      
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
  
        // Create a Blob from the Uint8Array
        const audioBlob = new Blob([byteArray], { type: "audio/mp3" }); // Adjust the type according to your audio format
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
  
        if (audioRef) {
          audioRef.addEventListener("loadedmetadata", () => {
            setAudioDuration(audioRef.duration);
          });
          
          audioRef.addEventListener("ended", () => {
            handleSkipForward();
          });
          
          audioRef.addEventListener("timeupdate", () => {
            setTrackProgress(audioRef.currentTime);
          });
        
          audioRef.play();
          audioRef.addEventListener("play", () => {
            setIsAudioPlaying(true);
          });
  
          audioRef.addEventListener("pause", () => {
            setIsAudioPlaying(false);
          });
        }
      } catch (error) {
        return error;
      } finally {
        setLoading(false);
      }
    }
  }, activeAudio);

  const togglePlay = () => {
    if(audioRef) {
      if (audioRef.paused) {
        audioRef.play();
      }
      else {
        audioRef.pause();
      }
    }
  };

  const handleSkipForward = () => {
    if (audioRef && activeAudio && activePlaylist) {
      let index = activePlaylist().findIndex((audio) => audio.id === activeAudio()?.id);
      index = (index + 1) % activePlaylist().length;
      setActiveAudio(activePlaylist()[index]); 
    }
  };

  const handleSkipBackward = () => {
    if (audioRef && activeAudio && activePlaylist) {
      let index = activePlaylist().findIndex((audio) => audio.id === activeAudio()?.id);
      index = (index - 1 + activePlaylist().length) % activePlaylist().length;
      setActiveAudio(activePlaylist()[index]); 
    }
  };

  const handleTrackChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (audioRef) {
      audioRef.currentTime = parseFloat(target.value);
    }
  };

  const handleVolumeChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (audioRef) {
      audioRef.volume = parseFloat(target.value);
    }
  };

  return (
    <AudioContext.Provider value={{ activeAudio, loading, audioUrl, trackProgress, isAudioPlaying, audioDuration, togglePlay, handleSkipForward, handleSkipBackward, handleTrackChange, handleVolumeChange, setActiveAudio}}>
      <audio ref={audioRef} src={audioUrl()} id="audio"/>
      {props.children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};