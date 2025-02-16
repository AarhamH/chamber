use tokio::sync::Mutex;
use std::sync::Arc;

lazy_static::lazy_static! {
    pub static ref DB_LOCK: Arc<Mutex<()>> = Arc::new(Mutex::new(()));
}
