CREATE TABLE music(
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  path TEXT NOT NULL,
  duration TEXT NOT NULL
);

CREATE TABLE playlist(
  id INTEGER PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  created_on TEXT NOT NULL
);

CREATE TABLE playlist_music(
  playlist_id INTEGER NOT NULL,
  music_id INTEGER NOT NULL,
  FOREIGN KEY (playlist_id) REFERENCES playlist(id),
  FOREIGN KEY (music_id) REFERENCES music(id),
  PRIMARY KEY (playlist_id, music_id)
);