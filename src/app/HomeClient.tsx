"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/context";
import type { Provider, NewsItem, Paper } from "@/types";
import HeroSection from "@/components/HeroSection";
import ProviderCard from "@/components/ProviderCard";
import NewsCard from "@/components/NewsCard";
import PaperCard from "@/components/PaperCard";

interface HomeProps {
  featuredProviders: Provider[];
  latestNews: NewsItem[];
  recentPapers: Paper[];
  totalProviders: number;
  totalNews: number;
  totalPapers: number;
}

export default function HomeClient({
  featuredProviders,
  latestNews,
  recentPapers,
  totalProviders,
  totalNews,
  totalPapers,
}: HomeProps) {
  const { t } = useLocale();

  return (
    <div>
      <HeroSection
        providerCount={totalProviders}
        newsCount={totalNews}
        paperCount={totalPapers}
      />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-16">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("home.featuredProviders")}
            </h2>
            <Link
              href="/providers"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t("home.viewAll")} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProviders.map((p) => (
              <ProviderCard key={p.id} provider={p} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("home.latestNews")}
            </h2>
            <Link
              href="/news"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t("home.viewAll")} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t("home.recentPapers")}
            </h2>
            <Link
              href="/papers"
              className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {t("home.viewAll")} →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {recentPapers.map((paper) => (
              <PaperCard key={paper.id} paper={paper} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
