use std::{fs::File, io::Read};

#[tauri::command(async)]
pub fn read_audio_buffer(file_path: String) -> Result<String, String> {
    let mut file = File::open(&file_path)
        .map_err(|e| e.to_string())?;
    
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|e| e.to_string())?;
    
    // Encode the buffer as a base64 string
    let encoded = base64::encode(buffer);
    Ok(encoded)
}