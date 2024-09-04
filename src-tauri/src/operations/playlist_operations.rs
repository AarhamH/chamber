use diesel::prelude::*;
use crate::models::playlist_model:: {
    NewPlaylist, Playlist, PlaylistArg 
};
use crate::models::playlist_music_model::{NewPlaylistMusic, InsertMusicIntoPlaylistArg};
use crate::db::establish_connection;

#[tauri::command]
pub fn create_playlist(playlist_arg: PlaylistArg) {
  use crate::schema::playlist::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let new_playlist: NewPlaylist<'_> = NewPlaylist {
    title: &playlist_arg.title.unwrap_or_default().to_string(),
    created_on: &playlist_arg.created_on.unwrap_or_default().to_string(),
  };

  diesel::insert_into(playlist)
    .values(&new_playlist)
    .execute(&mut connection)
    .expect("Error saving new playlist");
}

#[tauri::command]
pub fn get_all_playlists() -> Vec<Playlist> {
    use crate::schema::playlist::dsl::*;

    let mut connection = establish_connection();

    let playlists = playlist
        .load::<Playlist>(&mut connection)
        .expect("Error loading playlists");
    println!("Displaying playlists");
    playlists 
}

#[tauri::command]
pub fn update_playlist(id_arg: i32, playlist_arg: PlaylistArg) {
    use crate::schema::playlist::dsl::*;

    let mut connection = establish_connection();

    let current_playlist: Playlist = playlist
        .find(id_arg)
        .first(&mut connection)
        .expect("Error loading playlist");

    let new_playlist = Playlist {
        id:id_arg,
        title: playlist_arg.title.unwrap_or(current_playlist.title),
        created_on: playlist_arg.created_on.unwrap_or(current_playlist.created_on),
    };

    diesel::update(playlist.find(id_arg))
        .set(&new_playlist)
        .execute(&mut connection)
        .expect("Error updating playlist");
}

pub fn insert_song_into_playlist(playlist_relationship: InsertMusicIntoPlaylistArg) {
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