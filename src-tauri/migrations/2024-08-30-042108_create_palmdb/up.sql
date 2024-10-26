CREATE TABLE audio (
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  path TEXT NOT NULL,
  duration TEXT NOT NULL,
  audio_type TEXT NOT NULL
);

CREATE TABLE playlist (
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  created_on TEXT NOT NULL
);

CREATE TABLE playlist_audio (
  playlist_id INTEGER NOT NULL,
  audio_id INTEGER NOT NULL,
  FOREIGN KEY (playlist_id) REFERENCES playlist(id),
  FOREIGN KEY (audio_id) REFERENCES audio(id),
  PRIMARY KEY (playlist_id, audio_id)
);