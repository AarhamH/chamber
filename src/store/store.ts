import { createStore } from "solid-js/store";
import type { Audio, Playlist, YoutubeQuery } from "~/utils/types";

export const [playlists, setPlaylists] = createStore<Playlist[]>([]);
export const [audio, setAudio] = createStore<Audio[]>([]);
export const [audioInPlaylist, setAudioInPlaylist] = createStore<Audio[]>([]);
export const [activeAudio, setActiveAudio] = createStore<Audio>({} as Audio);
export const [youtubeQueue, setYoutubeQueue] = createStore<YoutubeQuery[]>([]);
export const [audioCodecQueue, setAudioCodecQueue] = createStore<Audio[]>([]);