pub struct CreatePlaylist{
  pub title: String,
  pub created_on: String,
}

pub struct InsertMusicIntoPlaylist{
  pub playlist_id: i32,
  pub music_id: i32,
}

pub struct UpdatePlaylist {
  pub id: i32,
  pub title: String,
  pub created_on: String,
}

pub struct DestroyMusic{
  pub id: i32,
}