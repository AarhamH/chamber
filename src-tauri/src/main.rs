// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use chamber::commands::music_commands::*;
use chamber::commands::playlist_commands::*;
use chamber::commands::playlist_music_commands::*;
use chamber::commands::youtube_commands::*;
use chamber::db;
use chamber::audio::audio_handler::*;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_playlist,
            update_playlist,
            update_music,
            create_music,
            get_all_music_from_playlist,
            get_all_playlists,
            get_all_music,
            get_playlist,
            get_music,
            delete_music,
            insert_song_into_playlist,  
            delete_playlist,
            destroy_song_from_playlist,
            get_audio_data,
            youtube_search,
            youtube_suggestion,
            download_audio
         ])
        .setup(|_app| {
            db::init();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
