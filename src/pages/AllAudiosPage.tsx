import { onMount } from "solid-js";
import { open } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import { setAudio, audio } from "~/store/store";
import { BiRegularPause, BiRegularPlay, BiRegularDotsVerticalRounded } from "solid-icons/bi"
import { toast } from "solid-sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/solidui/Table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/solidui/Dropdown";
import { useAudio } from "~/components/AudioContext";
import { BsPlus } from "solid-icons/bs";
import { SUPPORTED_TYPES } from "~/utils/constants";

export const AllAudiosPage = () => {
  const { togglePlay, activeAudio, setActiveAudio, setActivePlaylist, isAudioPlaying } = useAudio();
  
  const fetchAllAudio = async () => { 
    const result = await invoke<typeof Audio[]>("get_all_audio").catch((error) => error);
    if (result instanceof Error) return toast.error(result.message);
    setAudio(result);
  }

  const addAudio= async () => {
    const filePaths = await open({
      multiple: true,
      filters: [{
        name: "Audio Files",
        extensions: SUPPORTED_TYPES,
      }],
    });
    
    // Check if any files were selected
    if (filePaths && Array.isArray(filePaths)) {
      for (const filePath of filePaths) {
        const response = await invoke("create_audio", { filePath }).catch((error) => error);
        if (response instanceof Error) {
          toast.error(response.message);
        }
        fetchAllAudio();
      }
      toast.success("Successfully added audio");
    };
  }

  const exportAudio = async (audioIdArg: number) => {
    const destinationDirectory = await open({
      directory: true,
    })
    console.log(destinationDirectory);
  }

  const deleteAudio = async (audioIdArg: number) => {
    const result = await invoke("delete_audio", { audioIdArg }).catch((error) => error);
    if(result instanceof Error) return toast.error(result.message);
    fetchAllAudio();
    return toast.success("Audio deleted successfully");
  }

  onMount(fetchAllAudio);

  return(
    <div class="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="flex items-center justify-center">
              <BsPlus size={"2em"} class="hover:cursor-pointer" onClick={addAudio} />
            </TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        {audio.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} class="text-center font-thin">No audio in this playlist</TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {audio.map((audio_item, index: number) => (
              <TableRow>
                <TableCell class="flex justify-end hover:cursor-pointer">
                  {audio_item.id === activeAudio()?.id && isAudioPlaying() ? (
                    <BiRegularPause size={"2em"} class="text-green" onClick={() => togglePlay()} />
                  ) : (
                    <BiRegularPlay size={"2em"} 
                      onClick={() => {
                        if(audio_item.id !== activeAudio()?.id) {
                          setActiveAudio(audio_item); 
                          setActivePlaylist([...audio]);
                        } else {
                          togglePlay();
                        }
                      }} />
                  )}
                </TableCell>
                <TableCell class="max-w-xs truncate overflow-hidden whitespace-nowrap">{index+1}</TableCell>
                <TableCell class="max-w-xs truncate overflow-hidden whitespace-nowrap">{audio_item.title}</TableCell>
                <TableCell class="max-w-xs truncate overflow-hidden whitespace-nowrap">{audio_item.author}</TableCell>
                <TableCell class="max-w-xs truncate overflow-hidden whitespace-nowrap">{audio_item.path}</TableCell>
                <TableCell class="max-w-xs truncate overflow-hidden whitespace-nowrap">{audio_item.audio_type}</TableCell>
                <TableCell class=" truncate overflow-hidden whitespace-nowrap">{audio_item.duration}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <BiRegularDotsVerticalRounded size={"1.5em"}  />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportAudio(audio_item.id)} >
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        class="text-red-500 hover:cursor-pointer" 
                        onClick={() => deleteAudio(audio_item.id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>                    
                </TableCell>  
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  )
}