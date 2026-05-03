"use client";

import type { NewsItem } from "@/types";
import { useLocale } from "@/i18n/context";
import FavoriteButton from "./FavoriteButton";

export default function NewsCard({ item }: { item: NewsItem }) {
  const { locale, t } = useLocale();
  const title = locale === "en" ? (item.titleEn || item.title) : item.title;
  const summary = locale === "en" ? (item.summaryEn || item.summary) : item.summary;

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-700">
      <div className="absolute top-3 right-3">
        <FavoriteButton item={{ id: item.id, type: "news", title: item.title, url: item.url }} />
      </div>

      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="flex items-center gap-2 mb-2 pr-8">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
            {item.source}
          </span>
          <time className="text-xs text-slate-400 dark:text-slate-500">{item.date}</time>
        </div>

        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {summary}
        </p>

        <div className="mt-3 text-sm font-medium text-blue-600 dark:text-blue-400">
          {t("news.readMore")} →
        </div>
      </a>
    </div>
  );
}
