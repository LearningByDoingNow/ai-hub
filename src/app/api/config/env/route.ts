import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const envPath = path.join(process.cwd(), ".env.local");

function readEnv(): Record<string, string> {
  try {
    const content = readFileSync(envPath, "utf-8");
    const env: Record<string, string> = {};
    for (const line of content.split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim();
        if (key) env[key] = val;
      }
    }
    return env;
  } catch {
    return {};
  }
}

function writeEnv(env: Record<string, string>) {
  const lines = Object.entries(env).map(([k, v]) => `${k}=${v}`);
  writeFileSync(envPath, lines.join("\n") + "\n", "utf-8");
}

export async function GET() {
  const env = readEnv();
  return NextResponse.json({
    baseUrl: env.LLM_BASE_URL || "",
    apiKey: env.LLM_API_KEY ? "***configured***" : "",
    model: env.LLM_MODEL || "",
  });
}

export async function PUT(req: NextRequest) {
  const { baseUrl, apiKey, model } = await req.json();
  const env = readEnv();

  if (baseUrl !== undefined) env.LLM_BASE_URL = baseUrl;
  if (apiKey && apiKey !== "***configured***") env.LLM_API_KEY = apiKey;
  if (model !== undefined) env.LLM_MODEL = model;

  writeEnv(env);
  return NextResponse.json({ ok: true });
}
