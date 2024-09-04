export type Playlist = {
  id: number;
  title: string;
  created_on: string;
}

export type PlaylistArg = {
  title: string | null;
  created_on: string | null;
}

export type Music = {
  id: number;
  title: string;
  artist: string;
  path: string;
}

export type MusicArg = {
  title: string | null;
  artist: string | null;
  path: string | null;
}