use diesel::prelude::*;
use crate::entities::music_entity:: {
    CreateMusic,
    UpdateMusic,
};

use crate::models::music_model:: {
    Music,
    NewMusic
};

use crate::db::establish_connection;

pub fn create_music(music_arg: CreateMusic) {
  use crate::schema::music::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let new_music: NewMusic<'_> = NewMusic {
    title: &music_arg.title,
    artist: &music_arg.artist,
    path: &music_arg.path
  };

  diesel::insert_into(music)
    .values(&new_music)
    .execute(&mut connection)
    .expect("Error saving new music");
}

pub fn update_music(music_arg: UpdateMusic) {
  use crate::schema::music::dsl::*;

  let mut connection = establish_connection();

  let new_music = Music{
    id: music_arg.id,
    title: music_arg.title,
    artist: music_arg.artist,
    path: music_arg.path
  };

  diesel::update(music.find(music_arg.id))
    .set(&new_music)
    .execute(&mut connection)
    .expect("Error updating music");
}