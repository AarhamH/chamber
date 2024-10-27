use std::{fs::File, io::Read};

#[tauri::command(async)]
pub fn read_audio_buffer(file_path: String) -> Result<String, String> {
    let mut file = File::open(&file_path)
        .map_err(|e| e.to_string())?;
    
    let mut buffer = Vec::new();
    let mut buffer_container = vec![0; 128 * 1024];

    while let Ok(bytes_read) = file.read(&mut buffer_container) {
        if bytes_read == 0 {
            break;
        }
        buffer.extend_from_slice(&buffer_container[..bytes_read]);
    }
    
    // Encode the buffer as a base64 string
    let encoded = base64::encode(buffer);
    Ok(encoded)
}