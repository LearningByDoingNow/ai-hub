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
    temperature: env.LLM_TEMPERATURE || "0.5",
    maxTokens: env.LLM_MAX_TOKENS || "2000",
    reasoningEffort: env.LLM_REASONING_EFFORT || "default",
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const env = readEnv();

  if (body.baseUrl !== undefined) env.LLM_BASE_URL = body.baseUrl;
  if (body.apiKey && body.apiKey !== "***configured***") env.LLM_API_KEY = body.apiKey;
  if (body.model !== undefined) env.LLM_MODEL = body.model;
  if (body.temperature !== undefined) env.LLM_TEMPERATURE = body.temperature;
  if (body.maxTokens !== undefined) env.LLM_MAX_TOKENS = body.maxTokens;
  if (body.reasoningEffort !== undefined) env.LLM_REASONING_EFFORT = body.reasoningEffort;

  writeEnv(env);
  return NextResponse.json({ ok: true });
}
