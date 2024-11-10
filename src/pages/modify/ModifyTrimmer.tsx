import { createEffect, createSignal, onMount } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js"
import Minimap from "wavesurfer.js/dist/plugins/minimap.esm.js"
import audio from "../../../src-tauri/audio_store/Opeth_-_Moonlapse_Vertigo.mp3";
import { useColorMode } from "@kobalte/core";
import type { Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js"
import { Button } from "../../components/Button";

import "../../App.css";
import { BiRegularPause, BiRegularPlay } from "solid-icons/bi";
import { AiFillBackward, AiFillForward } from "solid-icons/ai";
import { BsCircle } from "solid-icons/bs";
import { FaSolidCircle } from "solid-icons/fa";

export const ModifyTrimmer = () => {
  let container: HTMLDivElement | null = null;
  let wavesurfer: WaveSurfer;
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [volume, setVolume] = createSignal(0.5);
  let activeRegion: Region | null = null;
  const { colorMode } = useColorMode();
  const [regionCount, setRegionCount] = createSignal(0);
  const [regions, setRegions] = createSignal<RegionsPlugin>(RegionsPlugin.create());
  const [regionsContent, setRegionsContent] = createSignal<{title:string, region: Region}[]>([]);

  onMount(() => {
    try {
      if (!container) {
        throw new Error("Container element not found");
      }

      const minimap = Minimap.create({
        height: 20,
        dragToSeek: true,
      });

      const timeline = TimelinePlugin.create();
      const audioObj = new Audio();
      audioObj.src = audio;

      wavesurfer = WaveSurfer.create({
        container: container,
        height: 100,
        waveColor: colorMode() == "dark" ? "white" : "black",
        progressColor: "#C2C0C0",
        cursorWidth: 3,
        barGap: 7,
        barWidth: 1,
        barRadius: 100,
        dragToSeek: true,
        plugins: [regions(), timeline, minimap],
        url: audio,
      });

      wavesurfer.setVolume(volume());

      wavesurfer.on("play", () => {
        setIsPlaying(true);
      });

      wavesurfer.on("pause", () => {
        setIsPlaying(false);
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

  createEffect(() => {
    if (wavesurfer) {
      regions().on("region-created", (region) => {
        setRegionCount(regionsCount => regionsCount + 1);
        if (activeRegion) {
          activeRegion.remove();
        }
        activeRegion = region;
        // Set initial color on region creation
        region.setOptions({ start: region.start, color: randomColor(), content: `Region ${regionCount()}` });
        setRegionsContent([...regionsContent(), {title: `Region ${regionCount()}`, region} ]);
      });

      regions().on("region-updated", (region) => {
        setRegionsContent(regionsContent().map(regionContent => {
          if (regionContent.region === region) {
            return {title: regionContent.title, region}
          }
          return regionContent;
        }))
      });

      regions().on("region-in", (region) => {
        activeRegion = region;
      });

      regions().on("region-out", (region) => {
        if (activeRegion === region) {
          activeRegion = null;
        }
      });

      const random = (min: number, max: number) => Math.random() * (max - min) + min;
      const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

      regions().enableDragSelection({
        color: "rgba(2555, 0, 0, 0.4)",
      });

      regions().on("region-clicked", (region, e) => {
        e.stopPropagation(); // prevent triggering a click on the waveform
        activeRegion = region;
        region.play();
      });
    }
  })

  const waveFormPlay = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
    } else {
      return new Error(String("WaveSurfer instance is not initialized"));
    }
  };

  const waveFormForward = () => {
    if (wavesurfer) {
      wavesurfer.skip(10);
    }
  }

  const waveFormBackward = () => {
    if (wavesurfer) {
      wavesurfer.skip(-10);
    }
  }

  const waveFormVolume = (value: number) => {
    if (wavesurfer) {
      wavesurfer.setVolume(value);
    }
  }

  const printstuff = () => {
    console.log("activeRegion", activeRegion);
    console.log("regions", regions().getRegions());
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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "d" && activeRegion) {
        setRegionsContent(regionsContent().filter(region => region.region !== activeRegion));
        activeRegion.remove();
        activeRegion = null;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeRegion]);
  

  return (
    <div>
      <div class="flex justify-center pt-20 text-4xl font-thin overflow-x-auto">Trimmer</div>
      <div class="mt-16 pl-16 pr-16 overflow-x-visible" ref={el => container = el}></div>
      <div class="flex flex-row items-center justify-center pt-5 gap-5">
        <AiFillBackward size={"2em"} class="mb-2" onClick={waveFormBackward} />
        {isPlaying() ? (
          <BiRegularPause size={"2.2em"} class="mb-2" onClick={waveFormPlay} />
        ) : (
          <BiRegularPlay size={"2.2em"} class="mb-2" onClick={waveFormPlay} />
        )}
        <AiFillForward size={"2em"} class="mb-2" onClick={waveFormForward} />
      </div>
      {regionsContent().map((region) => (
        <div class="flex flex-row items-center justify-center gap-5">
          <FaSolidCircle size={"1.2em"} color={region.region.color} class="border-black" />
          <span>{region.title}</span>
          <span>{region.region.start}</span>
          <Button class="w-20" onClick={() => region.region.play()}>Play</Button>
        </div>
      ))}
    </div>
  );
};