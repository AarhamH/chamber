// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
pub mod db;
pub mod models;
pub mod schema;

pub mod operations {
    pub mod playlist_operations;
    pub mod music_operations;
}

fn main() {
    use operations::playlist_operations::*;
    use operations::music_operations::*;    
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            create_playlist,
            update_playlist,
            create_music,
            update_music,
            get_all_playlists
         ])
        .setup(|_app| {
            db::init();
            print!("{:?}", get_all_playlists());
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
