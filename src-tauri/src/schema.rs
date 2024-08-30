// @generated automatically by Diesel CLI.

diesel::table! {
    music (id) {
        id -> Integer,
        title -> Text,
        artist -> Text,
        path -> Text,
    }
}
