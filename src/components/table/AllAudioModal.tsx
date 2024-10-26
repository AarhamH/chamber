import { Audio } from "~/utils/types";
import { Button } from "../Button";
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../Dialog";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "../Table";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { setAudio, audio } from "~/store/store";
import { IconTypes } from "solid-icons";
import { toast } from "solid-sonner";
import { createEffect, onMount } from "solid-js";

interface AllAudioModalProps {
  title: string;
  modalAction?: {icon: IconTypes, onClick: (_id:number) => Promise<string | Error>};
}

export const AllAudioModal = ({ title, modalAction }:AllAudioModalProps) => {
  createEffect(() => {
    fetchAllAudio();
  },[])

  const fetchAllAudio = async () => { 
    try {
      const result = await invoke<Audio[]>("get_all_audio");
      setAudio(result);
    } catch (error) {
      return error
    }
  }
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
        await invoke("create_audio", { filePath });
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
                <TableHead class="w-10 truncate">Type</TableHead>
                <TableHead class="w-16 text-right truncate"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audio.map((audio_item:Audio,index:number) => (
                <TableRow>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{index+1}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.title}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.author}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.path}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.duration}</TableCell>
                  <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{audio_item.audio_type}</TableCell>
                  <TableCell>
                    {}
                    {modalAction && (
                      <modalAction.icon 
                        class="flex justify-end hover:cursor-pointer" 
                        size={"1.5em"} 
                        onClick={() => {
                          modalAction.onClick(audio_item.id).then(result => {
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