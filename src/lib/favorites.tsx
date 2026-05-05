"use client";

import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

export interface FavoriteItem {
  id: string;
  type: "news" | "paper" | "provider";
  title: string;
  url?: string;
  savedAt: string;
}

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  isFavorited: (id: string) => boolean;
  toggle: (item: Omit<FavoriteItem, "savedAt">) => void;
  clear: () => void;
  mounted: boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const value = useFavoritesInternal();
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (ctx) return ctx;
  return useFavoritesInternal();
}

function useFavoritesInternal() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [mounted, setMounted] = useState(false);

  const reload = useCallback(() => {
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((items) => {
        if (!Array.isArray(items)) return;
        setFavorites(
          items.map((i: { id: string; type: string; title: string; url: string; createdAt: string }) => ({
            id: i.id,
            type: i.type as FavoriteItem["type"],
            title: i.title,
            url: i.url,
            savedAt: i.createdAt,
          }))
        );
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    reload();
    setMounted(true);
  }, [reload]);

  const isFavorited = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggle = useCallback(
    (item: Omit<FavoriteItem, "savedAt">) => {
      const exists = favorites.some((f) => f.id === item.id);
      if (exists) {
        setFavorites((prev) => prev.filter((f) => f.id !== item.id));
        fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id }),
        }).catch(() => reload());
      } else {
        setFavorites((prev) => [...prev, { ...item, savedAt: new Date().toISOString() }]);
        fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, type: item.type, title: item.title, url: item.url || "" }),
        }).catch(() => reload());
      }
    },
    [favorites, reload]
  );

  const clear = useCallback(() => {
    const ids = favorites.map((f) => f.id);
    setFavorites([]);
    Promise.all(
      ids.map((id) =>
        fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        })
      )
    ).catch(() => reload());
  }, [favorites, reload]);

  return { favorites, isFavorited, toggle, clear, mounted };
}
