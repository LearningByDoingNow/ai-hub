"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/i18n/context";

interface Source {
  id: string;
  name: string;
  type: string;
  url: string;
  lang: string;
  enabled: boolean;
  module: string;
}

export default function SourcesManager() {
  const { locale } = useLocale();
  const [sources, setSources] = useState<Source[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", lang: "en", module: "news" });
  const [loading, setLoading] = useState(true);

  const fetchSources = useCallback(async () => {
    const res = await fetch("/api/sources");
    const data = await res.json();
    setSources(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSources(); }, [fetchSources]);

  async function addSource() {
    if (!form.name || !form.url) return;
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...form, type: "rss", enabled: true }),
    });
    setForm({ name: "", url: "", lang: "en", module: "news" });
    setShowAdd(false);
    fetchSources();
  }

  async function toggleSource(id: string, enabled: boolean) {
    await fetch("/api/sources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    fetchSources();
  }

  async function deleteSource(id: string) {
    await fetch("/api/sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchSources();
  }

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {locale === "zh"
            ? `共 ${sources.length} 个数据源，可自由添加 RSS 源`
            : `${sources.length} sources configured. Add any RSS feed.`}
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {locale === "zh" ? "+ 添加数据源" : "+ Add Source"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              placeholder={locale === "zh" ? "名称（如 BBC News）" : "Name (e.g. BBC News)"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              placeholder={locale === "zh" ? "RSS URL" : "RSS URL"}
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <select
              value={form.lang}
              onChange={(e) => setForm({ ...form, lang: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
            <select
              value={form.module}
              onChange={(e) => setForm({ ...form, module: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="news">{locale === "zh" ? "资讯" : "News"}</option>
              <option value="papers">{locale === "zh" ? "论文" : "Papers"}</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={addSource}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              {locale === "zh" ? "确认添加" : "Add"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="rounded-lg bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
            >
              {locale === "zh" ? "取消" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sources.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {s.name}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  {s.module === "news" ? (locale === "zh" ? "资讯" : "News") : (locale === "zh" ? "论文" : "Papers")}
                </span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                  {s.lang === "zh" ? "中文" : "EN"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 truncate">
                {s.url}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <button
                onClick={() => toggleSource(s.id, s.enabled)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  s.enabled
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                }`}
              >
                {s.enabled
                  ? (locale === "zh" ? "已启用" : "Enabled")
                  : (locale === "zh" ? "已禁用" : "Disabled")}
              </button>
              <button
                onClick={() => deleteSource(s.id)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
