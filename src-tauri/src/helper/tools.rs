pub fn seconds_to_minutes(seconds: u64) -> String {
    let minutes: u64 = seconds / 60;
    let seconds: u64 = seconds % 60;
    let res: String = format!("{:02}:{:02}", minutes, seconds);
    res
}

pub fn seconds_to_hh_mm_ss(seconds: u64) -> String {
    let hours: u64 = seconds / 3600;
    let minutes: u64 = (seconds % 3600) / 60;
    let seconds: u64 = seconds % 60;
    let res: String = format!("{:02}:{:02}:{:02}", hours, minutes, seconds);
    res
}

pub fn meta_duration_to_minutes(meta_dur: String) -> String {
    let mut minutes: i32 = 0;
    let mut seconds: i32 = 0;

    let re: regex::Regex = regex::Regex::new(r"PT(?:(\d+)M)?(?:(\d+)S)?").unwrap();
    if let Some(caps) = re.captures(meta_dur.as_str()) {
        // Capture minutes
        if let Some(min) = caps.get(1) {
            minutes = min.as_str().parse().unwrap();
        }
        // Capture seconds
        if let Some(sec) = caps.get(2) {
            seconds = sec.as_str().parse().unwrap();
        }
    }

    format!("{:02}:{:02}", minutes, seconds)
}

// used by the youtube web parser
pub fn meta_duration_to_minutes_raw(duration_str: &str) -> Option<u64> {
    let re = regex::Regex::new(r"(?:(\d+):)?(\d+):(\d+)").unwrap();
    if let Some(captures) = re.captures(duration_str) {
        let hours = captures.get(1).map_or(0, |m| m.as_str().parse::<u64>().unwrap_or(0));
        let minutes = captures.get(2).map_or(0, |m| m.as_str().parse::<u64>().unwrap_or(0));
        let seconds = captures.get(3).map_or(0, |m| m.as_str().parse::<u64>().unwrap_or(0));
        Some(hours * 60 + minutes + (seconds / 60))
    } else {
        None
    }
}


pub fn trim_number(input: &str) -> String {
    // turn a number like 2123213123 to 2.12B
    let num: f64 = input.parse().unwrap();
    let res: String = match num {
        n if n > 1_000_000_000.0 => format!("{:.2}B", n / 1_000_000_000.0),
        n if n > 1_000_000.0 => format!("{:.2}M", n / 1_000_000.0),
        n if n > 1_000.0 => format!("{:.2}K", n / 1_000.0),
        _ => input.to_string(),
    };

    res.to_string()
}
