import { createEffect, createSignal, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/tauri";
import { useColorMode } from "@kobalte/core";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.esm.js"
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js"
import Minimap from "wavesurfer.js/dist/plugins/minimap.esm.js"
import type { Region } from "wavesurfer.js/dist/plugins/regions.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.esm.js"
import { modifyAudioTrim, setModifyAudioTrim } from "~/store/store";
import { Audio } from "~/utils/types";
import { audio } from "~/store/store";
import { BiRegularLoaderCircle, BiRegularPause, BiRegularPlay } from "solid-icons/bi";
import { AiFillBackward, AiFillForward } from "solid-icons/ai";
import { IoAdd, IoRemoveCircleOutline } from "solid-icons/io";
import { FaSolidCircle } from "solid-icons/fa";
import { BsPlus } from "solid-icons/bs";
import { toast } from "solid-sonner";
import { Button } from "~/components/solidui/Button";
import { Dialog, DialogTrigger } from "~/components/solidui/Dialog";
import { AllAudioModal } from "~/components/table/AllAudioModal";
import "../../App.css";
import { buildBlob } from "~/utils/helper";
import { secondsToMinutes } from "~/utils/helper";

export const WaveTrimmer = () => {
  /* States and references */
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [isWaveSurferLoading, setIsWaveSurferLoading] = createSignal(true);
  const { colorMode } = useColorMode();
  const [regionCount, setRegionCount] = createSignal(0);
  const regions = RegionsPlugin.create();
  const [regionsContent, setRegionsContent] = createSignal<{title:string, region: Region}[]>([]);
  let container!: HTMLDivElement;
  let actualContainer!: HTMLDivElement;
  let wavesurfer: WaveSurfer;
  let activeRegion: Region | null = null;
  
  const waveFormPlay = () => {
    if (wavesurfer) {
      wavesurfer.playPause();
    } else {
      toast.error("WaveSurfer instance is not initialized");
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

  const deleteRegion = (region: Region) => {
    setRegionsContent(regionsContent().filter(regionContent => regionContent.region !== region));
    region.remove();
  }

  const trimSingleAudio = async (region: Region) => {
    const argument = {
      fileName: modifyAudioTrim.title,
      filePath: modifyAudioTrim.path,
      start: region.start,
      end: region.end,
      fileType: modifyAudioTrim.audio_type,
    }
    const response = await invoke("trim_single_audio", argument).catch((error) => error);
    if(response instanceof Error) return toast.error(response.message);
    deleteRegion(region);
    return toast.success("Successfully trimmed audio");
  }

  const insertFromAllAudios = async (id: number) => {
    try {
      const foundAudio = audio.find((audio_item: Audio) => audio_item.id === id);
      if (foundAudio) {
        setModifyAudioTrim(foundAudio);
      } else {
        throw new Error("Audio not found");
      }
      regions.getRegions().forEach(region => deleteRegion(region));
      return "Successfully added to trimmer";
    } catch (error) {
      return new Error(String(error));
    }
  };
  
  onMount(() => {
    try {
      const minimap = Minimap.create({
        height: 20,
        dragToSeek: true,
      });

      const timeline = TimelinePlugin.create();

      wavesurfer = WaveSurfer.create({
        container: container,
        autoCenter: true,
        waveColor: colorMode() == "dark" ? "white" : "black",
        progressColor: "#C2C0C0",
        cursorWidth: 3,
        barWidth: 3,
        barRadius:3,
        dragToSeek: true,
        plugins: [regions, timeline, minimap],
      });

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

      wavesurfer.on("ready", () => {
        setIsWaveSurferLoading(false);
      })
      wavesurfer.on("loading", () => {
        setIsWaveSurferLoading(true);
      })

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
      regions.on("region-created", (region) => {
        setRegionCount(regionsCount => regionsCount + 1);
        if (activeRegion) {
          activeRegion.remove();
        }
        activeRegion = region;
        // Set initial color on region creation
        region.setOptions({ start: region.start, color: randomColor(), content: `Region ${regionCount()}` });
        setRegionsContent([...regionsContent(), {title: `Region ${regionCount()}`, region} ]);
      });

      regions.on("region-updated", (region) => {
        setRegionsContent(regionsContent().map(regionContent => {
          if (regionContent.region === region) {
            return {title: regionContent.title, region}
          }
          return regionContent;
        }))
      });

      regions.on("region-in", (region) => {
        activeRegion = region;
      });

      regions.on("region-out", (region) => {
        if (activeRegion === region) {
          activeRegion = null;
        }
      });

      const random = (min: number, max: number) => Math.random() * (max - min) + min;
      const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;

      regions.enableDragSelection({
        color: "rgba(2555, 0, 0, 0.4)",
      });

      regions.on("region-clicked", (region, e) => {
        e.stopPropagation(); // prevent triggering a click on the waveform
        activeRegion = region;
        region.play();
      });
    }
  })

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

  createEffect(() => {
    if(Object.keys(modifyAudioTrim).length !== 0) {
      wavesurfer.setOptions({
        container: actualContainer,
      })
    }
  })


  createEffect(async () => {
    if (Object.keys(modifyAudioTrim).length !== 0 && wavesurfer) {
      const audioBlob = await buildBlob(modifyAudioTrim.path, modifyAudioTrim.audio_type);
      wavesurfer.loadBlob(audioBlob);
    }
  }, [modifyAudioTrim]);

  return (
    <div class="flex items-center justify-center h-full w-full" ref={container}>
      {
        Object.keys(modifyAudioTrim).length !== 0 ? (
          <div class="h-full w-full">
            <div class="flex justify-center pt-10 text-4xl font-thin">Trimmer</div>
            <div class="flex justify-center text-2xl font-thin">{modifyAudioTrim.title}</div>
            <div class="mt-16 pl-16 pr-16 overflow-x-visible" ref={actualContainer}/>
            
            <div class="flex flex-row items-center justify-center pt-5 pb-5 gap-5">
              {isWaveSurferLoading() ? (
                <BiRegularLoaderCircle class="animate-spin" size={"1.5em"} />
              ): (
                <div class="flex flex-row items-center justify-center pt-5 gap-5">
                  <AiFillBackward size={"2em"} class="mb-2" onClick={waveFormBackward} />
                  {isPlaying() ? (
                    <BiRegularPause size={"2.2em"} class="mb-2" onClick={waveFormPlay} />
                  ) : (
                    <BiRegularPlay size={"2.2em"} class="mb-2" onClick={waveFormPlay} />
                  )}
                  <AiFillForward size={"2em"} class="mb-2" onClick={waveFormForward} />
         
                  <Dialog>
                    <DialogTrigger class="flex items-center justify-center">
                      <BsPlus size={"2em"} class="mb-2 hover:cursor-pointer" />
                    </DialogTrigger>
                    <AllAudioModal title="Add to Trimmer" modalAction={{icon:IoAdd, onClick:insertFromAllAudios}} />
                  </Dialog>
                </div>
              )}
            </div>
            <div class="p-5 ml-48 mr-48 border-2 overflow-auto h-1/3 rounded-lg">
              {regionsContent().length === 0 ? (
                <div class="flex items-center justify-center h-full">
                  <span class="text-normal font-thin">No regions added</span>
                </div>
              ) : (
                regionsContent().map((region) => (
                  <div class="flex flex-row items-center justify-evenly p-2 mb-4 border-b">
                    <FaSolidCircle size={"1.2em"} color={region.region.color} />
                    <span>{region.title}</span>
                    <span>Start: {secondsToMinutes(region.region.start)}</span>
                    <span>End: {secondsToMinutes(region.region.end)}</span>
                    <span>Duration: {secondsToMinutes(region.region.end - region.region.start)}</span>
                    <Button size={"sm"} class="w-20" onClick={() => region.region.play()}>Play</Button>
                    <Button 
                      size={"sm"} 
                      class="w-20"
                      onClick={() => trimSingleAudio(region.region)}>
                      Trim
                    </Button>
                    <IoRemoveCircleOutline class="hover:cursor-pointer" size={"1.5em"} onClick={() => deleteRegion(region.region)} />
                  </div>
                ))
              )}
            </div>
          </div>
        ):(
          <div>
            <div class="flex flex-col items-center justify-center">
              <div class="text-3xl font-thin">Welcome to the Trimmer</div>
              <Dialog>
                <DialogTrigger as={Button} class="mt-5 w-32 border-2 hover:bg-transparent hover:border-opacity-60" size={"sm"}>(+) Add Audio</DialogTrigger>
                <AllAudioModal title="Add to Trimmer" modalAction={{icon:IoAdd, onClick:insertFromAllAudios}} />
              </Dialog>
            </div>
          </div>
        )
      }
    </div>
  );
};