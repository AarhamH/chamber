import { Button } from "~/components/Button"
import { Dialog, DialogTrigger } from "~/components/Dialog";
import { AllAudioModal } from "~/components/table/AllAudioModal";
import { audioCodecQueue, setAudioCodecQueue, audio, isAudioTranscodeLoading, setIsAudioTranscodeLoading } from "~/store/store";
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
import { invoke } from "@tauri-apps/api/tauri";
import { BiRegularLoaderCircle } from "solid-icons/bi";
import { toast } from "solid-sonner";
import { SUPPORTED_TYPES } from "~/utils/constants";

export const Transcoding = () => {
  const supportedAudioTypes = SUPPORTED_TYPES

  const insertFromAllAudios = async (id: number) => {
    try {
      const newAudioItems = audio
        .filter((audio_item: Audio) => audio_item.id === id)
        .map((audio_item, index) => {
          if (audio_item.path.includes("-converted_to-")) {
            throw new Error("This file may have already been transcoded, which may result in corrupted metadata. Please select another audio file.");
          }
          return {
            ...audio_item,
            id: audioCodecQueue.length + index,
            converted_type: supportedAudioTypes.find((supAudioType: string) => supAudioType !== audio_item.audio_type) || "",
            is_added_to_list: false
          };
        });
  
      setAudioCodecQueue([
        ...audioCodecQueue,
        ...newAudioItems
      ]);
  
      return "Successfully added to transcoding queue";
    } catch (error) {
      return new Error(String(error));
    }
  };

  const removeFromQueue = (id:number) => {
    setAudioCodecQueue(audioCodecQueue.filter(audio_item => audio_item.id !== id));
  }

  const setConvertType = (id: number, convertType: string) => {
    setAudioCodecQueue(audioCodecQueue.map(audio_item => 
      audio_item.id === id ? { ...audio_item, converted_type: convertType } : audio_item
    ));
  }

  const addToList = (id: number, isAddedToList: boolean) => {
    setAudioCodecQueue(audioCodecQueue.map(audio_item => 
      audio_item.id === id ? { ...audio_item, is_added_to_list: isAddedToList } : audio_item
    ));
  }
  
  const transcodeAudio = async () => {
    try {
      setIsAudioTranscodeLoading(true);
      const queueItems = audioCodecQueue.map((audio_item: AudioCodec) => ({
        id: audio_item.id,
        title: audio_item.title,
        author: audio_item.author,
        path: audio_item.path,
        duration: audio_item.duration,
        converted_type: audio_item.converted_type,
        is_added_to_list: audio_item.is_added_to_list
      }));
      await invoke("transcode_audio", { queueItems });
      setAudioCodecQueue([]);
    } catch(err) {
      return Error(String(err));
    } finally {
      setIsAudioTranscodeLoading(false);
    }
    return "Transcoding complete";
  }

  return(
    <div class="w-full h-full flex flex-col items-center justify-center">
      <div class="flex flex-col items-center justify-center">
        <div class="text-3xl font-thin pb-5">Transcoding Queue</div>
      </div>
      <div class="min-h-96 max-h-96 w-3/4 border rounded-lg overflow-auto">
        <Table class="min-w-5xl">
          <TableBody>
            {audioCodecQueue.map((audio_item: AudioCodec) => (
              <TableRow>
                <TableCell class="max-w-sm">
                  <AiOutlineMinusCircle onClick={() => removeFromQueue(audio_item.id)} class="hover:cursor-pointer"/>
                </TableCell>
                <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.title}</TableCell>
                <TableCell class="w-20">{audio_item.path}</TableCell>
                <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{"-->"}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger class="underline">
                      {audio_item.converted_type}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {supportedAudioTypes.filter((supAudioType: string) => supAudioType !== audio_item.audio_type).map((supAudioType: string) => (
                        <DropdownMenuItem onClick={() => setConvertType(audio_item.id, supAudioType)}>{supAudioType}</DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>                    
                </TableCell> 
                <TableCell>
                  <div class="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      class="h-4 w-4" 
                      checked={audio_item.is_added_to_list}
                      onChange={(e) => addToList(audio_item.id, e.currentTarget.checked)}
                    />
                    <span class="whitespace-nowrap">Add to Audio list?</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div class="flex items-center gap-2">
        <Dialog>
          <DialogTrigger as={Button} class="mt-5 w-32 border-2 hover:bg-transparent hover:border-opacity-60" size={"sm"}>(+) Add to queue</DialogTrigger>
          <AllAudioModal title="Add to Transcoding" modalAction={{icon:IoAdd, onClick:insertFromAllAudios}} />
        </Dialog>
        <Button class="mt-5 w-32 flex items-center justify-center" variant={"filled"} disabled={isAudioTranscodeLoading()} size={"sm"} 
          onClick={() => {
            transcodeAudio().then(result => {
              const isError = result instanceof Error;
              (() => isError ? toast.error(result.message) : toast.success(result))();
            })
              
          }}>
          {isAudioTranscodeLoading() ? <BiRegularLoaderCircle class="animate-spin" size={"1.5em"} /> : "Transcode"}
        </Button> 
      </div>
    </div>
  )
}