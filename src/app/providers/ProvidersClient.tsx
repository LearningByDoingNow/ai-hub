"use client";

import { useState, useMemo } from "react";
import type { Provider } from "@/types";
import { useLocale } from "@/i18n/context";
import SearchBar from "@/components/SearchBar";
import CategoryFilter from "@/components/CategoryFilter";
import ProviderCard from "@/components/ProviderCard";

export default function ProvidersClient({ providers }: { providers: Provider[] }) {
  const { t } = useLocale();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return providers.filter((p) => {
      if (category && p.category !== category) return false;
      if (country && p.country !== country) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q) &&
        !p.tags.some((tag) => tag.toLowerCase().includes(q))
      )
        return false;
      return true;
    });
  }, [search, category, country]);

  const domestic = filtered.filter((p) => p.country === "国内");
  const international = filtered.filter((p) => p.country === "国外");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {t("providers.title")}
        </h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          {t("providers.subtitle")}
        </p>
      </div>

      <div className="mb-6">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      <CategoryFilter
        selected={category}
        onSelect={setCategory}
        countryFilter={country}
        onCountryChange={setCountry}
      />

      <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {t("providers.count", { count: filtered.length })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-16 text-center text-slate-400 dark:text-slate-500">
          <p className="text-lg">{t("providers.empty")}</p>
          <p className="mt-1 text-sm">{t("providers.emptyHint")}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {(!country || country === "国外") && international.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                {t("providers.sectionInternational")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {international.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            </section>
          )}

          {(!country || country === "国内") && domestic.length > 0 && (
            <section>
              <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-200">
                {t("providers.sectionDomestic")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {domestic.map((p) => (
                  <ProviderCard key={p.id} provider={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
