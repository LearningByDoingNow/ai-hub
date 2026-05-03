import Database from "better-sqlite3";
import path from "path";
import type { Provider, NewsItem, Paper } from "@/types";

const DB_PATH = path.join(process.cwd(), "data", "ai-hub.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    initTables(_db);
  }
  return _db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      country TEXT NOT NULL,
      links TEXT NOT NULL DEFAULT '[]',
      tags TEXT NOT NULL DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      title_en TEXT NOT NULL DEFAULT '',
      source TEXT NOT NULL,
      date TEXT NOT NULL,
      summary TEXT NOT NULL,
      summary_en TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS papers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      authors TEXT NOT NULL DEFAULT '[]',
      venue TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      abstract TEXT NOT NULL,
      abstract_en TEXT NOT NULL DEFAULT '',
      links TEXT NOT NULL DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS pipeline_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS pipeline_runs (
      id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
      task_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      items_processed INTEGER DEFAULT 0,
      error_message TEXT,
      started_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
    CREATE INDEX IF NOT EXISTS idx_papers_date ON papers(date DESC);
    CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
    CREATE INDEX IF NOT EXISTS idx_providers_country ON providers(country);
  `);
}

function mapProvider(row: Record<string, unknown>): Provider {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    category: row.category as string,
    country: row.country as "国内" | "国外",
    links: JSON.parse(row.links as string),
    tags: JSON.parse(row.tags as string),
  };
}

function mapNews(row: Record<string, unknown>): NewsItem {
  return {
    id: row.id as string,
    title: row.title as string,
    titleEn: row.title_en as string,
    source: row.source as string,
    date: row.date as string,
    summary: row.summary as string,
    summaryEn: row.summary_en as string,
    url: row.url as string,
  };
}

function mapPaper(row: Record<string, unknown>): Paper {
  return {
    id: row.id as string,
    title: row.title as string,
    authors: JSON.parse(row.authors as string),
    venue: row.venue as string,
    date: row.date as string,
    abstract: row.abstract as string,
    abstractEn: row.abstract_en as string,
    links: JSON.parse(row.links as string),
  };
}

export function getProviders(): Provider[] {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM providers ORDER BY created_at ASC").all();
  return rows.map(mapProvider);
}

export function getNews(limit?: number): NewsItem[] {
  const db = getDb();
  const sql = limit
    ? "SELECT * FROM news ORDER BY date DESC LIMIT ?"
    : "SELECT * FROM news ORDER BY date DESC";
  const rows = limit ? db.prepare(sql).all(limit) : db.prepare(sql).all();
  return rows.map(mapNews);
}

export function getPapers(limit?: number): Paper[] {
  const db = getDb();
  const sql = limit
    ? "SELECT * FROM papers ORDER BY date DESC LIMIT ?"
    : "SELECT * FROM papers ORDER BY date DESC";
  const rows = limit ? db.prepare(sql).all(limit) : db.prepare(sql).all();
  return rows.map(mapPaper);
}
