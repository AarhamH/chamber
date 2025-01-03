use std::fs;
use std::path::Path;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use home::home_dir;

const MIGRATIONS: EmbeddedMigrations = embed_migrations!();

pub fn init() {
    if !db_file_exists() {
        create_db_file();
    }
    run_migrations();
}

fn run_migrations() {
    let mut connection: SqliteConnection = establish_connection();
    connection.run_pending_migrations(MIGRATIONS).unwrap();
}

pub fn establish_connection() -> SqliteConnection {
    let db_path: String = "sqlite://".to_string() + get_db_path().as_str();

    SqliteConnection::establish(&db_path)
        .unwrap_or_else(|_| panic!("Error connecting to {}", db_path))
}

fn create_db_file() {
    let db_path: String = get_db_path();
    let db_dir: &Path = Path::new(&db_path).parent().unwrap();

    if !db_dir.exists() {
        fs::create_dir_all(db_dir).unwrap();
    }

    fs::File::create(db_path).unwrap();
}

fn db_file_exists() -> bool {
    let db_path: String = get_db_path();
    Path::new(&db_path).exists()
}

fn get_db_path() -> String {
    let db_dir = home_dir().unwrap();
    db_dir.to_str().unwrap().to_string() + "/chamberdb.sqlite"
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use std::env;

    #[test]
    fn test_get_db_path() {
        let dir = tempdir().unwrap();
        env::set_current_dir(&dir).unwrap();
        let db_path = get_db_path();
        assert!(db_path.ends_with("/chamberdb.sqlite"));
    }

    #[test]
    fn test_create_db_file() {
        let dir = tempdir().unwrap();
        env::set_current_dir(&dir).unwrap();
        let db_path = get_db_path();
        create_db_file();
        assert!(Path::new(&db_path).exists());
    }
}