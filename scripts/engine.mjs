import Parser from "rss-parser";
import Database from "better-sqlite3";
import cron from "node-cron";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "AI-Hub-Engine/1.0" },
});

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "deep learning",
  "llm", "large language model", "gpt", "claude", "gemini", "llama",
  "deepseek", "openai", "anthropic", "chatgpt", "copilot", "agent",
  "neural", "transformer", "diffusion", "generative", "model",
  "reasoning", "multimodal", "fine-tuning", "training", "inference",
  "人工智能", "大模型", "机器学习", "深度学习",
];

function generateId(url) {
  return "news-" + crypto.createHash("md5").update(url).digest("hex").slice(0, 12);
}

function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(str, maxLen) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

function isAIRelated(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  return AI_KEYWORDS.some((kw) => text.includes(kw));
}

function getDb() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  return db;
}

function getEnabledSources(db) {
  return db.prepare("SELECT * FROM sources WHERE enabled = 1").all();
}

async function fetchSingleSource(source) {
  try {
    const result = await parser.parseURL(source.url);
    const items = [];

    for (const item of (result.items || []).slice(0, 20)) {
      const title = stripHtml(item.title || "");
      const summary = stripHtml(item.contentSnippet || item.content || item.summary || "");
      const url = item.link || "";
      const date = item.isoDate ? item.isoDate.split("T")[0] : new Date().toISOString().split("T")[0];

      if (!title || !url) continue;
      if (!isAIRelated(title, summary)) continue;

      items.push({
        id: generateId(url),
        title,
        title_en: source.lang === "en" ? title : "",
        source: source.name,
        date,
        summary: truncate(summary, 300),
        summary_en: source.lang === "en" ? truncate(summary, 300) : "",
        url,
      });
    }
    return { source: source.name, items, error: null };
  } catch (err) {
    return { source: source.name, items: [], error: err.message };
  }
}

async function runFetch() {
  const db = getDb();
  const sources = getEnabledSources(db);
  const timestamp = new Date().toLocaleString();

  console.log(`\n[${timestamp}] Fetching from ${sources.length} sources...`);

  const insertNews = db.prepare(
    "INSERT OR IGNORE INTO news (id, title, title_en, source, date, summary, summary_en, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  let totalNew = 0;
  let totalErrors = 0;

  for (const source of sources) {
    const result = await fetchSingleSource(source);
    if (result.error) {
      console.log(`  ✗ ${result.source}: ${result.error}`);
      totalErrors++;
      continue;
    }

    const insertMany = db.transaction((items) => {
      let added = 0;
      for (const item of items) {
        const r = insertNews.run(item.id, item.title, item.title_en, item.source, item.date, item.summary, item.summary_en, item.url);
        if (r.changes > 0) added++;
      }
      return added;
    });

    const added = insertMany(result.items);
    totalNew += added;
    console.log(`  ✓ ${result.source}: ${result.items.length} articles, ${added} new`);
  }

  const total = db.prepare("SELECT COUNT(*) as count FROM news").get();
  console.log(`  Done: +${totalNew} new, ${totalErrors} errors, ${total.count} total in DB`);

  // Log the run
  db.prepare(
    "INSERT INTO pipeline_runs (id, task_type, status, items_processed, completed_at) VALUES (hex(randomblob(16)), 'news', 'success', ?, datetime('now'))"
  ).run(totalNew);

  db.close();
  return totalNew;
}

// --- Main ---
const args = process.argv.slice(2);
const mode = args[0] || "once";
const intervalHours = parseInt(args[1] || "4", 10);

console.log("AI Hub Fetch Engine");
console.log("===================");
console.log(`Mode: ${mode}`);

if (mode === "once") {
  await runFetch();
  console.log("\nDone. Run with 'schedule' to enable auto-fetching.");
} else if (mode === "schedule") {
  console.log(`Schedule: every ${intervalHours} hours`);
  console.log("Press Ctrl+C to stop.\n");

  // Run immediately on start
  await runFetch();

  // Then schedule
  cron.schedule(`0 */${intervalHours} * * *`, async () => {
    await runFetch();
  });

  // Keep process alive
  process.on("SIGINT", () => {
    console.log("\nStopping fetch engine...");
    process.exit(0);
  });
}
