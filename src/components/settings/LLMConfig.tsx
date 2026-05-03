"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/i18n/context";

const PRESETS = [
  { id: "openai", name: "OpenAI", baseUrl: "https://api.openai.com/v1", format: "openai", defaultModel: "gpt-4o-mini" },
  { id: "anthropic", name: "Anthropic (Claude)", baseUrl: "https://api.anthropic.com", format: "anthropic", defaultModel: "claude-sonnet-4-6" },
  { id: "deepseek", name: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", format: "openai", defaultModel: "deepseek-chat" },
  { id: "openrouter", name: "OpenRouter (290+ models)", baseUrl: "https://openrouter.ai/api/v1", format: "openai", defaultModel: "deepseek/deepseek-chat-v3-0324:free" },
  { id: "groq", name: "Groq", baseUrl: "https://api.groq.com/openai/v1", format: "openai", defaultModel: "llama-3.3-70b-versatile" },
  { id: "together", name: "Together AI", baseUrl: "https://api.together.xyz/v1", format: "openai", defaultModel: "meta-llama/Llama-3.3-70B-Instruct-Turbo" },
  { id: "siliconflow", name: "SiliconFlow (硅基流动)", baseUrl: "https://api.siliconflow.cn/v1", format: "openai", defaultModel: "deepseek-ai/DeepSeek-V3" },
  { id: "mimo", name: "Xiaomi MiMo", baseUrl: "https://api.xiaomimimo.com/v1", format: "openai", defaultModel: "mimo-v2.5-pro" },
  { id: "custom", name: "Custom (自定义)", baseUrl: "", format: "openai", defaultModel: "" },
];

interface LLMConfigData {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
  format: string;
}

export default function LLMConfig() {
  const { locale } = useLocale();
  const [config, setConfig] = useState<LLMConfigData>({
    provider: "openai", apiKey: "", baseUrl: "https://api.openai.com/v1", model: "gpt-4o-mini", format: "openai",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/config?key=llm");
    const data = await res.json();
    if (data.value) setConfig((prev) => ({ ...prev, ...data.value, apiKey: prev.apiKey }));
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  function selectProvider(providerId: string) {
    const preset = PRESETS.find((p) => p.id === providerId);
    if (!preset) return;
    setConfig({
      ...config,
      provider: providerId,
      baseUrl: preset.baseUrl,
      model: config.model || preset.defaultModel,
      format: preset.format,
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    // Save non-sensitive config to database (no API key)
    const { apiKey: _, ...safeConfig } = config;
    await fetch("/api/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "llm", value: safeConfig }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function testConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/llm/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      setTestResult(data.ok ? `✓ ${data.message}` : `✗ ${data.error}`);
    } catch {
      setTestResult("✗ Request failed");
    }
    setTesting(false);
  }

  const currentPreset = PRESETS.find((p) => p.id === config.provider);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
          {locale === "zh" ? "LLM 服务商" : "LLM Provider"}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => selectProvider(p.id)}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                config.provider === p.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600"
              }`}
            >
              <div className="font-medium">{p.name}</div>
              {p.defaultModel && (
                <div className="text-xs opacity-60 mt-0.5 truncate">{p.defaultModel}</div>
              )}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              API Key
            </label>
            <input
              type="password"
              placeholder="sk-..."
              value={config.apiKey}
              onChange={(e) => { setConfig({ ...config, apiKey: e.target.value }); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
              {locale === "zh"
                ? "安全提示：Key 仅用于测试连接，不会存入数据库。正式使用请在 .env.local 中设置 LLM_API_KEY=你的Key"
                : "Security: Key is only used for testing. For production, set LLM_API_KEY in .env.local"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "模型" : "Model"}
            </label>
            <input
              placeholder={currentPreset?.defaultModel || "model-name"}
              value={config.model}
              onChange={(e) => { setConfig({ ...config, model: e.target.value }); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Base URL
            </label>
            <input
              placeholder={currentPreset?.baseUrl || "https://api.example.com/v1"}
              value={config.baseUrl}
              onChange={(e) => { setConfig({ ...config, baseUrl: e.target.value }); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "API 格式" : "API Format"}
            </label>
            <select
              value={config.format}
              onChange={(e) => { setConfig({ ...config, format: e.target.value }); setSaved(false); }}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="openai">OpenAI Compatible</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? (locale === "zh" ? "保存中..." : "Saving...") : (locale === "zh" ? "保存配置" : "Save")}
          </button>
          <button
            onClick={testConnection}
            disabled={testing || !config.apiKey}
            className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {testing ? (locale === "zh" ? "测试中..." : "Testing...") : (locale === "zh" ? "测试连接" : "Test Connection")}
          </button>
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400">
              {locale === "zh" ? "✓ 已保存" : "✓ Saved"}
            </span>
          )}
        </div>

        {testResult && (
          <div className={`mt-3 rounded-lg px-4 py-2 text-sm ${
            testResult.startsWith("✓")
              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
          }`}>
            {testResult}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
          {locale === "zh" ? "LLM 能力说明" : "LLM Capabilities"}
        </h3>
        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <p>{locale === "zh" ? "配置 LLM 后，以下功能将自动增强：" : "With LLM configured, these features are automatically enhanced:"}</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>{locale === "zh" ? "智能过滤 — 语义理解替代关键词匹配，过滤低质量内容" : "Smart filtering — semantic understanding replaces keyword matching"}</li>
            <li>{locale === "zh" ? "双语摘要 — 自动生成中英文摘要" : "Bilingual summaries — auto-generate Chinese and English summaries"}</li>
            <li>{locale === "zh" ? "跨模块联动 — 检测到新模型发布时自动更新产品导航" : "Cross-module sync — auto-update product cards when new models are detected"}</li>
            <li>{locale === "zh" ? "无 LLM 时仍可正常使用所有抓取功能" : "All fetching works normally without LLM configured"}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
