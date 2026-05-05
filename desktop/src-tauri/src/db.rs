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

fn standalone_db_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_default().join(".aihub")
}

fn db_path() -> PathBuf {
    let candidates: Vec<PathBuf> = vec![
        std::env::var("AIHUB_DB_PATH").ok().map(PathBuf::from),
        Some(std::env::current_dir().unwrap_or_default().join("data").join("ai-hub.db")),
        std::env::current_dir().ok().and_then(|p| p.parent().map(|pp| pp.join("data").join("ai-hub.db"))),
        std::env::current_exe().ok().and_then(|exe| {
            let mut p = exe.parent()?.to_path_buf();
            for _ in 0..5 {
                let candidate = p.join("data").join("ai-hub.db");
                if candidate.exists() { return Some(candidate); }
                p = p.parent()?.to_path_buf();
            }
            None
        }),
        dirs::home_dir().map(|h| h.join("Desktop").join("ai-hub").join("data").join("ai-hub.db")),
        Some(standalone_db_dir().join("ai-hub.db")),
    ]
    .into_iter()
    .flatten()
    .collect();

    for c in &candidates {
        if c.exists() { return c.clone(); }
    }

    // None found — copy bundled database to ~/.aihub/ or create fresh one
    let dir = standalone_db_dir();
    let _ = std::fs::create_dir_all(&dir);
    let path = dir.join("ai-hub.db");

    // Try to copy bundled default.db from app resources
    let copied = std::env::current_exe().ok().and_then(|exe| {
        let resources = exe.parent()?.join("../Resources/resources/default.db");
        if resources.exists() {
            std::fs::copy(&resources, &path).ok()?;
            Some(true)
        } else {
            None
        }
    });

    if copied.is_none() {
        // No bundled db, create from scratch
        if let Ok(conn) = Connection::open(&path) {
            let _ = init_standalone_db(&conn);
        }
    }
    path
}

fn init_standalone_db(conn: &Connection) -> Result<(), String> {
    conn.execute_batch("
        CREATE TABLE IF NOT EXISTS providers (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, category TEXT NOT NULL, country TEXT NOT NULL, links TEXT NOT NULL DEFAULT '[]', tags TEXT NOT NULL DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
        CREATE TABLE IF NOT EXISTS news (id TEXT PRIMARY KEY, title TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '', source TEXT NOT NULL, date TEXT NOT NULL, summary TEXT NOT NULL, summary_en TEXT NOT NULL DEFAULT '', url TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
        CREATE TABLE IF NOT EXISTS papers (id TEXT PRIMARY KEY, title TEXT NOT NULL, authors TEXT NOT NULL DEFAULT '[]', venue TEXT NOT NULL DEFAULT '', date TEXT NOT NULL, abstract TEXT NOT NULL, abstract_en TEXT NOT NULL DEFAULT '', links TEXT NOT NULL DEFAULT '[]', created_at TEXT DEFAULT (datetime('now')));
        CREATE TABLE IF NOT EXISTS sources (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'rss', url TEXT NOT NULL, lang TEXT NOT NULL DEFAULT 'en', enabled INTEGER NOT NULL DEFAULT 1, module TEXT NOT NULL DEFAULT 'news', module_ids TEXT NOT NULL DEFAULT '[]', display_category TEXT NOT NULL DEFAULT 'rss', created_at TEXT DEFAULT (datetime('now')));
        CREATE TABLE IF NOT EXISTS modules (id TEXT PRIMARY KEY, name TEXT NOT NULL, name_en TEXT NOT NULL DEFAULT '', icon TEXT NOT NULL DEFAULT 'rss', sort_order INTEGER NOT NULL DEFAULT 0, created_at TEXT DEFAULT (datetime('now')));
        CREATE TABLE IF NOT EXISTS pipeline_config (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT (datetime('now')));
        CREATE TABLE IF NOT EXISTS pipeline_runs (id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))), task_type TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'running', items_processed INTEGER DEFAULT 0, error_message TEXT, started_at TEXT DEFAULT (datetime('now')), completed_at TEXT);
        CREATE TABLE IF NOT EXISTS favorites (id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, url TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT (datetime('now')));
        CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
        CREATE INDEX IF NOT EXISTS idx_papers_date ON papers(date DESC);

        INSERT OR IGNORE INTO modules VALUES ('providers','AI 产品导航','AI Products','grid',0,datetime('now'));
        INSERT OR IGNORE INTO modules VALUES ('news','AI 资讯','AI News','newspaper',1,datetime('now'));
        INSERT OR IGNORE INTO modules VALUES ('papers','论文追踪','Papers','book',2,datetime('now'));
        INSERT OR IGNORE INTO modules VALUES ('国际时政','国际时政','World News','rss',3,datetime('now'));

        INSERT OR IGNORE INTO sources VALUES ('openai-blog','OpenAI Blog','rss','https://openai.com/blog/rss.xml','en',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('deepmind-blog','Google DeepMind Blog','rss','https://deepmind.google/blog/rss.xml','en',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('hf-blog','Hugging Face Blog','rss','https://huggingface.co/blog/feed.xml','en',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('techcrunch-ai','TechCrunch AI','rss','https://techcrunch.com/category/artificial-intelligence/feed/','en',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('mit-tech','MIT Tech Review','rss','https://www.technologyreview.com/feed/','en',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('36kr','36氪','rss','https://36kr.com/feed','zh',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('ithome','IT之家','rss','https://www.ithome.com/rss/','zh',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('hackernews-ai','Hacker News (AI)','rss','https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT','en',1,'news','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('bbc-world','BBC World News','rss','https://feeds.bbci.co.uk/news/world/rss.xml','en',1,'国际时政','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('guardian-world','The Guardian World','rss','https://www.theguardian.com/world/rss','en',1,'国际时政','[]',datetime('now'));
        INSERT OR IGNORE INTO sources VALUES ('nyt-world','New York Times World','rss','https://rss.nytimes.com/services/xml/rss/nyt/World.xml','en',1,'国际时政','[]',datetime('now'));
    ").map_err(|e| e.to_string())?;
    Ok(())
}

fn open_db() -> Result<Connection, String> {
    let path = db_path();
    let conn = Connection::open(&path).map_err(|e| format!("Failed to open DB at {:?}: {}", path, e))?;
    migrate_display_category(&conn);
    Ok(conn)
}

fn migrate_display_category(conn: &Connection) {
    let has_col: bool = conn
        .prepare("PRAGMA table_info(sources)")
        .and_then(|mut stmt| {
            let rows = stmt.query_map([], |row| row.get::<_, String>(1))?;
            let names: Vec<String> = rows.filter_map(|r| r.ok()).collect();
            Ok(names.iter().any(|n| n == "display_category"))
        })
        .unwrap_or(false);
    if has_col { return; }
    let _ = conn.execute_batch("
        ALTER TABLE sources ADD COLUMN display_category TEXT NOT NULL DEFAULT 'rss';
        UPDATE sources SET display_category = 'wechat' WHERE id LIKE 'wx-%';
        UPDATE sources SET display_category = 'twitter' WHERE id LIKE 'x-%';
        UPDATE sources SET display_category = 'world' WHERE module = '国际时政' AND display_category = 'rss';
    ");
}

pub fn fetch_news(limit: i64, _module_ids: &[String]) -> Result<Vec<NewsItem>, String> {
    let conn = open_db()?;
    let mut stmt = conn
        .prepare("SELECT id, title, title_en, source, date, summary, summary_en, url FROM news ORDER BY date DESC LIMIT ?1")
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
        .prepare("SELECT id, title, authors, venue, date, abstract, abstract_en, links FROM papers ORDER BY date DESC LIMIT ?1")
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

pub fn find_project_root() -> Option<PathBuf> {
    let db = db_path();
    let parent = db.parent()?;
    // If db is at ~/.aihub/ai-hub.db, project root is ~/.aihub
    // If db is at <project>/data/ai-hub.db, project root is <project>
    if parent.ends_with("data") {
        parent.parent().map(|r| r.to_path_buf())
    } else {
        Some(parent.to_path_buf())
    }
}

pub fn find_env_path() -> Option<PathBuf> {
    // Try project root first (always use this path even if file doesn't exist yet)
    if let Some(root) = find_project_root() {
        return Some(root.join(".env.local"));
    }
    Some(standalone_db_dir().join(".env.local"))
}

pub fn search_news_papers(query: &str) -> Result<Vec<serde_json::Value>, String> {
    let conn = open_db()?;
    let q = format!("%{}%", query.to_lowercase());

    let mut results = Vec::new();

    let mut stmt = conn.prepare(
        "SELECT id, title, title_en, source, date, summary, url FROM news WHERE LOWER(title) LIKE ?1 OR LOWER(title_en) LIKE ?1 OR LOWER(source) LIKE ?1 ORDER BY created_at DESC LIMIT 8"
    ).map_err(|e| e.to_string())?;

    let news = stmt.query_map([&q], |row| {
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "type": "news",
            "title": row.get::<_, String>(1)?,
            "source": row.get::<_, String>(3)?,
            "date": row.get::<_, String>(4)?,
            "summary": row.get::<_, String>(5)?,
            "url": row.get::<_, String>(6)?,
        }))
    }).map_err(|e| e.to_string())?;

    for item in news { if let Ok(v) = item { results.push(v); } }

    let mut stmt2 = conn.prepare(
        "SELECT id, title, venue, date, abstract, links FROM papers WHERE LOWER(title) LIKE ?1 ORDER BY created_at DESC LIMIT 5"
    ).map_err(|e| e.to_string())?;

    let papers = stmt2.query_map([&q], |row| {
        let links_json: String = row.get(5)?;
        let links: Vec<String> = serde_json::from_str(&links_json).unwrap_or_default();
        Ok(serde_json::json!({
            "id": row.get::<_, String>(0)?,
            "type": "paper",
            "title": row.get::<_, String>(1)?,
            "source": row.get::<_, String>(2)?,
            "date": row.get::<_, String>(3)?,
            "summary": row.get::<_, String>(4)?,
            "url": links.first().unwrap_or(&String::new()).clone(),
        }))
    }).map_err(|e| e.to_string())?;

    for item in papers { if let Ok(v) = item { results.push(v); } }

    results.truncate(10);
    Ok(results)
}

pub fn fetch_llm_config() -> Result<Option<LlmConfig>, String> {
    let env_path = find_env_path().unwrap_or_default();

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
        .prepare("SELECT id, title, title_en, source, date, summary, summary_en, url FROM news WHERE created_at > ?1 ORDER BY date DESC")
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
        .prepare("SELECT id, title, authors, venue, date, abstract, abstract_en, links FROM papers WHERE created_at > ?1 ORDER BY date DESC")
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

#[derive(Debug, Serialize, Clone)]
pub struct SourceCategory {
    pub name: String,
    pub display_category: String,
}

pub fn fetch_source_categories() -> Result<Vec<SourceCategory>, String> {
    let conn = open_db()?;
    let mut stmt = conn
        .prepare("SELECT name, display_category FROM sources WHERE enabled = 1")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(SourceCategory {
                name: row.get(0)?,
                display_category: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

pub fn add_favorite(id: &str, item_type: &str, title: &str, url: &str) -> Result<(), String> {
    let conn = open_db()?;
    conn.execute(
        "INSERT OR REPLACE INTO favorites (id, type, title, url, created_at) VALUES (?1, ?2, ?3, ?4, datetime('now'))",
        [id, item_type, title, url],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn remove_favorite(id: &str) -> Result<(), String> {
    let conn = open_db()?;
    conn.execute("DELETE FROM favorites WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

pub fn fetch_favorite_ids() -> Result<Vec<String>, String> {
    let conn = open_db()?;
    let mut stmt = conn.prepare("SELECT id FROM favorites").map_err(|e| e.to_string())?;
    let rows = stmt.query_map([], |row| row.get(0)).map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}
