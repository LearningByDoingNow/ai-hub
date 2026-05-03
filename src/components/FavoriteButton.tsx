"use client";

import { useFavorites, type FavoriteItem } from "@/lib/favorites";

export default function FavoriteButton({
  item,
  size = "sm",
}: {
  item: Omit<FavoriteItem, "savedAt">;
  size?: "sm" | "md";
}) {
  const { isFavorited, toggle, mounted } = useFavorites();
  if (!mounted) return null;

  const active = isFavorited(item.id);
  const px = size === "md" ? "p-2" : "p-1.5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(item);
      }}
      className={`${px} rounded-lg transition-colors ${
        active
          ? "text-red-500 hover:text-red-600"
          : "text-slate-300 hover:text-red-400 dark:text-slate-600 dark:hover:text-red-400"
      }`}
      title={active ? "取消收藏" : "收藏"}
    >
      <svg
        className={size === "md" ? "h-5 w-5" : "h-4 w-4"}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
