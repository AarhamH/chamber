use std::{fs::File, io::Read};
use std::io::BufReader;
use rodio::{Decoder, OutputStream, Sink};

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

#[tauri::command(async)]
pub async fn audio_playback() {
    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    let sink = Sink::try_new(&stream_handle).unwrap();
    let file = BufReader::new(File::open("/home/ahaider/repos/chamber/src-tauri/audio_store/Arctic_Monkeys_-_Do_I_Wanna_Know?_(Official_Video)-converted_to-flac-1.flac").unwrap());
    let source = Decoder::new(file).unwrap();
    sink.append(source);
    
    // The sound plays in a separate thread. This call will block the current thread until the sink
    // has finished playing all its queued sounds.
    sink.sleep_until_end();
}

pub struct AudioBuffer {
    pub sink: Sink
}

impl AudioBuffer {
    pub fn new() -> Self {
        let (_stream, stream_handle) = OutputStream::try_default().unwrap();
        let sink = Sink::try_new(&stream_handle).unwrap();
        AudioBuffer {
            sink
        }
    }

    
}