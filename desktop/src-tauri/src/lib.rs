mod db;
mod tray;

use std::sync::Mutex;
use tauri::{AppHandle, Emitter, LogicalSize, Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_notification::NotificationExt;

struct LastCheck(Mutex<String>);

#[tauri::command]
async fn get_news(limit: i64, module_ids: Vec<String>) -> Result<Vec<db::NewsItem>, String> {
    db::fetch_news(limit, &module_ids)
}

#[tauri::command]
async fn get_news_since(since: String) -> Result<Vec<db::NewsItem>, String> {
    db::fetch_news_since(&since)
}

#[tauri::command]
async fn get_papers(limit: i64) -> Result<Vec<db::Paper>, String> {
    db::fetch_papers(limit)
}

#[tauri::command]
async fn get_papers_since(since: String) -> Result<Vec<db::Paper>, String> {
    db::fetch_papers_since(&since)
}

#[tauri::command]
async fn get_modules() -> Result<Vec<db::Module>, String> {
    db::fetch_modules()
}

#[tauri::command]
async fn get_llm_config() -> Result<Option<db::LlmConfig>, String> {
    db::fetch_llm_config()
}

#[tauri::command]
async fn chat_with_llm(messages: Vec<serde_json::Value>) -> Result<String, String> {
    let config = db::fetch_llm_config()?.ok_or("LLM not configured")?;

    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "model": config.model,
        "messages": messages,
        "temperature": config.temperature,
    });

    let res = client
        .post(format!("{}/chat/completions", config.base_url))
        .header("Authorization", format!("Bearer {}", config.api_key))
        .header("Content-Type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    json["choices"][0]["message"]["content"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| format!("Unexpected response: {}", json))
}

#[tauri::command]
async fn open_in_browser(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

pub fn open_chat_window_impl(app: AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("chat") {
        win.show().map_err(|e| e.to_string())?;
        win.set_focus().map_err(|e| e.to_string())?;
        return Ok(());
    }

    WebviewWindowBuilder::new(&app, "chat", WebviewUrl::App("chat.html".into()))
        .title("AI Chat")
        .inner_size(420.0, 600.0)
        .decorations(false)
        .transparent(true)
        .center()
        .build()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn open_chat_window(app: AppHandle) -> Result<(), String> {
    open_chat_window_impl(app)
}

#[tauri::command]
fn save_position(x: i32, y: i32) -> Result<(), String> {
    let path = dirs::home_dir()
        .unwrap_or_default()
        .join(".aihub-widget-pos.json");
    let data = format!(r#"{{"x":{},"y":{}}}"#, x, y);
    std::fs::write(&path, data).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_position() -> Result<Option<(i32, i32)>, String> {
    let path = dirs::home_dir()
        .unwrap_or_default()
        .join(".aihub-widget-pos.json");
    if !path.exists() {
        return Ok(None);
    }
    let data = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let v: serde_json::Value = serde_json::from_str(&data).map_err(|e| e.to_string())?;
    let x = v["x"].as_i64().unwrap_or(100) as i32;
    let y = v["y"].as_i64().unwrap_or(100) as i32;
    Ok(Some((x, y)))
}

#[tauri::command]
async fn resize_widget(app: AppHandle, width: f64, height: f64) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("widget") {
        win.set_size(LogicalSize::new(width, height))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn now_utc() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    // Format as SQLite datetime
    let secs_per_day = 86400u64;
    let days = now / secs_per_day;
    let rem = now % secs_per_day;
    let h = rem / 3600;
    let m = (rem % 3600) / 60;
    let s = rem % 60;
    // Days since epoch to Y-M-D
    let (y, mo, d) = epoch_days_to_ymd(days as i64);
    format!("{:04}-{:02}-{:02} {:02}:{:02}:{:02}", y, mo, d, h, m, s)
}

fn epoch_days_to_ymd(days: i64) -> (i64, i64, i64) {
    // Civil from days algorithm
    let z = days + 719468;
    let era = if z >= 0 { z } else { z - 146096 } / 146097;
    let doe = z - era * 146097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}

fn start_background_poller(app: AppHandle) {
    let handle = app.clone();
    tauri::async_runtime::spawn(async move {
        let state = handle.state::<LastCheck>();
        loop {
            tokio::time::sleep(tokio::time::Duration::from_secs(15)).await;

            let since = {
                let lock = state.0.lock().unwrap();
                lock.clone()
            };

            let news = db::fetch_news_since(&since).unwrap_or_default();
            let papers = db::fetch_papers_since(&since).unwrap_or_default();

            if !news.is_empty() || !papers.is_empty() {
                // Update last check time
                {
                    let mut lock = state.0.lock().unwrap();
                    *lock = now_utc();
                }

                // Send native notifications for new items (max 5 to avoid spam)
                for item in news.iter().take(5) {
                    let title = if !item.title_en.is_empty() {
                        &item.title_en
                    } else {
                        &item.title
                    };
                    let _ = handle.notification().builder()
                        .title(format!("📰 {}", item.source))
                        .body(title)
                        .show();
                }

                for item in papers.iter().take(3) {
                    let _ = handle.notification().builder()
                        .title("📄 New Paper")
                        .body(&item.title)
                        .show();
                }

                // Also emit event to frontend
                let payload = serde_json::json!({
                    "news_count": news.len(),
                    "paper_count": papers.len(),
                    "news": news,
                    "papers": papers,
                });
                let _ = handle.emit("new-items", payload);
            }
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .manage(LastCheck(Mutex::new(now_utc())))
        .setup(|app| {
            tray::setup_tray(app.handle())?;
            start_background_poller(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_news,
            get_news_since,
            get_papers,
            get_papers_since,
            get_modules,
            get_llm_config,
            chat_with_llm,
            open_in_browser,
            open_chat_window,
            resize_widget,
            save_position,
            load_position,
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            #[cfg(target_os = "macos")]
            if let tauri::RunEvent::Reopen { .. } = event {
                if let Some(win) = app.get_webview_window("widget") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }
        });
}
