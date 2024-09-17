import { useParams } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/tauri";
import { createEffect, createSignal} from "solid-js";
import { MusicArg, PlaylistArg } from "~/utils/types";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/Table"

import { Music } from "~/utils/types";
import { playlists, setPlaylists, musicInPlaylist, setMusicInPlaylist } from "~/store/store";
import { Button } from "~/components/Button";
import img from "~/assets/GOJIRA-THE-WAY-OF-ALL-FLESH-2XWINYL-2627680470.png";
import Modal from "~/components/Modal";

export const PlaylistPage = () => {
  const params = useParams();
  const playIcon = "https://img.icons8.com/?size=100&id=Uh8hvgeb99i5&format=png&color=FFFFFF" 
  const [ playlistTitle, setPlaylistTitle ] = createSignal<string>(playlists[parseInt(params.id)-1].title);
  const [modalIsOpen, setModalIsOpen] = createSignal(false);
  const closeModal = () => setModalIsOpen(false);

  createEffect(() => {
    if (params.id) {
      const playlistIndex = parseInt(params.id) - 1;
      fetchMusicFromPlaylist();
      setPlaylistTitle(playlists[playlistIndex]?.title || ""); // Update playlist title
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

  const changePlaylistTitle = async () => {
    const playlistArg: PlaylistArg = { title: playlistTitle() };
    try{
      await invoke("update_playlist", { idArg: parseInt(params.id), playlistArg });
      setPlaylists(parseInt(params.id) - 1, "title", playlistTitle());
    } catch (error) {
      return error
    }
  };

  const handleInput = (e: InputEvent) => {
    const newInput = e.target as HTMLInputElement;
    setPlaylistTitle(newInput.value); // Just set the local state without invoking update
  };

  const insertMusicToPlaylist = async () => {
    const musicArg: MusicArg = {
      title: "Unknown",
      artist: "Unknown",
      path: "Unknown",   
      duration: "Unknown"
    }
    await invoke("create_music", { musicArg }); 
  };

  return(
    <div>
      <div class="pt-10 flex items-end justify- start">
        <img src={img} class="ml-10 mr-10 w-48 h-auto rounded-md" />
        <div class="flex flex-col">
          <input
            type="text"
            value={playlistTitle()}
            onInput={handleInput}  
            onBlur={changePlaylistTitle} 
            onKeyPress={(e) => {
              if (e.key === "Enter") changePlaylistTitle();
            }}
            class="font-medium bg-transparent text-7xl"
          />
          <div class="flex flex-row mt-2">
            <Button class="w-32" onClick={() => {setModalIsOpen(true)}} variant={"link"}>Add Music</Button> 
          </div>
        </div>
      </div>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
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
            
          {musicInPlaylist.map((song:Music) => (
            <TableRow>
              <TableCell class="flex justify-end w-16">
                <img class="w-5" src={playIcon} />
              </TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.id}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.title}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.artist}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.path}</TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.duration}</TableCell>
              <TableCell class="flex justify-start w-16">
                <img class="w-5" src={playIcon} />
              </TableCell>  
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {modalIsOpen() && (
        <Modal isShown={modalIsOpen()} closeModal={closeModal}>
          hey
        </Modal>
      )}
    </div>
  )
}