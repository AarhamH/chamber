import { Button } from "~/components/Button"
import { open } from "@tauri-apps/api/dialog";
import { Dialog, DialogTrigger } from "~/components/Dialog";
import { AllAudioModal } from "~/components/table/AllAudioModal";
import { audioCodecQueue, setAudioCodecQueue, audio } from "~/store/store";
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
  const supportedAudioTypes = ["mp3", "wav", "aiff", "flac"];

  const insertFromAllAudios = async (id:number) => {
    try{
      if(audioCodecQueue.find((audio_item: AudioCodec) => audio_item.id === id)) {
        return new Error(String("Audio already in transcoding queue"));
      }
      setAudioCodecQueue([
        ...audioCodecQueue,
        ...audio
          .filter((audio_item: Audio) => audio_item.id === id)
          .map(audio_item => ({
            ...audio_item,
            converted_type: supportedAudioTypes.find((supAudioType: string) => supAudioType !== audio_item.audio_type) || ""
          }))
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

  return(
    <div class="w-full h-full flex items-center justify-center">
      {audioCodecQueue.length <= 0 ? (
        <div class="flex flex-col items-center justify-center">
          <div class="text-3xl font-thin">Transcoding Queue Empty</div>
          <div class="flex gap-5">
            <Button class="mt-5 w-32 border-2 border-zinc-600 hover:bg-transparent hover:border-opacity-60" size={"sm"} onClick={addAudio}>From Machine</Button>
            <Dialog>
              <DialogTrigger as={Button} class="mt-5 w-32 border-2 border-zinc-600 hover:bg-transparent hover:border-opacity-60" size={"sm"}>All Audios</DialogTrigger>
              <AllAudioModal title="Add to Transcoding" modalAction={{icon:IoAdd, onClick:insertFromAllAudios}} />
            </Dialog>
          </div>
        </div>
      ):(
        <div>
          <div class="flex items-center justify-center gap-5 pb-5">
            <Button class="mt-5 w-32 border-2 border-zinc-600 hover:bg-transparent hover:border-opacity-60" size={"sm"} onClick={addAudio}>From Machine</Button> <Dialog>
              <DialogTrigger as={Button} class="mt-5 w-32 border-2 border-zinc-600 hover:bg-transparent hover:border-opacity-60" size={"sm"}>All Audios</DialogTrigger>
              <AllAudioModal title="Add to Transcoding" modalAction={{icon:IoAdd, onClick:insertFromAllAudios}} />
            </Dialog>
          </div>
          <div class="max-h-96 w-full border border-zinc-900 rounded-lg overflow-y-auto">
            <Table class="min-w-5xl">
              <TableBody>
                {audioCodecQueue.map((audio_item: AudioCodec) => (
                  <TableRow>
                    <TableCell class="max-w-sm">
                      <AiOutlineMinusCircle onClick={() => removeFromQueue(audio_item.id)} class="hover:cursor-pointer"/>
                    </TableCell>
                    <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.title}</TableCell>
                    <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.path}</TableCell>
                    <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.audio_type}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger as={Button} variant={"link"}>
                          Convert to: {audio_item.converted_type}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {supportedAudioTypes.filter((supAudioType: string) => supAudioType !== audio_item.audio_type).map((supAudioType: string) => (
                            <DropdownMenuItem onClick={() => setConvertType(audio_item.id, supAudioType)}>{supAudioType}</DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>                    
                    </TableCell>  
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}