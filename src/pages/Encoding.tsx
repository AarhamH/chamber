import { Button } from "~/components/Button"
import { open } from "@tauri-apps/api/dialog";
import { Dialog, DialogTrigger } from "~/components/Dialog";
import { AllAudioModal } from "~/components/table/AllAudioModal";
import { audioCodecQueue, setAudioCodecQueue, audio } from "~/store/store";
import { Audio } from "~/utils/types";
import { IoAdd } from "solid-icons/io";
import { Table, TableBody, TableCell, TableRow } from "~/components/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/Dropdown"
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

  const insertFromAllAudios = async (id:number) => {
    try{
      setAudioCodecQueue([...audioCodecQueue, ...audio.filter((audio_item: Audio) => audio_item.id === id)]);
      return "Successfully added to transcoding queue";
    } catch (error) {
      return new Error(String(error));
    }
  };

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
          <div class="max-h-96 border border-zinc-900 rounded-lg overflow-y-auto">
            <Table>
              <TableBody>
                {audioCodecQueue.map((audio_item: Audio) => (
                  <TableRow>
                    <TableCell class="max-w-sm">{audio_item.title}</TableCell>
                    <TableCell class="max-w-sm ">{audio_item.path}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger as={Button} variant={"link"}>
                          Mp3
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            class="text-red-500 hover:cursor-pointer"
                          >
                            Delete
                          </DropdownMenuItem>
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