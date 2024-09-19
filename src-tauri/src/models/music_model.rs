use diesel::prelude::*;
use serde::{Serialize,Deserialize};

#[derive(Insertable)]
#[diesel(table_name = crate::schema::music)]
pub struct NewMusic<'a> {
    pub title: &'a str,
    pub artist: &'a str,
    pub path: &'a str,
    pub duration: &'a str
  }

#[derive(Debug, Queryable, AsChangeset)]
#[diesel(table_name = crate::schema::music)]
#[derive(Serialize, Deserialize)]
pub struct Music {
  pub id: i32,
  pub title: String,
  pub artist: String,
  pub path: String,
  pub duration: String
}

#[derive(Debug,Serialize, Deserialize)]
pub struct MusicArg{
  pub title: Option<String>,
  pub artist: Option<String>,
  pub path:Option<String>,
  pub duration:Option<String>
}