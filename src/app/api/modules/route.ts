import { NextRequest, NextResponse } from "next/server";
import * as sqlite from "@/lib/sqlite";

export async function GET() {
  return NextResponse.json(sqlite.getModules());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.id || !body.name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }
  try {
    sqlite.createModule(body);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    sqlite.updateModule(body.id, body);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  sqlite.deleteModule(id);
  return NextResponse.json({ ok: true });
}
