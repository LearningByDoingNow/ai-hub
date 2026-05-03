import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { execSync } from "child_process";
import path from "path";
import * as cheerio from "cheerio";
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

function normalizeUrl(baseUrl: string) {
  const url = baseUrl.replace(/\/+$/, "");
  if (url.includes("anthropic.com")) {
    return { chatUrl: url.replace(/\/v1$/, "") + "/v1/messages", format: "anthropic" as const };
  }
  if (url.endsWith("/chat/completions")) return { chatUrl: url, format: "openai" as const };
  if (url.endsWith("/v1")) return { chatUrl: url + "/chat/completions", format: "openai" as const };
  return { chatUrl: url + "/v1/chat/completions", format: "openai" as const };
}

const SYSTEM_PROMPT = `You are AI Hub Assistant, a helpful AI embedded in the AI Hub platform.

## Your Capabilities
- Answer questions about AI news, papers, and products
- Summarize and analyze articles when user references them with @
- Help users discover content and recommend relevant items
- Help users manage data: create modules, add/edit/delete providers, sources, etc.
- Help users add favorites, search articles, trigger data fetching
- Provide AI industry insights and trend analysis

## What You CAN Do
- Read, create, update, delete DATA: providers, news, papers, sources, modules, favorites
- Analyze and summarize article content
- Recommend RSS sources for topics users are interested in
- Answer any questions about AI industry, models, companies

## What You MUST NOT Do
- Modify project source code, framework code, or any .ts/.tsx/.js/.css files
- Modify system configuration or .env files
- Execute shell commands or access the file system
- If asked to modify code, politely explain you can only help with data operations

Respond in the same language as the user's message. Keep responses concise and helpful.`;

function fetchArticleContent(url: string): string {
  if (!url || url.includes("example.com")) return "";
  try {
    const html = execSync(
      `curl -sL --max-time 10 -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" "${url}"`,
      { maxBuffer: 5 * 1024 * 1024, timeout: 12000 }
    ).toString("utf-8");

    const $ = cheerio.load(html);
    $("script, style, nav, header, footer, iframe, .ad, .sidebar, .comment").remove();

    const selectors = ["article", ".article-content", ".post-content", ".entry-content", ".content", "main", ".rich_media_content"];
    for (const sel of selectors) {
      const el = $(sel);
      if (el.length && el.text().trim().length > 200) {
        return el.text().replace(/\s+/g, " ").trim().slice(0, 10000);
      }
    }
    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);
  } catch {
    return "";
  }
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = getEnv("LLM_API_KEY");
  const baseUrl = getEnv("LLM_BASE_URL");
  const model = getEnv("LLM_MODEL");

  if (!apiKey || !baseUrl) {
    return new Response(JSON.stringify({ error: "LLM not configured" }), { status: 400 });
  }

  // If last user message contains article URLs, fetch their content
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === "user") {
    const urlMatch = lastMsg.content.match(/URL: (https?:\/\/[^\s\n]+)/g);
    if (urlMatch) {
      for (const match of urlMatch) {
        const url = match.replace("URL: ", "");
        const content = fetchArticleContent(url);
        if (content && content.length > 100) {
          lastMsg.content += `\n\n[Fetched full article content]:\n${content}`;
        }
      }
    }
  }

  const newsCount = sqlite.getNews().length;
  const papersCount = sqlite.getPapers().length;
  const systemWithContext = SYSTEM_PROMPT + `\n\nCurrent: ${newsCount} news, ${papersCount} papers.`;
  const { chatUrl, format } = normalizeUrl(baseUrl);

  if (format === "anthropic") {
    const res = await fetch(chatUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model, system: systemWithContext, stream: true,
        messages: messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
        max_tokens: 2000, temperature: 0.5,
      }),
    });
    if (!res.ok) return new Response(JSON.stringify({ error: `LLM ${res.status}` }), { status: 500 });
    return new Response(res.body, { headers: { "Content-Type": "text/event-stream" } });
  }

  // OpenAI compatible streaming
  const res = await fetch(chatUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model, stream: true,
      messages: [{ role: "system", content: systemWithContext }, ...messages],
      max_tokens: 2000, temperature: 0.5,
    }),
  });

  if (!res.ok) return new Response(JSON.stringify({ error: `LLM ${res.status}` }), { status: 500 });
  return new Response(res.body, { headers: { "Content-Type": "text/event-stream" } });
}
