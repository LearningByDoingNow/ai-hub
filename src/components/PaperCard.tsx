"use client";

import type { Paper } from "@/types";
import { useLocale } from "@/i18n/context";
import FavoriteButton from "./FavoriteButton";

export default function PaperCard({ paper }: { paper: Paper }) {
  const { locale } = useLocale();
  const abstract = locale === "en" ? (paper.abstractEn || paper.abstract) : paper.abstract;
  const firstLink = paper.links[0]?.url || "";

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-violet-200 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-violet-700">
      <div className="absolute top-3 right-3">
        <FavoriteButton item={{ id: paper.id, type: "paper", title: paper.title, url: firstLink }} />
      </div>

      <div className="flex items-center gap-2 mb-2 pr-8">
        <span className="inline-flex items-center rounded-md bg-violet-50 px-2 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:ring-violet-800">
          {paper.venue}
        </span>
        <time className="text-xs text-slate-400 dark:text-slate-500">{paper.date}</time>
      </div>

      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
        {paper.title}
      </h3>

      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
        {paper.authors.join(", ")}
      </p>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
        {abstract}
      </p>

      <div className="flex gap-2">
        {paper.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            {link.label}
            <svg className="h-2.5 w-2.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}
