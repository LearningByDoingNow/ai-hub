"use client";

import { useState, useMemo } from "react";
import { newsItems } from "@/data/news";
import { useLocale } from "@/i18n/context";
import NewsCard from "@/components/NewsCard";

export default function NewsPage() {
  const { t } = useLocale();
  const [search, setSearch] = useState("");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    newsItems.forEach((item) => item.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, []);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return newsItems.filter((item) => {
      if (selectedTag && !item.tags.includes(selectedTag)) return false;
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.titleEn.toLowerCase().includes(q) &&
        !item.summary.toLowerCase().includes(q) &&
        !item.tags.some((tag) => tag.toLowerCase().includes(q))
      )
        return false;
      return true;
    });
  }, [search, selectedTag]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("news.title")}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t("news.subtitle")}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-md">
          <svg
            className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            type="text"
            placeholder={t("search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              selectedTag === null
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t("filter.all")}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedTag === tag
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-16 text-center text-slate-400 dark:text-slate-500">
          <p className="text-lg">{t("providers.empty")}</p>
        </div>
      )}
    </div>
  );
}
