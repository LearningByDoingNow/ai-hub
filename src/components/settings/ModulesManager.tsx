"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/i18n/context";

interface Module {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  sortOrder: number;
}

const ICONS = [
  { value: "newspaper", label: "Newspaper" },
  { value: "book", label: "Book" },
  { value: "grid", label: "Grid" },
  { value: "globe", label: "Globe" },
  { value: "code", label: "Code" },
  { value: "chart", label: "Chart" },
  { value: "rss", label: "RSS" },
  { value: "star", label: "Star" },
];

export default function ModulesManager() {
  const { locale } = useLocale();
  const [modules, setModules] = useState<Module[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", nameEn: "", icon: "rss" });
  const [loading, setLoading] = useState(true);

  const fetchModules = useCallback(async () => {
    const res = await fetch("/api/modules");
    setModules(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchModules(); }, [fetchModules]);

  async function addModule() {
    if (!form.name) return;
    const id = form.name.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, "-").slice(0, 30)
      || "module-" + Date.now();
    await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        name: form.name,
        nameEn: form.nameEn || form.name,
        icon: form.icon,
        sortOrder: modules.length,
      }),
    });
    setForm({ name: "", nameEn: "", icon: "rss" });
    setShowAdd(false);
    fetchModules();
  }

  async function deleteModule(id: string) {
    if (["providers", "news", "papers"].includes(id)) return;
    await fetch("/api/modules", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchModules();
  }

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {locale === "zh"
            ? "定义内容模块，数据源可绑定到一个或多个模块"
            : "Define content modules. Data sources can be bound to one or more modules."}
        </p>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {locale === "zh" ? "+ 新建模块" : "+ New Module"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              placeholder={locale === "zh" ? "模块名称（如 国际时政）" : "Module name"}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              placeholder={locale === "zh" ? "英文名称（如 World News）" : "English name"}
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {ICONS.map((i) => (
                <option key={i.value} value={i.value}>{i.label}</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={addModule}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              {locale === "zh" ? "创建" : "Create"}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="rounded-lg bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">
              {locale === "zh" ? "取消" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {modules.map((m) => {
          const isBuiltin = ["providers", "news", "papers"].includes(m.id);
          return (
            <div key={m.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 text-sm">
                  {m.icon === "newspaper" ? "📰" : m.icon === "book" ? "📄" : m.icon === "grid" ? "📦" : m.icon === "globe" ? "🌍" : m.icon === "code" ? "💻" : m.icon === "chart" ? "📊" : m.icon === "star" ? "⭐" : "📡"}
                </div>
                <div>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{m.name}</span>
                  {m.nameEn && m.nameEn !== m.name && (
                    <span className="ml-2 text-sm text-slate-400">({m.nameEn})</span>
                  )}
                  {isBuiltin && (
                    <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400 dark:bg-slate-700">
                      {locale === "zh" ? "内置" : "Built-in"}
                    </span>
                  )}
                </div>
              </div>
              {!isBuiltin && (
                <button onClick={() => deleteModule(m.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
