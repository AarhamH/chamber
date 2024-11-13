use std::fs::{self, File};
use std::io::Read;
use std::path::Path;
use mime_guess::from_path;
use crate::helper::constants::AUDIO_STORE;

pub fn get_file_type(file_path: &str) -> Result<String, String> {
    let file_type: String = from_path(file_path).first_or_octet_stream().essence_str().to_string();
    Ok(file_type)
}

pub fn extract_file_name(file_path: &str) -> Result<String, String> {
    Path::new(file_path)
        .file_name()
        .and_then(|name| name.to_str())
        .ok_or_else(|| "Unable to extract file name".to_string())
        .map(|name| name.to_string())
}

pub fn read_file_to_buffer(file_path: &str) -> Result<Vec<u8>, String> {
    let mut file: File = File::open(file_path)
        .map_err(|e| format!("Unable to open file: {}", e))?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)
        .map_err(|e| format!("Unable to read file: {}", e))?;
    Ok(buffer)
}

pub fn create_audio_store_directory() -> Result<(), String> {
    let audio_store_path: &Path = Path::new(AUDIO_STORE);
    if !audio_store_path.exists() {
        fs::create_dir(audio_store_path).map_err(|err| {
            eprintln!("Failed to create audio_store directory: {}", err);
            "Failed to create audio_store directory".to_string()
        })?;
    }
    Ok(())
}

pub fn copy_file_to_destination(file_path: &str, destination_path: &str) -> Result<(), String> {
    fs::copy(file_path, &destination_path)
        .map_err(|e| format!("Unable to copy file: {}", e))?;
    Ok(())
}

pub fn construct_output_path(store: &str, title: &str, extension: &str) -> std::path::PathBuf {
    std::path::PathBuf::from(format!("{}/{}.{}", store, title.replace(" ", "_"), extension))
}

pub fn delete_file_if_exists(path: &std::path::PathBuf) -> Result<(), String> {
    if path.exists() {
        fs::remove_file(path).map_err(|e| format!("Error removing file: {}", e))?;
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;
    use std::fs::File;
    use std::io::{Write, Read};
    use std::path::PathBuf;

    // Tests for get_file_type
    #[test]
    fn test_get_file_type() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.mp3");
        File::create(&file_path).unwrap();

        let file_type = get_file_type(file_path.to_str().unwrap()).unwrap();
        assert_eq!(file_type, "audio/mpeg");
    }

    #[test]
    fn test_get_file_type_unknown() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.unknown");
        File::create(&file_path).unwrap();

        let file_type = get_file_type(file_path.to_str().unwrap()).unwrap();
        assert_eq!(file_type, "application/octet-stream");
    }

    #[test]
    fn test_get_file_type_nonexistent() {
        let file_path = "/nonexistent/file.mp3";
        let result = get_file_type(file_path);
        assert!(result.is_ok());
    }

    #[test]
    fn test_get_file_type_empty() {
        let file_path = "";
        let result = get_file_type(file_path);
        assert!(result.is_ok());
    }

    // Tests for extract_file_name
    #[test]
    fn test_extract_file_name() {
        let file_path = "/some/path/to/file.mp3";
        let file_name = extract_file_name(file_path).unwrap();
        assert_eq!(file_name, "file.mp3");
    }

    #[test]
    fn test_extract_file_name_no_extension() {
        let file_path = "/some/path/to/file";
        let file_name = extract_file_name(file_path).unwrap();
        assert_eq!(file_name, "file");
    }

    #[test]
    fn test_extract_file_name_root() {
        let file_path = "/file.mp3";
        let file_name = extract_file_name(file_path).unwrap();
        assert_eq!(file_name, "file.mp3");
    }

    // Tests for read_file_to_buffer
    #[test]
    fn test_read_file_to_buffer() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        let mut file = File::create(&file_path).unwrap();
        writeln!(file, "Hello, world!").unwrap();

        let buffer = read_file_to_buffer(file_path.to_str().unwrap()).unwrap();
        assert_eq!(buffer, b"Hello, world!\n");
    }

    #[test]
    fn test_read_file_to_buffer_empty() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("empty.txt");
        File::create(&file_path).unwrap();

        let buffer = read_file_to_buffer(file_path.to_str().unwrap()).unwrap();
        assert_eq!(buffer, b"");
    }

    #[test]
    fn test_read_file_to_buffer_nonexistent() {
        let file_path = "/nonexistent/file.txt";
        let result = read_file_to_buffer(file_path);
        assert!(result.is_err());
    }

    #[test]
    fn test_read_file_to_buffer_large() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("large.txt");
        let mut file = File::create(&file_path).unwrap();
        let large_content = "a".repeat(10_000);
        writeln!(file, "{}", large_content).unwrap();

        let buffer = read_file_to_buffer(file_path.to_str().unwrap()).unwrap();
        assert_eq!(buffer.len(), large_content.len() + 1); // +1 for the newline
    }

    // Tests for create_audio_store_directory
    #[test]
    fn test_create_audio_store_directory() {
        let audio_store_path = Path::new(AUDIO_STORE);
        create_audio_store_directory().unwrap();
        assert!(audio_store_path.exists());
    }

    // Tests for copy_file_to_destination
    #[test]
    fn test_copy_file_to_destination() {
        let dir = tempdir().unwrap();
        let src_path = dir.path().join("src.txt");
        let mut src_file = File::create(&src_path).unwrap();
        writeln!(src_file, "Hello, world!").unwrap();

        let dest_path = dir.path().join("dest.txt");
        copy_file_to_destination(src_path.to_str().unwrap(), dest_path.to_str().unwrap()).unwrap();
        assert!(dest_path.exists());

        let mut dest_file = File::open(dest_path).unwrap();
        let mut content = String::new();
        dest_file.read_to_string(&mut content).unwrap();
        assert_eq!(content, "Hello, world!\n");
    }

    #[test]
    fn test_copy_file_to_destination_overwrite() {
        let dir = tempdir().unwrap();
        let src_path = dir.path().join("src.txt");
        let mut src_file = File::create(&src_path).unwrap();
        writeln!(src_file, "Hello, world!").unwrap();

        let dest_path = dir.path().join("dest.txt");
        let mut dest_file = File::create(&dest_path).unwrap();
        writeln!(dest_file, "Old content").unwrap();

        copy_file_to_destination(src_path.to_str().unwrap(), dest_path.to_str().unwrap()).unwrap();
        assert!(dest_path.exists());

        let mut dest_file = File::open(dest_path).unwrap();
        let mut content = String::new();
        dest_file.read_to_string(&mut content).unwrap();
        assert_eq!(content, "Hello, world!\n");
    }

    #[test]
    fn test_copy_file_to_destination_nonexistent() {
        let dir = tempdir().unwrap();
        let src_path = dir.path().join("src.txt");
        let dest_path = dir.path().join("dest.txt");

        let result = copy_file_to_destination(src_path.to_str().unwrap(), dest_path.to_str().unwrap());
        assert!(result.is_err());
    }

    #[test]
    fn test_copy_file_to_destination_invalid_path() {
        let dir = tempdir().unwrap();
        let src_path = dir.path().join("src.txt");
        let mut src_file = File::create(&src_path).unwrap();
        writeln!(src_file, "Hello, world!").unwrap();

        let dest_path = "/invalid/path/to/dest.txt";
        let result = copy_file_to_destination(src_path.to_str().unwrap(), dest_path);
        assert!(result.is_err());
    }

    // Tests for construct_output_path
    #[test]
    fn test_construct_output_path() {
        let store = "/some/store";
        let title = "test title";
        let extension = "mp3";
        let output_path = construct_output_path(store, title, extension);
        assert_eq!(output_path, PathBuf::from("/some/store/test_title.mp3"));
    }

    #[test]
    fn test_construct_output_path_no_extension() {
        let store = "/some/store";
        let title = "test title";
        let extension = "";
        let output_path = construct_output_path(store, title, extension);
        assert_eq!(output_path, PathBuf::from("/some/store/test_title."));
    }

    #[test]
    fn test_construct_output_path_special_chars() {
        let store = "/some/store";
        let title = "test@title#";
        let extension = "mp3";
        let output_path = construct_output_path(store, title, extension);
        assert_eq!(output_path, PathBuf::from("/some/store/test@title#.mp3"));
    }

    #[test]
    fn test_construct_output_path_spaces() {
        let store = "/some/store";
        let title = "test title";
        let extension = "mp3";
        let output_path = construct_output_path(store, title, extension);
        assert_eq!(output_path, PathBuf::from("/some/store/test_title.mp3"));
    }

    // Tests for delete_file_if_exists
    #[test]
    fn test_delete_file_if_exists() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        let mut file = File::create(&file_path).unwrap();
        writeln!(file, "Hello, world!").unwrap();

        delete_file_if_exists(&file_path).unwrap();
        assert!(!file_path.exists());
    }

    #[test]
    fn test_delete_file_if_exists_nonexistent() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("nonexistent.txt");

        let result = delete_file_if_exists(&file_path);
        assert!(result.is_ok());
    }
    
    #[test]
    fn test_delete_file_if_exists_directory() {
        let dir = tempdir().unwrap();
        let dir_path = dir.path().join("test_dir");
        fs::create_dir(&dir_path).unwrap();

        let result = delete_file_if_exists(&dir_path);
        assert!(result.is_err());
    }
}