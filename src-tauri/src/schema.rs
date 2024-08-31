// @generated automatically by Diesel CLI.

diesel::table! {
    music (id) {
        id -> Integer,
        title -> Text,
        artist -> Text,
        path -> Text,
    }
}

diesel::table! {
    playlist (id) {
        id -> Integer,
        title -> Text,
        created_on -> Text,
    }
}

diesel::table! {
    playlist_music (playlist_id, music_id) {
        playlist_id -> Integer,
        music_id -> Integer,
    }
}

diesel::joinable!(playlist_music -> music (music_id));
diesel::joinable!(playlist_music -> playlist (playlist_id));

diesel::allow_tables_to_appear_in_same_query!(
    music,
    playlist,
    playlist_music,
);
