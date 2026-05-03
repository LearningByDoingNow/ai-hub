import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import path from "path";

function readEnvKey(): string {
  try {
    const content = readFileSync(path.join(process.cwd(), ".env.local"), "utf-8");
    for (const line of content.split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0 && line.slice(0, idx).trim() === "LLM_API_KEY") return line.slice(idx + 1).trim();
    }
  } catch { /* */ }
  return "";
}

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
  const body = await req.json();
  let { apiKey, baseUrl, model } = body;

  if (!baseUrl) return NextResponse.json({ ok: false, error: "Base URL required" });

  // Use saved key if not provided
  if (!apiKey || apiKey === "***use-saved***" || apiKey === "***configured***") {
    apiKey = readEnvKey();
  }
  if (!apiKey) return NextResponse.json({ ok: false, error: "API Key required" });

  const { chatUrl, fallbackUrl, format } = normalizeUrl(baseUrl);

  async function tryCall(url: string): Promise<{ ok: boolean; message?: string; error?: string }> {
    try {
      if (format === "anthropic") {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({ model: model || "claude-sonnet-4-6", messages: [{ role: "user", content: "Say hi" }], max_tokens: 10 }),
        });
        if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
        const data = await res.json();
        return { ok: true, message: `${model || "claude"}: "${data.content?.[0]?.text || "ok"}"` };
      }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: model || "gpt-4o-mini", messages: [{ role: "user", content: "Say hi" }], max_tokens: 10 }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      return { ok: true, message: `${model || "model"}: "${data.choices?.[0]?.message?.content || "ok"}"` };
    } catch (e: unknown) {
      return { ok: false, error: (e as Error).message };
    }
  }

  let result = await tryCall(chatUrl);
  if (!result.ok && fallbackUrl && result.error?.startsWith("404")) {
    result = await tryCall(fallbackUrl);
  }
  return NextResponse.json(result);
}
