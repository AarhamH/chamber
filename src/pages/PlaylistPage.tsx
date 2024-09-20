import { useNavigate, useParams } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/tauri";
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

import { Music } from "~/utils/types";
import { playlists, setPlaylists, musicInPlaylist, setMusicInPlaylist, music, setMusic } from "~/store/store";
import { Button } from "~/components/Button";
import img from "~/assets/GOJIRA-THE-WAY-OF-ALL-FLESH-2XWINYL-2627680470.png";
import Modal from "~/components/Modal";

export const PlaylistPage = () => {
  const params = useParams();
  const playIcon = "https://img.icons8.com/?size=100&id=Uh8hvgeb99i5&format=png&color=FFFFFF" 
  const [ playlistTitle, setPlaylistTitle ] = createSignal<string>(
    playlists.find((playlistItem) => playlistItem.id === parseInt(params.id))?.title || ""
  );
  const [modalIsOpen, setModalIsOpen] = createSignal(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = createSignal(false);
  const closeModal = () => setModalIsOpen(false);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  let playlistPageRef!: HTMLDivElement;
  const navigate = useNavigate()

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
      setPlaylists(parseInt(params.id) - 1, "title", playlistTitle());
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

  const  addAudio= async () => {
    const filePath = "/home/ahaider/Desktop/History's Worst Non-Water Floods.mp3"
    await invoke("create_music", { filePath: filePath });
    fetchAllAudio();
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

  const headerButtons = [
    <Button class="w-32" onClick={addAudio} variant={"link"}>Add Audio</Button>,
  ]

  return(
    <div ref={playlistPageRef}>
      <div class="pt-10 pb-5 flex items-end justify- start">
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
          <div class="flex flex-row mt-6 space-x-4">
            <Button class="w-32" onClick={() => {setModalIsOpen(true)}} variant={"filled"} size={"sm"}>Add Music</Button> 
            <Button class="w-32" onClick={() => {setIsDeleteModalOpen(true)}} variant={"destructive"} size={"sm"}>Delete Playlist</Button> 
          </div>
        </div>
      </div>
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
              <TableCell class="flex justify-end w-16">
                <img class="w-5" src={playIcon} />
              </TableCell>
              <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{index+1}</TableCell>
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
      {isDeleteModalOpen() && (
        <Modal size="sm" isShown={isDeleteModalOpen()} closeModal={closeDeleteModal}>
          <div class="flex flex-col items-center justify-center mt-5 ">
            <div class="text-xl font-semibold">Are you sure you want to delete?</div>
            <div class="flex flex-row space-x-4">
              <Button class="w-16" onClick={closeDeleteModal} variant={"default"} size={"sm"}>Cancel</Button>
              <Button class="w-16" onClick={deleteCurrentPlaylist} variant={"destructive"} size={"sm"}>Delete</Button>
            </div>
          </div>  
        </Modal>
      )}
      {modalIsOpen() && (
        <Modal size="lg" title="Downloaded Music" isShown={modalIsOpen()} closeModal={closeModal} headerButtons={headerButtons}>
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
                  <TableCell class="flex justify-end w-16">
                    <img onClick={() => insertMusicToPlaylist(song.id)} class="w-5" src={playIcon} />
                  </TableCell>  
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Modal>
      )}
    </div>
  )
}