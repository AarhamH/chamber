use std::fs::{self, File};
use std::io::Read;
use std::path::Path;
use mime_guess::from_path;
use crate::helper::constants::AUDIO_STORE;

pub fn get_file_type(file_path: &str) -> Result<String, String> {
    let file_type: String = from_path(file_path).first_or_octet_stream().essence_str().to_string();
    Ok(file_type)
}

pub fn extract_file_name(file_path: &str) -> Result<String, String> {
    Path::new(file_path)
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "Unable to extract file name".to_string())
        .map(|name| name.to_string())
}

pub fn read_file_to_buffer(file_path: &str) -> Result<Vec<u8>, String> {
    let mut file: File = File::open(file_path)
        .map_err(|e| format!("Unable to open file: {}", e))?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|e| format!("Unable to read file: {}", e))?;
    Ok(buffer)
}

pub fn create_audio_store_directory() -> Result<(), String> {
    let audio_store_path: &Path = Path::new(AUDIO_STORE);
    if !audio_store_path.exists() {
        fs::create_dir(audio_store_path).map_err(|err| {
            eprintln!("Failed to create audio_store directory: {}", err);
            "Failed to create audio_store directory".to_string()
        })?;
    }
    Ok(())
}

pub fn copy_file_to_store(file_path: &str, file_name: &str) -> Result<String, String> {
    let destination_path: std::path::PathBuf = Path::new(AUDIO_STORE).join(file_name);
    if destination_path.exists() {
        return Err("File already exists".to_string());
    }
    fs::copy(file_path, &destination_path)
        .map_err(|e| format!("Unable to copy file: {}", e))?;
    Ok(destination_path.to_str().unwrap().to_string())
}
