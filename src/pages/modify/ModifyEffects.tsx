import { useColorMode } from "@kobalte/core";
import { createSignal, onMount, createEffect } from "solid-js";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
import { Button } from "~/components/Button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/Dropdown";

export const ModifyEffects = () => {
  let container!: HTMLDivElement;
  let wavesurfer!: WaveSurfer;
  let record!: RecordPlugin;
  const [micList, setMicList] = createSignal<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = createSignal<MediaDeviceInfo>();
  const [audioList, setAudioList] = createSignal<Blob[]>([]);
  const [isRecording, setIsRecording] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [time, setTime] = createSignal(0);
  const { colorMode } = useColorMode();

  onMount(() => {
    wavesurfer = WaveSurfer.create({
      container: container,
      waveColor: "violet",
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
    record.on("record-end", (blob: Blob) => {
      setAudioList([...audioList(), blob]);
    });
  })

  const recordAudio = () => {
    if (record.isPaused() || record.isRecording()) {
      record.stopRecording();
      return;
    }
    record.startRecording({deviceId: "default"})
  };

  const pauseRecording = () => {
    if(record.isPaused()) {
      record.resumeRecording();
      return;
    }
    record.pauseRecording();
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

  createEffect(() => {
    RecordPlugin.getAvailableAudioDevices().then((list: MediaDeviceInfo[]) => {
      setMicList(list);
    });
  },[micList]);

  const formatTime = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    const milliseconds = Math.floor((duration % 1000) / 10); // Keep milliseconds to 2 significant figures
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}:${milliseconds < 10 ? "0" : ""}${milliseconds}`;
  };

  return (
    <div>
      <div class="flex flex-col items-center justify-center">
        <div class="pt-10 text-4xl font-thin">Recorder</div>
        <div class="text-2xl font-thin">{formatTime(time())}</div>

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
          <Button class="w-32" size={"sm"} onClick={recordAudio}>{isRecording() ? "Stop Recording" : "Record"}</Button>
          <Button class="w-32" size={"sm"} onClick={pauseRecording}>{isPaused() ? "Resume" : "Pause"}</Button>
        </div>
      </div>
      <div class="flex flex-col items-center overflow-auto h-64 ml-20 mr-20 border-2 border-secondary">
        {
          audioList().map((audio: Blob,index) => (
            <div class="flex flex-row items-center">
              <span>{index+1}</span>
              <audio controls src={URL.createObjectURL(audio)} />
              <Button class="w-32" size={"sm"} variant={"link"} onClick={() => 
              {setAudioList(audioList().filter((_, i) => i !== index))}}>
                Delete
              </Button>
            </div>
          ))
        }
      </div>
    </div>
  );
};