
use diesel::prelude::*;
use serde::{Serialize, Deserialize};
#[derive(Insertable)]
#[diesel(table_name = crate::schema::playlist_audio)]
pub struct NewPlaylistAudio {
    pub playlist_id: i32,
    pub audio_id: i32,
}

#[derive(Debug, Queryable, AsChangeset, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::playlist_audio)]
pub struct PlaylistAudio {
  pub playlist_id: i32,
  pub audio_id: i32,
}

// Arguments
#[derive(Serialize, Deserialize)]
pub struct InsertAudioIntoPlaylistArg {
  pub playlist_id: i32,
  pub audio_id: i32,
}