use std::path::Path;

use diesel::prelude::*;
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
      read_file_to_buffer,
      create_audio_store_directory,
      copy_file_to_destination
  };
  let file_type: String = get_file_type(&file_path)?;
  if file_type != "audio/mpeg" && file_type != "audio/wav" {
      return Err("Unsupported file type: not an mp3 or wav".to_string());
  }

  let file_name: String = extract_file_name(&file_path)?;
  let buffer: Vec<u8> = read_file_to_buffer(&file_path)?;

  let duration_secs = match file_type.as_str() {
      "audio/mpeg" => {
        let mp3_metadata: mp3_metadata::MP3Metadata = mp3_metadata::read_from_slice(&buffer)
        .map_err(|e| format!("Unable to read mp3 metadata: {}", e))?;
        
        mp3_metadata.duration.as_secs()
        },
      "audio/wav" => {
        let wav_reader = hound::WavReader::new(std::io::Cursor::new(buffer)).unwrap();
        (wav_reader.duration() as u64 / wav_reader.spec().sample_rate as u64).into()
      },
      _ => 0,
  };
  
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
      audio_type: Some(file_type),
  })
}

#[tauri::command]
pub fn create_music(file_path: String) -> Result<(), String> {
  let music_arg: AudioArg = match read_file_metadata(file_path) {
    Ok(arg) => arg,
    Err(err) => return Err(err),
  };
  
  let mut connection: SqliteConnection = establish_connection();

  let new_music: NewAudio<'_> = NewAudio{
    title: &music_arg.title.unwrap_or_default().to_string(),
    author: &music_arg.author.unwrap_or_default().to_string(),
    path: &music_arg.path.unwrap_or_default().to_string(),
    duration: &music_arg.duration.unwrap_or_default().to_string(),
    audio_type: &music_arg.audio_type.unwrap_or_default().to_string()
  };

  let result: Result<usize, diesel::result::Error> = diesel::insert_into(audio)
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
pub fn get_all_music() -> Result<Vec<Audio>, String> {
  use crate::schema::audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let music_list: Vec<Audio> = match audio.load::<Audio>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
          eprintln!("Error loading playlists: {}", err);
          return Err(format!("Error querying playlist entries: {}", err)); // Return an error message
      }
  };
  
  Ok(music_list)
}


#[tauri::command]
pub fn get_music(music_id_arg: i32) -> Result<Vec<Audio>, String> {
  use crate::schema::audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let music_list: Vec<Audio> = match audio
    .filter(id.eq(music_id_arg))
    .load::<Audio>(&mut connection) {
      Ok(result) => result,
      Err(err) => {
        eprintln!("Error loading music from playlist: {}", err);
        return Err(format!("Error querying playlist music entries: {}", err));
      }
  };

  Ok(music_list)
}

#[tauri::command]
pub fn update_music(id_arg: i32, music_arg: AudioArg) -> Result<(), String> {
  use crate::schema::audio::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

    let current_song: Audio = audio
        .find(id_arg)
        .first(&mut connection)
        .expect("Error loading playlist");

    let new_music = Audio{
        id:id_arg,
        title: music_arg.title.unwrap_or(current_song.title),
        author: music_arg.author.unwrap_or(current_song.author),
        path: music_arg.path.unwrap_or(current_song.path),
        duration: music_arg.duration.unwrap_or(current_song.duration),
        audio_type: music_arg.audio_type.unwrap_or(current_song.audio_type)
    };
 
    let result: Result<_, _> = diesel::update(audio.find(id_arg))
      .set(&new_music)
      .execute(&mut connection);

    match result {
      Ok(_) => Ok(()),
      Err(err) => Err(format!("Error updating music entry: {}", err)), // Return error to the client
    }
}

#[tauri::command]
pub fn delete_music(music_id_arg: i32) -> Result<(), String> {
  use crate::schema::audio::dsl::*;
  use crate::schema::playlist_audio::dsl::*;
  
  let mut connection: SqliteConnection = establish_connection();

  // Delete playlist entries from playlist_music first to maintain referential integrity
  let result_playlist_music: Result<usize, diesel::result::Error> = diesel::delete(playlist_audio.filter(playlist_id.eq(music_id_arg)))
    .execute(&mut connection);

  match result_playlist_music {
    Ok(_) => (),
    Err(err) => return Err(format!("Error deleting playlist music entries: {}", err)), // Return error to the client
  }

  // Delete the playlist entry
  let result_playlist: Result<usize, diesel::result::Error> = diesel::delete(audio.filter(id.eq(music_id_arg)))
    .execute(&mut connection);

  match result_playlist {
    Ok(_) => Ok(()),
    Err(err) => Err(format!("Error deleting playlist entry: {}", err)), // Return error to the client
  }

}