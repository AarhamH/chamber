import { Music } from "~/utils/types";
import { Button } from "../Button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../Dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../Table";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { setMusic, music } from "~/store/store";
import { IconTypes } from "solid-icons";
import { toast } from "solid-sonner";
import { createEffect } from "solid-js";

interface AllAudioModalProps {
  title: string;
  modalAction?: {icon: IconTypes, onClick: (_id:number) => Promise<string | Error>};
}

export const AllAudioModal = ({ title, modalAction }:AllAudioModalProps) => {
  const fetchAllAudio = async () => { try {
    const result = await invoke<Music[]>("get_all_music");
    setMusic(result);
  } catch (error) {
    return error
  }
  }
  createEffect(() => {
    fetchAllAudio();
  },[music])
  const addAudio= async () => {
    const filePaths = await open({
      multiple: true,
      filters: [{
        name: "Audio Files",
        extensions: ["mp3", "wav"],
      }],
    });
    
    // Check if any files were selected
    if (filePaths && Array.isArray(filePaths)) {
      for (const filePath of filePaths) {
        await invoke("create_music", { filePath });
      }
      fetchAllAudio();
    }
  };
  return(
    <DialogContent class="w-5/6 h-2/3">
      <DialogHeader>
        <div class="flex flex-col items-center justify-center">
          <DialogTitle>{title}</DialogTitle>
          <Button class="w-32" onClick={addAudio} variant={"link"}>Add Audio</Button>      
        </div>
        <DialogDescription>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-2 truncate">ID</TableHead>
                <TableHead class="w-1/4 truncate">Title</TableHead>
                <TableHead class="w-2/12 truncate">Artist</TableHead>
                <TableHead class="w-1/2 truncate">Path</TableHead>
                <TableHead class="w-10 truncate">Duration</TableHead>
                <TableHead class="w-16 text-right truncate"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {music.map((song:Music,index:number) => (
                <TableRow>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{index+1}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.title}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.artist}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.path}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.duration}</TableCell>
                  <TableCell>
                    {}
                    {modalAction && (
                      <modalAction.icon 
                        class="flex justify-end hover:cursor-pointer" 
                        size={"1.5em"} 
                        onClick={() => {
                          modalAction.onClick(song.id).then(result => {
                            const isError = result instanceof Error;
                            (() => isError ? toast.error(result.message) : toast.success(result))();
                          });
                        }}
                      />
                    )}
                  </TableCell>  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  )
}