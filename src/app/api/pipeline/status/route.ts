import { NextResponse } from "next/server";
import { existsSync } from "fs";
import path from "path";

const sqliteExists = existsSync(path.join(process.cwd(), "data", "ai-hub.db"));
const useSupabase =
  !sqliteExists &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET() {
  if (useSupabase) {
    const { createServerSupabase } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabase();

    const [newsCount, papersCount, sourcesCount, recentNews] =
      await Promise.all([
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("papers").select("*", { count: "exact", head: true }),
        supabase
          .from("sources")
          .select("*", { count: "exact", head: true })
          .eq("enabled", true),
        supabase
          .from("news")
          .select("id, title, source, date, created_at")
          .order("created_at", { ascending: false })
          .limit(15),
      ]);

    return NextResponse.json({
      runs: [],
      recentNews: recentNews.data || [],
      stats: {
        news: newsCount.count || 0,
        papers: papersCount.count || 0,
        sources: sourcesCount.count || 0,
      },
    });
  }

  const Database = (await import("better-sqlite3")).default;
  const dbPath = path.join(process.cwd(), "data", "ai-hub.db");
  const sdb = new Database(dbPath);

  const runs = sdb
    .prepare("SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 20")
    .all();

  const recentNews = sdb
    .prepare(
      "SELECT id, title, source, date, created_at FROM news ORDER BY created_at DESC LIMIT 15"
    )
    .all();

  const newsCount = sdb
    .prepare("SELECT COUNT(*) as c FROM news")
    .get() as { c: number };
  const papersCount = sdb
    .prepare("SELECT COUNT(*) as c FROM papers")
    .get() as { c: number };
  const sourcesCount = sdb
    .prepare("SELECT COUNT(*) as c FROM sources WHERE enabled = 1")
    .get() as { c: number };

  sdb.close();

  return NextResponse.json({
    runs,
    recentNews,
    stats: {
      news: newsCount.c,
      papers: papersCount.c,
      sources: sourcesCount.c,
    },
  });
}
