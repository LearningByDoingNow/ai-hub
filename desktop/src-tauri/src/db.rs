use rusqlite::Connection;
use serde::Serialize;
use std::path::PathBuf;

#[derive(Debug, Serialize, Clone)]
pub struct NewsItem {
    pub id: String,
    pub title: String,
    pub title_en: String,
    pub source: String,
    pub date: String,
    pub summary: String,
    pub summary_en: String,
    pub url: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct Paper {
    pub id: String,
    pub title: String,
    pub authors: Vec<String>,
    pub venue: String,
    pub date: String,
    pub abstract_text: String,
    pub abstract_en: String,
    pub links: Vec<String>,
}

#[derive(Debug, Serialize, Clone)]
pub struct Module {
    pub id: String,
    pub name: String,
    pub name_en: String,
    pub icon: String,
    pub sort_order: i32,
}

#[derive(Debug, Serialize, Clone)]
pub struct LlmConfig {
    pub base_url: String,
    pub api_key: String,
    pub model: String,
    pub temperature: f64,
}

fn db_path() -> PathBuf {
    let candidates: Vec<PathBuf> = vec![
        // 1. Explicit env override
        std::env::var("AIHUB_DB_PATH").ok().map(PathBuf::from),
        // 2. Current working directory (project root when launched from there)
        Some(std::env::current_dir().unwrap_or_default().join("data").join("ai-hub.db")),
        // 3. Parent of cwd (if running from desktop/)
        std::env::current_dir().ok().and_then(|p| p.parent().map(|pp| pp.join("data").join("ai-hub.db"))),
        // 4. Relative to executable — dev mode (target/debug or target/release)
        std::env::current_exe().ok().and_then(|exe| {
            let mut p = exe.parent()?.to_path_buf();
            // Walk up from target/debug/.. or target/release/.. to project root
            for _ in 0..5 {
                let candidate = p.join("data").join("ai-hub.db");
                if candidate.exists() {
                    return Some(candidate);
                }
                p = p.parent()?.to_path_buf();
            }
            None
        }),
        // 5. Home directory fallback
        dirs::home_dir().map(|h| h.join("Desktop").join("ai-hub").join("data").join("ai-hub.db")),
    ]
    .into_iter()
    .flatten()
    .collect();

    for c in &candidates {
        if c.exists() {
            return c.clone();
        }
    }

    candidates.into_iter().next().unwrap_or_else(|| PathBuf::from("data/ai-hub.db"))
}

fn open_db() -> Result<Connection, String> {
    let path = db_path();
    Connection::open(&path).map_err(|e| format!("Failed to open DB at {:?}: {}", path, e))
}

pub fn fetch_news(limit: i64, _module_ids: &[String]) -> Result<Vec<NewsItem>, String> {
    let conn = open_db()?;
    let mut stmt = conn
        .prepare("SELECT id, title, title_en, source, date, summary, summary_en, url FROM news ORDER BY created_at DESC LIMIT ?1")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([limit], |row| {
            Ok(NewsItem {
                id: row.get(0)?,
                title: row.get(1)?,
                title_en: row.get(2)?,
                source: row.get(3)?,
                date: row.get(4)?,
                summary: row.get(5)?,
                summary_en: row.get(6)?,
                url: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn fetch_papers(limit: i64) -> Result<Vec<Paper>, String> {
    let conn = open_db()?;
    let mut stmt = conn
        .prepare("SELECT id, title, authors, venue, date, abstract, abstract_en, links FROM papers ORDER BY created_at DESC LIMIT ?1")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([limit], |row| {
            let authors_json: String = row.get(2)?;
            let links_json: String = row.get(7)?;
            Ok(Paper {
                id: row.get(0)?,
                title: row.get(1)?,
                authors: serde_json::from_str(&authors_json).unwrap_or_default(),
                venue: row.get(3)?,
                date: row.get(4)?,
                abstract_text: row.get(5)?,
                abstract_en: row.get(6)?,
                links: serde_json::from_str(&links_json).unwrap_or_default(),
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn fetch_modules() -> Result<Vec<Module>, String> {
    let conn = open_db()?;
    let mut stmt = conn
        .prepare("SELECT id, name, name_en, icon, sort_order FROM modules ORDER BY sort_order ASC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Module {
                id: row.get(0)?,
                name: row.get(1)?,
                name_en: row.get(2)?,
                icon: row.get(3)?,
                sort_order: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn fetch_llm_config() -> Result<Option<LlmConfig>, String> {
    // Find .env.local next to the data/ directory (project root)
    let env_path = {
        let db = db_path();
        // db is <project>/data/ai-hub.db → parent.parent = project root
        db.parent()
            .and_then(|data_dir| data_dir.parent())
            .map(|root| root.join(".env.local"))
            .unwrap_or_default()
    };

    if !env_path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&env_path).map_err(|e| e.to_string())?;
    let mut base_url = String::new();
    let mut api_key = String::new();
    let mut model = String::new();
    let mut temperature = 0.5;

    for line in content.lines() {
        let line = line.trim();
        if let Some(val) = line.strip_prefix("LLM_BASE_URL=") {
            base_url = val.to_string();
        } else if let Some(val) = line.strip_prefix("LLM_API_KEY=") {
            api_key = val.to_string();
        } else if let Some(val) = line.strip_prefix("LLM_MODEL=") {
            model = val.to_string();
        } else if let Some(val) = line.strip_prefix("LLM_TEMPERATURE=") {
            temperature = val.parse().unwrap_or(0.5);
        }
    }

    if base_url.is_empty() || api_key.is_empty() {
        return Ok(None);
    }

    Ok(Some(LlmConfig {
        base_url,
        api_key,
        model,
        temperature,
    }))
}

pub fn fetch_news_since(since: &str) -> Result<Vec<NewsItem>, String> {
    let conn = open_db()?;
    let mut stmt = conn
        .prepare("SELECT id, title, title_en, source, date, summary, summary_en, url FROM news WHERE created_at > ?1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([since], |row| {
            Ok(NewsItem {
                id: row.get(0)?,
                title: row.get(1)?,
                title_en: row.get(2)?,
                source: row.get(3)?,
                date: row.get(4)?,
                summary: row.get(5)?,
                summary_en: row.get(6)?,
                url: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn fetch_papers_since(since: &str) -> Result<Vec<Paper>, String> {
    let conn = open_db()?;
    let mut stmt = conn
        .prepare("SELECT id, title, authors, venue, date, abstract, abstract_en, links FROM papers WHERE created_at > ?1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([since], |row| {
            let authors_json: String = row.get(2)?;
            let links_json: String = row.get(7)?;
            Ok(Paper {
                id: row.get(0)?,
                title: row.get(1)?,
                authors: serde_json::from_str(&authors_json).unwrap_or_default(),
                venue: row.get(3)?,
                date: row.get(4)?,
                abstract_text: row.get(5)?,
                abstract_en: row.get(6)?,
                links: serde_json::from_str(&links_json).unwrap_or_default(),
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}
