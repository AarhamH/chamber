import { useParams } from "@solidjs/router"
import { invoke } from "@tauri-apps/api/tauri";
import { createEffect} from "solid-js";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "~/components/Table"

import { Music } from "~/interfaces/interfaces";
import { musicInPlaylist, setMusicInPlaylist } from "~/store/store";

export const PlaylistPage = () => {
  const params = useParams();
  const playIcon = "https://img.icons8.com/?size=100&id=Uh8hvgeb99i5&format=png&color=FFFFFF" 

  const fetchMusicFromPlaylist = async () => {
    try {
      const result = await invoke<Music[]>("get_all_music_from_playlist", {playlistIdArg: parseInt(params.id)});
      setMusicInPlaylist(result);
    } catch (error) {
      return error
    }
  }

  createEffect(() => {
    if (params.id) {
      fetchMusicFromPlaylist();
    }
  });
  
  return(
    <div>
      <div class="h-40">
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
              <>
                <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.id}</TableCell>
                <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.title}</TableCell>
                <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.artist}</TableCell>
                <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.path}</TableCell>
                <TableCell class="max-w-sm truncate overflow-hidden whitespace-nowrap">{song.duration}</TableCell>
              </>
              <TableCell class="flex justify-start w-16">
                <img class="w-5" src={playIcon} />
              </TableCell>  
            </TableRow>
          ))}
        </TableBody>
      </Table>
      Playlist with id of <code>{params.id}</code>
    </div>
  )
}