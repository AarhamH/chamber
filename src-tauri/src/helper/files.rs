use std::{fs::File, io::Read, path::Path};
use crate::models::music_model::MusicArg;
use mime_guess::from_path;
use mp3_metadata;

pub fn process_audio_file(file_path: String) -> Result<MusicArg, String> {
  use crate::helper::time::to_minutes;

  let file_type: String = from_path(&file_path).first_or_octet_stream().essence_str().to_string();

  match file_type.as_str() {
      "audio/mpeg" => (),
      "audio/wav" => (),
      _ => return Err("Unsupported file type: not an mp3 or wav".to_string()),
  }

  let file_name: String = Path::new(&file_path)
      .file_name()
      .and_then(|name| name.to_str())
      .ok_or_else(|| "Unable to extract file name".to_string())?
      .to_string();

  let mut file: File = File::open(&file_path)
      .map_err(|e: std::io::Error| format!("Unable to open file: {}", e))?;
  let mut buffer: Vec<u8> = Vec::new();
  file.read_to_end(&mut buffer)
      .map_err(|e: std::io::Error| format!("Unable to read file: {}", e))?;

  let mp3_metadata: mp3_metadata::MP3Metadata = mp3_metadata::read_from_slice(&buffer)
      .map_err(|e: mp3_metadata::Error| format!("Unable to read mp3 metadata: {}", e))?;
  let duration_secs: u64 = mp3_metadata.duration.as_secs();
  let duration: String = to_minutes(duration_secs);

  Ok(MusicArg {
      title: Some(file_name),
      artist: Some("Unknown".to_string()),
      path: Some(file_path),
      duration: Some(duration),
  })
}