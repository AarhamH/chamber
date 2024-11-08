import { createEffect, createSignal, onMount } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js"
import audio from "../../../src-tauri/audio_store/Lenny_Kravitz_-_Fly_Away_(Official_Music_Video).mp3";
import { useColorMode } from "@kobalte/core";
import type { Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js"

import "../../App.css";
import { BiRegularPause, BiRegularPlay } from "solid-icons/bi";
import { AiFillBackward, AiFillForward } from "solid-icons/ai";

export const ModifyTrimmer = () => {
  let container: HTMLDivElement | null = null;
  let wavesurfer: WaveSurfer;
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(0.5);
  let activeRegion: Region | null = null;
  const { colorMode } = useColorMode();

  onMount(() => {
    try {
      if (!container) {
        throw new Error("Container element not found");
      }
  
      const regions = RegionsPlugin.create();
      const timeline = TimelinePlugin.create();
      const audioObj = new Audio();
      audioObj.src = audio;
  
      wavesurfer = WaveSurfer.create({
        container: container,
        height: 100,
        width: 1200,
        waveColor: colorMode() == "dark" ? "white" : "black",
        progressColor: "#C2C0C0",
        cursorWidth: 3,
        barGap: 2,
        barWidth: 2,
        dragToSeek: true,
        plugins: [regions, timeline],
        media: audioObj,
      });
  
      wavesurfer.setVolume(volume());
  
      wavesurfer.on("click", () => {
        wavesurfer.play();
      });
  
      wavesurfer.on("play", () => {
        setIsPlaying(true);
      });
  
      wavesurfer.on("pause", () => {
        setIsPlaying(false);
      });
  
      regions.enableDragSelection({
        color: "rgba(255, 0, 0, 0.35)",
      });
  
      regions.on("region-in", (region) => {
        activeRegion = region;
      });
  
      regions.on("region-out", (region) => {
        if (activeRegion === region) {
          activeRegion = null;
        }
      });
  
      regions.on("region-clicked", (region, e) => {
        e.stopPropagation(); // prevent triggering a click on the waveform
        activeRegion = region;
        region.play();
      });
  
      // Reset the active region when the user clicks anywhere in the waveform
      wavesurfer.on("interaction", () => {
        activeRegion = null;
      });
  
      wavesurfer.registerPlugin(
        ZoomPlugin.create({
          scale: 0.2, // the amount of zoom per wheel step, e.g. 0.5 means a 50% magnification per scroll
          maxZoom: 250, // Optionally, specify the maximum pixels-per-second factor while zooming
        })
      );
    } catch (error) {
      return new Error(String(error));
    }
  });

  const waveFormPlay = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
    } else {
      return new Error(String("WaveSurfer instance is not initialized"));
    }
  };

  const waveFormForward = () => {
    if(wavesurfer) {
      wavesurfer.skip(10);
    }
  }

  const waveFormBackward = () => {
    if(wavesurfer) {
      wavesurfer.skip(-10);
    }
  }
  
  const waveFormVolume = (value:number) => {
    if(wavesurfer) {
      wavesurfer.setVolume(value);
    }
  }

  createEffect(() => {
    if (wavesurfer) {
      wavesurfer.setOptions({
        waveColor: colorMode() == "dark" ? "white" : "black",
      });
    } else {
      return new Error(String("WaveSurfer instance is not initialized"));
    }
  });

  createEffect(() => {
    const handleKeyDown = (e:KeyboardEvent) => {
      if (e.key === "d" && activeRegion) {
        activeRegion.remove();
        activeRegion = null;
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
  
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeRegion])

  return (
    <div>
      <div class="flex justify-center pt-20 text-4xl font-thin">Trimmer</div>
      <div class=" mt-32 pl-16 pr-16 overflow-x-auto" ref={el => container = el}></div>
      <div class="flex flex-row items-center justify-center pt-5 gap-5">
        <AiFillBackward size={"1.3em"} class="mb-2" onClick={waveFormBackward} />
        {isPlaying() ? (
          <BiRegularPause size={"1.5em"} class="mb-2" onClick={waveFormPlay}/>
        ) : (
          <BiRegularPlay size={"1.5em"} class="mb-2" onClick={waveFormPlay} />
        )}
        <AiFillForward size={"1.3em"} class="mb-2" onClick={waveFormForward} />
      </div>
      <div class="flex flex-col items-center gap-2">
        <div class="flex items-center gap-2">
          <label>Volume</label>
          <input type="range" min="0" max="1" value={volume()} step="0.01"  onInput={(e) => waveFormVolume(parseFloat(e.currentTarget.value))}  class="w-1/2" />
        </div>
        <div class="flex items-center gap-2">
          <label>Playback Rate</label>
          <input type="range" min="0" max="1" step="0.01" class="w-1/2" />
        </div>
        <div class="flex items-center gap-2">
          <label>Bass</label>
          <input type="range" min="0" max="1" step="0.01" class="w-1/2" />
        </div>
        <div class="flex items-center gap-2">
          <label>Treble</label>
          <input type="range" min="0" max="1" step="0.01" class="w-1/2" />
        </div>
      </div>
    </div>
  );
};