use diesel::prelude::*;
use serde::{Serialize,Deserialize};

#[derive(Insertable)]
#[diesel(table_name = crate::schema::audio)]
pub struct NewAudio<'a> {
    pub title: &'a str,
    pub author: &'a str,
    pub path: &'a str,
    pub duration: &'a str,
    pub audio_type: &'a str
  }

#[derive(Debug, diesel::Queryable, AsChangeset)]
#[diesel(table_name = crate::schema::audio)]
#[derive(Serialize, Deserialize)]
pub struct Audio {
  pub id: i32,
  pub title: String,
  pub author: String,
  pub path: String,
  pub duration: String,
  pub audio_type: String
}

#[derive(Debug,Serialize, Deserialize)]
pub struct AudioArg {
  pub title: Option<String>,
  pub author: Option<String>,
  pub path: Option<String>,
  pub duration: Option<String>,
  pub audio_type: Option<String>
}