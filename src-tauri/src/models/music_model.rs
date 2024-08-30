use diesel::prelude::*;

#[derive(Insertable)]
#[diesel(table_name = crate::schema::music)]
pub struct NewMusic<'a> {
    pub title: &'a str,
    pub artist: &'a str,
    pub path: &'a str,
}

#[derive(Debug, Queryable, AsChangeset)]
#[diesel(table_name = crate::schema::music)]
pub struct Music {
  pub id: i32,
  pub title: String,
  pub artist: String,
  pub path: String,
}