import { createStore } from "solid-js/store";
import type { Music, Playlist, YoutubeQuery } from "~/utils/types";

export const [playlists, setPlaylists] = createStore<Playlist[]>([]);
export const [music, setMusic] = createStore<Music[]>([]);
export const [musicInPlaylist, setMusicInPlaylist] = createStore<Music[]>([]);
export const [activeAudio, setActiveAudio] = createStore<Music>({} as Music);
export const [youtubeQueue, setYoutubeQueue] = createStore<YoutubeQuery[]>([]);
export const [audioCodecQueue, setAudioCodecQueue] = createStore<Music[]>([]);