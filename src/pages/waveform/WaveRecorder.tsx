import { createSignal, onMount, createEffect } from "solid-js";
import { useColorMode } from "@kobalte/core";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import { Button } from "~/components/solidui/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/solidui/Dropdown";
import { formatTimeCounter } from "~/utils/helper";

export const WaveRecorder = () => {
  /* States and references */
  const [micList, setMicList] = createSignal<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = createSignal<MediaDeviceInfo>();
  const [audioList, setAudioList] = createSignal<Blob[]>([]);
  const [isRecording, setIsRecording] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [time, setTime] = createSignal(0);
  const { colorMode } = useColorMode();
  let container!: HTMLDivElement;
  let wavesurfer!: WaveSurfer;
  let record!: RecordPlugin;

  /* Functions */
  const toggleRecord = () => {
    if (record.isPaused() || record.isRecording()) {
      record.stopRecording();
      return;
    }
    record.startRecording({deviceId: "default"})
  };

  const togglePause = () => {
    if(record.isPaused()) {
      record.resumeRecording();
      return;
    }
    record.pauseRecording();
  }


  /* Effects and events */

  // builds the wave surfer insance with plugins
  onMount(() => {
    wavesurfer = WaveSurfer.create({
      container: container,
      waveColor: colorMode() == "dark" ? "white" : "black",
      barWidth: 3,
      barRadius: 3,
      height: 100,
    });

    record = wavesurfer.registerPlugin(RecordPlugin.create({
      scrollingWaveform: false,
      renderRecordedAudio: false,
    }));
  });

  createEffect(() => {
    if (wavesurfer) {
      wavesurfer.setOptions({
        waveColor: colorMode() == "dark" ? "white" : "black",
      });
    } else {
      return new Error(String("WaveSurfer instance is not initialized"));
    }
  });
  
  // define mic list
  createEffect(() => {
    RecordPlugin.getAvailableAudioDevices().then((list: MediaDeviceInfo[]) => {
      setMicList(list);
    });
  },[micList]);
  
  // define record listeners
  createEffect(() => {
    record.on("record-start", () => {
      setIsRecording(true);
    })
    record.on("record-end", () => {
      setTime(0);
      setIsRecording(false);
    })
    record.on("record-pause", () => {
      setIsPaused(true);
    })
    record.on("record-resume", () => {
      setIsPaused(false);
    });
    record.on("record-progress", (duration: number) => {
      setTime(duration);
    });
  });

  // if recording ends, add the audio blob to the list
  createEffect(() => {
    record.on("record-end", (blob: Blob) => {
      setAudioList([...audioList(), blob]);
    });
  })

  return (
    <div>
      <div class="flex flex-col items-center justify-center">
        <div class="pt-10 text-4xl font-thin">Recorder</div>
        <div class="text-2xl font-thin">{formatTimeCounter(time())}</div>

        <DropdownMenu>
          <DropdownMenuTrigger as={Button} class="w-fit pl-2 pr-2" size={"sm"}>
            {selectedMic()?.label || "Select Mic"}
          </DropdownMenuTrigger>
          <DropdownMenuContent >
            {micList().map((mic: MediaDeviceInfo) => (
              <DropdownMenuItem onClick={() => setSelectedMic(mic)}>{mic.label}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>                    
      </div>
      <div class="p-10" ref={container}></div>
      <div class="flex flex-col items-center justify-center">
        <div>
          <Button class="w-32" size={"sm"} onClick={toggleRecord}>{isRecording() ? "Stop Recording" : "Record"}</Button>
          <Button class="w-32" size={"sm"} onClick={togglePause}>{isPaused() ? "Resume" : "Pause"}</Button>
        </div>
      </div>
      <div class="flex flex-col items-center overflow-auto h-64 ml-20 mr-20 border-2 border-secondary rounded-lg">
        {audioList().length === 0 ? (
          <div class="flex items-center justify-center h-full">
            <div class="text-center font-thin">No recordings available</div>
          </div>
        ) : (
          audioList().map((audio: Blob, index) => (
            <div class="flex flex-row items-center">
              <span>{index + 1}</span>
              <audio controls src={URL.createObjectURL(audio)} />
              <Button
                class="w-32"
                size={"sm"}
                variant={"link"}
                onClick={() => {
                  setAudioList(audioList().filter((_, i) => i !== index));
                }}
              >
                Delete
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};