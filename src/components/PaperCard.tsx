"use client";

import { Paper } from "@/data/papers";
import { useLocale } from "@/i18n/context";

export default function PaperCard({ paper }: { paper: Paper }) {
  const { locale, t } = useLocale();
  const abstract = locale === "en" ? paper.abstractEn : paper.abstract;

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 mb-2">
        <span className="font-medium text-violet-600 dark:text-violet-400">
          {paper.venue}
        </span>
        <span>·</span>
        <time>{paper.date}</time>
      </div>

      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        {paper.title}
      </h3>

      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
        {paper.authors.join(", ")}
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-3 leading-relaxed">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          {t("papers.abstract")}:
        </span>{" "}
        {abstract}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {paper.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-violet-50 px-2.5 py-0.5 text-xs text-violet-600 dark:bg-violet-900/20 dark:text-violet-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2 shrink-0">
          {paper.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              {link.label}
              <svg
                className="h-2.5 w-2.5 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
