"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/i18n/context";
import { categories } from "@/lib/constants";
import { countries, getFlag } from "@/lib/countries";
import type { Provider } from "@/types";

const countryCodes = Object.keys(countries);

const emptyForm: Provider = {
  id: "", name: "", description: "", category: "大模型", country: "US",
  links: [{ label: "", url: "" }], tags: [],
};

export default function ProvidersManager() {
  const { locale } = useLocale();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [editing, setEditing] = useState<Provider | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Provider>(emptyForm);
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProviders = useCallback(async () => {
    const res = await fetch("/api/providers");
    setProviders(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  function openEdit(p: Provider) {
    setEditing(p);
    setForm(p);
    setTagsInput(p.tags.join(", "));
    setShowAdd(false);
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setTagsInput("");
    setShowAdd(true);
  }

  async function save() {
    const data = { ...form, tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean) };
    if (!data.id) data.id = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);

    await fetch("/api/providers", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setShowAdd(false);
    setEditing(null);
    fetchProviders();
  }

  async function remove(id: string) {
    await fetch("/api/providers", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchProviders();
  }

  function updateLink(idx: number, field: "label" | "url", value: string) {
    const links = [...form.links];
    links[idx] = { ...links[idx], [field]: value };
    setForm({ ...form, links });
  }

  function addLink() {
    setForm({ ...form, links: [...form.links, { label: "", url: "" }] });
  }

  function removeLink(idx: number) {
    setForm({ ...form, links: form.links.filter((_, i) => i !== idx) });
  }

  if (loading) return <div className="text-slate-400">Loading...</div>;

  const isFormOpen = showAdd || editing;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {locale === "zh" ? `共 ${providers.length} 个供应商` : `${providers.length} providers`}
        </p>
        {!isFormOpen && (
          <button
            onClick={openAdd}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            {locale === "zh" ? "+ 添加供应商" : "+ Add Provider"}
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
            {editing ? (locale === "zh" ? "编辑供应商" : "Edit Provider") : (locale === "zh" ? "添加供应商" : "Add Provider")}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="ID (e.g. openai)" value={form.id} disabled={!!editing}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <input placeholder={locale === "zh" ? "名称" : "Name"} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <input placeholder={locale === "zh" ? "描述" : "Description"} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <select
                value={countryCodes.includes(form.country) ? form.country : "__custom"}
                onChange={(e) => {
                  if (e.target.value !== "__custom") setForm({ ...form, country: e.target.value });
                }}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                {countryCodes.map((code) => (
                  <option key={code} value={code}>
                    {getFlag(code)} {locale === "zh" ? countries[code].nameZh : countries[code].nameEn} ({code})
                  </option>
                ))}
                <option value="__custom">{locale === "zh" ? "其他（手动输入）" : "Other (type below)"}</option>
              </select>
              {!countryCodes.includes(form.country) && (
                <input
                  placeholder={locale === "zh" ? "输入国家代码（如 JP, KR）" : "Country code (e.g. JP, KR)"}
                  value={form.country === "US" ? "" : form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })}
                  className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              )}
            </div>
            <input placeholder={locale === "zh" ? "标签（逗号分隔）" : "Tags (comma separated)"}
              value={tagsInput} onChange={(e) => setTagsInput(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>

          <div className="mt-3">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mb-2">
              {locale === "zh" ? "链接" : "Links"}
            </p>
            {form.links.map((link, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input placeholder="Label" value={link.label} onChange={(e) => updateLink(i, "label", e.target.value)}
                  className="w-28 rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                <input placeholder="URL" value={link.url} onChange={(e) => updateLink(i, "url", e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
                <button onClick={() => removeLink(i)} className="text-slate-400 hover:text-red-500 px-1">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button onClick={addLink} className="text-sm text-blue-600 hover:text-blue-700">
              + {locale === "zh" ? "添加链接" : "Add link"}
            </button>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={save} className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
              {locale === "zh" ? "保存" : "Save"}
            </button>
            <button onClick={() => { setShowAdd(false); setEditing(null); }}
              className="rounded-lg bg-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200">
              {locale === "zh" ? "取消" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {providers.map((p) => (
          <div key={p.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-slate-100">{p.name}</span>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {p.category}
                </span>
                <span className="text-xs text-slate-400">{p.country}</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{p.description}</p>
            </div>
            <div className="flex gap-1 ml-3 shrink-0">
              <button onClick={() => openEdit(p)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30">
                {locale === "zh" ? "编辑" : "Edit"}
              </button>
              <button onClick={() => remove(p.id)}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                {locale === "zh" ? "删除" : "Delete"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
