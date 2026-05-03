"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/context";
import { providers } from "@/data/providers";
import { newsItems } from "@/data/news";
import { papers } from "@/data/papers";
import HeroSection from "@/components/HeroSection";
import ProviderCard from "@/components/ProviderCard";
import NewsCard from "@/components/NewsCard";
import PaperCard from "@/components/PaperCard";

const featuredIds = ["openai", "anthropic", "deepseek", "google", "mistral", "alibaba"];

export default function Home() {
  const { t } = useLocale();

  const featuredProviders = providers.filter((p) => featuredIds.includes(p.id));
  const latestNews = newsItems.slice(0, 3);
  const recentPapers = papers.slice(0, 4);

  return (
    <div>
      <HeroSection />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 space-y-16">
        {/* Featured Providers */}
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

        {/* Latest News */}
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

        {/* Recent Papers */}
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
