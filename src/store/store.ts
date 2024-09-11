import { createStore } from "solid-js/store";
import type { Music, Playlist } from "~/interfaces/interfaces";

export const [playlists, setPlaylists] = createStore<Playlist[]>([]);
export const [musicInPlaylist, setMusicInPlaylist] = createStore<Music[]>([]);