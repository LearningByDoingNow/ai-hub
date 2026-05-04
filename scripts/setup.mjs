#!/usr/bin/env node
/**
 * AI Hub Setup Script
 * Initializes database, imports default sources, and runs first fetch.
 * Usage: node scripts/setup.mjs
 */
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dbDir = join(root, "data");
const dbPath = join(dbDir, "ai-hub.db");

console.log("AI Hub Setup");
console.log("============\n");

// 1. Create data directory
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log("Created data/ directory");
}

// 2. Initialize database
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
    category TEXT NOT NULL, country TEXT NOT NULL,
    links TEXT NOT NULL DEFAULT '[]', tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL, date TEXT NOT NULL, summary TEXT NOT NULL,
    summary_en TEXT NOT NULL DEFAULT '', url TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, authors TEXT NOT NULL DEFAULT '[]',
    venue TEXT NOT NULL DEFAULT '', date TEXT NOT NULL, abstract TEXT NOT NULL,
    abstract_en TEXT NOT NULL DEFAULT '', links TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'rss',
    url TEXT NOT NULL, lang TEXT NOT NULL DEFAULT 'en',
    enabled INTEGER NOT NULL DEFAULT 1, module TEXT NOT NULL DEFAULT 'news',
    module_ids TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, name_en TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'rss', sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS pipeline_config (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS pipeline_runs (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))), task_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running', items_processed INTEGER DEFAULT 0,
    error_message TEXT, started_at TEXT DEFAULT (datetime('now')), completed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS favorites (
    id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL,
    url TEXT NOT NULL DEFAULT '', created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
  CREATE INDEX IF NOT EXISTS idx_papers_date ON papers(date DESC);
`);
console.log("Database initialized");

// 3. Insert default modules
const insertModule = db.prepare("INSERT OR IGNORE INTO modules (id, name, name_en, icon, sort_order) VALUES (?, ?, ?, ?, ?)");
const modules = [
  ["providers", "AI 产品导航", "AI Products", "grid", 0],
  ["news", "AI 资讯", "AI News", "newspaper", 1],
  ["papers", "论文追踪", "Papers", "book", 2],
  ["国际时政", "国际时政", "World News", "rss", 3],
];
for (const m of modules) insertModule.run(...m);
console.log("Modules initialized");

// 4. Insert default sources
const insertSource = db.prepare("INSERT OR IGNORE INTO sources (id, name, url, type, lang, enabled, module) VALUES (?, ?, ?, ?, ?, 1, ?)");
const defaultSources = [
  // AI News - EN
  ["openai-blog", "OpenAI Blog", "https://openai.com/blog/rss.xml", "rss", "en", "news"],
  ["deepmind-blog", "Google DeepMind Blog", "https://deepmind.google/blog/rss.xml", "rss", "en", "news"],
  ["hf-blog", "Hugging Face Blog", "https://huggingface.co/blog/feed.xml", "rss", "en", "news"],
  ["nvidia-blog", "NVIDIA AI Blog", "https://blogs.nvidia.com/feed/", "rss", "en", "news"],
  ["microsoft-ai-blog", "Microsoft AI Blog", "https://blogs.microsoft.com/ai/feed/", "rss", "en", "news"],
  ["apple-ml-blog", "Apple ML Research", "https://machinelearning.apple.com/rss.xml", "rss", "en", "news"],
  ["google-ai", "Google AI Blog", "https://blog.google/technology/ai/rss/", "rss", "en", "news"],
  ["techcrunch-ai", "TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/", "rss", "en", "news"],
  ["verge-ai", "The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "rss", "en", "news"],
  ["mit-tech", "MIT Tech Review", "https://www.technologyreview.com/feed/", "rss", "en", "news"],
  ["ars-tech", "Ars Technica", "https://feeds.arstechnica.com/arstechnica/technology-lab", "rss", "en", "news"],
  ["hackernews-ai", "Hacker News (AI)", "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT", "rss", "en", "news"],
  ["sebas-newsletter", "Sebastian Raschka", "https://magazine.sebastianraschka.com/feed", "rss", "en", "news"],
  ["toward-ai", "Towards AI", "https://pub.towardsai.net/feed", "rss", "en", "news"],
  // AI News - CN
  ["36kr", "36氪", "https://36kr.com/feed", "rss", "zh", "news"],
  ["ithome", "IT之家", "https://www.ithome.com/rss/", "rss", "zh", "news"],
  ["geekpark", "极客公园", "https://www.geekpark.net/rss", "rss", "zh", "news"],
  // YouTube
  ["yt-ai-explained", "AI Explained (YT)", "https://www.youtube.com/feeds/videos.xml?channel_id=UCNJ1Ymd5yFuUPtn21xtRbbw", "rss", "en", "news"],
  ["yt-fireship", "Fireship (YT)", "https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA", "rss", "en", "news"],
  // Papers
  ["arxiv-cs-ai", "arXiv cs.AI", "https://rss.arxiv.org/rss/cs.AI", "rss", "en", "papers"],
  ["arxiv-cs-lg", "arXiv cs.LG", "https://rss.arxiv.org/rss/cs.LG", "rss", "en", "papers"],
  // World News
  ["bbc-world", "BBC World News", "https://feeds.bbci.co.uk/news/world/rss.xml", "rss", "en", "国际时政"],
  ["reuters-world", "Reuters World", "https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best", "rss", "en", "国际时政"],
  ["guardian-world", "The Guardian World", "https://www.theguardian.com/world/rss", "rss", "en", "国际时政"],
  ["ft-world", "Financial Times", "https://www.ft.com/news-feed?format=rss", "rss", "en", "国际时政"],
  ["nyt-world", "New York Times World", "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", "rss", "en", "国际时政"],
  ["ap-world", "AP News World", "https://feedx.net/rss/ap.xml", "rss", "en", "国际时政"],
  ["rfi-cn", "RFI 法广中文", "https://www.rfi.fr/cn/rss", "rss", "zh", "国际时政"],
  // Twitter (via syndication API, no auth needed)
  ["tw-openai", "Twitter: OpenAI", "OpenAI", "twitter", "en", "news"],
  ["tw-anthropic", "Twitter: Anthropic", "AnthropicAI", "twitter", "en", "news"],
  ["tw-deepmind", "Twitter: DeepMind", "GoogleDeepMind", "twitter", "en", "news"],
  ["tw-nvidiaai", "Twitter: NVIDIA AI", "NVIDIAAI", "twitter", "en", "news"],
  ["tw-mistral", "Twitter: Mistral", "MistralAI", "twitter", "en", "news"],
  ["tw-elonmusk", "Twitter: Elon Musk", "elonmusk", "twitter", "en", "news"],
  ["tw-deepseek", "Twitter: DeepSeek", "deepseek_ai", "twitter", "en", "news"],
  ["tw-sama", "Twitter: Sam Altman", "sama", "twitter", "en", "news"],
  ["tw-ylecun", "Twitter: Yann LeCun", "ylecun", "twitter", "en", "news"],
  ["tw-karpathy", "Twitter: Andrej Karpathy", "karpathy", "twitter", "en", "news"],
  ["tw-jimfan", "Twitter: Jim Fan", "DrJimFan", "twitter", "en", "news"],
  ["tw-reuters", "Twitter: Reuters", "Reuters", "twitter", "en", "国际时政"],
  ["tw-ap", "Twitter: AP", "AP", "twitter", "en", "国际时政"],
  ["tw-bbc", "Twitter: BBC Breaking", "BBCBreaking", "twitter", "en", "国际时政"],
  ["tw-cnn", "Twitter: CNN Breaking", "cnnbrk", "twitter", "en", "国际时政"],
  ["tw-aj", "Twitter: Al Jazeera", "AJEnglish", "twitter", "en", "国际时政"],
  // WeChat Public Accounts
  ["wx-jiqizhixin", "机器之心", "机器之心", "wechat", "zh", "news"],
  ["wx-quantumbit", "量子位", "量子位", "wechat", "zh", "news"],
  ["wx-jiuwanli", "九万里", "九万里", "wechat", "zh", "news"],
  ["wx-xinzhiyuan", "新智元", "新智元", "wechat", "zh", "news"],
  ["wx-aiqianxian", "AI前线", "AI前线", "wechat", "zh", "news"],
];

let added = 0;
for (const s of defaultSources) {
  const r = insertSource.run(...s);
  if (r.changes > 0) added++;
}
console.log(`Sources: ${added} new (${defaultSources.length} total defaults)`);

const total = db.prepare("SELECT COUNT(*) as c FROM sources WHERE enabled = 1").get();
console.log(`Total active sources: ${total.c}`);

// 5. Insert default pipeline config
const insertConfig = db.prepare("INSERT OR IGNORE INTO pipeline_config (key, value) VALUES (?, ?)");
const defaultConfig = [
  ["fetch_interval_hours", "4"],
  ["rsshub_base_url", "https://rsshub.app"],
];
for (const [k, v] of defaultConfig) insertConfig.run(k, v);
console.log("Pipeline config initialized");

db.pragma("wal_checkpoint(TRUNCATE)");
db.close();

console.log("\nSetup complete!");
console.log("Next steps:");
console.log("  npm run fetch:all  — Fetch data from all sources");
console.log("  npm run dev        — Start WebUI");
console.log("  npm run desktop    — Build & launch desktop widget");
