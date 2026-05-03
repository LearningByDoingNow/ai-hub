"use client";

import { categories } from "@/data/providers";
import { useLocale } from "@/i18n/context";

export default function CategoryFilter({
  selected,
  onSelect,
  countryFilter,
  onCountryChange,
}: {
  selected: string | null;
  onSelect: (c: string | null) => void;
  countryFilter: string | null;
  onCountryChange: (c: string | null) => void;
}) {
  const { t } = useLocale();

  const countryOptions: { value: string | null; key: string }[] = [
    { value: null, key: "filter.global" },
    { value: "国内", key: "filter.domestic" },
    { value: "国外", key: "filter.international" },
  ];

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelect(null)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
            selected === null
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {t("filter.all")}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelect(selected === cat ? null : cat)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              selected === cat
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t(`cat.${cat}`)}
          </button>
        ))}
      </div>
      <div className="flex gap-2 shrink-0">
        {countryOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onCountryChange(opt.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              countryFilter === opt.value
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {t(opt.key)}
          </button>
        ))}
      </div>
    </div>
  );
}
