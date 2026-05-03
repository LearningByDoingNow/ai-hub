import { NextRequest, NextResponse } from "next/server";
import * as sqlite from "@/lib/sqlite";
import type { Provider } from "@/types";

export async function GET() {
  const providers = sqlite.getProviders();
  return NextResponse.json(providers);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Provider;
  if (!body.id || !body.name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }
  try {
    sqlite.createProvider(body);
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as { id: string } & Partial<Provider>;
  if (!body.id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  try {
    sqlite.updateProvider(body.id, body);
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
  sqlite.deleteProvider(id);
  return NextResponse.json({ ok: true });
}
