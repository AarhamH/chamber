use rusty_ytdl::search::{SearchOptions, SearchResult, YouTube};
use rusty_ytdl::search::SearchType::Video;
use scraper::Html;
use crate::models::youtube_model::YouTubeAudio;

use crate::helper::parser::{extract_channel, extract_views};

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
    use crate::helper::parser::{extract_duration, extract_thumbnail, extract_title};
    let response: reqwest::Response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    
    let body: String = response.text().await.map_err(|e| e.to_string())?;
    let document: Html = Html::parse_document(&body);

    let title: String = extract_title(&document).map_err(|e| e.to_string())?;
    let thumbnail: String = extract_thumbnail(&document).map_err(|e| e.to_string())?;
    let duration: String = extract_duration(&document).map_err(|e| e.to_string())?;
    let channel: String = extract_channel(&document).map_err(|e| e.to_string())?;
    let views: String = extract_views(&document).map_err(|e| e.to_string())?;
    
    let youtube_audio: YouTubeAudio = YouTubeAudio{
        title: Some(title),
        thumbnail: Some(thumbnail),
        duration: Some(duration),
        channel: Some(channel),
        views: Some(views),
    };

    Ok(youtube_audio)
}