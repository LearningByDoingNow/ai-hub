"use client";

import { useMemo } from "react";
import type { NewsItem } from "@/types";
import { useLocale } from "@/i18n/context";
import FavoriteButton from "./FavoriteButton";
import { formatPublishTime, formatFullDate } from "@/lib/timeAgo";

function getFreshness(dateStr?: string): number {
  if (!dateStr) return 0;
  let d: Date;
  if (dateStr.includes("T")) d = new Date(dateStr);
  else if (dateStr.includes(" ")) d = new Date(dateStr.replace(" ", "T") + "Z");
  else d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return 0;
  const hours = (Date.now() - d.getTime()) / 3600000;
  if (hours < 1) return 1;
  if (hours < 3) return 0.7;
  if (hours < 6) return 0.5;
  if (hours < 12) return 0.3;
  if (hours < 24) return 0.15;
  return 0;
}

export default function NewsCard({ item }: { item: NewsItem }) {
  const { locale, t } = useLocale();
  const title = locale === "en" ? (item.titleEn || item.title) : item.title;
  const summary = locale === "en" ? (item.summaryEn || item.summary) : item.summary;
  const freshness = useMemo(() => getFreshness(item.createdAt || item.date), [item.createdAt, item.date]);

  const cardBg = freshness >= 0.8
    ? "bg-blue-50/80 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800/50"
    : freshness >= 0.5
      ? "bg-blue-50/40 border-blue-100 dark:bg-blue-950/15 dark:border-blue-900/30"
      : freshness >= 0.2
        ? "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700"
        : "bg-white border-slate-200 dark:bg-slate-800/30 dark:border-slate-700/50";

  return (
    <div
      className={`group relative rounded-xl border p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 ${cardBg}`}
    >
      <div className="absolute top-3 right-3">
        <FavoriteButton item={{ id: item.id, type: "news", title: item.title, url: item.url }} />
      </div>

      <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="flex items-center gap-2 mb-2 pr-8">
          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-800">
            {item.source}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {formatPublishTime(item.createdAt || item.date, locale)}
          </span>
          <span className="text-xs text-slate-300 dark:text-slate-600">
            {formatFullDate(item.date, locale)}
          </span>
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
