"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useLocale } from "@/i18n/context";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

interface Module {
  id: string;
  name: string;
  nameEn: string;
}

const MAX_VISIBLE = 4;

const moduleRoutes: Record<string, string> = {
  providers: "/providers",
  news: "/news",
  papers: "/papers",
};

function getModuleHref(id: string) {
  return moduleRoutes[id] || `/feed/${id}`;
}

export default function Navbar() {
  const pathname = usePathname();
  const { locale, t } = useLocale();
  const [modules, setModules] = useState<Module[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/modules").then((r) => r.json()).then(setModules).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const builtinLabels: Record<string, string> = {
    providers: t("nav.products"),
    news: t("nav.news"),
    papers: t("nav.papers"),
  };

  function getLabel(m: Module) {
    return builtinLabels[m.id] || (locale === "zh" ? m.name : m.nameEn);
  }

  const visibleModules = modules.slice(0, MAX_VISIBLE);
  const overflowModules = modules.slice(MAX_VISIBLE);

  function NavLink({ m, compact }: { m: Module; compact?: boolean }) {
    const href = getModuleHref(m.id);
    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
    if (compact) {
      return (
        <Link
          href={href}
          onClick={() => setMoreOpen(false)}
          className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
            isActive
              ? "bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100"
              : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {getLabel(m)}
        </Link>
      );
    }
    return (
      <Link
        href={href}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
          isActive
            ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100"
        }`}
      >
        {getLabel(m)}
      </Link>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo-widget.png" alt="AI Hub" className="h-14" />
          <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
            AI Hub
          </span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {visibleModules.map((m) => (
            <NavLink key={m.id} m={m} />
          ))}
          {overflowModules.length > 0 && (
            <div ref={moreRef} className="relative">
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  moreOpen
                    ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
                }`}
              >
                {locale === "zh" ? "更多" : "More"}
                <svg className="inline-block ml-1 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {overflowModules.map((m) => (
                    <NavLink key={m.id} m={m} compact />
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <Link
            href="/favorites"
            className={`rounded-lg p-2 transition-colors ${
              pathname.startsWith("/favorites")
                ? "text-red-500"
                : "text-slate-400 hover:text-red-400 dark:hover:text-red-400"
            }`}
            title={locale === "zh" ? "收藏夹" : "Favorites"}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill={pathname.startsWith("/favorites") ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </Link>
          <Link
            href="/settings"
            className={`rounded-lg p-2 transition-colors ${
              pathname.startsWith("/settings")
                ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
            }`}
            title={locale === "zh" ? "设置" : "Settings"}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
