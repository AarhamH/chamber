use scraper::{Html, Selector};

pub fn extract_title(document: &Html) -> Result<String, String>{
  let title_selector: Selector = Selector::parse("meta[itemprop='name']").unwrap();
  let title: String = document.select(&title_selector)
    .next()
    .map(|e| e.value().attr("content").unwrap_or("").to_string())
    .unwrap_or_default();

  match title.is_empty() {
    true => Err("Could not parse title".to_string()),
    false => Ok(title)
  }
}

pub fn extract_thumbnail(document: &Html) -> Result<String, String> {
  let thumbnail_selector: Selector = Selector::parse("link[itemprop='thumbnailUrl']").unwrap();
  let thumbnail: String = document.select(&thumbnail_selector)
    .next()
    .map(|e| e.value().attr("href").unwrap_or("").to_string())
    .unwrap_or_default();

  match thumbnail.is_empty() {
    true => Err("Could not parse thumbnail".to_string()),
    false => Ok(thumbnail)
  }
}

pub fn extract_duration(document: &Html) -> Result <String, String>{
  use crate::helper::time::meta_duration_to_minutes;
  let duration_selector: Selector = Selector::parse("meta[itemprop='duration']").unwrap();
  let duration: String = document.select(&duration_selector)
    .next()
    .map(|e| e.value().attr("content").unwrap_or("").to_string())
    .unwrap_or_default();

  match duration.is_empty() {
    true => Err("Could not parse duration".to_string()),
    false => Ok(meta_duration_to_minutes(duration))
  }
}