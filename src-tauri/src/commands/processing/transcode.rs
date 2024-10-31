
use diesel::prelude::*;
use crate::binary_path_gen::FFMPEG_NO_EXT_PATH;
use crate::binary_path_gen::FFMPEG_PATH;
use crate::db::establish_connection;
use crate::helper::constants::AUDIO_STORE;
pub use crate::helper::files::{create_audio_store_directory, construct_output_path};
use crate::models::audio_model::NewAudio;
use crate::schema::audio::dsl::*;
use tokio::sync::mpsc;
use std::process::Command;
use tokio::task;
use serde::{Serialize, Deserialize};   
use std::sync::{Arc, Mutex};     
use std::collections::HashSet;

#[derive(Debug, Deserialize, Serialize)]
pub struct QueueItem {
    pub title: String,
    pub author: String,
    pub path: String,
    pub duration: String,
    pub converted_type: String,
    pub is_added_to_list: bool,
}

#[tauri::command]
pub async fn transcode_audio(queue_items: Vec<QueueItem>) -> Result<(), String> {
    create_audio_store_directory()?;

    let (tx, mut rx) = mpsc::channel(32);
    let handles = Arc::new(Mutex::new(Vec::new()));
    let file_paths = Arc::new(Mutex::new(HashSet::new())); // HashSet to track file paths

    for queue_item in queue_items {
        let command = if cfg!(target_os = "windows") { FFMPEG_PATH } else { FFMPEG_NO_EXT_PATH };
        let tx = tx.clone();
        let handles = Arc::clone(&handles);
        let file_paths = Arc::clone(&file_paths);

        let handle = task::spawn(async move {
            let base_file_name = format!("{}-converted_to-{}.{}", queue_item.title.replace(" ", "_"), queue_item.converted_type, queue_item.converted_type);
            
            let mut destination_path = construct_output_path(AUDIO_STORE, &base_file_name, &queue_item.converted_type);
            let mut counter = 1;

            // Lock the HashSet to check for existing paths
            loop {
                let mut paths_guard = file_paths.lock().unwrap();
                if !paths_guard.contains(&destination_path) {
                    paths_guard.insert(destination_path.clone());
                    break; // Found a unique path
                } else {
                    // Generate a new file name
                    counter += 1;
                    let new_file_name = format!("{}-converted_to-{}-{}.{}", queue_item.title.replace(" ", "_"), queue_item.converted_type, counter, queue_item.converted_type);
                    destination_path = construct_output_path(AUDIO_STORE, &new_file_name, &queue_item.converted_type);
                }
            }

            let args = vec![
                "-i", &queue_item.path,
                &destination_path.to_str().unwrap(),
            ];

            let output = Command::new(command)
                .args(&args)
                .output()
                .expect("Failed to execute command");

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                let _ = tx.send(Err(format!("Error: {}", stderr))).await;
                return;
            }

            if queue_item.is_added_to_list {
                // Fetch metadata and insert into the database
                let mut connection: SqliteConnection = establish_connection();
                let new_audio: NewAudio<'_> = NewAudio {
                    title: &queue_item.title,
                    author: &queue_item.author,
                    path: &destination_path.to_str().unwrap(),
                    duration: &queue_item.duration,
                    audio_type: &queue_item.converted_type,
                };

                let result: Result<usize, diesel::result::Error> = diesel::insert_into(audio)
                    .values(&new_audio)
                    .execute(&mut connection);

                if result.is_err() {
                    let _ = tx.send(Err("Error: Could not add audio entry to database".to_string())).await;
                } else {
                    let _ = tx.send(Ok(())).await;
                }
            }
        });

        handles.lock().unwrap().push(handle);
    }

    drop(tx);

    while let Some(result) = rx.recv().await {
        if let Err(e) = result {
            return Err(e);
        }
    }

    for handle in handles.lock().unwrap().iter() {
        let _ = handle;
    }

    Ok(())
}