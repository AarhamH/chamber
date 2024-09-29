use std::{fs::File, io::Read};

#[tauri::command]
pub fn get_audio_data() -> Result<Vec<u8>, String> {
    let mut file = File::open("/home/ahaider/Desktop/History's Worst Non-Water Floods.mp3")
        .map_err(|e| e.to_string())?;
    
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|e| e.to_string())?;
    
    Ok(buffer)
}