/**
 * AI Hub Fetch Engine v2
 * Multi-strategy: RSS + Web Scrape + API
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
    const result = await fetchSource(source);

    if (result.error) {
      console.log(`  ✗ ${result.source} [${source.type || "rss"}]: ${result.error}`);
      totalErrors++;
      continue;
    }

    // Filter AI-related (skip for scrape type — user explicitly added the source)
    const filtered = source.type === "scrape"
      ? result.items
      : result.items.filter((item) => isAIRelated(item.title, item.summary));

    const insertMany = db.transaction((items) => {
      let added = 0;
      for (const item of items) {
        const r = insertNews.run(
          item.id, item.title, item.title_en, item.source,
          item.date, item.summary, item.summary_en, item.url
        );
        if (r.changes > 0) added++;
      }
      return added;
    });

    const added = insertMany(filtered);
    totalNew += added;
    const typeLabel = source.type || "rss";
    console.log(`  ✓ ${result.source} [${typeLabel}]: ${result.items.length} found, ${filtered.length} relevant, ${added} new`);
  }

  const total = db.prepare("SELECT COUNT(*) as count FROM news").get();
  console.log(`\n  Done: +${totalNew} new, ${totalErrors} errors, ${total.count} total in DB`);

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

console.log("AI Hub Fetch Engine v2");
console.log("======================");
console.log(`Mode: ${mode}`);
console.log(`Strategies: RSS + Web Scrape + API\n`);

if (mode === "once") {
  await runFetch();
  console.log("\nDone. Run with 'schedule' to enable auto-fetching.");
} else if (mode === "schedule") {
  console.log(`Schedule: every ${intervalHours} hours`);
  console.log("Press Ctrl+C to stop.\n");
  await runFetch();
  cron.schedule(`0 */${intervalHours} * * *`, async () => { await runFetch(); });
  process.on("SIGINT", () => { console.log("\nStopping..."); process.exit(0); });
}
