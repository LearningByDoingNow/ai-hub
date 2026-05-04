import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();

export default function SettingsWindow() {
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState("0.5");
  const [fetchInterval, setFetchInterval] = useState("0");
  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState("");
  const [saved, setSaved] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => { if (e.buttons === 1) appWindow.startDragging(); };
    el.addEventListener("mousedown", handler);
    return () => el.removeEventListener("mousedown", handler);
  }, []);

  async function loadConfig() {
    try {
      const config = await invoke<{ base_url: string; api_key: string; model: string; temperature: number } | null>("get_llm_config");
      if (config) {
        setBaseUrl(config.base_url);
        setApiKey(config.api_key);
        setModel(config.model);
        setTemperature(String(config.temperature));
      }
      const interval = await invoke<string>("get_config_value", { key: "FETCH_INTERVAL_MIN" });
      if (interval) setFetchInterval(interval);
    } catch {}
  }

  async function saveLlm() {
    try {
      await invoke("save_llm_config", {
        baseUrl: baseUrl,
        apiKey: apiKey,
        model: model,
        temperature: parseFloat(temperature) || 0.5,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("保存失败: " + e);
    }
  }

  async function saveInterval() {
    try {
      await invoke("save_config_value", { key: "FETCH_INTERVAL_MIN", value: fetchInterval });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
  }

  async function doFetch() {
    setFetching(true);
    setFetchResult("");
    try {
      const result = await invoke<string>("trigger_fetch");
      setFetchResult(result);
    } catch (e) {
      setFetchResult("错误: " + e);
    }
    setFetching(false);
  }

  return (
    <div className="h-full flex flex-col bg-white/90 dark:bg-[#0d0f1a]/90 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/20 dark:border-white/5 shadow-2xl">
      {/* Drag bar + Header combined */}
      <div ref={dragRef} className="flex items-center justify-between px-5 py-3 cursor-grab active:cursor-grabbing flex-shrink-0">
        <h1 className="text-base font-bold text-slate-800 dark:text-white pointer-events-none">设置</h1>
        <button onClick={() => appWindow.close()} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-5">
        {/* LLM Config */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">LLM 配置</h2>
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">API 地址</label>
              <input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1"
                className="w-full rounded-lg border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400/50" />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 mb-1 block">API 密钥</label>
              <input value={apiKey} onChange={(e) => setApiKey(e.target.value)} type="password" placeholder="sk-..."
                className="w-full rounded-lg border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400/50" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[11px] text-slate-500 mb-1 block">模型</label>
                <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o"
                  className="w-full rounded-lg border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400/50" />
              </div>
              <div className="w-20">
                <label className="text-[11px] text-slate-500 mb-1 block">温度</label>
                <input value={temperature} onChange={(e) => setTemperature(e.target.value)} type="number" step="0.1" min="0" max="2"
                  className="w-full rounded-lg border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400/50" />
              </div>
            </div>
            <button onClick={saveLlm}
              className="w-full py-2 rounded-lg bg-blue-600 text-white text-[12px] font-medium hover:bg-blue-700 transition-colors">
              保存 LLM 配置
            </button>
          </div>
        </section>

        {/* Fetch Config */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">数据抓取</h2>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-500">定时抓取：每</label>
              <input value={fetchInterval} onChange={(e) => setFetchInterval(e.target.value)} type="number" min="0"
                className="w-16 rounded-lg border border-slate-200/50 dark:border-white/10 bg-white/60 dark:bg-white/5 px-2 py-1.5 text-center text-[12px] text-slate-700 dark:text-slate-200 outline-none" />
              <label className="text-[11px] text-slate-500">分钟（0=关闭）</label>
              <button onClick={saveInterval} className="ml-auto px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-[11px] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                保存
              </button>
            </div>
            <button onClick={doFetch} disabled={fetching}
              className="w-full py-2 rounded-lg bg-emerald-600 text-white text-[12px] font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors">
              {fetching ? "抓取中..." : "立即抓取所有数据"}
            </button>
            {fetchResult && (
              <div className={`text-[11px] px-3 py-2 rounded-lg ${fetchResult.includes("错误") ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" : "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"}`}>
                {fetchResult}
              </div>
            )}
          </div>
        </section>

        {/* Saved indicator */}
        {saved && (
          <div className="fixed top-3 right-3 rounded-lg bg-green-500 text-white text-[11px] px-3 py-1.5 shadow-lg animate-pulse">
            已保存
          </div>
        )}
      </div>
    </div>
  );
}
