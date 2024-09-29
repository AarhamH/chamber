import { createEffect, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { BiRegularPlay, BiRegularPause } from "solid-icons/bi";
import { AiFillStepForward, AiFillStepBackward } from "solid-icons/ai";
import { BiRegularVolumeFull } from "solid-icons/bi";
import { activeAudio } from "~/store/store";

const PlayBack = () => {
  const [audioUrl, setAudioUrl] = createSignal("");
  const [trackProgress, setTrackProgress] = createSignal(0);
  let audioRef: HTMLAudioElement | undefined;
  const [isAudioPlaying, setIsAudioPlaying] = createSignal(false);
  const [audioDuration, setAudioDuration] = createSignal(0);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  createEffect(async () => {
    try {
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
    }
  }, [activeAudio]);

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
      audioRef.currentTime += 10; // Skip forward 10 seconds
    }
  };

  const handleSkipBackward = () => {
    if (audioRef) {
      audioRef.currentTime -= 10; // Skip backward 10 seconds
    }
  };

  const handleTrackChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (audioRef) {
      audioRef.currentTime = parseFloat(target.value);
    }
  };

  return (
    <div class="h-20 bg-zinc-800 flex items-center">
      <audio ref={audioRef} src={audioUrl()} id="audio" />
      <div class="w-1/5 ml-16 h-full p-2 flex flex-col items-center justify-center text-center">
        <div class="truncate w-full mb-1">
          <span class="block whitespace-nowrap overflow-hidden text-ellipsis text-center">
            {activeAudio?.title ?? "n/A"}
          </span>
        </div>
        <div class="truncate w-full">
          <span class="block whitespace-nowrap overflow-hidden text-ellipsis text-center text-sm font-thin">
            {activeAudio?.path?? "n/A"}
          </span>
        </div>
      </div>
      <div class="w-3/5 p-2 flex flex-col items-center justify-center">
        <div class="flex flex-row items-center justify-center space-x-4">
          <AiFillStepBackward size={36} onClick={handleSkipBackward} />
          {isAudioPlaying() ? (
            <BiRegularPause size={50} onClick={togglePlay} />
          ) : (
            <BiRegularPlay size={50} onClick={togglePlay} />
          )}
          <AiFillStepForward size={36} onClick={handleSkipForward} />
        </div>
        <div class="flex items-center w-full">
          <span class="text-sm mr-2 w-12 text-right">
            {formatTime(trackProgress())}
          </span>
          <input
            type="range"
            min={0}
            max={audioDuration() || 100}
            value={trackProgress()}
            onInput={handleTrackChange}
            class="flex-grow"
            style={{ width: "calc(100% - 96px)" }} // Adjust based on label widths
          />
          <span class="text-sm ml-2 w-12 text-left">
            {formatTime(audioDuration())}
          </span>
        </div>
      </div>
      <div class="w-1/5 p-2 flex flex-row justify-start">
        <BiRegularVolumeFull size={28} class="mr-2" />
        <input type="range" min={0} max={100} class="w-1/2" />
      </div>
    </div>
  );
};

export default PlayBack;