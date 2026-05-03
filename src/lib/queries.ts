import type { Provider, NewsItem, Paper } from "@/types";

import { existsSync } from "fs";
import path from "path";

// Local dev: always use SQLite if db file exists (engine writes to SQLite)
// Cloud deploy (Vercel etc): use Supabase (no local file system)
const sqliteExists = existsSync(path.join(process.cwd(), "data", "ai-hub.db"));
const useSupabase =
  !sqliteExists &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getProviders(): Promise<Provider[]> {
  if (useSupabase) {
    const { createServerSupabase } = await import("./supabase/server");
    const supabase = await createServerSupabase();
    const { data, error } = await supabase
      .from("providers")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Failed to fetch providers:", error);
      return [];
    }
    return data.map(mapSupabaseProvider);
  }

  const sqlite = await import("./sqlite");
  return sqlite.getProviders();
}

export async function getNews(limit?: number): Promise<NewsItem[]> {
  if (useSupabase) {
    const { createServerSupabase } = await import("./supabase/server");
    const supabase = await createServerSupabase();
    let query = supabase.from("news").select("*").order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch news:", error);
      return [];
    }
    return data.map(mapSupabaseNews);
  }

  const sqlite = await import("./sqlite");
  return sqlite.getNews(limit);
}

export async function getPapers(limit?: number): Promise<Paper[]> {
  if (useSupabase) {
    const { createServerSupabase } = await import("./supabase/server");
    const supabase = await createServerSupabase();
    let query = supabase.from("papers").select("*").order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch papers:", error);
      return [];
    }
    return data.map(mapSupabasePaper);
  }

  const sqlite = await import("./sqlite");
  return sqlite.getPapers(limit);
}

// Supabase returns snake_case, map to camelCase
function mapSupabaseProvider(row: Record<string, unknown>): Provider {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    category: row.category as string,
    country: row.country as string,
    links: row.links as { label: string; url: string }[],
    tags: row.tags as string[],
  };
}

function mapSupabaseNews(row: Record<string, unknown>): NewsItem {
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

function mapSupabasePaper(row: Record<string, unknown>): Paper {
  return {
    id: row.id as string,
    title: row.title as string,
    authors: row.authors as string[],
    venue: row.venue as string,
    date: row.date as string,
    abstract: row.abstract as string,
    abstractEn: row.abstract_en as string,
    links: row.links as { label: string; url: string }[],
  };
}
