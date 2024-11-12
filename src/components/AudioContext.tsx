import { createContext, createEffect, createSignal, ParentProps, useContext } from "solid-js";
import { buildBlob } from "~/utils/helper";
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
  handleTrackChange: (_event: Event) => void;
  handleVolumeChange: (_event: Event) => void;
  setActiveAudio: (_audio_item: Audio) => void;
  togglePlaybackMode: () => void;
  playbackStatus: () => string;
  setActivePlaylist: (_playlist: Audio[]) => void;
  isMuted: () => boolean;
  handleVolumeMute: () => void;
}

// this context is used globally to handle audio playback
const AudioContext = createContext<AudioContextType>();

export const AudioProvider  = (props: ParentProps) => {
  /* States and references */
  const [audioUrl, setAudioUrl] = createSignal("");
  const [trackProgress, setTrackProgress] = createSignal(0);
  const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
  const [audioDuration, setAudioDuration] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [activeAudio, setActiveAudio] = createSignal<Audio>({} as Audio);
  const [activePlaylist, setActivePlaylist] = createSignal<Audio[]>([]);
  const [playbackStatus, setPlaybackStatus] = createSignal("default");
  const [isMuted, setIsMuted] = createSignal(false);
  let audioRef!: HTMLAudioElement;

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

  /* Functions */

  // sets shuffle/repeat mode
  const togglePlaybackMode = () => {
    setPlaybackStatus(playbackStatus() === "default" ? "shuffle" : playbackStatus() === "shuffle" ? "repeat" : "default");
  }

  const handleSkipForward = () => {
    if (audioRef && activeAudio && activePlaylist) {
      audioRef.pause();
      let index = activePlaylist().findIndex((audio_item) => audio_item.id === activeAudio()?.id);
      index = (index + 1) % activePlaylist().length;
      setActiveAudio(activePlaylist()[index]); 
    }
  };

  const handleSkipBackward = () => {
    if (audioRef && activeAudio && activePlaylist) {
      audioRef.pause(); 
      let index = activePlaylist().findIndex((audio_item) => audio_item.id === activeAudio()?.id);
      index = (index - 1 + activePlaylist().length) % activePlaylist().length;
      setActiveAudio(activePlaylist()[index]); 
    }
  };

  // used to update track progress per tick
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

  const handleVolumeMute = () => {
    if (audioRef) {
      audioRef.muted = !audioRef.muted;
    }
  }

  /* Effects and events */
  createEffect(async () => {
    if(activeAudio() && activePlaylist()) {
      try {
        setLoading(true);
        const audioBlob = await buildBlob(activeAudio()?.path, activeAudio()?.audio_type);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
  
        audioRef.addEventListener("loadedmetadata", () => {
          setAudioDuration(audioRef.duration);
        });
          
        audioRef.addEventListener("timeupdate", () => {
          setTrackProgress(audioRef.currentTime);
        });
        
        audioRef.addEventListener("play", () => {
          setIsAudioPlaying(true);
        });
        
        audioRef.addEventListener("pause", () => {
          setIsAudioPlaying(false);
        });

        audioRef.addEventListener("volumechange", () => {
          setIsMuted(audioRef.muted || audioRef.volume === 0);
        })

        audioRef.addEventListener("ended", () => {
          if (!loading()) {
            if(playbackStatus() === "shuffle") {
              const randomIndex = Math.floor(Math.random() * activePlaylist().length);
              setActiveAudio(activePlaylist()[randomIndex]);
            } else if(playbackStatus() === "repeat") {
              audioRef.currentTime = 0;
              audioRef.play();
            } else {
              handleSkipForward();
            }
          }
        });

        if(audioRef.HAVE_ENOUGH_DATA) {
          audioRef.play();
        }
      } catch (error) {
        return error;
      } finally {
        setLoading(false);
      }
    }
  }, activeAudio);

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
      playbackStatus,
      setActivePlaylist,
      isMuted,
      handleVolumeMute
    }}>
      <audio ref={audioRef} src={audioUrl()} id="audio"/>
      {props.children}
    </AudioContext.Provider>
  );
};

// build context
export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};