use std::process::Command;

use rusty_dl::youtube::YoutubeDownloader;
use rusty_dl::Downloader;
use rusty_ytdl::search::{SearchOptions, SearchResult, YouTube};
use rusty_ytdl::search::SearchType::Video;
use scraper::Html;
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
pub async fn get_video_metadata(url: String) -> Result<YouTubeAudio, String> {
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

#[tauri::command]
pub async fn download_audio(url: String, title: String) -> Result<(), String> {
    pub use crate::helper::files::create_audio_store_directory;
    create_audio_store_directory()?;
    let (video_path_with_extension, 
        audio_path_with_extension) = format_audio_file_path(&title);

    let mut downloader = YoutubeDownloader::new(&url).map_err(|e| e.to_string())?;
    downloader.with_name(title.to_owned());

    match downloader.download_to(AUDIO_STORE).await {
        Ok(_) => println!("Video downloaded successfully."),
        Err(e) => return Err(format!("Download failed: {}", e)),
    }

    let status = Command::new("ffmpeg")
        .args(&["-i", &video_path_with_extension, "-q:a", "0", "-map", "a", "-y", &audio_path_with_extension])
        .status()
        .map_err(|e| e.to_string())?;

    match status.success() {
        true => {
            println!("Conversion to audio completed successfully.");
            // Remove the video file after conversion
            std::fs::remove_file(&video_path_with_extension).map_err(|e| e.to_string())?;
            Ok(())
        },
        false => {
            std::fs::remove_file(&video_path_with_extension).map_err(|e| e.to_string())?;
            Err("Conversion to audio failed".to_string())
        }
    }
}

fn format_audio_file_path(title: &str) -> (String, String) {
    let video_path_with_extension = format!("{}/{}.mp4", AUDIO_STORE, title);
    let audio_path_with_extension = format!("{}/{}.mp3", AUDIO_STORE, title);
    (video_path_with_extension, audio_path_with_extension)
}