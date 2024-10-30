use std::path::Path;

use diesel::prelude::*;
use lofty::file::AudioFile;
use lofty::probe::Probe;
use crate::helper::constants::AUDIO_STORE;
use crate::helper::tools::seconds_to_minutes;
use crate::schema::audio::dsl::*;
use crate::models::audio_model:: {
    Audio, AudioArg, NewAudio,
};
use crate::db::establish_connection;

fn read_file_metadata(file_path: String) -> Result<AudioArg, String> {
  use crate::helper::files::{
      get_file_type,
      extract_file_name,
      create_audio_store_directory,
      copy_file_to_destination
  };
  let file_type: String = get_file_type(&file_path)?;

  let file_name: String = extract_file_name(&file_path)?;

  // read the file into memory for parsing metadata (duration)
  let tagged_file = Probe::open(file_path.clone())
    .expect("Error opening file")
    .read()
    .expect("Error reading file");

  let properties = tagged_file.properties();

  let duration_secs = properties.duration().as_secs();
  
  create_audio_store_directory()?;

  // create destination path based on file_name, if there is a duplicate, add a suffix -1, -2, etc.
  let mut destination_path = Path::new(AUDIO_STORE).join(&file_name);
  let mut counter = 1;
        
  while destination_path.exists() {
      // Create a new destination path with a counter suffix
      let new_file_name = format!("{}-{}", file_name, counter);
      destination_path = Path::new(AUDIO_STORE).join(new_file_name);
      counter += 1;
  }

  copy_file_to_destination(&file_path, destination_path.to_str().unwrap()).map_err(|e| format!("Unable to copy file: {}", e))?;

  Ok(AudioArg{
      title: Some(file_name),
      author: Some("Unknown".to_string()),
      path: Some((&destination_path.to_str().unwrap()).to_string()),
      duration: Some(seconds_to_minutes(duration_secs)),
      audio_type: if file_type == "audio/mpeg" { Some("mp3".to_string()) } else { Some("wav".to_string()) },
  })
}

#[tauri::command]
pub fn create_audio(file_path: String) -> Result<(), String> {
  let audio_arg: AudioArg = match read_file_metadata(file_path) {
    Ok(arg) => arg,
    Err(err) => return Err(err),
  };
  
  let mut connection: SqliteConnection = establish_connection();

  let new_audio: NewAudio<'_> = NewAudio{
    title: &audio_arg.title.unwrap_or_default().to_string(),
    author: &audio_arg.author.unwrap_or_default().to_string(),
    path: &audio_arg.path.unwrap_or_default().to_string(),
    duration: &audio_arg.duration.unwrap_or_default().to_string(),
    audio_type: &audio_arg.audio_type.unwrap_or_default().to_string()
  };

  let result: Result<usize, diesel::result::Error> = diesel::insert_into(audio)
    .values(&new_audio)
    .execute(&mut connection);

  match result {
    Ok(_) => Ok(()),

    Err(diesel::result::Error::DatabaseError(diesel::result::DatabaseErrorKind::UniqueViolation, _)) => {
        Err("Error: Could not add audio entry to database".to_string()) // Return error to the client
    }
    Err(err) => {
        Err(format!("Error: {}", err))
    }
  }
}

#[tauri::command]
pub fn get_all_audio() -> Result<Vec<Audio>, String> {
  use crate::schema::audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let audio_list: Vec<Audio> = match audio.load::<Audio>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
          eprintln!("Error loading playlists: {}", err);
          return Err(format!("Error querying playlist entries: {}", err)); // Return an error message
      }
  };
  
  Ok(audio_list)
}

#[tauri::command]
pub fn get_audio(audio_id_arg: i32) -> Result<Vec<Audio>, String> {
  use crate::schema::audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let audio_list: Vec<Audio> = match audio
    .filter(id.eq(audio_id_arg))
    .load::<Audio>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
        eprintln!("Error loading audio from playlist: {}", err);
        return Err(format!("Error querying playlist audio entries: {}", err));
      }
  };

  Ok(audio_list)
}

#[tauri::command]
pub fn update_audio(id_arg: i32, audio_arg: AudioArg) -> Result<(), String> {
  use crate::schema::audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

    let current_audio: Audio = audio
        .find(id_arg)
        .first(&mut connection)
        .expect("Error loading playlist");

    let new_audio = Audio{
        id:id_arg,
        title: audio_arg.title.unwrap_or(current_audio.title),
        author: audio_arg.author.unwrap_or(current_audio.author),
        path: audio_arg.path.unwrap_or(current_audio.path),
        duration: audio_arg.duration.unwrap_or(current_audio.duration),
        audio_type: audio_arg.audio_type.unwrap_or(current_audio.audio_type)
    };
 
    let result: Result<_, _> = diesel::update(audio.find(id_arg))
      .set(&new_audio)
      .execute(&mut connection);

    match result {
      Ok(_) => Ok(()),
      Err(err) => Err(format!("Error updating audio entry: {}", err)), // Return error to the client
    }
}

#[tauri::command]
pub fn delete_audio(audio_id_arg: i32) -> Result<(), String> {
  use crate::schema::audio::dsl::*;
  use crate::schema::playlist_audio::dsl::*;
  
  let mut connection: SqliteConnection = establish_connection();

  // Delete playlist entries from playlist_audio first to maintain referential integrity
  let result_playlist_audio: Result<usize, diesel::result::Error> = diesel::delete(playlist_audio.filter(playlist_id.eq(audio_id_arg)))
    .execute(&mut connection);

  match result_playlist_audio {
    Ok(_) => (),
    Err(err) => return Err(format!("Error deleting playlist audio entries: {}", err)), // Return error to the client
  }

  // Delete the playlist entry
  let result_playlist: Result<usize, diesel::result::Error> = diesel::delete(audio.filter(id.eq(audio_id_arg)))
    .execute(&mut connection);

  match result_playlist {
    Ok(_) => Ok(()),
    Err(err) => Err(format!("Error deleting playlist entry: {}", err)), // Return error to the client
  }

}