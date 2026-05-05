import { NextResponse } from "next/server";
import * as sqlite from "@/lib/sqlite";

export async function GET() {
  const items = sqlite.getFavorites();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const { id, type, title, url } = await req.json();
  if (!id || !type || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  sqlite.addFavorite(id, type, title, url || "");
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  sqlite.removeFavorite(id);
  return NextResponse.json({ ok: true });
}
