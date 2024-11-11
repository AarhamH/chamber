import { invoke } from "@tauri-apps/api/tauri";
import { createContext, createEffect, createSignal, ParentProps, useContext } from "solid-js";
import { audioInPlaylist } from "~/store/store";
import { Audio } from "~/utils/types";

interface AudioContextType {
  activeAudio: () => Audio;
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
  setActiveAudio: (audio_item: Audio) => void;
  togglePlaybackMode: () => void;
  playbackStatus: () => string;
}

const AudioContext = createContext<AudioContextType>();


export const AudioProvider  = (props: ParentProps) => {
  const [audioUrl, setAudioUrl] = createSignal("");
  const [trackProgress, setTrackProgress] = createSignal(0);
  let audioRef: HTMLAudioElement | undefined;
  const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
  const [audioDuration, setAudioDuration] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [activeAudio, setActiveAudio] = createSignal<Audio>({} as Audio);
  const [activePlaylist, setActivePlaylist] = createSignal<Audio[]>([]);

  const [playbackStatus, setPlaybackStatus] = createSignal("default");

  createEffect(async () => {
    if(activeAudio) {
      try {
        setLoading(true);
        setActivePlaylist(() => audioInPlaylist);
        const audioData: string = await invoke("read_audio_buffer", { filePath: activeAudio()?.path });
        // Decode the base64 string to binary
        const byteCharacters = atob(audioData);
        const byteNumbers = new Array(byteCharacters.length);
      
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const getMimeType = (format: string): string => {
          switch (format.toLowerCase()) {
            case "mp3":
              return "audio/mp3";
            case "opus":
              return "audio/opus";
            case "ogg":
              return "audio/ogg";
            case "flac":
              return "audio/flac";
            case "m4a":
              return "audio/m4a";
            case "m4b":
              return "audio/m4b";
            default:
              throw new Error("Unsupported audio format");
          }
        };
        const mimeType = getMimeType(activeAudio()?.audio_type);        
        // Create a Blob from the Uint8Array
        const audioBlob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
  
        if (audioRef) {
          audioRef.addEventListener("loadedmetadata", () => {
            setAudioDuration(audioRef.duration);
          });
          
          audioRef.addEventListener("ended", () => {
            if(playbackStatus() === "shuffle") {
              handleRandomSkip();
            } else if(playbackStatus() === "repeat") {
              audioRef.currentTime = 0;
              audioRef.play();
            } else {
              handleSkipForward();
            }
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

  const togglePlaybackMode = () => {
    setPlaybackStatus(playbackStatus() === "default" ? "shuffle" : playbackStatus() === "shuffle" ? "repeat" : "default");
  }

  const handleSkipForward = () => {
    if (audioRef && activeAudio && activePlaylist) {
      let index = activePlaylist().findIndex((audio_item) => audio_item.id === activeAudio()?.id);
      index = (index + 1) % activePlaylist().length;
      setActiveAudio(activePlaylist()[index]); 
    }
  };

  const handleSkipBackward = () => {
    if (audioRef && activeAudio && activePlaylist) {
      let index = activePlaylist().findIndex((audio_item) => audio_item.id === activeAudio()?.id);
      index = (index - 1 + activePlaylist().length) % activePlaylist().length;
      setActiveAudio(activePlaylist()[index]); 
    }
  };

  const handleRandomSkip = () => {
    if (audioRef && activeAudio() && activePlaylist) {
      const index = Math.floor(Math.random() * activePlaylist().length);
      setActiveAudio(activePlaylist()[index]); 
    }
  }

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
    <AudioContext.Provider value={{ 
      activeAudio, 
      loading, 
      audioUrl, 
      trackProgress, 
      isAudioPlaying, 
      audioDuration, 
      togglePlay, 
      handleSkipForward, 
      handleSkipBackward, 
      handleTrackChange, 
      handleVolumeChange, 
      setActiveAudio, 
      togglePlaybackMode,
      playbackStatus}}>
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