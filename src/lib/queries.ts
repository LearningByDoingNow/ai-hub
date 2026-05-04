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

export interface HeroStat {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  count: number;
  href: string;
}

export async function getHeroStats(): Promise<{ modules: HeroStat[]; sources: number }> {
  if (useSupabase) {
    const { createServerSupabase } = await import("./supabase/server");
    const supabase = await createServerSupabase();
    const [mods, n, p, prov, s] = await Promise.all([
      supabase.from("modules").select("*").order("sort_order", { ascending: true }),
      supabase.from("news").select("*", { count: "exact", head: true }),
      supabase.from("papers").select("*", { count: "exact", head: true }),
      supabase.from("providers").select("*", { count: "exact", head: true }),
      supabase.from("sources").select("*", { count: "exact", head: true }).eq("enabled", true),
    ]);
    const countMap: Record<string, number> = {
      providers: prov.count || 0, news: n.count || 0, papers: p.count || 0,
    };
    const hrefMap: Record<string, string> = { providers: "/providers", news: "/news", papers: "/papers" };
    const modules = (mods.data || []).map((m: Record<string, unknown>) => ({
      id: m.id as string, name: m.name as string, nameEn: m.name_en as string,
      icon: m.icon as string, count: countMap[m.id as string] || 0,
      href: hrefMap[m.id as string] || `/feed/${m.id}`,
    }));
    return { modules, sources: s.count || 0 };
  }

  const sqlite = await import("./sqlite");
  return sqlite.getHeroStats();
}

export async function getCounts(): Promise<{ news: number; papers: number; sources: number }> {
  if (useSupabase) {
    const { createServerSupabase } = await import("./supabase/server");
    const supabase = await createServerSupabase();
    const [n, p, s] = await Promise.all([
      supabase.from("news").select("*", { count: "exact", head: true }),
      supabase.from("papers").select("*", { count: "exact", head: true }),
      supabase.from("sources").select("*", { count: "exact", head: true }).eq("enabled", true),
    ]);
    return { news: n.count || 0, papers: p.count || 0, sources: s.count || 0 };
  }

  const sqlite = await import("./sqlite");
  return sqlite.getCounts();
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
    createdAt: row.created_at as string,
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
