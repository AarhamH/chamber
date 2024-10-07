export type Playlist = {
  id: number;
  title: string;
  created_on: string;
}

export type Music = {
  id: number;
  title: string;
  artist: string;
  path: string;
  duration: string;
}

export type YoutubeQuery = {
  title: string;
  channel: string;
  views: string;
  duration: string;
  thumbnail: string;
}

export type PlaylistArg = Partial<Playlist>;
export type MusicArg = Partial<Music>;