/**
 * AI Hub Universal LLM Client
 *
 * Supports ALL OpenAI-compatible and Anthropic-compatible APIs:
 * OpenAI, DeepSeek, OpenRouter, Groq, Together, SiliconFlow,
 * Xiaomi MiMo, Moonshot, Zhipu, Baichuan, MiniMax, 01.AI,
 * Azure OpenAI, Anthropic Claude, and any custom endpoint.
 *
 * Auto-detects API format from base URL.
 * Handles URL normalization (with/without /v1, trailing slashes).
 */

import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");

function readEnvFile(key) {
  try {
    const envPath = join(dirname(dbPath), "..", ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const idx = line.indexOf("=");
      if (idx > 0 && line.slice(0, idx).trim() === key) return line.slice(idx + 1).trim();
    }
  } catch { /* no .env.local */ }
  return "";
}

function getLLMConfig() {
  const apiKey = process.env.LLM_API_KEY || readEnvFile("LLM_API_KEY") || "";
  const baseUrl = process.env.LLM_BASE_URL || readEnvFile("LLM_BASE_URL") || "";
  const model = process.env.LLM_MODEL || readEnvFile("LLM_MODEL") || "";
  return { apiKey, baseUrl, model };
}

// Normalize base URL: strip trailing slash, detect format
function normalizeUrl(baseUrl) {
  let url = baseUrl.replace(/\/+$/, "");

  // Detect Anthropic
  if (url.includes("anthropic.com")) {
    return { chatUrl: url.replace(/\/v1$/, "") + "/v1/messages", format: "anthropic" };
  }

  // OpenAI-compatible: ensure we get to /chat/completions
  // Handle: "https://api.x.com", "https://api.x.com/v1", "https://api.x.com/v1/"
  if (url.endsWith("/chat/completions")) {
    return { chatUrl: url, format: "openai" };
  }
  if (url.endsWith("/v1")) {
    return { chatUrl: url + "/chat/completions", format: "openai" };
  }
  // Some APIs don't need /v1 (e.g. DeepSeek works both ways)
  // Try with /v1 first as it's more standard
  return { chatUrl: url + "/v1/chat/completions", fallbackUrl: url + "/chat/completions", format: "openai" };
}

async function callOpenAI(chatUrl, apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch(chatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAnthropic(chatUrl, apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch(chatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

export async function chat(systemPrompt, userPrompt) {
  const config = getLLMConfig();
  if (!config.apiKey || !config.baseUrl) {
    throw new Error("LLM not configured. Set LLM_BASE_URL, LLM_API_KEY, LLM_MODEL in .env.local");
  }

  const { chatUrl, fallbackUrl, format } = normalizeUrl(config.baseUrl);

  if (format === "anthropic") {
    return callAnthropic(chatUrl, config.apiKey, config.model, systemPrompt, userPrompt);
  }

  // OpenAI compatible — try primary URL, fallback if 404
  try {
    return await callOpenAI(chatUrl, config.apiKey, config.model, systemPrompt, userPrompt);
  } catch (e) {
    if (fallbackUrl && e.message.startsWith("404")) {
      return callOpenAI(fallbackUrl, config.apiKey, config.model, systemPrompt, userPrompt);
    }
    throw e;
  }
}

export function isLLMConfigured() {
  const config = getLLMConfig();
  return !!(config.apiKey && config.baseUrl);
}
