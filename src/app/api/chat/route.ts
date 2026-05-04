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
    return { chatUrl: url.replace(/\/v1$/, "") + "/v1/messages", fallbackUrl: "", format: "anthropic" as const };
  }
  if (url.endsWith("/chat/completions")) return { chatUrl: url, fallbackUrl: "", format: "openai" as const };
  if (url.endsWith("/v1")) return { chatUrl: url + "/chat/completions", fallbackUrl: "", format: "openai" as const };
  return { chatUrl: url + "/v1/chat/completions", fallbackUrl: url + "/chat/completions", format: "openai" as const };
}

const SYSTEM_PROMPT = `You are AI Hub Assistant, a smart and versatile AI embedded in the AI Hub platform — an AI-powered information aggregation platform covering multiple domains.

## About AI Hub
AI Hub aggregates content from 70+ global sources across multiple modules:
- AI 资讯: AI industry news, product launches, technology breakthroughs
- 论文追踪: Academic papers from arXiv and research blogs
- 国际时政: World news from Financial Times, BBC, NYT, Al Jazeera, etc.
- AI 产品导航: Directory of 50+ AI companies and products
Users can also create custom modules and add their own RSS sources.

## Your Role
You are a GENERAL-PURPOSE assistant for this platform. When users ask about "news" or "hot topics", consider ALL modules and all content — not just AI. Only focus on AI if the user specifically asks about AI.

## Your Capabilities
- Answer questions about ANY topic covered by the platform (tech, world affairs, research, etc.)
- Summarize and analyze articles when user references them with @
- Help users discover content across all modules
- Help users manage the platform: create modules, add/edit/delete providers, sources, etc.
- Recommend RSS sources for any topic users are interested in
- Explain what AI Hub can do and guide users to features
- Trigger data fetching, manage favorites, search articles

## Platform Features You Can Tell Users About
- @ reference: Type @ in chat to search and attach articles for analysis
- Custom modules: Users can create topic-based modules in Settings
- RSS sources: Add any RSS feed URL as a data source
- Auto-fetch: Set a timer in Settings to auto-update periodically
- Desktop widget: A companion desktop app that shows notifications
- Search: Every module page has search functionality
- Favorites: Save articles for later reading

## What You MUST NOT Do
- Modify source code or system configuration
- Make up news or information not in the database
- Default to AI-only content when user asks general questions

Respond in the same language as the user's message. Be concise, helpful, and cover all relevant modules.`;

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
        return el.text().replace(/\s+/g, " ").trim().slice(0, 50000);
      }
    }
    return $("body").text().replace(/\s+/g, " ").trim().slice(0, 30000);
  } catch {
    return "";
  }
}

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const apiKey = getEnv("LLM_API_KEY");
  const baseUrl = getEnv("LLM_BASE_URL");
  const model = getEnv("LLM_MODEL");

  if (!apiKey || !baseUrl) {
    return new Response(JSON.stringify({ error: "LLM not configured" }), { status: 400, headers: CORS });
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
  const modules = sqlite.getModules();
  const moduleList = modules.map((m) => `${m.name}(${m.nameEn})`).join(", ");
  const systemWithContext = SYSTEM_PROMPT + `\n\nCurrent data: ${newsCount} news articles, ${papersCount} papers. Active modules: ${moduleList}.`;
  const { chatUrl, fallbackUrl, format } = normalizeUrl(baseUrl);

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
    if (!res.ok) return new Response(JSON.stringify({ error: `LLM ${res.status}` }), { status: 500, headers: CORS });
    return new Response(res.body, { headers: { "Content-Type": "text/event-stream", "Access-Control-Allow-Origin": "*" } });
  }

  // OpenAI compatible streaming (with fallback for providers like GLM)
  const body = JSON.stringify({
    model, stream: true,
    messages: [{ role: "system", content: systemWithContext }, ...messages],
    max_tokens: 2000, temperature: 0.5,
  });
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };

  let res = await fetch(chatUrl, { method: "POST", headers, body });

  if (!res.ok && res.status === 404 && fallbackUrl) {
    res = await fetch(fallbackUrl, { method: "POST", headers, body });
  }

  if (!res.ok) return new Response(JSON.stringify({ error: `LLM ${res.status}` }), { status: 500, headers: CORS });
  return new Response(res.body, { headers: { "Content-Type": "text/event-stream", "Access-Control-Allow-Origin": "*" } });
}
