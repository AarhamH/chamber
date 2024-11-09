import { createSignal, onCleanup, onMount } from "solid-js";
import * as Tone from "tone";
import { Button } from "~/components/Button";
import { useAudio } from "~/components/AudioContext";

const SynthesizerPage = () => {
  const [pressedKeys, setPressedKeys] = createSignal<{ [key: string]: boolean }>({});
  const synth = new Tone.Synth().toDestination();
  const { isAudioPlaying, togglePlay} = useAudio();

  const keyMappings = [
    { key: "q", note: "B3" },
    { key: "a", note: "C4" },
    { key: "w", note: "Db4" },
    { key: "s", note: "D4" },
    { key: "e", note: "Eb4" },
    { key: "d", note: "E4" },
    { key: "r", note: "F4" },
    { key: "f", note: "Gb4" },
    { key: "t", note: "G4" },
    { key: "g", note: "Ab4" },
    { key: "y", note: "A4" },
    { key: "h", note: "Bb4" },
    { key: "u", note: "B4" },
    { key: "j", note: "C5" },
    { key: "i", note: "Db5" },
    { key: "k", note: "D5" },
    { key: "o", note: "Eb5" },
    { key: "l", note: "E5" },
    { key: "p", note: "F5" },
  ];

  const playNote = (note: string) => {
    if(isAudioPlaying()) {
      togglePlay();
    }
    synth.triggerAttack(note);
  };

  const releaseNote = () => {
    synth.triggerRelease();
  };

  onMount(() => {
    Tone.start();
    
    const handleKeyDown = (event:KeyboardEvent) => {
      const keyMapping = keyMappings.find((mapping) => mapping.key === event.key);
      if (keyMapping) {
        playNote(keyMapping.note);
        setPressedKeys((prev) => ({ ...prev, [event.key]: true }));
      }
    };

    const handleKeyUp = (event:KeyboardEvent) => {
      const keyMapping = keyMappings.find((mapping) => mapping.key === event.key);
      if (keyMapping) {
        releaseNote();
        setPressedKeys((prev) => ({ ...prev, [event.key]: false }));
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
  
    onCleanup(() => {
      synth.dispose();
      synth.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    });
  });
  
  return (
    <div class="w-full h-full flex flex-col items-center justify-center gap-5">
      <div class="flex gap-5 items-center justify-center">
        {keyMappings.map((keyMapping, index) => (
          index % 2 === 0 && (
            <Button
              onMouseDown={() => playNote(keyMapping.note)}
              onMouseUp={releaseNote}
              class={`flex flex-col items-center justify-center w-12 h-12 rounded border-2 border-primary ${pressedKeys()[keyMapping.key] ? "bg-primary text-background" : "hover:bg-primary hover:text-background"}`}

            >
              {(keyMapping.key).toUpperCase()}
              <div class="text-xs font-thin">
                {keyMapping.note}
              </div>
            </Button>
          )
        ))}
      </div>
      <div class="flex gap-3 items-center justify-center">
        {keyMappings.map((keyMapping, index) => (
          index % 2 === 1 && (
            <Button
              onMouseDown={() => playNote(keyMapping.note)}
              onMouseUp={releaseNote}
              class={`flex flex-col items-center justify-center w-12 h-12 rounded border-2 border-primary ${pressedKeys()[keyMapping.key] ? "bg-primary text-background" : "hover:bg-primary hover:text-background"}`}

            >
              {keyMapping.key.toUpperCase()}
              <div class="text-xs font-thin">
                {keyMapping.note}
              </div>
            </Button>
          )
        ))}
      </div>
    </div>
  );
};

export default SynthesizerPage;