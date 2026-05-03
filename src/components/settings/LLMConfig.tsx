"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/i18n/context";

const PRESETS = [
  { name: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  { name: "Anthropic", baseUrl: "https://api.anthropic.com", model: "claude-sonnet-4-6" },
  { name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "deepseek/deepseek-chat-v3-0324:free" },
  { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile" },
  { name: "Together AI", baseUrl: "https://api.together.xyz/v1", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  { name: "SiliconFlow", baseUrl: "https://api.siliconflow.cn/v1", model: "deepseek-ai/DeepSeek-V3" },
  { name: "Xiaomi MiMo", baseUrl: "https://api.xiaomimimo.com/v1", model: "mimo-v2.5-pro" },
];

export default function LLMConfig() {
  const { locale } = useLocale();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState("0.5");
  const [maxTokens, setMaxTokens] = useState("2000");
  const [reasoningEffort, setReasoningEffort] = useState("default");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [configured, setConfigured] = useState(false);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/config/env");
    const data = await res.json();
    if (data.baseUrl) setBaseUrl(data.baseUrl);
    if (data.model) setModel(data.model);
    if (data.temperature) setTemperature(data.temperature);
    if (data.maxTokens) setMaxTokens(data.maxTokens);
    if (data.reasoningEffort) setReasoningEffort(data.reasoningEffort);
    setConfigured(!!data.apiKey);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  function applyPreset(preset: typeof PRESETS[0]) {
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/config/env", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        baseUrl, apiKey: apiKey || undefined, model,
        temperature, maxTokens, reasoningEffort,
      }),
    });
    setSaving(false);
    setSaved(true);
    setConfigured(true);
    setApiKey("");
    setTimeout(() => setSaved(false), 2000);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    const format = baseUrl.includes("anthropic.com") ? "anthropic" : "openai";
    const testKey = apiKey || "***use-saved***";
    try {
      const res = await fetch("/api/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ baseUrl, apiKey: testKey, model, format }),
      });
      const data = await res.json();
      setTestResult(data.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
    } catch {
      setTestResult("✗ Request failed");
    }
    setTesting(false);
  }

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
          {locale === "zh" ? "快速选择" : "Quick Select"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                baseUrl === p.baseUrl
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Config Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
          {locale === "zh" ? "LLM 配置" : "LLM Configuration"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base URL</label>
            <input
              placeholder="https://api.openai.com/v1"
              value={baseUrl}
              onChange={(e) => { setBaseUrl(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key</label>
            <input
              type="password"
              placeholder={configured ? (locale === "zh" ? "已配置（留空保持不变）" : "Configured (leave empty to keep)") : "sk-..."}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "模型" : "Model"}
            </label>
            <input
              placeholder="gpt-4o-mini"
              value={model}
              onChange={(e) => { setModel(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Inference Parameters */}
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Temperature
              <span className="ml-1 text-xs text-slate-400">({temperature})</span>
            </label>
            <input type="range" min="0" max="2" step="0.1" value={temperature}
              onChange={(e) => { setTemperature(e.target.value); setSaved(false); }}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-0.5">
              <span>{locale === "zh" ? "精确" : "Precise"}</span>
              <span>{locale === "zh" ? "创意" : "Creative"}</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max Tokens
            </label>
            <select value={maxTokens} onChange={(e) => { setMaxTokens(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option value="1000">1,000</option>
              <option value="2000">2,000</option>
              <option value="4000">4,000</option>
              <option value="8000">8,000</option>
              <option value="16000">16,000</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "推理强度" : "Reasoning Effort"}
            </label>
            <select value={reasoningEffort} onChange={(e) => { setReasoningEffort(e.target.value); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option value="default">{locale === "zh" ? "默认" : "Default"}</option>
              <option value="low">{locale === "zh" ? "低 — 快速回复" : "Low — Fast"}</option>
              <option value="medium">{locale === "zh" ? "中 — 平衡" : "Medium — Balanced"}</option>
              <option value="high">{locale === "zh" ? "高 — 深度思考" : "High — Deep thinking"}</option>
            </select>
            <p className="text-xs text-slate-400 mt-1">
              {locale === "zh" ? "支持 DeepSeek/OpenAI o系列/Claude 等" : "For DeepSeek/OpenAI o-series/Claude etc."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving || !baseUrl}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "..." : (locale === "zh" ? "保存" : "Save")}
          </button>
          <button
            onClick={testConnection}
            disabled={testing || !baseUrl || (!apiKey && !configured)}
            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
          >
            {testing ? "..." : (locale === "zh" ? "测试连接" : "Test")}
          </button>
          {saved && <span className="text-sm text-green-600">✓ {locale === "zh" ? "已保存到 .env.local" : "Saved to .env.local"}</span>}
        </div>

        {testResult && (
          <div className={`mt-3 rounded-lg px-4 py-2 text-sm ${testResult.startsWith("✓") ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}>
            {testResult}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
          {locale === "zh" ? "说明" : "Info"}
        </h3>
        <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400 list-disc pl-5">
          <li>{locale === "zh" ? "配置保存在 .env.local 中，不会提交到 Git" : "Config saved in .env.local, never committed to Git"}</li>
          <li>{locale === "zh" ? "支持所有 OpenAI 兼容 API（DeepSeek、OpenRouter、Groq 等）" : "Supports all OpenAI-compatible APIs"}</li>
          <li>{locale === "zh" ? "支持 Anthropic 原生 API（自动检测）" : "Supports Anthropic native API (auto-detected)"}</li>
          <li>{locale === "zh" ? "无 LLM 时，所有抓取功能正常使用" : "All fetching works normally without LLM"}</li>
        </ul>
      </div>
    </div>
  );
}
