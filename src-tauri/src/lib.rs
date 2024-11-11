pub mod db;
pub mod schema;
pub mod binary_path_gen;
pub mod helper {
    pub mod tools;
    pub mod files;
    pub mod constants;
}


pub mod models {
  pub mod audio_model;
  pub mod playlist_model;
  pub mod playlist_audio_model;
  pub mod youtube_model;
}

pub mod commands {
    pub mod playlist_commands;
    pub mod audio_commands;
    pub mod playlist_audio_commands;
    pub mod audio_buffer;
    pub mod youtube {
      pub mod yt_web_parser;
      pub mod youtube_commands;
    }
    pub mod processing {
      pub mod transcode;
      pub mod trimming;
    }
}
