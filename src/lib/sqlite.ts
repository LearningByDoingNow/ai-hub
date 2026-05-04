import Database from "better-sqlite3";
import path from "path";
import type { Provider, NewsItem, Paper } from "@/types";

export interface Module {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  sortOrder: number;
}

export interface Source {
  id: string;
  name: string;
  type: "rss" | "arxiv" | "custom";
  url: string;
  lang: "zh" | "en";
  enabled: boolean;
  module: string;
  moduleIds: string[];
}

const DB_PATH = path.join(process.cwd(), "data", "ai-hub.db");

function getDb(): Database.Database {
  const db = new Database(DB_PATH, { readonly: false });
  db.pragma("journal_mode = WAL");
  initTables(db);
  return db;
}

function initTables(db: Database.Database) {
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
    CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
    CREATE INDEX IF NOT EXISTS idx_papers_date ON papers(date DESC);
    CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
    CREATE INDEX IF NOT EXISTS idx_providers_country ON providers(country);
  `);
}

// ============ READ ============

function mapProvider(row: Record<string, unknown>): Provider {
  return {
    id: row.id as string, name: row.name as string, description: row.description as string,
    category: row.category as string, country: row.country as string,
    links: JSON.parse(row.links as string), tags: JSON.parse(row.tags as string),
  };
}

function mapNews(row: Record<string, unknown>): NewsItem {
  return {
    id: row.id as string, title: row.title as string, titleEn: row.title_en as string,
    source: row.source as string, date: row.date as string, createdAt: row.created_at as string,
    summary: row.summary as string, summaryEn: row.summary_en as string, url: row.url as string,
  };
}

function mapPaper(row: Record<string, unknown>): Paper {
  return {
    id: row.id as string, title: row.title as string,
    authors: JSON.parse(row.authors as string), venue: row.venue as string,
    date: row.date as string, abstract: row.abstract as string,
    abstractEn: row.abstract_en as string, links: JSON.parse(row.links as string),
  };
}

export function getProviders(): Provider[] {
  return getDb().prepare("SELECT * FROM providers ORDER BY created_at ASC").all().map((r) => mapProvider(r as Record<string, unknown>));
}

export function getNews(limit?: number): NewsItem[] {
  const db = getDb();
  if (limit) return db.prepare("SELECT * FROM news ORDER BY created_at DESC LIMIT ?").all(limit).map((r) => mapNews(r as Record<string, unknown>));
  return db.prepare("SELECT * FROM news ORDER BY created_at DESC").all().map((r) => mapNews(r as Record<string, unknown>));
}

export function getPapers(limit?: number): Paper[] {
  const db = getDb();
  if (limit) return db.prepare("SELECT * FROM papers ORDER BY created_at DESC LIMIT ?").all(limit).map((r) => mapPaper(r as Record<string, unknown>));
  return db.prepare("SELECT * FROM papers ORDER BY created_at DESC").all().map((r) => mapPaper(r as Record<string, unknown>));
}

export function getHeroStats(): { modules: { id: string; name: string; nameEn: string; icon: string; count: number; href: string }[]; sources: number } {
  const db = getDb();
  const modules = db.prepare("SELECT * FROM modules ORDER BY sort_order ASC").all().map((row) => {
    const r = row as Record<string, unknown>;
    const id = r.id as string;
    const hrefMap: Record<string, string> = { providers: "/providers", news: "/news", papers: "/papers" };
    const tableMap: Record<string, string> = { providers: "providers", news: "news", papers: "papers" };
    const table = tableMap[id];
    let count = 0;
    if (table) {
      count = (db.prepare(`SELECT COUNT(*) as c FROM ${table}`).get() as { c: number }).c;
    } else {
      count = (db.prepare("SELECT COUNT(*) as c FROM news WHERE source IN (SELECT name FROM sources WHERE module = ?)").get(id) as { c: number }).c;
    }
    return {
      id, name: r.name as string, nameEn: r.name_en as string,
      icon: r.icon as string, count, href: hrefMap[id] || `/feed/${id}`,
    };
  });
  const sources = (db.prepare("SELECT COUNT(*) as c FROM sources WHERE enabled = 1").get() as { c: number }).c;
  return { modules, sources };
}

export function getCounts(): { news: number; papers: number; sources: number } {
  const db = getDb();
  const news = (db.prepare("SELECT COUNT(*) as c FROM news").get() as { c: number }).c;
  const papers = (db.prepare("SELECT COUNT(*) as c FROM papers").get() as { c: number }).c;
  const sources = (db.prepare("SELECT COUNT(*) as c FROM sources WHERE enabled = 1").get() as { c: number }).c;
  return { news, papers, sources };
}

export function getSources(): Source[] {
  return getDb().prepare("SELECT * FROM sources ORDER BY created_at ASC").all().map((row) => { const r = row as Record<string, unknown>; return ({
    id: r.id as string, name: r.name as string, type: r.type as Source["type"],
    url: r.url as string, lang: r.lang as "zh" | "en",
    enabled: (r.enabled as number) === 1, module: r.module as string,
    moduleIds: r.module_ids ? JSON.parse(r.module_ids as string) : [r.module as string],
  }); });
}

export function getModules(): Module[] {
  return getDb().prepare("SELECT * FROM modules ORDER BY sort_order ASC").all().map((row) => { const r = row as Record<string, unknown>; return ({
    id: r.id as string, name: r.name as string, nameEn: r.name_en as string,
    icon: r.icon as string, sortOrder: r.sort_order as number,
  }); });
}

export function getConfig(key: string): unknown | null {
  const row = getDb().prepare("SELECT value FROM pipeline_config WHERE key = ?").get(key) as Record<string, unknown> | undefined;
  return row ? JSON.parse(row.value as string) : null;
}

// ============ WRITE: Providers ============

export function createProvider(p: Provider): void {
  getDb().prepare(
    "INSERT INTO providers (id, name, description, category, country, links, tags) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).run(p.id, p.name, p.description, p.category, p.country, JSON.stringify(p.links), JSON.stringify(p.tags));
}

export function updateProvider(id: string, p: Partial<Provider>): void {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM providers WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!existing) throw new Error("Provider not found");

  const merged = {
    name: p.name ?? existing.name,
    description: p.description ?? existing.description,
    category: p.category ?? existing.category,
    country: p.country ?? existing.country,
    links: p.links ? JSON.stringify(p.links) : existing.links,
    tags: p.tags ? JSON.stringify(p.tags) : existing.tags,
  };

  db.prepare(
    "UPDATE providers SET name=?, description=?, category=?, country=?, links=?, tags=?, updated_at=datetime('now') WHERE id=?"
  ).run(merged.name, merged.description, merged.category, merged.country, merged.links, merged.tags, id);
}

export function deleteProvider(id: string): void {
  getDb().prepare("DELETE FROM providers WHERE id = ?").run(id);
}

// ============ WRITE: Sources ============

export function createSource(s: Source): void {
  const moduleIds = s.moduleIds?.length ? s.moduleIds : [s.module || "news"];
  getDb().prepare(
    "INSERT INTO sources (id, name, type, url, lang, enabled, module, module_ids) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).run(s.id, s.name, s.type, s.url, s.lang, s.enabled ? 1 : 0, moduleIds[0], JSON.stringify(moduleIds));
}

export function updateSource(id: string, s: Partial<Source>): void {
  const db = getDb();
  const existing = db.prepare("SELECT * FROM sources WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!existing) throw new Error("Source not found");

  const moduleIds = s.moduleIds ? JSON.stringify(s.moduleIds) : null;
  const module = s.moduleIds?.length ? s.moduleIds[0] : null;
  db.prepare(
    "UPDATE sources SET name=COALESCE(?,name), type=COALESCE(?,type), url=COALESCE(?,url), lang=COALESCE(?,lang), enabled=COALESCE(?,enabled), module=COALESCE(?,module), module_ids=COALESCE(?,module_ids) WHERE id=?"
  ).run(s.name ?? null, s.type ?? null, s.url ?? null, s.lang ?? null, s.enabled !== undefined ? (s.enabled ? 1 : 0) : null, module, moduleIds, id);
}

export function deleteSource(id: string): void {
  getDb().prepare("DELETE FROM sources WHERE id = ?").run(id);
}

// ============ WRITE: Modules ============

export function createModule(m: Module): void {
  getDb().prepare(
    "INSERT INTO modules (id, name, name_en, icon, sort_order) VALUES (?, ?, ?, ?, ?)"
  ).run(m.id, m.name, m.nameEn, m.icon, m.sortOrder);
}

export function updateModule(id: string, m: Partial<Module>): void {
  const db = getDb();
  db.prepare(
    "UPDATE modules SET name=COALESCE(?,name), name_en=COALESCE(?,name_en), icon=COALESCE(?,icon), sort_order=COALESCE(?,sort_order) WHERE id=?"
  ).run(m.name ?? null, m.nameEn ?? null, m.icon ?? null, m.sortOrder ?? null, id);
}

export function deleteModule(id: string): void {
  getDb().prepare("DELETE FROM modules WHERE id = ?").run(id);
}

// ============ WRITE: Config ============

export function setConfig(key: string, value: unknown): void {
  getDb().prepare(
    "INSERT OR REPLACE INTO pipeline_config (key, value, updated_at) VALUES (?, ?, datetime('now'))"
  ).run(key, JSON.stringify(value));
}
