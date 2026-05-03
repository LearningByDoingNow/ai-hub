import Parser from "rss-parser";
import Database from "better-sqlite3";
import cron from "node-cron";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { chat, isLLMConfigured, PROVIDER_PRESETS } from "./llm-client.mjs";

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

// --- LLM Enhancement ---

async function llmAnalyzeNews(title, summary, sourceLang) {
  const prompt = `You are an AI news analyst. Analyze this article and respond in JSON format only.

Article title: ${title}
Article summary: ${summary}
Source language: ${sourceLang}

Respond with this exact JSON structure (no markdown, no code blocks):
{
  "relevant": true/false,
  "quality": "high"/"medium"/"low",
  "title_zh": "Chinese title (translate if English, keep if Chinese)",
  "title_en": "English title (translate if Chinese, keep if English)",
  "summary_zh": "Chinese summary in 1-2 sentences",
  "summary_en": "English summary in 1-2 sentences",
  "new_model": null or {"provider_id": "xxx", "model_name": "xxx"} if a new AI model release is mentioned
}`;

  const result = await chat("You are a precise JSON-only responder. Never use markdown.", prompt);
  try {
    const cleaned = result.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

async function llmUpdateProviderTags(db, providerUpdate) {
  if (!providerUpdate || !providerUpdate.provider_id || !providerUpdate.model_name) return;

  const provider = db.prepare("SELECT * FROM providers WHERE id = ?").get(providerUpdate.provider_id);
  if (!provider) return;

  const tags = JSON.parse(provider.tags);
  if (!tags.includes(providerUpdate.model_name)) {
    tags.unshift(providerUpdate.model_name);
    if (tags.length > 5) tags.pop();
    db.prepare("UPDATE providers SET tags = ?, updated_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(tags), providerUpdate.provider_id);
    console.log(`    🔗 Updated ${providerUpdate.provider_id} tags: +${providerUpdate.model_name}`);
  }
}

// --- Fetch ---

async function fetchSingleSource(source, useLLM) {
  try {
    const result = await parser.parseURL(source.url);
    const items = [];

    for (const item of (result.items || []).slice(0, 20)) {
      const title = stripHtml(item.title || "");
      const summary = stripHtml(item.contentSnippet || item.content || item.summary || "");
      const url = item.link || "";
      const date = item.isoDate ? item.isoDate.split("T")[0] : new Date().toISOString().split("T")[0];

      if (!title || !url) continue;

      if (useLLM) {
        // LLM mode: analyze each article
        items.push({ title, summary, url, date, lang: source.lang, _raw: true });
      } else {
        // Keyword mode: simple filter
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
    }
    return { source: source.name, items, error: null };
  } catch (err) {
    return { source: source.name, items: [], error: err.message };
  }
}

async function runFetch() {
  const db = getDb();
  const sources = getEnabledSources(db);
  const useLLM = isLLMConfigured();
  const timestamp = new Date().toLocaleString();

  console.log(`\n[${timestamp}] Fetching from ${sources.length} sources...`);
  console.log(`  LLM mode: ${useLLM ? "ON ✨" : "OFF (keyword filter)"}`);

  const insertNews = db.prepare(
    "INSERT OR IGNORE INTO news (id, title, title_en, source, date, summary, summary_en, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );

  let totalNew = 0;
  let totalErrors = 0;
  let llmCalls = 0;

  for (const source of sources) {
    const result = await fetchSingleSource(source, useLLM);
    if (result.error) {
      console.log(`  ✗ ${result.source}: ${result.error}`);
      totalErrors++;
      continue;
    }

    if (useLLM && result.items.length > 0) {
      // LLM-enhanced processing
      let added = 0;
      for (const raw of result.items) {
        try {
          const analysis = await llmAnalyzeNews(raw.title, raw.summary, raw.lang);
          llmCalls++;
          if (!analysis || !analysis.relevant || analysis.quality === "low") continue;

          const r = insertNews.run(
            generateId(raw.url),
            analysis.title_zh || raw.title,
            analysis.title_en || "",
            source.name,
            raw.date,
            analysis.summary_zh || truncate(raw.summary, 300),
            analysis.summary_en || "",
            raw.url
          );
          if (r.changes > 0) {
            added++;
            // Cross-module: update provider tags if new model detected
            if (analysis.new_model) {
              await llmUpdateProviderTags(db, analysis.new_model);
            }
          }
        } catch (e) {
          // LLM call failed, fall back to keyword mode for this item
          if (isAIRelated(raw.title, raw.summary)) {
            const r = insertNews.run(
              generateId(raw.url), raw.title,
              raw.lang === "en" ? raw.title : "",
              source.name, raw.date,
              truncate(raw.summary, 300),
              raw.lang === "en" ? truncate(raw.summary, 300) : "",
              raw.url
            );
            if (r.changes > 0) added++;
          }
        }
      }
      totalNew += added;
      console.log(`  ✓ ${result.source}: ${result.items.length} articles, ${added} new (LLM)`);
    } else {
      // Keyword mode
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
  }

  const total = db.prepare("SELECT COUNT(*) as count FROM news").get();
  console.log(`  Done: +${totalNew} new, ${totalErrors} errors, ${total.count} total`);
  if (useLLM) console.log(`  LLM calls: ${llmCalls}`);

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

  await runFetch();

  cron.schedule(`0 */${intervalHours} * * *`, async () => {
    await runFetch();
  });

  process.on("SIGINT", () => {
    console.log("\nStopping fetch engine...");
    process.exit(0);
  });
}
