"use client";

import { useState, useMemo } from "react";
import type { NewsItem } from "@/types";
import { useLocale } from "@/i18n/context";
import NewsCard from "@/components/NewsCard";
import ViewToggle, { type ViewMode } from "@/components/ViewToggle";
import SearchBar from "@/components/SearchBar";
import SourceFilter, { useSourceFilter, filterBySource } from "@/components/SourceFilter";

export default function NewsClient({ newsItems, categoryMap }: { newsItems: NewsItem[]; categoryMap?: Record<string, string> }) {
  const { t } = useLocale();
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");
  const { state: filterState, update: setFilterState } = useSourceFilter();

  const allSources = useMemo(
    () => [...new Set(newsItems.map((item) => item.source))].sort(),
    [newsItems]
  );

  const filtered = useMemo(() => {
    let items = filterBySource(newsItems, filterState, categoryMap);
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
  }, [newsItems, query, filterState, categoryMap]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("news.title")}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {t("news.subtitle")}
          </p>
        </div>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      <div className="mb-4">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <div className="mb-6">
        <SourceFilter sources={allSources} state={filterState} onChange={setFilterState} categoryMap={categoryMap} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 text-center text-slate-400">
          <p>{query ? (t("providers.empty")) : ""}</p>
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
