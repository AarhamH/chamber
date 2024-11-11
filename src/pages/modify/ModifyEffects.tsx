import { Button } from "~/components/Button"
import { Dialog, DialogTrigger } from "~/components/Dialog";
import { AllAudioModal } from "~/components/table/AllAudioModal";
import { audioCodecQueue, setAudioCodecQueue, audio, isAudioTranscodeLoading, setIsAudioTranscodeLoading, setEffectInput } from "~/store/store";
import { Audio, AudioCodec } from "~/utils/types";
import { IoAdd } from "solid-icons/io";
import { Table, TableBody, TableCell, TableRow } from "~/components/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/Dropdown"
import { AiOutlineMinusCircle } from "solid-icons/ai";
import { BiRegularLoaderCircle } from "solid-icons/bi";
import { toast } from "solid-sonner";
import { SUPPORTED_TYPES } from "~/utils/constants";
import { effectInput } from "~/store/store";

export const ModifyEffects = () => {
  const supportedAudioTypes = SUPPORTED_TYPES

  const insertFromAllAudios = async (id: number) => {
    try {
      const foundAudio = audio.find((audio_item: Audio) => audio_item.id === id);
      if (foundAudio) {
        setEffectInput(foundAudio);
      } else {
        throw new Error("Audio not found");
      }
      return "Successfully added to transcoding queue";
    } catch (error) {
      return new Error(String(error));
    }
  };

  const addToList = (id: number, isAddedToList: boolean) => {
    setAudioCodecQueue(audioCodecQueue.map(audio_item => 
      audio_item.id === id ? { ...audio_item, is_added_to_list: isAddedToList } : audio_item
    ));
  }

  return(
    <div class="flex items-center justify-center h-full">
      {Object.keys(effectInput).length === 0 ? (
        <div class="flex flex-col items-center justify-center">
          <div class="text-3xl font-thin">Welcome to the Effects Pannel</div>
          <Dialog>
            <DialogTrigger as={Button} class="mt-5 w-32 border-2 hover:bg-transparent hover:border-opacity-60" size={"sm"}>(+) Add to queue</DialogTrigger>
            <AllAudioModal title="Add to Transcoding" modalAction={{icon:IoAdd, onClick:insertFromAllAudios}} />
          </Dialog>
        </div>
      ):(
        <div>Items are here!</div>
      )} 
    </div>
  )
}