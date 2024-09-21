use diesel::prelude::*;
use crate::models::playlist_model:: {
    NewPlaylist, Playlist, PlaylistArg 
};
use crate::models::music_model::Music;
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
        eprintln!("Error loading music from playlist: {}", err);
        return Err(format!("Error querying playlist music entries: {}", err));
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

  let new_playlist = Playlist {
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
pub fn get_all_music_from_playlist(playlist_id_arg: i32) -> Result<Vec<Music>, String> {
  use crate::schema::playlist_music::dsl::*;
  use crate::schema::music::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let music_id_list: Vec<i32> = match playlist_music
  .filter(playlist_id.eq(playlist_id_arg))
  .select(music_id) 
  .load::<i32>(&mut connection) {
      Ok(ids) => ids,
      Err(err) => {
        eprintln!("Error loading music IDs from playlist: {}", err);
        return Err(format!("Error querying playlist music entries: {}", err));
      }
  };

  let music_list: Vec<Music> = match music
  .filter(id.eq_any(music_id_list)) // Filter by the list of music_ids
  .load::<Music>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
          eprintln!("Error loading music: {}", err);
          return Err(format!("Error querying music: {}", err));
      }
  };

  Ok(music_list)
}

#[tauri::command]
pub fn delete_playlist(playlist_id_arg: i32) -> Result<(), String> {
  use crate::schema::playlist::dsl::*;
  use crate::schema::playlist_music::dsl::*;
  
  let mut connection: SqliteConnection = establish_connection();

  // Delete playlist entries from playlist_music first to maintain referential integrity
  let result_playlist_music: Result<usize, diesel::result::Error> = diesel::delete(playlist_music.filter(playlist_id.eq(playlist_id_arg)))
    .execute(&mut connection);

  match result_playlist_music {
    Ok(_) => (),
    Err(err) => return Err(format!("Error deleting playlist music entries: {}", err)), // Return error to the client
  }

  // Delete the playlist entry
  let result_playlist: Result<usize, diesel::result::Error> = diesel::delete(playlist.filter(id.eq(playlist_id_arg)))
    .execute(&mut connection);

  match result_playlist {
    Ok(_) => Ok(()),
    Err(err) => Err(format!("Error deleting playlist entry: {}", err)), // Return error to the client
  }

}