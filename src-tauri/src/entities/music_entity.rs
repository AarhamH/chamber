pub struct CreateMusic{
  pub title: String,
  pub artist: String,
  pub path: String,
}

pub struct UpdateMusic {
  pub id: i32,
  pub title: String,
  pub artist: String,
  pub path: String,
}

pub struct DestroyMusic{
  pub id: i32,
}