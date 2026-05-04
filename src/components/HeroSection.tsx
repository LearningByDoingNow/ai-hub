"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/context";
import type { HeroStat } from "@/lib/queries";

interface HeroProps {
  modules: HeroStat[];
  sourceCount: number;
}

function ModuleIcon({ icon, className }: { icon: string; className?: string }) {
  const cls = className || "h-4 w-4";
  switch (icon) {
    case "grid":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>);
    case "newspaper":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>);
    case "book":
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>);
    default:
      return (<svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>);
  }
}

const MODULE_COLORS: Record<string, string> = {
  providers: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20",
  news: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20",
  papers: "from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/20",
};
const DEFAULT_MODULE_COLOR = "from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/20";
const UNIT_ZH: Record<string, string> = { providers: "家", news: "篇", papers: "篇" };

export default function HeroSection({ modules, sourceCount }: HeroProps) {
  const { locale } = useLocale();
  const totalContent = modules.reduce((sum, m) => sum + m.count, 0);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-600/[0.07] blur-[100px]" />
        <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-violet-600/[0.07] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-16 sm:px-6 sm:pb-18 sm:pt-22">
        {/* Title area */}
        <div className="text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-blue-400/80">
            AI Hub
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {locale === "zh" ? (
              <>全球信息，<span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">智能聚合</span></>
            ) : (
              <>Global Intel, <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">Smartly Curated</span></>
            )}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
            {locale === "zh"
              ? "从科技前沿到国际时政，AI 自动抓取、过滤、聚合，重要的事不错过"
              : "From cutting-edge tech to world affairs — AI-curated, auto-updated, nothing important missed"}
          </p>
        </div>

        {/* Live stats bar */}
        <div className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-6 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-3.5 backdrop-blur-sm sm:px-8 sm:py-4">
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-white sm:text-3xl">{sourceCount}</div>
              <div className="mt-0.5 text-xs text-slate-500">{locale === "zh" ? "数据源" : "Sources"}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-2xl font-bold tabular-nums text-white sm:text-3xl">{totalContent.toLocaleString()}</div>
              <div className="mt-0.5 text-xs text-slate-500">{locale === "zh" ? "篇内容" : "Articles"}</div>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-xs font-medium text-emerald-400/90 sm:text-sm">{locale === "zh" ? "自动更新中" : "Live"}</span>
            </div>
          </div>
        </div>

        {/* Module cards */}
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          {modules.map((m) => {
            const color = MODULE_COLORS[m.id] || DEFAULT_MODULE_COLOR;
            return (
              <Link
                key={m.id}
                href={m.href}
                className={`group relative overflow-hidden rounded-xl border bg-gradient-to-b p-3.5 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 sm:p-4 ${color}`}
              >
                <div className="flex items-center gap-2">
                  <ModuleIcon icon={m.icon} className="h-4 w-4" />
                  <span className="text-sm font-medium text-slate-200">
                    {locale === "zh" ? m.name : m.nameEn}
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold tabular-nums text-white sm:text-3xl">
                  {m.count}+
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
