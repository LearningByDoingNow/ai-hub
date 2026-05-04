"use client";

import { useState, useEffect, useMemo } from "react";
import type { NewsItem } from "@/types";
import { useLocale } from "@/i18n/context";
import NewsCard from "@/components/NewsCard";
import ViewToggle, { type ViewMode } from "@/components/ViewToggle";
import SearchBar from "@/components/SearchBar";
import SourceFilter, { useSourceFilter, filterBySource } from "@/components/SourceFilter";

interface Module {
  id: string;
  name: string;
  nameEn: string;
}

export default function FeedClient({ moduleId, newsItems }: { moduleId: string; newsItems: NewsItem[] }) {
  const { locale } = useLocale();
  const [view, setView] = useState<ViewMode>("list");
  const [module, setModule] = useState<Module | null>(null);
  const [query, setQuery] = useState("");
  const { state: filterState, update: setFilterState } = useSourceFilter();

  useEffect(() => {
    fetch("/api/modules")
      .then((r) => r.json())
      .then((mods: Module[]) => {
        const m = mods.find((mod) => mod.id === moduleId);
        if (m) setModule(m);
      });
  }, [moduleId]);

  const title = module
    ? (locale === "zh" ? module.name : module.nameEn)
    : moduleId;

  const allSources = useMemo(
    () => [...new Set(newsItems.map((item) => item.source))].sort(),
    [newsItems]
  );

  const filtered = useMemo(() => {
    let items = filterBySource(newsItems, filterState);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((item) =>
        item.title.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q)
      );
    }
    return items;
  }, [newsItems, query, filterState]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {locale === "zh" ? `${filtered.length} 条内容` : `${filtered.length} items`}
          </p>
        </div>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      <div className="mb-4">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mb-6">
        <SourceFilter sources={allSources} state={filterState} onChange={setFilterState} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-slate-400 dark:text-slate-500">
          {query ? (
            <p>{locale === "zh" ? "没有匹配的结果" : "No matching results"}</p>
          ) : (
            <>
              <p className="text-lg">{locale === "zh" ? "暂无内容" : "No content yet"}</p>
              <p className="mt-1 text-sm">
                {locale === "zh"
                  ? "请在设置 → 数据源中添加 RSS 源并绑定到此模块"
                  : "Add RSS sources in Settings → Data Sources and bind to this module"}
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-4"}>
          {filtered.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
