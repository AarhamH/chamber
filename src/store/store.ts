import { createStore } from "solid-js/store";
import type { Music, Playlist } from "~/utils/types";

export const [playlists, setPlaylists] = createStore<Playlist[]>([]);
export const [music, setMusic] = createStore<Music[]>([]);
export const [musicInPlaylist, setMusicInPlaylist] = createStore<Music[]>([]);
export const [activeAudio, setActiveAudio] = createStore<Music>({} as Music);