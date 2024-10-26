
use crate::binary_path_gen::FFMPEG_NO_EXT_PATH;
use crate::binary_path_gen::FFMPEG_PATH;
use crate::helper::constants::AUDIO_STORE;
pub use crate::helper::files::create_audio_store_directory;
use tokio::sync::mpsc;
use std::path::Path;
use std::process::Command;
use tokio::task;
use serde::{Serialize, Deserialize};        

#[derive(Debug, Deserialize, Serialize)]
pub struct QueueItem {
    pub title: String,
    pub path: String,
    pub converted_type: String,
}

#[tauri::command]
pub async fn transcode_audio(queue_items: Vec<QueueItem>) -> Result<(), String> {
    create_audio_store_directory()?;

    let (tx, mut rx) = mpsc::channel(32);
    let mut handles = vec![];

    for queue_item in queue_items{
        let command = if cfg!(target_os = "windows") { FFMPEG_PATH } else { FFMPEG_NO_EXT_PATH };

        let tx: mpsc::Sender<Result<(), String>> = tx.clone();
        // Spawn a task for each audio download
        let handle = task::spawn(async move {
            let file_name = format!("{}-converted_to-{}.{}", queue_item.title.replace(" ", "_"), queue_item.converted_type, queue_item.converted_type);
            let mut destination_path = Path::new(AUDIO_STORE).join(&file_name);
            let mut counter = 1;
            while destination_path.exists() {
                let new_file_name = format!("{}-converted_to-{}-{}.{}", queue_item.title.replace(" ", "_"), queue_item.converted_type, counter, queue_item.converted_type);
                destination_path = Path::new(AUDIO_STORE).join(new_file_name);
                counter += 1;
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
        });

        handles.push(handle);
    }

    drop(tx);

    while let Some(result) = rx.recv().await {
        if let Err(e) = result {
            return Err(e);
        }
    }

    for handle in handles {
        let _ = handle.await;
    }

    Ok(())

}