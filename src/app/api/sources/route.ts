import { NextRequest, NextResponse } from "next/server";
import * as sqlite from "@/lib/sqlite";
import * as db from "@/lib/db";
import type { Source } from "@/lib/sqlite";

export async function GET() {
  return NextResponse.json(sqlite.getSources());
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Source;
  if (!body.id || !body.name || !body.url) {
    return NextResponse.json({ error: "id, name, and url are required" }, { status: 400 });
  }
  try {
    await db.createSource(body);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as { id: string } & Partial<Source>;
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    await db.updateSource(body.id, body);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = (await req.json()) as { id: string };
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  await db.deleteSource(id);
  return NextResponse.json({ ok: true });
}
