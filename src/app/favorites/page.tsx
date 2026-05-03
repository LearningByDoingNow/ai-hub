"use client";

import { useLocale } from "@/i18n/context";
import { useFavorites, type FavoriteItem } from "@/lib/favorites";

export default function FavoritesPage() {
  const { locale } = useLocale();
  const { favorites, toggle, clear, mounted } = useFavorites();

  if (!mounted) return null;

  const news = favorites.filter((f) => f.type === "news");
  const papers = favorites.filter((f) => f.type === "paper");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {locale === "zh" ? "我的收藏" : "Favorites"}
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {locale === "zh"
              ? `共收藏 ${favorites.length} 条内容`
              : `${favorites.length} items saved`}
          </p>
        </div>
        {favorites.length > 0 && (
          <button
            onClick={clear}
            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {locale === "zh" ? "清空收藏" : "Clear All"}
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div className="mt-16 text-center text-slate-400 dark:text-slate-500">
          <svg className="mx-auto h-12 w-12 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          <p className="text-lg">{locale === "zh" ? "还没有收藏" : "No favorites yet"}</p>
          <p className="mt-1 text-sm">{locale === "zh" ? "在资讯或论文卡片上点击心形图标即可收藏" : "Click the heart icon on any news or paper card"}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {news.length > 0 && (
            <Section
              title={locale === "zh" ? "资讯收藏" : "News"}
              items={news}
              toggle={toggle}
              locale={locale}
            />
          )}
          {papers.length > 0 && (
            <Section
              title={locale === "zh" ? "论文收藏" : "Papers"}
              items={papers}
              toggle={toggle}
              locale={locale}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  toggle,
  locale,
}: {
  title: string;
  items: FavoriteItem[];
  toggle: (item: Omit<FavoriteItem, "savedAt">) => void;
  locale: string;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{title}</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="flex-1 min-w-0">
              <a
                href={item.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400 transition-colors"
              >
                {item.title}
              </a>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === "zh" ? "收藏于" : "Saved"} {new Date(item.savedAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => toggle(item)}
              className="shrink-0 ml-3 rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
