import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";
import * as sqlite from "@/lib/sqlite";

function getEnv(key: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const content = readFileSync(path.join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0 && line.slice(0, idx).trim() === key) return line.slice(idx + 1).trim();
    }
  } catch { /* */ }
  return "";
}

const SYSTEM_PROMPT = `You are AI Hub Assistant, a helpful AI embedded in the AI Hub platform.

## Your Capabilities
- Answer questions about AI news, papers, and products in the database
- Summarize and analyze articles when user mentions them
- Help users discover content and recommend relevant items
- CRUD operations on DATA ONLY: providers, news, papers, sources, modules

## Strict Constraints
- You can ONLY read and modify DATA (database records)
- You MUST NOT modify code, configuration, system files, or any non-data content
- You MUST NOT execute commands, access file system, or change settings
- If asked to do anything outside data operations, politely refuse
- Keep responses concise and helpful

## Context
Current data stats:
- News articles in database
- Research papers from arXiv
- AI provider directory
- User can @mention article titles for you to analyze

Respond in the same language as the user's message.`;

function normalizeUrl(baseUrl: string) {
  const url = baseUrl.replace(/\/+$/, "");
  if (url.includes("anthropic.com")) {
    return { chatUrl: url.replace(/\/v1$/, "") + "/v1/messages", format: "anthropic" as const };
  }
  if (url.endsWith("/chat/completions")) return { chatUrl: url, format: "openai" as const };
  if (url.endsWith("/v1")) return { chatUrl: url + "/chat/completions", format: "openai" as const };
  return { chatUrl: url + "/v1/chat/completions", fallbackUrl: url + "/chat/completions", format: "openai" as const };
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = getEnv("LLM_API_KEY");
  const baseUrl = getEnv("LLM_BASE_URL");
  const model = getEnv("LLM_MODEL");

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ error: "LLM not configured. Go to Settings → LLM Config." }, { status: 400 });
  }

  // Build context: inject recent data stats
  const newsCount = sqlite.getNews().length;
  const papersCount = sqlite.getPapers().length;
  const providersCount = sqlite.getProviders().length;

  const systemWithContext = SYSTEM_PROMPT + `\n\nCurrent stats: ${newsCount} news, ${papersCount} papers, ${providersCount} providers.`;

  const { chatUrl, fallbackUrl, format } = normalizeUrl(baseUrl);

  async function callLLM(url: string): Promise<string> {
    if (format === "anthropic") {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model, system: systemWithContext,
          messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
          max_tokens: 2000, temperature: 0.5,
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      return data.content?.[0]?.text || "";
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemWithContext }, ...messages],
        max_tokens: 2000, temperature: 0.5,
      }),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  try {
    let reply: string;
    try {
      reply = await callLLM(chatUrl);
    } catch (e) {
      if (fallbackUrl && (e as Error).message === "404") {
        reply = await callLLM(fallbackUrl);
      } else throw e;
    }
    return NextResponse.json({ reply });
  } catch (e) {
    return NextResponse.json({ error: `LLM error: ${(e as Error).message}` }, { status: 500 });
  }
}
