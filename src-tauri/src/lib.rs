pub mod db;
pub mod schema;
pub mod helper {
    pub mod tools;
    pub mod files;
    pub mod constants;
    pub mod parser;
}

pub mod models {
  pub mod music_model;
  pub mod playlist_model;
  pub mod playlist_music_model;
  pub mod youtube_model;
}

pub mod audio {
    pub mod audio_handler;
}

pub mod commands {
    pub mod playlist_commands;
    pub mod music_commands;
    pub mod playlist_music_commands;
    pub mod youtube_commands;
}