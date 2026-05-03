import { NextRequest, NextResponse } from "next/server";
import * as sqlite from "@/lib/sqlite";

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  const value = sqlite.getConfig(key);
  return NextResponse.json({ key, value });
}

export async function PUT(req: NextRequest) {
  const { key, value } = await req.json();
  if (!key) {
    return NextResponse.json({ error: "key is required" }, { status: 400 });
  }
  sqlite.setConfig(key, value);
  return NextResponse.json({ ok: true });
}
