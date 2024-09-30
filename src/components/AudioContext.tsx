import { invoke } from "@tauri-apps/api/tauri";
import { createContext, createEffect, createSignal, ParentProps, useContext } from "solid-js";
import { activeAudio } from "~/store/store";

interface AudioContextType {
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
}

const AudioContext = createContext<AudioContextType>();


export const AudioProvider  = (props: ParentProps) => {
  const [audioUrl, setAudioUrl] = createSignal("");
  const [trackProgress, setTrackProgress] = createSignal(0);
  let audioRef: HTMLAudioElement | undefined;
  const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
  const [audioDuration, setAudioDuration] = createSignal(0);
  const [loading, setLoading] = createSignal(false);

  createEffect(async () => {
    try {
      setLoading(true);
      const audioData: string = await invoke("get_audio_data", { filePath: activeAudio?.path });
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
  }, audioUrl);

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
    if (audioRef) {
      audioRef.currentTime += 10;
    }
  };

  const handleSkipBackward = () => {
    if (audioRef) {
      audioRef.currentTime -= 10;
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
    <AudioContext.Provider value={{ loading, audioUrl, trackProgress, isAudioPlaying, audioDuration, togglePlay, handleSkipForward, handleSkipBackward, handleTrackChange, handleVolumeChange}}>
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