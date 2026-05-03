import { createServerSupabase } from "./supabase/server";
import type { Provider, NewsItem, Paper } from "@/types";

interface DbProvider {
  id: string;
  name: string;
  description: string;
  category: string;
  country: "国内" | "国外";
  links: { label: string; url: string }[];
  tags: string[];
}

interface DbNews {
  id: string;
  title: string;
  title_en: string;
  source: string;
  date: string;
  summary: string;
  summary_en: string;
  url: string;
}

interface DbPaper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  abstract: string;
  abstract_en: string;
  links: { label: string; url: string }[];
}

function mapProvider(row: DbProvider): Provider {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    country: row.country,
    links: row.links,
    tags: row.tags,
  };
}

function mapNews(row: DbNews): NewsItem {
  return {
    id: row.id,
    title: row.title,
    titleEn: row.title_en,
    source: row.source,
    date: row.date,
    summary: row.summary,
    summaryEn: row.summary_en,
    url: row.url,
  };
}

function mapPaper(row: DbPaper): Paper {
  return {
    id: row.id,
    title: row.title,
    authors: row.authors,
    venue: row.venue,
    date: row.date,
    abstract: row.abstract,
    abstractEn: row.abstract_en,
    links: row.links,
  };
}

export async function getProviders(): Promise<Provider[]> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("providers")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch providers:", error);
    return [];
  }
  return (data as DbProvider[]).map(mapProvider);
}

export async function getNews(limit?: number): Promise<NewsItem[]> {
  const supabase = await createServerSupabase();
  let query = supabase.from("news").select("*").order("date", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
  return (data as DbNews[]).map(mapNews);
}

export async function getPapers(limit?: number): Promise<Paper[]> {
  const supabase = await createServerSupabase();
  let query = supabase.from("papers").select("*").order("date", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) {
    console.error("Failed to fetch papers:", error);
    return [];
  }
  return (data as DbPaper[]).map(mapPaper);
}

