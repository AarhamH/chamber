use std::{fs::File, io::Read};
use std::io::BufReader;
use rodio::{Decoder, OutputStream, Sink};
use std::sync::{Arc, Mutex};
use lazy_static::lazy_static;

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
    let file = BufReader::new(File::open("C:\\Users\\aarha\\repos\\chamber\\src-tauri\\audio_store\\Opeth_-_Moonlapse_Vertigo-converted_to-flac.flac").unwrap());
    let source = Decoder::new(file).unwrap();
    sink.append(source);
    
    // The sound plays in a separate thread. This call will block the current thread until the sink
    // has finished playing all its queued sounds.
    sink.sleep_until_end();
}

pub struct AudioBuffer {
    pub sink: Arc<Mutex<Sink>>,
}

impl AudioBuffer {
    pub fn new() -> Self {
        let (_stream, stream_handle) = OutputStream::try_default().unwrap();
        let sink = Sink::try_new(&stream_handle).unwrap();
        AudioBuffer {
            sink: Arc::new(Mutex::new(sink)),
        }
    }

    pub fn play_source(&self) {
        let file = BufReader::new(File::open("C:\\Users\\aarha\\repos\\chamber\\src-tauri\\audio_store\\Opeth_-_Moonlapse_Vertigo-converted_to-mp3.mp3").unwrap());
        let source = Decoder::new(file).unwrap();
        let sink = self.sink.lock().unwrap();

        sink.append(source);
        
        // The sound plays in a separate thread. This call will block the current thread until the sink
        // has finished playing all its queued sounds.
        sink.sleep_until_end();

    }
}

#[tauri::command(async)]
pub async fn play() {
    let audio_buffer = AUDIO_BUFFER.clone();
    audio_buffer.lock().unwrap().play_source();
}

lazy_static! {
    static ref AUDIO_BUFFER: Arc<Mutex<AudioBuffer>> = Arc::new(Mutex::new(AudioBuffer::new()));
}