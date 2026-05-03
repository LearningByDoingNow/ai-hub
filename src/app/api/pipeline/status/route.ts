import { NextResponse } from "next/server";
import * as sqlite from "@/lib/sqlite";

export async function GET() {
  const db = (sqlite as unknown as { getDb?: () => unknown }).getDb
    ? undefined
    : undefined;

  // Direct SQLite query for pipeline runs
  const Database = (await import("better-sqlite3")).default;
  const path = await import("path");
  const dbPath = path.join(process.cwd(), "data", "ai-hub.db");
  const sdb = new Database(dbPath);

  const runs = sdb
    .prepare(
      "SELECT * FROM pipeline_runs ORDER BY started_at DESC LIMIT 20"
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
    stats: {
      news: newsCount.c,
      papers: papersCount.c,
      sources: sourcesCount.c,
    },
  });
}
