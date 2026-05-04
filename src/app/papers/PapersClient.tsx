"use client";

import { useState, useMemo } from "react";
import type { Paper } from "@/types";
import { useLocale } from "@/i18n/context";
import PaperCard from "@/components/PaperCard";
import ViewToggle, { type ViewMode } from "@/components/ViewToggle";
import SearchBar from "@/components/SearchBar";

export default function PapersClient({ papers }: { papers: Paper[] }) {
  const { t } = useLocale();
  const [view, setView] = useState<ViewMode>("list");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return papers;
    const q = query.toLowerCase();
    return papers.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.venue.toLowerCase().includes(q) ||
      p.abstract.toLowerCase().includes(q) ||
      p.authors.some((a) => a.toLowerCase().includes(q))
    );
  }, [papers, query]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("papers.title")}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {t("papers.subtitle")}
          </p>
        </div>
        <ViewToggle mode={view} onChange={setView} />
      </div>

      <div className="mb-6">
        <SearchBar value={query} onChange={setQuery} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 text-center text-slate-400">
          <p>{query ? (t("providers.empty")) : ""}</p>
        </div>
      ) : (
        <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2" : "flex flex-col gap-4"}>
          {filtered.map((paper) => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}
