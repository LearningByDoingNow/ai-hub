"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/context";
import { providers } from "@/data/providers";
import { newsItems } from "@/data/news";
import { papers } from "@/data/papers";

export default function HeroSection() {
  const { t } = useLocale();

  const stats = [
    { value: providers.length, label: t("hero.providers"), color: "from-blue-500 to-blue-600" },
    { value: newsItems.length, label: t("hero.news"), color: "from-emerald-500 to-emerald-600" },
    { value: papers.length, label: t("hero.papers"), color: "from-violet-500 to-violet-600" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-violet-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {t("hero.title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100/80">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8">
            <Link
              href="/providers"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            >
              {t("hero.cta")}
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-5 text-center backdrop-blur-sm"
            >
              <div
                className={`inline-block bg-gradient-to-r ${stat.color} bg-clip-text text-3xl font-bold text-transparent`}
              >
                {stat.value}+
              </div>
              <div className="mt-1 text-sm text-blue-100/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
