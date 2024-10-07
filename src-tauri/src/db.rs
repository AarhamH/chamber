use std::fs;
use std::path::Path;
use std::env;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

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
    let repo_dir: std::path::PathBuf = env::current_dir().unwrap();
    repo_dir.to_str().unwrap().to_string() + "/chamberdb.sqlite"
}
