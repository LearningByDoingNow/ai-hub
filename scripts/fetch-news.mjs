import Parser from "rss-parser";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import crypto from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AI-Hub-News-Fetcher/1.0",
  },
});

const RSS_FEEDS = [
  { name: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/", lang: "en" },
  { name: "The Verge AI", url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", lang: "en" },
  { name: "OpenAI Blog", url: "https://openai.com/blog/rss.xml", lang: "en" },
  { name: "Google AI Blog", url: "https://blog.google/technology/ai/rss/", lang: "en" },
  { name: "MIT Tech Review AI", url: "https://www.technologyreview.com/feed/", lang: "en" },
  { name: "Ars Technica AI", url: "https://feeds.arstechnica.com/arstechnica/technology-lab", lang: "en" },
  { name: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/", lang: "en" },
];

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "deep learning",
  "llm", "large language model", "gpt", "claude", "gemini", "llama",
  "deepseek", "openai", "anthropic", "chatgpt", "copilot", "agent",
  "neural", "transformer", "diffusion", "generative", "model",
  "reasoning", "multimodal", "vision language", "fine-tuning",
  "人工智能", "大模型", "机器学习", "深度学习",
];

function isAIRelated(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  return AI_KEYWORDS.some((kw) => text.includes(kw));
}

function generateId(url) {
  return "news-" + crypto.createHash("md5").update(url).digest("hex").slice(0, 12);
}

function truncate(str, maxLen) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const insertNews = db.prepare(`
  INSERT OR IGNORE INTO news (id, title, title_en, source, date, summary, summary_en, url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

async function fetchFeed(feed) {
  try {
    console.log(`  Fetching ${feed.name}...`);
    const result = await parser.parseURL(feed.url);
    const items = [];

    for (const item of (result.items || []).slice(0, 15)) {
      const title = stripHtml(item.title || "");
      const summary = stripHtml(item.contentSnippet || item.content || item.summary || "");
      const url = item.link || "";
      const date = item.isoDate
        ? item.isoDate.split("T")[0]
        : new Date().toISOString().split("T")[0];

      if (!title || !url) continue;
      if (!isAIRelated(title, summary)) continue;

      items.push({
        id: generateId(url),
        title: feed.lang === "en" ? title : title,
        title_en: feed.lang === "en" ? title : "",
        source: feed.name,
        date,
        summary: truncate(summary, 300),
        summary_en: feed.lang === "en" ? truncate(summary, 300) : "",
        url,
      });
    }

    console.log(`    → ${items.length} AI-related articles`);
    return items;
  } catch (err) {
    console.error(`    ✗ Failed: ${err.message}`);
    return [];
  }
}

async function main() {
  console.log("AI Hub News Fetcher");
  console.log("===================\n");

  let totalNew = 0;

  const insertMany = db.transaction((items) => {
    for (const item of items) {
      const result = insertNews.run(
        item.id, item.title, item.title_en, item.source,
        item.date, item.summary, item.summary_en, item.url
      );
      if (result.changes > 0) totalNew++;
    }
  });

  for (const feed of RSS_FEEDS) {
    const items = await fetchFeed(feed);
    if (items.length > 0) {
      insertMany(items);
    }
  }

  const totalCount = db.prepare("SELECT COUNT(*) as count FROM news").get();
  console.log(`\n✓ Done! ${totalNew} new articles added.`);
  console.log(`  Total news in database: ${totalCount.count}`);

  db.close();
}

main();
