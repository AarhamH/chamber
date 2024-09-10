import { createStore } from "solid-js/store";
import type { Playlist } from "~/interfaces/interfaces";

export const [playlists, setPlaylists] = createStore<Playlist[]>([]);