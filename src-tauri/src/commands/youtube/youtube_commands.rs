use rusty_ytdl::search::{SearchOptions, SearchResult, YouTube};
use rusty_ytdl::search::SearchType::Video;
use scraper::Html;
use crate::helper::constants::audio_store_path;
use crate::helper::files::trim_invalid_file_characters;
use crate::models::youtube_model::YouTubeAudio;
use crate::helper::tools::meta_duration_to_minutes_raw;
use crate::helper::db_lock::DB_LOCK;


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
        safe_search: true,
    };
    let res: Result<Vec<SearchResult>, rusty_ytdl::VideoError> = youtube.search(input, Some(&search_options)).await;
    let structured_res: Vec<YouTubeAudio> = match res {
        Ok(results) => results.into_iter().filter_map(|result| {
            match result {
                SearchResult::Video(video) => {
                    let duration_minutes = meta_duration_to_minutes_raw(&video.duration_raw)?;
                    if duration_minutes <= 420 {
                        Some(YouTubeAudio {
                            title: Some(video.title.clone()),
                            thumbnail: video.thumbnails.first().map(|thumb| thumb.url.clone()),
                            duration: Some(video.duration_raw.clone()),
                            channel: Some(video.channel.name.clone()),
                            views: Some(video.views.clone().to_string()),
                            url: video.url.clone().to_string(),
                        })
                    } else {
                        None
                    }
                },
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
    pub use crate::helper::files:: create_audio_store_directory;
    use crate::models::audio_model::NewAudio;
    use crate::db::establish_connection;
    use diesel::SqliteConnection;
    use diesel::prelude::*;
    use crate::schema::audio::dsl::*;
    use tokio::sync::mpsc;
    use tokio::task;
    use tauri::api::process::Command;

    create_audio_store_directory()?;

    let (tx, mut rx) = mpsc::channel(32);
    let mut handles = vec![];
    for yt_audio in audio_list {
        let tx = tx.clone();
        let db_lock = DB_LOCK.clone();
        // Spawn a task for each audio download
        let handle = task::spawn(async move {
            let audio_store_path = audio_store_path();
            let yt_title = yt_audio.title.clone().unwrap_or_default();
            let mut output_path = audio_store_path.join(format!("{}.mp3", trim_invalid_file_characters(&yt_title)));
            let mut counter = 0;

            while output_path.exists() {
                counter += 1;
                let dup_title = format!("{}-{}", trim_invalid_file_characters(&yt_title), counter);
                output_path = audio_store_path.join(format!("{}.mp3", dup_title.replace(" ", "_")));
            }

            let args = vec![
                "-x",
                "--max-filesize", "500m",
                "-o", output_path.to_str().unwrap(),
                "--postprocessor-args", "ffmpeg:-strict -2",
                "--cookies", "cookies.txt",
                &yt_audio.url,
            ];

            let command = if cfg!(target_os = "windows") { "yt-dlp.exe" } else { "yt-dlp" };
            Command::new_sidecar(command)
                .expect("failed to create `my-sidecar` binary command")
                .args(&args)
                .spawn()
                .expect("Failed to spawn sidecar");

            let timeout_duration = std::time::Duration::from_secs(120);
            let start_time = std::time::Instant::now();
            // Wait for the output path to exist
            while !std::path::Path::new(output_path.to_str().unwrap()).exists() {
                if start_time.elapsed() > timeout_duration {
                    panic!("Timeout waiting for output file to exist");
                }
                std::thread::sleep(std::time::Duration::from_secs(1));
            }
            
            // Lock multithreaded access to avoid database blocks
            let download_result = fetch_metadata(yt_audio.url).await.unwrap();
            let _lock = db_lock.lock().await;
        
            let mut connection: SqliteConnection = establish_connection();
            let new_audio: NewAudio<'_> = NewAudio{
                title: &download_result.title.unwrap_or_default(),
                author: &download_result.channel.unwrap_or_default(),
                path: output_path.to_str().unwrap(),
                duration: &download_result.duration.unwrap_or_default(),
                audio_type: "mp3",
            };

            let result: Result<usize, diesel::result::Error> = diesel::insert_into(audio)
                .values(&new_audio)
                .execute(&mut connection);

            if result.is_err() {
                let _ = tx.send(Err(format!("Error: Could not add audio entry to database: {:?}", result.err()))).await;
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
