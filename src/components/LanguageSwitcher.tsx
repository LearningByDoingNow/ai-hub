"use client";

import { useLocale } from "@/i18n/context";

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-800">
      <button
        onClick={() => setLocale("zh")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          locale === "zh"
            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        中文
      </button>
      <button
        onClick={() => setLocale("en")}
        className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
          locale === "en"
            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
            : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        }`}
      >
        EN
      </button>
    </div>
  );
}
