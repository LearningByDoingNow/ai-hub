"use client";

import { NewsItem } from "@/data/news";
import { useLocale } from "@/i18n/context";

export default function NewsCard({ item }: { item: NewsItem }) {
  const { locale, t } = useLocale();
  const title = locale === "en" ? item.titleEn : item.title;
  const summary = locale === "en" ? item.summaryEn : item.summary;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-blue-700"
    >
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {item.source}
        </span>
        <span>·</span>
        <time>{item.date}</time>
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
  );
}
