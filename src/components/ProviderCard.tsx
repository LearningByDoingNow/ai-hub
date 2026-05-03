"use client";

import type { Provider } from "@/types";
import { useLocale } from "@/i18n/context";
import { getFlag, getCountryName } from "@/lib/countries";

const categoryColors: Record<string, string> = {
  "大模型": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "AI 助手": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "AI 编程": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "AI 绘画": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  "AI 视频": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "AI 音频": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "AI 搜索": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "AI 基础设施": "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  "AI Agent": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "AI 机器人": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
};

export default function ProviderCard({ provider }: { provider: Provider }) {
  const { locale, t } = useLocale();

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {provider.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {provider.description}
          </p>
        </div>
        <span className="shrink-0 ml-2 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500" title={getCountryName(provider.country, locale)}>
          <span className="text-base">{getFlag(provider.country)}</span>
          {provider.country}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
            categoryColors[provider.category] || "bg-gray-100 text-gray-700"
          }`}
        >
          {t(`cat.${provider.category}`)}
        </span>
        {provider.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {provider.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            {link.label}
            <svg
              className="h-3 w-3 opacity-50"
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
  );
}
