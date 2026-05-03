/**
 * AI Hub LLM Client
 * Supports multiple providers with their native API formats:
 * - OpenAI compatible: OpenAI, DeepSeek, OpenRouter, Groq, Together, etc.
 * - Anthropic: Claude native API
 */

import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");

const PROVIDER_PRESETS = {
  openai: {
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    format: "openai",
    defaultModel: "gpt-4o-mini",
  },
  anthropic: {
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com",
    format: "anthropic",
    defaultModel: "claude-sonnet-4-6",
  },
  deepseek: {
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com/v1",
    format: "openai",
    defaultModel: "deepseek-chat",
  },
  openrouter: {
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    format: "openai",
    defaultModel: "deepseek/deepseek-chat-v3-0324:free",
  },
  groq: {
    name: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    format: "openai",
    defaultModel: "llama-3.3-70b-versatile",
  },
  together: {
    name: "Together AI",
    baseUrl: "https://api.together.xyz/v1",
    format: "openai",
    defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  },
  siliconflow: {
    name: "SiliconFlow",
    baseUrl: "https://api.siliconflow.cn/v1",
    format: "openai",
    defaultModel: "deepseek-ai/DeepSeek-V3",
  },
  custom: {
    name: "Custom",
    baseUrl: "",
    format: "openai",
    defaultModel: "",
  },
};

function getLLMConfig() {
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  const row = db.prepare("SELECT value FROM pipeline_config WHERE key = 'llm'").get();
  db.close();
  if (!row) return null;
  return JSON.parse(row.value);
}

async function callOpenAIFormat(baseUrl, apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch(`${baseUrl}/chat/completions`, {
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
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

async function callAnthropicFormat(baseUrl, apiKey, model, systemPrompt, userPrompt) {
  const res = await fetch(`${baseUrl}/v1/messages`, {
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
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content[0].text;
}

export async function chat(systemPrompt, userPrompt) {
  const config = getLLMConfig();
  if (!config || !config.apiKey) {
    throw new Error("LLM not configured. Go to Settings → LLM Config to set up.");
  }

  const preset = PROVIDER_PRESETS[config.provider] || PROVIDER_PRESETS.custom;
  const baseUrl = config.baseUrl || preset.baseUrl;
  const model = config.model || preset.defaultModel;
  const format = config.format || preset.format;

  if (format === "anthropic") {
    return callAnthropicFormat(baseUrl, config.apiKey, model, systemPrompt, userPrompt);
  }
  return callOpenAIFormat(baseUrl, config.apiKey, model, systemPrompt, userPrompt);
}

export function isLLMConfigured() {
  const config = getLLMConfig();
  return !!(config && config.apiKey);
}

export { PROVIDER_PRESETS };
