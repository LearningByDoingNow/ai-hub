"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "ai-hub-favorites";

export interface FavoriteItem {
  id: string;
  type: "news" | "paper" | "provider";
  title: string;
  url?: string;
  savedAt: string;
}

function loadFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(items: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setFavorites(loadFavorites());
    setMounted(true);
  }, []);

  const isFavorited = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites]
  );

  const toggle = useCallback(
    (item: Omit<FavoriteItem, "savedAt">) => {
      setFavorites((prev) => {
        const exists = prev.some((f) => f.id === item.id);
        const next = exists
          ? prev.filter((f) => f.id !== item.id)
          : [...prev, { ...item, savedAt: new Date().toISOString() }];
        saveFavorites(next);
        return next;
      });
    },
    []
  );

  const clear = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  return { favorites, isFavorited, toggle, clear, mounted };
}
