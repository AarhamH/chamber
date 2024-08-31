use diesel::prelude::*;

#[derive(Insertable)]
#[diesel(table_name = crate::schema::playlist)]
pub struct NewPlaylist<'a> {
    pub title: &'a str,
    pub created_on: &'a str,
}

#[derive(Debug, Queryable, AsChangeset)]
#[diesel(table_name = crate::schema::playlist)]
pub struct Playlist{
  pub id: i32,
  pub title: String,
  pub created_on: String,
}