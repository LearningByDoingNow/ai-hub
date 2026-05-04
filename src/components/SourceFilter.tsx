"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useLocale } from "@/i18n/context";

const STORAGE_KEY = "ai-hub-source-filter";

type FilterType = "all" | "twitter" | "wechat" | "rss" | "world";

interface FilterState {
  activeType: FilterType;
  hiddenSources: string[];
}

const DEFAULT_STATE: FilterState = { activeType: "all", hiddenSources: [] };

function getSourceType(source: string): FilterType {
  if (source.startsWith("Twitter:")) return "twitter";
  if (["机器之心", "量子位", "九万里", "新智元", "AI前线"].includes(source)) return "wechat";
  const worldSources = [
    "BBC World News", "Reuters World", "The Guardian World", "Financial Times",
    "New York Times World", "AP News World", "RFI 法广中文", "Al Jazeera",
    "Sky News World", "France 24", "Nikkei Asia", "中国新闻网",
    "Twitter: Reuters", "Twitter: AP", "Twitter: BBC Breaking",
    "Twitter: CNN Breaking", "Twitter: Al Jazeera",
  ];
  if (worldSources.includes(source)) return "world";
  return "rss";
}

function loadState(): FilterState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_STATE;
}

function saveState(state: FilterState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function filterBySource<T extends { source: string }>(
  items: T[],
  state: FilterState
): T[] {
  if (state.activeType === "all" && state.hiddenSources.length === 0) return items;

  return items.filter((item) => {
    if (state.hiddenSources.includes(item.source)) return false;
    if (state.activeType === "all") return true;
    return getSourceType(item.source) === state.activeType;
  });
}

export function useSourceFilter() {
  const [state, setState] = useState<FilterState>(DEFAULT_STATE);

  useEffect(() => {
    setState(loadState());
  }, []);

  const update = (next: FilterState) => {
    setState(next);
    saveState(next);
  };

  return { state, update };
}

export default function SourceFilter({
  sources,
  state,
  onChange,
}: {
  sources: string[];
  state: FilterState;
  onChange: (state: FilterState) => void;
}) {
  const { locale } = useLocale();
  const [showCustom, setShowCustom] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCustom(false);
      }
    };
    if (showCustom) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showCustom]);

  const tabs: { key: FilterType; label: string }[] = [
    { key: "all", label: locale === "zh" ? "全部" : "All" },
    { key: "twitter", label: "Twitter" },
    { key: "wechat", label: locale === "zh" ? "微信" : "WeChat" },
    { key: "rss", label: "RSS" },
    { key: "world", label: locale === "zh" ? "国际时政" : "World" },
  ];

  const grouped = useMemo(() => {
    const map: Record<FilterType, string[]> = { all: [], twitter: [], wechat: [], rss: [], world: [] };
    for (const s of sources) {
      const type = getSourceType(s);
      map[type].push(s);
    }
    return map;
  }, [sources]);

  const customSources = state.activeType === "all" ? sources : (grouped[state.activeType] || []);

  const isHidden = (s: string) => state.hiddenSources.includes(s);

  const toggleSource = (s: string) => {
    const hidden = isHidden(s)
      ? state.hiddenSources.filter((x) => x !== s)
      : [...state.hiddenSources, s];
    onChange({ ...state, hiddenSources: hidden });
  };

  const selectAll = () => onChange({ ...state, hiddenSources: [] });
  const deselectAll = () => onChange({ ...state, hiddenSources: [...customSources] });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange({ activeType: tab.key, hiddenSources: [] })}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            state.activeType === tab.key
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {tab.label}
        </button>
      ))}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            state.hiddenSources.length > 0
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          }`}
        >
          {locale === "zh" ? "自定义" : "Custom"} ▾
        </button>

        {showCustom && (
          <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50">
            <div className="sticky top-0 flex gap-2 p-2 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button
                onClick={selectAll}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {locale === "zh" ? "全选" : "Select all"}
              </button>
              <button
                onClick={deselectAll}
                className="text-xs text-slate-500 hover:underline"
              >
                {locale === "zh" ? "全不选" : "Deselect all"}
              </button>
            </div>
            <div className="p-2 space-y-1">
              {customSources.sort().map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!isHidden(s)}
                    onChange={() => toggleSource(s)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{s}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {state.hiddenSources.length > 0 && (
        <span className="text-xs text-slate-400 dark:text-slate-500">
          ({locale === "zh" ? `已隐藏 ${state.hiddenSources.length} 个源` : `${state.hiddenSources.length} hidden`})
        </span>
      )}
    </div>
  );
}
