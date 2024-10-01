use std::fs::{self, File};
use std::io::Read;
use std::path::Path;
use mime_guess::from_path;
use mp3_metadata;
use crate::helper::time::to_minutes;
use crate::helper::constants::AUDIO_STORE;
use crate::models::music_model::MusicArg;

pub fn process_audio_file(file_path: String) -> Result<MusicArg, String> {
    let file_type = get_file_type(&file_path)?;
    validate_file_type(&file_type)?;

    let file_name = extract_file_name(&file_path)?;
    let buffer = read_file_to_buffer(&file_path)?;
    let duration = extract_audio_duration(&buffer)?;

    create_audio_store_directory()?;
    let destination_path = copy_file_to_store(&file_path, &file_name)?;

    Ok(MusicArg {
        title: Some(file_name),
        artist: Some("Unknown".to_string()),
        path: Some(destination_path.to_string()),
        duration: Some(duration),
    })
}

fn get_file_type(file_path: &str) -> Result<String, String> {
    let file_type: String = from_path(file_path).first_or_octet_stream().essence_str().to_string();
    Ok(file_type)
}

fn validate_file_type(file_type: &str) -> Result<(), String> {
    match file_type {
        "audio/mpeg" | "audio/wav" => Ok(()),
        _ => Err("Unsupported file type: not an mp3 or wav".to_string()),
    }
}

fn extract_file_name(file_path: &str) -> Result<String, String> {
    Path::new(file_path)
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "Unable to extract file name".to_string())
        .map(|name| name.to_string())
}

fn read_file_to_buffer(file_path: &str) -> Result<Vec<u8>, String> {
    let mut file = File::open(file_path)
        .map_err(|e| format!("Unable to open file: {}", e))?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|e| format!("Unable to read file: {}", e))?;
    Ok(buffer)
}

fn extract_audio_duration(buffer: &[u8]) -> Result<String, String> {
    let mp3_metadata = mp3_metadata::read_from_slice(buffer)
        .map_err(|e| format!("Unable to read mp3 metadata: {}", e))?;
    let duration_secs = mp3_metadata.duration.as_secs();
    Ok(to_minutes(duration_secs))
}

fn create_audio_store_directory() -> Result<(), String> {
    let audio_store_path = Path::new(AUDIO_STORE);
    if !audio_store_path.exists() {
        fs::create_dir(audio_store_path).map_err(|err| {
            eprintln!("Failed to create audio_store directory: {}", err);
            "Failed to create audio_store directory".to_string()
        })?;
    }
    Ok(())
}

fn copy_file_to_store(file_path: &str, file_name: &str) -> Result<String, String> {
    let destination_path = Path::new(AUDIO_STORE).join(file_name);
    fs::copy(file_path, &destination_path)
        .map_err(|e| format!("Unable to copy file: {}", e))?;
    Ok(destination_path.to_str().unwrap().to_string())
}
