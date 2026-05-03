"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/i18n/context";

interface Preset {
  name: string;
  baseUrl: string;
  model: string;
  builtin?: boolean;
}

const BUILTIN_PRESETS: Preset[] = [
  { name: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", builtin: true },
  { name: "Anthropic", baseUrl: "https://api.anthropic.com", model: "claude-sonnet-4-6", builtin: true },
  { name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat", builtin: true },
  { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1", model: "deepseek/deepseek-chat-v3-0324:free", builtin: true },
  { name: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama-3.3-70b-versatile", builtin: true },
  { name: "Together AI", baseUrl: "https://api.together.xyz/v1", model: "meta-llama/Llama-3.3-70B-Instruct-Turbo", builtin: true },
  { name: "SiliconFlow", baseUrl: "https://api.siliconflow.cn/v1", model: "deepseek-ai/DeepSeek-V3", builtin: true },
  { name: "Xiaomi MiMo", baseUrl: "https://api.xiaomimimo.com/v1", model: "mimo-v2.5-pro", builtin: true },
];

const CUSTOM_PRESETS_KEY = "ai-hub-llm-presets";

export default function LLMConfig() {
  const { locale } = useLocale();
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState("0.5");
  const [reasoningEffort, setReasoningEffort] = useState("default");
  const [saving, setSaving] = useState(false);
  const [savedConfig, setSavedConfig] = useState({ baseUrl: "", model: "" });

  // Custom presets
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [newPreset, setNewPreset] = useState({ name: "", baseUrl: "", model: "" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_PRESETS_KEY);
      if (saved) setCustomPresets(JSON.parse(saved));
    } catch { /* */ }
  }, []);

  function saveCustomPreset() {
    if (!newPreset.name || !newPreset.baseUrl) return;
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
    setNewPreset({ name: "", baseUrl: "", model: "" });
    setShowAddPreset(false);
  }

  function deleteCustomPreset(name: string) {
    const updated = customPresets.filter((p) => p.name !== name);
    setCustomPresets(updated);
    localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(updated));
  }

  const allPresets = [...BUILTIN_PRESETS, ...customPresets];
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
    if (data.reasoningEffort) setReasoningEffort(data.reasoningEffort);
    setConfigured(!!data.apiKey);
    setSavedConfig({ baseUrl: data.baseUrl || "", model: data.model || "" });
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
        temperature, reasoningEffort,
      }),
    });
    setSaving(false);
    setSaved(true);
    setConfigured(true);
    setApiKey("");
    setSavedConfig({ baseUrl, model });
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

  const savedProvider = allPresets.find((p) => p.baseUrl === savedConfig.baseUrl);

  return (
    <div className="space-y-6">
      {/* Current Status — shows actually saved config, not form editing state */}
      <div className={`rounded-xl border p-4 ${
        configured
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
      }`}>
        <div className="flex items-center gap-3">
          <span className={`relative flex h-3 w-3 ${configured ? "" : ""}`}>
            <span className={`h-3 w-3 rounded-full ${configured ? "bg-green-500" : "bg-amber-500"}`} />
            {configured && <span className="absolute h-3 w-3 rounded-full bg-green-500 animate-ping" />}
          </span>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {configured
                ? `${locale === "zh" ? "当前模型" : "Active"}: ${savedProvider?.name || savedConfig.baseUrl.replace(/https?:\/\//, "").split("/")[0]} — ${savedConfig.model}`
                : (locale === "zh" ? "未配置 LLM — 请在下方设置" : "LLM not configured — set up below")}
            </p>
            {configured && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{savedConfig.baseUrl}</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
          {locale === "zh" ? "快速选择" : "Quick Select"}
        </h3>
        <div className="flex flex-wrap gap-2">
          {allPresets.map((p) => (
            <div key={p.name} className="relative group">
              <button
                onClick={() => applyPreset(p)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                  baseUrl === p.baseUrl
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400"
                }`}
              >
                {p.name}
              </button>
              {!p.builtin && (
                <button
                  onClick={() => deleteCustomPreset(p.name)}
                  className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={() => setShowAddPreset(!showAddPreset)}
            className="rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-500 dark:border-slate-600"
          >
            + {locale === "zh" ? "添加模板" : "Add Template"}
          </button>
        </div>

        {showAddPreset && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
            <input placeholder={locale === "zh" ? "名称" : "Name"} value={newPreset.name}
              onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <input placeholder="Base URL" value={newPreset.baseUrl}
              onChange={(e) => setNewPreset({ ...newPreset, baseUrl: e.target.value })}
              className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <div className="flex gap-2">
              <input placeholder={locale === "zh" ? "默认模型" : "Default model"} value={newPreset.model}
                onChange={(e) => setNewPreset({ ...newPreset, model: e.target.value })}
                className="flex-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
              <button onClick={saveCustomPreset} disabled={!newPreset.name || !newPreset.baseUrl}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {locale === "zh" ? "添加" : "Add"}
              </button>
            </div>
          </div>
        )}
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
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
