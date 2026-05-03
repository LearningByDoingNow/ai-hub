"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { zh } from "./zh";
import { en } from "./en";

type Locale = "zh" | "en";

const dictionaries: Record<Locale, Record<string, string>> = { zh, en };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("zh");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("ai-hub-locale") as Locale | null;
    if (saved === "zh" || saved === "en") {
      setLocaleState(saved);
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("ai-hub-locale", l);
    document.documentElement.lang = l;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let str = dictionaries[locale][key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale]
  );

  if (!mounted) {
    return <div className="min-h-screen" />;
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
