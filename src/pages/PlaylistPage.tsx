import { useNavigate, useParams } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/tauri";
import { open } from "@tauri-apps/api/dialog";
import { createEffect, createSignal} from "solid-js";
import { Playlist, PlaylistArg } from "~/utils/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/Table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/Dropdown"

import { Music } from "~/utils/types";
import { playlists, setPlaylists, musicInPlaylist, setMusicInPlaylist, music, setMusic, activeAudio } from "~/store/store";
import { Button } from "~/components/Button";
import img from "~/assets/GOJIRA-THE-WAY-OF-ALL-FLESH-2XWINYL-2627680470.png";
import { BiRegularPause, BiRegularPlay } from "solid-icons/bi"
import { BiRegularDotsVerticalRounded } from "solid-icons/bi"
import { IoAdd } from "solid-icons/io"
import { useAudio } from "~/components/AudioContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/Dialog";

export const PlaylistPage = () => {
  const params = useParams();
  const [ playlistTitle, setPlaylistTitle ] = createSignal<string>(playlists.find((playlistItem) => playlistItem.id === parseInt(params.id))?.title || "");
  const { setActiveAudio } = useAudio();
  let playlistPageRef!: HTMLDivElement;
  const navigate = useNavigate();

  createEffect(() => {
    if (params.id) {
      fetchMusicFromPlaylist();
      fetchAllAudio();
      const playlist = playlists.find((playlistItem) => playlistItem.id === parseInt(params.id));
      setPlaylistTitle(playlist?.title || "");
    }
  });

  const fetchMusicFromPlaylist = async () => {
    try {
      const result = await invoke<Music[]>("get_all_music_from_playlist", {playlistIdArg: parseInt(params.id)});
      setMusicInPlaylist(result);
    } catch (error) {
      return error
    }
  }

  const fetchAllAudio = async () => {
    try {
      const result = await invoke<Music[]>("get_all_music");
      setMusic(result);
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
  
  const insertMusicToPlaylist = async (id:number) => {
    try{
      await invoke("insert_song_into_playlist", { playlistIdArg: parseInt(params.id), musicIdArg: id });
      fetchMusicFromPlaylist();
    } catch (error) {
      return error
    }
  };

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
 
  const deleteCurrentPlaylist = async () => {
    try {
      await invoke("delete_playlist", { playlistIdArg: parseInt(params.id) });
      const result = await invoke<Playlist[]>("get_all_playlists");
      setPlaylists(result);
      navigate("/search");
    } catch (error) {
      return error
    } 
  }

  const removeFromPlaylist = async (id: number) => {
    try {
      await invoke("destroy_song_from_playlist", { playlistIdArg: parseInt(params.id), musicIdArg: id });
      fetchMusicFromPlaylist();
    } catch (error) {
      return error
    } 
  }

  return(
    <div ref={playlistPageRef}>
      <div class="pt-10 pb-5 flex items-end justify-start">
        <img src={img} class="ml-10 mr-10 w-48 h-auto rounded-md" />
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
              <DialogContent class="w-2/3 h-2/3">
                <DialogHeader>
                  <div class="flex flex-col items-center justify-center">
                    <DialogTitle>Add to Playlist</DialogTitle>
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
                              <IoAdd class="flex justify-end hover:cursor-pointer" size={24} onClick={() => insertMusicToPlaylist(song.id)}/>
                            </TableCell>  
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
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
            <TableHead class="ml-5 w-16 text-left"></TableHead>
            <TableHead class="w-2 truncate">ID</TableHead>
            <TableHead class="w-1/4 truncate">Title</TableHead>
            <TableHead class="w-2/12 truncate">Artist</TableHead>
            <TableHead class="w-1/4 truncate">Path</TableHead>
            <TableHead class="w-10 truncate">Duration</TableHead>
            <TableHead class="w-16 text-right truncate"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {musicInPlaylist.map((song:Music, index: number) => (
            <TableRow>
              <TableCell class="flex justify-end hover:cursor-pointer">
                {song.id === activeAudio.id ? (
                  <BiRegularPause size={36} class="text-green" />
                ) : (
                  <BiRegularPlay size={36} onClick={() => setActiveAudio(song)} />
                )}
              </TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{index+1}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.title}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.artist}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.path}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.duration}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <BiRegularDotsVerticalRounded size={24} onClick={() => insertMusicToPlaylist(song.id)}/>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem class="text-red-500 hover:cursor-pointer" onClick={() => {removeFromPlaylist(song.id)}}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>                    
              </TableCell>  
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}