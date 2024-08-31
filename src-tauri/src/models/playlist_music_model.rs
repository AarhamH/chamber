
use diesel::prelude::*;

#[derive(Insertable)]
#[diesel(table_name = crate::schema::playlist_music)]
pub struct NewPlaylistMusic {
    pub playlist_id: i32,
    pub music_id: i32,
}

#[derive(Debug, Queryable, AsChangeset)]
#[diesel(table_name = crate::schema::playlist_music)]
pub struct PlaylistMusic{
  pub playlist_id: i32,
  pub music_id: i32,
}