"use client";

import { categories } from "@/lib/constants";
import { useLocale } from "@/i18n/context";
import { getFlag } from "@/lib/countries";
import type { Provider } from "@/types";

export default function CategoryFilter({
  selected,
  onSelect,
  countryFilter,
  onCountryChange,
  providers,
}: {
  selected: string | null;
  onSelect: (c: string | null) => void;
  countryFilter: string | null;
  onCountryChange: (c: string | null) => void;
  providers: Provider[];
}) {
  const { t } = useLocale();

  const countryCodes = Array.from(new Set(providers.map((p) => p.country))).sort();

  return (
    <div className="flex flex-col gap-3">
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
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCountryChange(null)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            countryFilter === null
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          🌐 {t("filter.global")}
        </button>
        {countryCodes.map((code) => (
          <button
            key={code}
            onClick={() => onCountryChange(countryFilter === code ? null : code)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              countryFilter === code
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {getFlag(code)} {code}
          </button>
        ))}
      </div>
    </div>
  );
}
