use rusty_ytdl::search::{SearchOptions, SearchResult, YouTube};
use rusty_ytdl::search::SearchType::Video;
use scraper::Html;
use crate::binary_path_gen::{FFMPEG_NO_EXT_PATH, FFMPEG_PATH, YT_DLP_NO_EXT_PATH, YT_DLP_PATH};
use crate::helper::constants::AUDIO_STORE;
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

#[tauri::command(async)]
pub async fn download_audio(audio_list: Vec<YouTubeAudio>) -> Result<(), String> {
    pub use crate::helper::files::create_audio_store_directory;
    use crate::models::audio_model::NewAudio;
    use crate::db::establish_connection;
    use diesel::SqliteConnection;
    use diesel::prelude::*;
    use crate::schema::audio::dsl::*;
    use tokio::sync::mpsc;
    use std::process::Command;
    use tokio::task;

    create_audio_store_directory()?;

    let (tx, mut rx) = mpsc::channel(32);
    let mut handles = vec![];

    for yt_audio in audio_list {
        let command = if cfg!(target_os = "windows") { YT_DLP_PATH } else { YT_DLP_NO_EXT_PATH };
        let ffmpeg = if cfg!(target_os = "windows") { FFMPEG_PATH } else { FFMPEG_NO_EXT_PATH };

        let tx = tx.clone();
        // Spawn a task for each audio download
        let handle = task::spawn(async move {
            let output_path = format!("{}/{}.mp3", AUDIO_STORE, yt_audio.title.unwrap_or_default().replace(" ", "_"));
            let args = vec![
                "-x",
                "--audio-format", "mp3",
                "-o", &output_path,
                "--cookies", "cookies.txt",
                "--ffmpeg-location", ffmpeg,
                &yt_audio.url,
            ];

            let output = Command::new(command)
                .args(&args)
                .output()
                .expect("Failed to execute command");

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                let _ = tx.send(Err(format!("Error: {}", stderr))).await;
                return;
            }

            // Fetch metadata and insert into the database
            let download_result = fetch_metadata(yt_audio.url).await.unwrap();
            let mut connection: SqliteConnection = establish_connection();
            let new_music: NewAudio<'_> = NewAudio{
                title: &download_result.title.unwrap_or_default(),
                author: &download_result.channel.unwrap_or_default(),
                path: &output_path,
                duration: &download_result.duration.unwrap_or_default(),
                audio_type: "mp3",
            };

            let result: Result<usize, diesel::result::Error> = diesel::insert_into(audio)
                .values(&new_music)
                .execute(&mut connection);

            if result.is_err() {
                let _ = tx.send(Err("Error: Could not add music entry to database".to_string())).await;
            } else {
                let _ = tx.send(Ok(())).await;
            }
        });

        handles.push(handle);
    }

    drop(tx);

    while let Some(result) = rx.recv().await {
        if let Err(e) = result {
            return Err(e);
        }
    }

    for handle in handles {
        let _ = handle.await;
    }

    Ok(())
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