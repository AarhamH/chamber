use home;

pub fn audio_store_path() -> std::path::PathBuf {
  let mut path = home::home_dir().unwrap();
  path.push("audio_store");
  path
}