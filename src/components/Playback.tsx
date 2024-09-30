import { BiRegularPlay, BiRegularPause } from "solid-icons/bi";
import { AiFillStepForward, AiFillStepBackward } from "solid-icons/ai";
import { BiRegularVolumeFull } from "solid-icons/bi";
import { activeAudio } from "~/store/store";
import { useAudio } from "./AudioContext";

const PlayBack = () => {
  const { loading, trackProgress, isAudioPlaying, audioDuration, togglePlay, handleSkipForward, handleSkipBackward, handleTrackChange, handleVolumeChange } = useAudio();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div class="h-20 bg-zinc-800 flex items-center">
      <div class="w-1/5 ml-16 h-full p-2 flex flex-col items-center justify-center text-center">
        <div class="truncate w-full mb-1">
          <span class="block whitespace-nowrap overflow-hidden text-ellipsis text-center">
            {loading() ? "Loading..." : `${activeAudio?.title ?? "n/A"}`}
          </span>
        </div>
        <div class="truncate w-full" style={{ width: "200px" }}>
          <span class="block whitespace-nowrap overflow-hidden text-ellipsis text-center text-sm font-thin">
            {loading() ? "Hold on!" : activeAudio?.path ?? "n/A"}
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
          />
          <span class="text-sm ml-2 w-12 text-left">
            {formatTime(audioDuration())}
          </span>
        </div>
      </div>
      <div class="w-1/5 p-2 flex flex-row justify-start">
        <BiRegularVolumeFull size={28} class="mr-2" />
        <input type="range" min="0" max="1" step="0.01"onInput={handleVolumeChange} class="w-1/2" />
      </div>
    </div>
  );
};

export default PlayBack;