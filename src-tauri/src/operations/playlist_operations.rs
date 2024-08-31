use diesel::prelude::*;
use crate::entities::playlist_entity:: {
    CreatePlaylist,
    UpdatePlaylist,
    InsertMusicIntoPlaylist,
};

use crate::models::playlist_model:: {
    Playlist,
    NewPlaylist 
};

use crate::models::playlist_music_model::NewPlaylistMusic;

use crate::db::establish_connection;

pub fn create_playlist(playlist_arg: CreatePlaylist) {
  use crate::schema::playlist::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let new_playlist: NewPlaylist<'_> = NewPlaylist {
    title: &playlist_arg.title,
    created_on: &playlist_arg.created_on,
  };

  diesel::insert_into(playlist)
    .values(&new_playlist)
    .execute(&mut connection)
    .expect("Error saving new playlist");
}

pub fn update_playlist(playlist_arg: UpdatePlaylist) {
  use crate::schema::playlist::dsl::*;

  let mut connection = establish_connection();

  let new_playlist = Playlist{
    id: playlist_arg.id,
    title: playlist_arg.title,
    created_on: playlist_arg.created_on,
  };

  diesel::update(playlist.find(playlist_arg.id))
    .set(&new_playlist)
    .execute(&mut connection)
    .expect("Error updating playlist");
}

pub fn inser_song_into_playlist(playlist_relationship: InsertMusicIntoPlaylist) {
  use crate::schema::playlist_music::dsl::*;

  let mut connection = establish_connection();

  let new_playlist_music = NewPlaylistMusic {
    playlist_id: playlist_relationship.playlist_id,
    music_id: playlist_relationship.music_id,
  };

  diesel::insert_into(playlist_music)
    .values(&new_playlist_music)
    .execute(&mut connection)
    .expect("Error saving new playlist music");
}