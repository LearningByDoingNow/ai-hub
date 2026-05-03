"use client";

import { useState } from "react";
import type { NewsItem } from "@/types";
import { useLocale } from "@/i18n/context";
import NewsCard from "@/components/NewsCard";
import ViewToggle, { type ViewMode } from "@/components/ViewToggle";

export default function NewsClient({ newsItems }: { newsItems: NewsItem[] }) {
  const { t } = useLocale();
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between mb-8">
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

      <div
        className={
          view === "grid"
            ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-4"
        }
      >
        {newsItems.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
