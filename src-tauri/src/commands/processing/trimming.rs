use diesel::prelude::*;
use diesel::SqliteConnection;
use crate::db::establish_connection;
pub use crate::helper::files::{create_audio_store_directory, construct_output_path};
pub use crate::helper::tools::{seconds_to_minutes,seconds_to_hh_mm_ss};
use crate::models::audio_model::NewAudio;
use crate::schema::audio::dsl::*;
use crate::helper::constants::audio_store_path;
use tauri::api::process::Command;

#[tauri::command]
pub async fn trim_single_audio(file_name:String, file_path:String, start:f64, end:f64, file_type:String) -> Result<(), String> {  
    create_audio_store_directory()?;
    let length = (end-start).ceil() as i32;
    let base_file_name = format!("{}-trimmed-to-{}-sec", file_name.replace(" ", "_"), length);
    let audio_store_path = audio_store_path();
    let mut destination_path = audio_store_path.join(format!("{}.{}",&base_file_name,&file_type)); 
    let mut counter = 1;

    while destination_path.exists() {
        // Create a new destination path with a counter suffix
        let new_file_name = format!("{}-{}", file_name, counter);
        destination_path = audio_store_path.join(format!("{}.{}",&new_file_name,&file_type));
        counter += 1;
    }

    let start_as_hh_mm_ss = seconds_to_hh_mm_ss(start as u64);
    let end_as_hh_mm_ss = seconds_to_hh_mm_ss(end as u64);
    
    let args = vec![
      "-ss", start_as_hh_mm_ss.as_str(),
      "-to", end_as_hh_mm_ss.as_str(),
      "-i", &file_path,
      "-c", "copy",
      &destination_path.to_str().unwrap(),
    ];

    let command = if cfg!(target_os = "windows") { "ffmpeg.exe" } else { "ffmpeg" };
    Command::new_sidecar(command)
        .expect("failed to create `my-sidecar` binary command")
        .args(&args)
        .spawn()
        .expect("Failed to spawn sidecar");

    let mut connection: SqliteConnection = establish_connection();
    let new_audio: NewAudio<'_> = NewAudio {
        title: &base_file_name,
        author: "Unknown",
        path: &destination_path.to_str().unwrap(),
        duration: &seconds_to_minutes(length as u64),
        audio_type: &file_type,
    };

    let result: Result<usize, diesel::result::Error> = diesel::insert_into(audio)
        .values(&new_audio)
        .execute(&mut connection);

    match result{
        Ok(_) => Ok(()),
        Err(e) => {
            return Err(format!("Error: Could not add audio entry to database: {}", e));
        }
    }
}