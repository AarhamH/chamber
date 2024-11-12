import { createEffect, createSignal} from "solid-js";
import { useNavigate, useParams } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/tauri";
import { Playlist, PlaylistArg, Audio} from "~/utils/types";
import { playlists, setPlaylists, audioInPlaylist, setAudioInPlaylist } from "~/store/store";
import { BiRegularPause, BiRegularPlay, BiRegularDotsVerticalRounded } from "solid-icons/bi"
import { IoAdd } from "solid-icons/io"
import { toast } from "solid-sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/solidui/Table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/solidui/Dropdown";
import { Button } from "~/components/solidui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/solidui/Dialog";
import { useAudio } from "~/components/AudioContext";
import { AllAudioModal } from "~/components/table/AllAudioModal";

export const PlaylistPage = () => {
  const params = useParams();
  const [ playlistTitle, setPlaylistTitle ] = createSignal<string>(playlists.find((playlistItem) => playlistItem.id === parseInt(params.id))?.title || "");
  const { togglePlay, activeAudio, setActiveAudio, setActivePlaylist, isAudioPlaying } = useAudio();
  let playlistPageRef!: HTMLDivElement;
  const navigate = useNavigate();

  createEffect(() => {
    if (params.id) {
      fetchAudioFromPlaylist();
      const playlist = playlists.find((playlistItem) => playlistItem.id === parseInt(params.id));
      setPlaylistTitle(playlist?.title || "");
    }
  });

  const fetchAudioFromPlaylist = async () => {
    try {
      const result = await invoke<Audio[]>("get_all_audio_from_playlist", {playlistIdArg: parseInt(params.id)});
      setAudioInPlaylist(result);
    } catch (error) {
      return error
    }
  }

  const changePlaylistTitle = async () => {
    const playlistArg: PlaylistArg = { title: playlistTitle() };
    try{
      await invoke("update_playlist", { idArg: parseInt(params.id), playlistArg });
      const result = await invoke<Playlist[]>("get_all_playlists");
      setPlaylists(result);
    } catch (error) {
      return error
    }
  };

  const handleInput = (e: InputEvent) => {
    const newInput = e.target as HTMLInputElement;
    setPlaylistTitle(newInput.value); // Just set the local state without invoking update
  };
  
  const insertAudioToPlaylist = async (id:number) => {
    try{
      await invoke("insert_audio_into_playlist", { playlistIdArg: parseInt(params.id), audioIdArg: id });
      fetchAudioFromPlaylist();
      return `Successfully added to playlist: ${playlistTitle()}`;
    } catch (error) {
      return new Error(String(error));
    }
  };

  const deleteCurrentPlaylist = async () => {
    try {
      await invoke("delete_playlist", { playlistIdArg: parseInt(params.id) });
      const result = await invoke<Playlist[]>("get_all_playlists");
      setPlaylists(result);
      navigate("/search");
    } catch (error) {
      return new Error(String(error));
    } 
  }

  const removeFromPlaylist = async (id: number) => {
    try {
      await invoke("destroy_audio_from_playlist", { playlistIdArg: parseInt(params.id), audioIdArg: id });
      fetchAudioFromPlaylist();
    } catch (error) {
      return new Error(String(error));
    } 
  }

  return(
    <div ref={playlistPageRef}>
      <div class="flex items-center pt-10 pb-5 pl-20 justify-start">
        <div class="flex flex-col">
          <input
            type="text"
            value={playlistTitle()}
            onInput={handleInput}  
            onBlur={() => playlistTitle().trim() !== "" ? changePlaylistTitle() : null} 
            onKeyPress={(e) => e.key === "Enter" && playlistTitle().trim() !== "" ? changePlaylistTitle() : null}
            class="font-medium bg-transparent text-7xl"
          />
          <div class="flex flex-row mt-6 space-x-4">
            {/* Modals for Add Audio/Delete Group */}
            <Dialog>
              <DialogTrigger class="w-32" as={Button} variant={"filled"} size={"sm"}>Add Audio</DialogTrigger>
              <AllAudioModal title="Add to playlist" modalAction={{icon: IoAdd, onClick: insertAudioToPlaylist}} />
            </Dialog>
            <Dialog>
              <DialogTrigger class="w-32" as={Button} variant={"destructive"} size={"sm"}>Delete Playlist</DialogTrigger>
              <DialogContent class="max-w-sm h-1/6 flex items-center justify-center">
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete?</DialogTitle>
                  <div class="flex flex-row justify-center gap-2 pt-5">
                    <Button class="w-32" onClick={deleteCurrentPlaylist} variant={"destructive"} size={"sm"}>Yes, Delete</Button>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      {/* Table for Group  */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead></TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        {audioInPlaylist.length === 0 ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} class="text-center font-thin">No audio in this playlist</TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <TableBody>
            {audioInPlaylist.map((audio_item: Audio, index: number) => (
              <TableRow>
                <TableCell class="flex justify-end hover:cursor-pointer">
                  {audio_item.id === activeAudio()?.id && isAudioPlaying() ? (
                    <BiRegularPause size={"2em"} class="text-green" onClick={() => togglePlay()} />
                  ) : (
                    <BiRegularPlay size={"2em"} 
                      onClick={() => {
                        if(audio_item.id !== activeAudio()?.id) {
                          setActiveAudio(audio_item); 
                          setActivePlaylist([...audioInPlaylist]);
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
                      <DropdownMenuItem 
                        class="text-red-500 hover:cursor-pointer" 
                        onClick={() => {
                          removeFromPlaylist(audio_item.id).then(result => {
                            const isError = result instanceof Error;
                            (() => isError ? toast.error(result.message) : toast.success(`Successfully removed from playlist: ${playlistTitle()}`))();
                          });
                        }}
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