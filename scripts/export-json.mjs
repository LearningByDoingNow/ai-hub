#!/usr/bin/env node
/**
 * Export SQLite data to static JSON files for GitHub Pages deployment.
 */
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { writeFileSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");
const outDir = join(__dirname, "../public/data");

mkdirSync(outDir, { recursive: true });

const db = new Database(dbPath, { readonly: true });

const news = db.prepare("SELECT * FROM news ORDER BY created_at DESC").all();
writeFileSync(join(outDir, "news.json"), JSON.stringify(news));
console.log(`Exported ${news.length} news`);

const papers = db.prepare("SELECT * FROM papers ORDER BY created_at DESC").all();
writeFileSync(join(outDir, "papers.json"), JSON.stringify(papers));
console.log(`Exported ${papers.length} papers`);

const providers = db.prepare("SELECT * FROM providers ORDER BY created_at ASC").all();
writeFileSync(join(outDir, "providers.json"), JSON.stringify(providers));
console.log(`Exported ${providers.length} providers`);

const modules = db.prepare("SELECT * FROM modules ORDER BY sort_order ASC").all();
writeFileSync(join(outDir, "modules.json"), JSON.stringify(modules));
console.log(`Exported ${modules.length} modules`);

const sources = db.prepare("SELECT id, name, type, url, lang, enabled, module FROM sources WHERE enabled = 1 ORDER BY created_at ASC").all();
writeFileSync(join(outDir, "sources.json"), JSON.stringify(sources));
console.log(`Exported ${sources.length} sources`);

// Stats
const stats = {
  news: news.length,
  papers: papers.length,
  providers: providers.length,
  sources: sources.length,
  modules: modules.map(m => ({ id: m.id, name: m.name, name_en: m.name_en, icon: m.icon })),
  updatedAt: new Date().toISOString(),
};
writeFileSync(join(outDir, "stats.json"), JSON.stringify(stats));

db.close();
console.log(`\nAll exported to ${outDir}`);
