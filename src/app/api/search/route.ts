import { NextRequest, NextResponse } from "next/server";
import * as sqlite from "@/lib/sqlite";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";
  if (q.length < 1) return NextResponse.json([]);

  const news = sqlite.getNews().filter((n) =>
    n.title.toLowerCase().includes(q) || n.titleEn.toLowerCase().includes(q)
  ).slice(0, 8).map((n) => ({
    id: n.id, type: "news" as const, title: n.title, source: n.source,
    date: n.date, summary: n.summary, url: n.url,
  }));

  const papers = sqlite.getPapers().filter((p) =>
    p.title.toLowerCase().includes(q)
  ).slice(0, 5).map((p) => ({
    id: p.id, type: "paper" as const, title: p.title, source: p.venue,
    date: p.date, summary: p.abstract, url: p.links[0]?.url || "",
  }));

  return NextResponse.json([...news, ...papers].slice(0, 10));
}
