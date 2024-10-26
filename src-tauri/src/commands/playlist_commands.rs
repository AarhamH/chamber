use diesel::prelude::*;
use crate::models::playlist_model:: {
    NewPlaylist, Playlist, PlaylistArg 
};
use crate::models::audio_model::Audio;
use crate::db::establish_connection;

#[tauri::command]
pub fn create_playlist(playlist_arg: PlaylistArg) -> Result<(), String> {
  use crate::schema::playlist::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let new_playlist: NewPlaylist<'_> = NewPlaylist {
    title: &playlist_arg.title.unwrap_or_default().to_string(),
    created_on: &playlist_arg.created_on.unwrap_or_default().to_string(),
  };

  let result: Result<usize, diesel::result::Error> = diesel::insert_into(playlist)
    .values(&new_playlist)
    .execute(&mut connection);

  match result {
    Ok(_) => Ok(()),
    Err(diesel::result::Error::DatabaseError(diesel::result::DatabaseErrorKind::UniqueViolation, _)) => {
        Err("Error: Could not create playlist entry".to_string())
    }
    Err(err) => {
        Err(format!("Error: {}", err))
    }
  }
}

#[tauri::command]
pub fn get_all_playlists() -> Result<Vec<Playlist>, String> {
  use crate::schema::playlist::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let playlists: Vec<Playlist> = match playlist.load::<Playlist>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
          eprintln!("Error loading playlists: {}", err);
          return Err(format!("Error querying playlist entries: {}", err)); // Return an error message
      }
  };
  
  Ok(playlists)
}

#[tauri::command]
pub fn get_playlist(playlist_id_arg: i32) -> Result<Vec<Playlist>, String> {
  use crate::schema::playlist::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let playlist_list: Vec<Playlist> = match playlist
    .filter(id.eq(playlist_id_arg))
    .load::<Playlist>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
        eprintln!("Error loading audio from playlist: {}", err);
        return Err(format!("Error querying playlist audio entries: {}", err));
      }
  };

  Ok(playlist_list)
}

#[tauri::command]
pub fn update_playlist(id_arg: i32, playlist_arg: PlaylistArg) -> Result<(), String> {
  use crate::schema::playlist::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let current_playlist: Playlist = playlist
    .find(id_arg)
    .first(&mut connection)
    .expect("Error loading playlist");

  let new_playlist: Playlist = Playlist {
    id: id_arg,
    title: playlist_arg.title.unwrap_or(current_playlist.title),
    created_on: playlist_arg.created_on.unwrap_or(current_playlist.created_on),
  };

  let result: Result<_, _> = diesel::update(playlist.find(id_arg))
    .set(&new_playlist)
    .execute(&mut connection);

  match result {
    Ok(_) => Ok(()),
    Err(err) => Err(format!("Error updating playlist entry: {}", err)), // Return error to the client
  }
}


#[tauri::command]
pub fn get_all_audio_from_playlist(playlist_id_arg: i32) -> Result<Vec<Audio>, String> {
  use crate::schema::playlist_audio::dsl::*;
  use crate::schema::audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let audio_id_list: Vec<i32> = match playlist_audio
  .filter(playlist_id.eq(playlist_id_arg))
  .select(audio_id) 
  .load::<i32>(&mut connection) {
      Ok(ids) => ids,
      Err(err) => {
        eprintln!("Error loading audio IDs from playlist: {}", err);
        return Err(format!("Error querying playlist audio entries: {}", err));
      }
  };

  let audio_list: Vec<Audio> = match audio
  .filter(id.eq_any(audio_id_list)) // Filter by the list of audio_ids
  .load::<Audio>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
          eprintln!("Error loading audio: {}", err);
          return Err(format!("Error querying audio: {}", err));
      }
  };

  Ok(audio_list)
}

#[tauri::command]
pub fn delete_playlist(playlist_id_arg: i32) -> Result<(), String> {
  use crate::schema::playlist::dsl::*;
  use crate::schema::playlist_audio::dsl::*;
  
  let mut connection: SqliteConnection = establish_connection();

  // Delete playlist entries from playlist_audio first to maintain referential integrity
  let result_playlist_audio: Result<usize, diesel::result::Error> = diesel::delete(playlist_audio.filter(playlist_id.eq(playlist_id_arg)))
    .execute(&mut connection);

  match result_playlist_audio {
    Ok(_) => (),
    Err(err) => return Err(format!("Error deleting playlist audio entries: {}", err)), // Return error to the client
  }

  // Delete the playlist entry
  let result_playlist: Result<usize, diesel::result::Error> = diesel::delete(playlist.filter(id.eq(playlist_id_arg)))
    .execute(&mut connection);

  match result_playlist {
    Ok(_) => Ok(()),
    Err(err) => Err(format!("Error deleting playlist entry: {}", err)), // Return error to the client
  }

}