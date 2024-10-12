use std::path::Path;
use std::process::Command;

use rusty_ytdl::search::{SearchOptions, SearchResult, YouTube};
use rusty_ytdl::search::SearchType::Video;
use scraper::Html;
use crate::helper::constants::{ AUDIO_STORE, YT_DLP, YT_DLP_EXE};
use crate::models::youtube_model::YouTubeAudio;

#[tauri::command]
pub async fn youtube_suggestion(input: String) -> Result<Vec<String>, String> {
    let youtube: YouTube = YouTube::new().map_err(|e| e.to_string())?;

    let res: Vec<String> = youtube.suggestion(input.to_string(), None).await.map_err(|e| e.to_string())?;
    
    let suggestions: Vec<String> = res.iter().map(|s| s.to_string()).collect();
    
    Ok(suggestions)
}

#[tauri::command(async)]
pub async fn youtube_search(input: String) -> Result<Vec<YouTubeAudio>, String> {
    let youtube = YouTube::new().map_err(|e| e.to_string())?;

    let search_options = SearchOptions {
        limit: 20,
        search_type: Video,
        safe_search: false,
    };
    let res: Result<Vec<SearchResult>, rusty_ytdl::VideoError> = youtube.search(input, Some(&search_options)).await;
    
    let structured_res: Vec<YouTubeAudio> = match res {
        Ok(results) => results.into_iter().filter_map(|result| {
            match result {
                SearchResult::Video(video) => Some(YouTubeAudio{
                    title: Some(video.title.clone()),
                    thumbnail: video.thumbnails.first().map(|thumb| thumb.url.clone()),
                    duration: Some(video.duration_raw.clone()),
                    channel: Some(video.channel.name.clone()),
                    views: Some(video.views.clone().to_string()),
                    url: video.url.clone().to_string(),
                }),
                _ => None,
            }
        }).collect(),
        Err(e) => return Err(e.to_string()),
    };
    
    Ok(structured_res)
}           

#[tauri::command]
pub async fn youtube_search_by_url(url: String) -> Result<YouTubeAudio, String> {
    fetch_metadata(url).await
}

#[tauri::command]
pub async fn download_audio(url: String) -> Result<(), String> {
    pub use crate::helper::files::create_audio_store_directory;
    use crate::models::music_model::NewMusic;
    use crate::db::establish_connection;
    use diesel::SqliteConnection;
    use diesel::prelude::*;
    use crate::schema::music::dsl::*;

    create_audio_store_directory()?;

    let path_to_binary: &Path;

    if cfg!(target_os = "windows") {
        path_to_binary = Path::new(YT_DLP_EXE);
    } else {
        path_to_binary = Path::new(YT_DLP);
    }

    let audio_title_output = Command::new(path_to_binary)
        .arg("--get-title")
        .arg(&url)
        .output()
        .expect("Failed to execute command");

    if !audio_title_output.status.success() {
        let stderr = String::from_utf8_lossy(&audio_title_output.stderr);
        return Err(format!("Error: {}", stderr));
    }

    let audio_title = String::from_utf8_lossy(&audio_title_output.stdout).trim().to_string().replace(" ", "_");

    let output_path = format!("{}/{}.mp3", AUDIO_STORE, audio_title);    
    let args = vec![
        "-x",
        "--audio-format", "mp3",
        "-o", &output_path,
        "--cookies", "cookies.txt",
        &url,
    ];
    
    let output = Command::new(path_to_binary)
    .args(&args)
    .output()
    .expect("Failed to execute command");
    
    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Error: {}", stderr))
    }

    let download_result = fetch_metadata(url).await.unwrap();

    let mut connection: SqliteConnection = establish_connection();
    let new_music: NewMusic<'_> = NewMusic {
        title: &download_result.title.unwrap_or_default().to_string(),
        artist: &download_result.channel.unwrap_or_default().to_string(),
        path: &output_path,
        duration: &download_result.duration.unwrap_or_default().to_string()
      };
      
    let result: Result<usize, diesel::result::Error> = diesel::insert_into(music)
      .values(&new_music)
      .execute(&mut connection);

    match result {
        Ok(_) => Ok(()),
    
        Err(diesel::result::Error::DatabaseError(diesel::result::DatabaseErrorKind::UniqueViolation, _)) => {
            Err("Error: Could not add music entry to database".to_string()) // Return error to the client
        }
        Err(err) => {
            Err(format!("Error: {}", err))
        }
      }
}

pub async fn fetch_metadata(url: String) -> Result<YouTubeAudio, String> {
    use crate::commands::youtube::yt_web_parser::{
        extract_channel, 
        extract_views,
        extract_duration, 
        extract_thumbnail, 
        extract_title};
    let response: reqwest::Response = reqwest::get(url.clone()).await.map_err(|e| e.to_string())?;
    
    let body: String = response.text().await.map_err(|e| e.to_string())?;
    let document: Html = Html::parse_document(&body);

    let (title, thumbnail, duration, channel, views) = (
        extract_title(&document).map_err(|e| e.to_string())?,
        extract_thumbnail(&document).map_err(|e| e.to_string())?,
        extract_duration(&document).map_err(|e| e.to_string())?,
        extract_channel(&document).map_err(|e| e.to_string())?,
        extract_views(&document).map_err(|e| e.to_string())?,
    );
    
    let youtube_audio: YouTubeAudio = YouTubeAudio{
        title: Some(title),
        thumbnail: Some(thumbnail),
        duration: Some(duration),
        channel: Some(channel),
        views: Some(views),
        url,
    };

    Ok(youtube_audio)
}