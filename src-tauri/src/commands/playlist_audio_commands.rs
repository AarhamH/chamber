use diesel::prelude::*;
use diesel::SqliteConnection;
use crate::db::establish_connection;
use crate::models::playlist_audio_model::NewPlaylistAudio;

#[tauri::command]
pub fn insert_audio_into_playlist(playlist_id_arg: i32, audio_id_arg: i32) -> Result<(), String> {
  use crate::schema::playlist_audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let new_playlist_audio: NewPlaylistAudio= NewPlaylistAudio{
    playlist_id: playlist_id_arg,
    audio_id: audio_id_arg,
  };

  let result: Result<usize, diesel::result::Error> = diesel::insert_into(playlist_audio)
    .values(&new_playlist_audio)
    .execute(&mut connection);

  match result {
      Ok(_) => Ok(()),
      Err(diesel::result::Error::DatabaseError(diesel::result::DatabaseErrorKind::UniqueViolation, _)) => {
          Err("Error: Duplicate key value pair for playlist entry".to_string())
      }
      Err(err) => {
          Err(format!("Error: {}", err))
      }
  }
}

#[tauri::command]
pub fn destroy_audio_from_playlist(playlist_id_arg: i32, audio_id_arg: i32) -> Result<(), String> {
  use crate::schema::playlist_audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let result: Result<usize, diesel::result::Error> = diesel::delete(playlist_audio
    .filter(playlist_id.eq(playlist_id_arg))
    .filter(audio_id.eq(audio_id_arg)))
    .execute(&mut connection);

  match result {
      Ok(_) => Ok(()),
      Err(err) => {
          Err(format!("Error: {}", err))
      }
  }
}