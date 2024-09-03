use diesel::prelude::*;

use crate::models::music_model:: {
    Music, MusicArg, NewMusic
};

use crate::db::establish_connection;

#[tauri::command]
pub fn create_music(music_arg: MusicArg) {
  use crate::schema::music::dsl::*;

  let mut connection: SqliteConnection = establish_connection();

  let new_music: NewMusic<'_> = NewMusic {
    title: &music_arg.title.unwrap_or_default().to_string(),
    artist: &music_arg.artist.unwrap_or_default().to_string(),
    path: &music_arg.path.unwrap_or_default().to_string(),
  };

  diesel::insert_into(music)
    .values(&new_music)
    .execute(&mut connection)
    .expect("Error saving new music");
}

#[tauri::command]
pub fn update_music(id_arg: i32, music_arg: MusicArg) {
  use crate::schema::music::dsl::*;

  let mut connection = establish_connection();

    let current_song: Music = music
        .find(id_arg)
        .first(&mut connection)
        .expect("Error loading playlist");

    let new_music = Music{
        id:id_arg,
        title: music_arg.title.unwrap_or(current_song.title),
        artist: music_arg.artist.unwrap_or(current_song.artist),
        path: music_arg.path.unwrap_or(current_song.path),
    };

    diesel::update(music.find(id_arg))
        .set(&new_music)
        .execute(&mut connection)
        .expect("Error updating playlist");


  }