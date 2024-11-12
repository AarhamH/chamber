// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use chamber::commands::audio_buffer::*;
use chamber::commands::audio_commands::*;
use chamber::commands::playlist_commands::*;
use chamber::commands::playlist_audio_commands::*;
use chamber::commands::youtube::youtube_commands::*;
use chamber::commands::processing::transcode::*;
use chamber::commands::processing::trimming::*;
use chamber::db;
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_playlist,
            update_playlist,
            update_audio,
            create_audio,
            get_all_audio_from_playlist,
            get_all_playlists,
            get_all_audio,
            get_playlist,
            get_audio,
            delete_audio,
            insert_audio_into_playlist,  
            delete_playlist,
            destroy_audio_from_playlist,
            read_audio_buffer,
            youtube_search,
            youtube_search_by_url,
            youtube_suggestion,
            download_audio,
            transcode_audio,
            trim_single_audio,
         ])
        .setup(|_app| {
            db::init();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
