import { Button } from "~/components/Button"
import { open } from "@tauri-apps/api/dialog";
import { Dialog, DialogTrigger } from "~/components/Dialog";
import { AllAudioModal } from "~/components/table/AllAudioModal";
import { IoAdd } from "solid-icons/io";

export const Encoding = () => {

  const addAudio= async () => {
    const filePaths = await open({
      multiple: true,
      filters: [{
        name: "Audio Files",
        extensions: ["mp3", "wav"],
      }],
    });
  };

  return(
    <Dialog>
      <div class="w-full h-full flex items-center justify-center">
        <div class="flex flex-col items-center justify-center">
          <div class="text-3xl font-thin">Transcoding Queue Empty</div>
          <div class="flex gap-5">
            <Button class="mt-5 w-32 border-2 border-zinc-600 hover:bg-transparent hover:border-opacity-60" size={"sm"} onClick={addAudio}>From Machine</Button>
            <DialogTrigger as={Button} class="mt-5 w-32 border-2 border-zinc-600 hover:bg-transparent hover:border-opacity-60" size={"sm"}>All Audios</DialogTrigger>
            <AllAudioModal title="Add to Transcoding" modalAction={{icon:IoAdd, onClick:()=>{}}} />
          </div>
        </div>
      </div>
    </Dialog>
  )
}