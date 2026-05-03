"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/context";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo-transparent.png" alt="AI Hub" className="h-10" />
              <span className="font-bold text-slate-900 dark:text-slate-100">
                AI Hub
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {t("footer.aboutDesc")}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("footer.quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/providers"
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t("nav.news")}
                </Link>
              </li>
              <li>
                <Link
                  href="/papers"
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t("nav.papers")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {t("footer.resources")}
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t("footer.github")}
                </a>
              </li>
              <li>
                <a
                  href="mailto:feedback@ai-hub.dev"
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  {t("footer.feedback")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}
