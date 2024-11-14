import { createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { Audio, AudioCodec, Playlist, YoutubeQuery } from "~/utils/types";

export const [playlists, setPlaylists] = createStore<Playlist[]>([]);
export const [audio, setAudio] = createStore<Audio[]>([]);
export const [audioInPlaylist, setAudioInPlaylist] = createStore<Audio[]>([]);
export const [youtubeQueue, setYoutubeQueue] = createStore<YoutubeQuery[]>([]);
export const [audioCodecQueue, setAudioCodecQueue] = createStore<AudioCodec[]>([]);
export const [effectInput, setEffectInput] = createStore<Audio>({} as Audio);
export const [modifyAudioTrim, setModifyAudioTrim] = createStore<Audio>({} as Audio);
// loading states
export const [isAudioTranscodeLoading, setIsAudioTranscodeLoading] = createSignal(false);
export const [isSearchDownloading, setIsSearchDownloading] = createSignal(false);