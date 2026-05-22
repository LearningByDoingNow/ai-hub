#!/usr/bin/env node
/**
 * WeWe RSS Watcher — monitors WeChat feeds for updates and auto-fetches
 * Usage: node scripts/watch-wewe.mjs [check_interval_seconds]
 * Default check interval: 120 seconds (2 minutes)
 */

import { execSync } from "child_process";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "ai-hub.db");
const CHECK_INTERVAL = (parseInt(process.argv[2]) || 120) * 1000;
const WEWE_BASE = "http://localhost:4000";

let lastUpdatedMap = new Map();
let fetchInProgress = false;

function getWeWeSources() {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const rows = db.prepare(
      "SELECT id, name, url FROM sources WHERE enabled = 1 AND url LIKE '%localhost:4000%'"
    ).all();
    db.close();
    return rows;
  } catch {
    return [];
  }
}

async function checkFeedUpdated(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const text = await res.text();
    const match = text.match(/<updated>([^<]+)<\/updated>/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function syncSources() {
  try {
    const resp = await fetch(`${WEWE_BASE}/feeds`, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return;
    const feeds = await resp.json();
    if (!Array.isArray(feeds)) return;

    const db = new Database(DB_PATH);
    const existing = db.prepare(
      "SELECT id, url FROM sources WHERE url LIKE '%localhost:4000%'"
    ).all();
    const existingIds = new Set(existing.map(s => s.url.match(/MP_WXS_\d+/)?.[0]).filter(Boolean));
    const feedMap = new Map(feeds.map(f => [f.id, f]));

    const insert = db.prepare(
      "INSERT OR IGNORE INTO sources (id, name, type, url, lang, enabled, module, module_ids, display_category) VALUES (?, ?, 'rss', ?, 'zh', 1, 'news', '[\"news\"]', 'wechat')"
    );

    for (const feed of feeds) {
      if (!existingIds.has(feed.id)) {
        const sourceId = `wx-${feed.id.replace(/^MP_WXS_/, '').toLowerCase()}`;
        const feedUrl = `${WEWE_BASE}/feeds/${feed.id}.atom`;
        insert.run(sourceId, feed.name, feedUrl);
        console.log(`[${ts()}] + New source: ${feed.name}`);
      }
    }

    for (const s of existing) {
      const feedId = s.url.match(/MP_WXS_\d+/)?.[0];
      if (feedId && !feedMap.has(feedId)) {
        db.prepare("UPDATE sources SET enabled = 0 WHERE id = ?").run(s.id);
        console.log(`[${ts()}] - Removed source: ${s.id}`);
      }
    }

    db.close();
  } catch {
    // WeWe RSS not available, skip
  }
}

async function checkForUpdates() {
  await syncSources();
  const sources = getWeWeSources();
  if (sources.length === 0) {
    process.stdout.write(`[${ts()}] · No WeChat sources yet\r`);
    return false;
  }

  let hasUpdate = false;

  for (const src of sources) {
    const updated = await checkFeedUpdated(src.url);
    if (!updated) continue;

    const lastKnown = lastUpdatedMap.get(src.id);
    if (lastKnown && updated !== lastKnown) {
      console.log(`[${ts()}] ✨ New content detected: ${src.name} (${lastKnown} → ${updated})`);
      hasUpdate = true;
    }
    lastUpdatedMap.set(src.id, updated);
  }

  return hasUpdate;
}

async function triggerFetch() {
  if (fetchInProgress) return;
  fetchInProgress = true;
  console.log(`[${ts()}] 🚀 Triggering fetch...`);
  try {
    const output = execSync("node scripts/engine.mjs once", {
      cwd: path.join(__dirname, ".."),
      encoding: "utf-8",
      timeout: 60000,
    });
    const lines = output.trim().split("\n");
    console.log(`[${ts()}] ✅ Fetch complete: ${lines[lines.length - 1]}`);
  } catch (e) {
    console.error(`[${ts()}] ❌ Fetch failed:`, e.message);
  }
  fetchInProgress = false;
}

function ts() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}

async function main() {
  console.log(`[${ts()}] 👀 WeWe RSS Watcher started`);
  console.log(`[${ts()}]    Check interval: ${CHECK_INTERVAL / 1000}s`);
  console.log(`[${ts()}]    WeWe base: ${WEWE_BASE}`);

  // Initial scan to populate lastUpdatedMap
  const sources = getWeWeSources();
  console.log(`[${ts()}]    Monitoring ${sources.length} WeChat sources`);

  for (const src of sources) {
    const updated = await checkFeedUpdated(src.url);
    if (updated) lastUpdatedMap.set(src.id, updated);
  }
  console.log(`[${ts()}]    Initial timestamps loaded, watching for changes...\n`);

  // Poll loop
  setInterval(async () => {
    const hasUpdate = await checkForUpdates();
    if (hasUpdate) {
      await triggerFetch();
    } else {
      process.stdout.write(`[${ts()}] · No updates\r`);
    }
  }, CHECK_INTERVAL);
}

main();
