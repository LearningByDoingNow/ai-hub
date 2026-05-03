/**
 * AI Hub Fetch Engine v2
 * Multi-strategy: RSS + Web Scrape + API
 * Parallel fetching for speed
 */

import Database from "better-sqlite3";
import cron from "node-cron";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { fetchSource } from "./fetchers/index.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");

const AI_KEYWORDS = [
  "ai", "artificial intelligence", "machine learning", "deep learning",
  "llm", "large language model", "gpt", "claude", "gemini", "llama",
  "deepseek", "openai", "anthropic", "chatgpt", "copilot", "agent",
  "neural", "transformer", "diffusion", "generative", "model",
  "reasoning", "multimodal", "fine-tuning", "training", "inference",
  "人工智能", "大模型", "机器学习", "深度学习", "大语言模型",
];

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

function localTime() {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(new Date());
}

function localDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function runFetch() {
  const db = getDb();
  const sources = getEnabledSources(db);
  const startTime = Date.now();

  console.log(`\n[${localTime()}] Fetching from ${sources.length} sources (parallel)...`);

  // Parallel fetch all sources
  const results = await Promise.allSettled(
    sources.map((source) => fetchSource(source).then((r) => ({ ...r, source })))
  );

  const insertNews = db.prepare(
    "INSERT OR IGNORE INTO news (id, title, title_en, source, date, summary, summary_en, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  let totalNew = 0;
  let totalErrors = 0;

  const insertAll = db.transaction(() => {
    for (const settled of results) {
      if (settled.status === "rejected") {
        totalErrors++;
        continue;
      }

      const result = settled.value;
      if (result.error) {
        console.log(`  ✗ ${result.source.name} [${result.source.type || "rss"}]: ${result.error}`);
        totalErrors++;
        continue;
      }

      const filtered = result.source.type === "scrape"
        ? result.items
        : result.items.filter((item) => isAIRelated(item.title, item.summary));

      let added = 0;
      for (const item of filtered) {
        // Use local date if article has no date
        if (!item.date || item.date === "NaN-NaN-NaN") item.date = localDate();
        const r = insertNews.run(
          item.id, item.title, item.title_en, item.source.name || item.source,
          item.date, item.summary, item.summary_en, item.url
        );
        if (r.changes > 0) added++;
      }
      totalNew += added;
      console.log(`  ✓ ${result.source.name} [${result.source.type || "rss"}]: ${result.items.length} found, ${filtered.length} relevant, ${added} new`);
    }
  });
  insertAll();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const total = db.prepare("SELECT COUNT(*) as count FROM news").get();
  console.log(`\n  Done in ${elapsed}s: +${totalNew} new, ${totalErrors} errors, ${total.count} total`);

  db.prepare(
    "INSERT INTO pipeline_runs (id, task_type, status, items_processed, completed_at) VALUES (hex(randomblob(16)), 'news', 'success', ?, datetime('now','localtime'))"
  ).run(totalNew);

  db.close();
  return totalNew;
}

// --- Main ---
const args = process.argv.slice(2);
const mode = args[0] || "once";
const intervalHours = parseInt(args[1] || "4", 10);

console.log("AI Hub Fetch Engine v2");
console.log("======================");
console.log(`Mode: ${mode} | Time: ${localTime()}`);
console.log(`Strategies: RSS + Web Scrape + API\n`);

if (mode === "once") {
  await runFetch();
  console.log("\nDone.");
} else if (mode === "schedule") {
  console.log(`Schedule: every ${intervalHours} hours`);
  console.log("Press Ctrl+C to stop.\n");
  await runFetch();
  cron.schedule(`0 */${intervalHours} * * *`, async () => { await runFetch(); });
  process.on("SIGINT", () => { console.log("\nStopping..."); process.exit(0); });
}
