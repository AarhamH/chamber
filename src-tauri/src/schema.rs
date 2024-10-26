// @generated automatically by Diesel CLI.

diesel::table! {
    audio (id) {
        id -> Integer,
        title -> Text,
        author -> Text,
        path -> Text,
        duration -> Text,
        audio_type -> Text,
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
    playlist_audio (playlist_id, audio_id) {
        playlist_id -> Integer,
        audio_id -> Integer,
    }
}

diesel::joinable!(playlist_audio -> audio (audio_id));
diesel::joinable!(playlist_audio -> playlist (playlist_id));

diesel::allow_tables_to_appear_in_same_query!(
    audio,
    playlist,
    playlist_audio,
);
