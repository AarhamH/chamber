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

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_read_audio_buffer() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.mp3");
        fs::write(&file_path, b"test_mp3!").unwrap();
        let result = read_audio_buffer(file_path.to_str().unwrap().to_string());
        let encoded_string = "dGVzdF9tcDMh";
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), encoded_string);
    }

    #[test]
    fn test_read_audio_buffer_non_existent_file() {
        let file_path = std::path::Path::new("non_existent_file.mp3");
        let result = read_audio_buffer(file_path.to_str().unwrap().to_string());
        assert!(result.is_err());
    }
}