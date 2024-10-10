use serde::{Deserialize, Serialize};

#[derive(Debug,Serialize, Deserialize)]
pub struct YouTubeAudio{
  pub title: Option<String>,
  pub channel: Option<String>,
  pub views: Option<String>,
  pub duration:Option<String>,
  pub thumbnail: Option<String>,
  pub url: String
}