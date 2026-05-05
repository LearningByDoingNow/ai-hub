"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/i18n/context";

interface Module { id: string; name: string; nameEn: string; }
interface Source {
  id: string; name: string; type: string; url: string;
  lang: string; enabled: boolean; module: string; moduleIds: string[];
}

export default function SourcesManager() {
  const { locale } = useLocale();
  const [sources, setSources] = useState<Source[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", url: "", lang: "en", moduleIds: [] as string[] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [sRes, mRes] = await Promise.all([fetch("/api/sources"), fetch("/api/modules")]);
    setSources(await sRes.json());
    const mods = await mRes.json();
    setModules(mods.filter((m: Module) => m.id !== "providers"));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function toggleModule(modId: string) {
    setForm((f) => ({
      ...f,
      moduleIds: f.moduleIds.includes(modId)
        ? f.moduleIds.filter((id) => id !== modId)
        : [...f.moduleIds, modId],
    }));
  }

  async function addSource() {
    if (!form.name || !form.url || form.moduleIds.length === 0) return;
    const id = form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);
    await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id, name: form.name, type: "rss", url: form.url,
        lang: form.lang, enabled: true,
        module: form.moduleIds[0], moduleIds: form.moduleIds,
      }),
    });
    setForm({ name: "", url: "", lang: "en", moduleIds: [] });
    setShowAdd(false);
    fetchData();
  }

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editModuleIds, setEditModuleIds] = useState<string[]>([]);

  function startEdit(source: Source) {
    setEditingId(source.id);
    setEditModuleIds([...source.moduleIds]);
  }

  function toggleEditModule(modId: string) {
    setEditModuleIds((ids) =>
      ids.includes(modId) ? ids.filter((id) => id !== modId) : [...ids, modId]
    );
  }

  async function saveEdit(id: string) {
    if (editModuleIds.length === 0) return;
    await fetch("/api/sources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, moduleIds: editModuleIds, module: editModuleIds[0] }),
    });
    setEditingId(null);
    fetchData();
  }

  async function toggleSource(id: string, enabled: boolean) {
    await fetch("/api/sources", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    fetchData();
  }

  async function deleteSource(id: string) {
    await fetch("/api/sources", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchData();
  }

  function getModuleName(modId: string) {
    const m = modules.find((mod) => mod.id === modId);
    return m ? (locale === "zh" ? m.name : m.nameEn) : modId;
  }

  if (loading) return <div className="text-slate-400">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {locale === "zh"
            ? `共 ${sources.length} 个数据源，添加时可绑定到一个或多个模块`
            : `${sources.length} sources. Bind to one or more modules when adding.`}
        </p>
        <button onClick={() => setShowAdd(!showAdd)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {locale === "zh" ? "+ 添加数据源" : "+ Add Source"}
        </button>
      </div>

      {showAdd && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder={locale === "zh" ? "名称（如 BBC News）" : "Name (e.g. BBC News)"}
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <input placeholder="RSS URL" value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <select value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {locale === "zh" ? "绑定模块（可多选）" : "Bind to modules (multi-select)"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {modules.map((m) => (
                  <button key={m.id} onClick={() => toggleModule(m.id)}
                    className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                      form.moduleIds.includes(m.id)
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
                    }`}>
                    {locale === "zh" ? m.name : m.nameEn}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button onClick={addSource}
              disabled={form.moduleIds.length === 0}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {locale === "zh" ? "确认添加" : "Add"}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="rounded-lg bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">
              {locale === "zh" ? "取消" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.id}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{s.name}</span>
                  {s.moduleIds.map((mid) => (
                    <span key={mid} className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {getModuleName(mid)}
                    </span>
                  ))}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    {s.lang === "zh" ? "中文" : "EN"}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 truncate">{s.url}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button onClick={() => startEdit(s)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-500 dark:hover:bg-blue-950/30"
                  title={locale === "zh" ? "编辑模块" : "Edit module"}>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => toggleSource(s.id, s.enabled)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    s.enabled
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                  }`}>
                  {s.enabled ? (locale === "zh" ? "已启用" : "On") : (locale === "zh" ? "已禁用" : "Off")}
                </button>
                <button onClick={() => deleteSource(s.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {editingId === s.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">
                  {locale === "zh" ? "选择所属模块（可多选）" : "Select modules (multi-select)"}
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {modules.map((m) => (
                    <button key={m.id} onClick={() => toggleEditModule(m.id)}
                      className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                        editModuleIds.includes(m.id)
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                      {locale === "zh" ? m.name : m.nameEn}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => saveEdit(s.id)}
                    disabled={editModuleIds.length === 0}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
                    {locale === "zh" ? "保存" : "Save"}
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300">
                    {locale === "zh" ? "取消" : "Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
