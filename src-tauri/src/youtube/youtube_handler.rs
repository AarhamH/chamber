use rusty_ytdl::search::YouTube;

pub fn youtube_search(input: String) {
    tauri::async_runtime::spawn(async {
        let youtube = YouTube::new().unwrap();

        let res = youtube.search(input, None).await;
    
        println!("{res:#?}");
    });
}