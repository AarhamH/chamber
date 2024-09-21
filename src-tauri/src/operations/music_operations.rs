use diesel::prelude::*;
use crate::schema::music::dsl::*;

use crate::models::music_model:: {
    Music, MusicArg, NewMusic
};
use crate::db::establish_connection;

#[tauri::command]
pub fn create_music(file_path: String) -> Result<(), String> {
  use crate::helper::files::process_audio_file;

  let music_arg: MusicArg = match process_audio_file(file_path) {
      Ok(arg) => arg,
      Err(err) => return Err(err),
  };

  let mut connection: SqliteConnection = establish_connection();

  let new_music: NewMusic<'_> = NewMusic {
    title: &music_arg.title.unwrap_or_default().to_string(),
    artist: &music_arg.artist.unwrap_or_default().to_string(),
    path: &music_arg.path.unwrap_or_default().to_string(),
    duration: &music_arg.duration.unwrap_or_default().to_string()
  };

  let result: Result<usize, diesel::result::Error> = diesel::insert_into(music)
    .values(&new_music)
    .execute(&mut connection);

  match result {
    Ok(_) => Ok(()),

    Err(diesel::result::Error::DatabaseError(diesel::result::DatabaseErrorKind::UniqueViolation, _)) => {
        Err("Error: Could not add music entry to database".to_string()) // Return error to the client
    }
    Err(err) => {
        Err(format!("Error: {}", err))
    }
  }
}

#[tauri::command]
pub fn get_all_music() -> Result<Vec<Music>, String> {
  use crate::schema::music::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let music_list: Vec<Music> = match music.load::<Music>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
          eprintln!("Error loading playlists: {}", err);
          return Err(format!("Error querying playlist entries: {}", err)); // Return an error message
      }
  };
  
  Ok(music_list)
}


#[tauri::command]
pub fn get_music(music_id_arg: i32) -> Result<Vec<Music>, String> {
  use crate::schema::music::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let music_list: Vec<Music> = match music
    .filter(id.eq(music_id_arg))
    .load::<Music>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
        eprintln!("Error loading music from playlist: {}", err);
        return Err(format!("Error querying playlist music entries: {}", err));
      }
  };

  Ok(music_list)
}

#[tauri::command]
pub fn update_music(id_arg: i32, music_arg: MusicArg) -> Result<(), String> {
  use crate::schema::music::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

    let current_song: Music = music
        .find(id_arg)
        .first(&mut connection)
        .expect("Error loading playlist");

    let new_music = Music{
        id:id_arg,
        title: music_arg.title.unwrap_or(current_song.title),
        artist: music_arg.artist.unwrap_or(current_song.artist),
        path: music_arg.path.unwrap_or(current_song.path),
        duration: music_arg.duration.unwrap_or(current_song.duration)
    };
 
    let result: Result<_, _> = diesel::update(music.find(id_arg))
      .set(&new_music)
      .execute(&mut connection);

    match result {
      Ok(_) => Ok(()),
      Err(err) => Err(format!("Error updating music entry: {}", err)), // Return error to the client
    }
}

#[tauri::command]
pub fn delete_music(music_id_arg: i32) -> Result<(), String> {
  use crate::schema::music::dsl::*;
  use crate::schema::playlist_music::dsl::*;
  
  let mut connection: SqliteConnection = establish_connection();

  // Delete playlist entries from playlist_music first to maintain referential integrity
  let result_playlist_music: Result<usize, diesel::result::Error> = diesel::delete(playlist_music.filter(playlist_id.eq(music_id_arg)))
    .execute(&mut connection);

  match result_playlist_music {
    Ok(_) => (),
    Err(err) => return Err(format!("Error deleting playlist music entries: {}", err)), // Return error to the client
  }

  // Delete the playlist entry
  let result_playlist: Result<usize, diesel::result::Error> = diesel::delete(music.filter(id.eq(music_id_arg)))
    .execute(&mut connection);

  match result_playlist {
    Ok(_) => Ok(()),
    Err(err) => Err(format!("Error deleting playlist entry: {}", err)), // Return error to the client
  }

}