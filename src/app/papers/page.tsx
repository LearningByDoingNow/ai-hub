"use client";

import { useState } from "react";
import { papers } from "@/data/papers";
import { useLocale } from "@/i18n/context";
import PaperCard from "@/components/PaperCard";
import ViewToggle, { type ViewMode } from "@/components/ViewToggle";

export default function PapersPage() {
  const { t } = useLocale();
  const [view, setView] = useState<ViewMode>("grid");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-start justify-between mb-8">
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

      <div
        className={
          view === "grid"
            ? "grid gap-4 sm:grid-cols-2"
            : "flex flex-col gap-4"
        }
      >
        {papers.map((paper) => (
          <PaperCard key={paper.id} paper={paper} />
        ))}
      </div>
    </div>
  );
}
