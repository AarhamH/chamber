import { useColorMode } from "@kobalte/core";
import { AiFillStepForward, AiFillStepBackward } from "solid-icons/ai";
import { BiRegularPlay, BiRegularPause, BiRegularVolumeFull, BiRegularVolumeMute, BiRegularLoaderCircle} from "solid-icons/bi";
import { TbArrowsShuffle, TbMoon, TbRepeat, TbRepeatOnce, TbSun } from "solid-icons/tb"
import { Button } from "~/components/solidui/Button";
import { useAudio } from "~/components/AudioContext";
import { formatTime } from "~/utils/helper";

export const PlayBack = () => {
  /* States and references */
  const { 
    activeAudio, 
    loading, 
    trackProgress, 
    isAudioPlaying, 
    audioDuration, 
    togglePlay, 
    handleSkipForward, 
    handleSkipBackward, 
    handleTrackChange, 
    handleVolumeChange, 
    togglePlaybackMode, 
    playbackStatus,
    isMuted,
    handleVolumeMute 
  } = useAudio();

  const { colorMode, setColorMode } = useColorMode();

  return (
    <div class="bg-playback h-20 flex items-center">
      <div class="w-1/5 ml-16 h-full p-2 flex flex-col items-center justify-center text-center">
        <div class="truncate w-full mb-1">
          <span class="flex items-center justify-center whitespace-nowrap overflow-hidden">
            {loading() ? <BiRegularLoaderCircle size={"1.5em"} class="animate-spin" /> : `${activeAudio()?.title ?? "n/A"}`}
          </span>
        </div>
        <div class="truncate w-full">
          <span class="block whitespace-nowrap overflow-hidden text-ellipsis text-center text-sm font-thin">
            {loading() ? "Hold on!" : activeAudio()?.path ?? "n/A"}
          </span>
        </div>
      </div>
      <div class="w-3/5 p-2 flex flex-col items-center justify-center">
        <div class="flex flex-row items-center justify-between space-x-4">
          <AiFillStepBackward size={"1.5em"} onClick={handleSkipBackward} />
          {isAudioPlaying() ? (
            <BiRegularPause size={"2em"} onClick={togglePlay} />
          ) : (
            <BiRegularPlay size={"2em"} onClick={togglePlay} />
          )}
          <AiFillStepForward size={"1.5em"} onClick={handleSkipForward} />
        </div>
        <div class="flex items-center w-3/4">
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
          <div class="hover:cursor-pointer" onClick={togglePlaybackMode}>
            {playbackStatus() === "shuffle" ? 
              <TbArrowsShuffle size={"1em"} /> : playbackStatus() === "repeat" ? <TbRepeatOnce size={"1em"} /> : <TbRepeat size={"1em"} />}
          </div>
        </div>
      </div>
      <div class="w-1/5 p-2 flex flex-row justify-start items-center">
        <div class="hover:cursor-pointer" onClick={handleVolumeMute}>
          {isMuted() ? <BiRegularVolumeMute size={"1.2em"} /> : <BiRegularVolumeFull size={"1.2em"} />}
        </div>
        <input type="range" min="0" max="1" step="0.01" value={1} onInput={handleVolumeChange} class="w-1/2" />
        <Button 
          class="m-auto hover:cursor-pointer w-fit rounded-full" 
          onClick={() => setColorMode(colorMode() === "dark" ? "light" : "dark")}>
          {colorMode() === "dark" ? (
            <TbMoon size={"1.2em"} />
          ) : (
            <TbSun size={"1.2em"} />
          )}
        </Button>
      </div>
    </div>
  );
};