export type Playlist = {
  id: number;
  title: string;
  created_on: string;
}

export type Audio = {
  id: number;
  title: string;
  author: string;
  path: string;
  duration: string;
  audio_type: string;
}

export type AudioCodec = Audio & {
  converted_type: string;
}

export type YoutubeQuery = {
  title: string;
  channel: string;
  views: string;
  duration: string;
  thumbnail: string;
  url: string;
}

export type PlaylistArg = Partial<Playlist>;
export type AudioArg = Partial<Audio>;