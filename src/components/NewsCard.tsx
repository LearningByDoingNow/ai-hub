"use client";

import { NewsItem } from "@/data/news";
import { useLocale } from "@/i18n/context";

export default function NewsCard({ item }: { item: NewsItem }) {
  const { locale, t } = useLocale();
  const title = locale === "en" ? item.titleEn : item.title;
  const summary = locale === "en" ? item.summaryEn : item.summary;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {item.source}
        </span>
        <span>·</span>
        <time>{item.date}</time>
      </div>

      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
        {title}
      </h3>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-3 leading-relaxed">
        {summary}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs text-blue-600 dark:bg-blue-900/20 dark:text-blue-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {t("news.readMore")} →
        </a>
      </div>
    </div>
  );
}
