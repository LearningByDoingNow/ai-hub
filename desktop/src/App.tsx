import { useState, useEffect, useRef, useCallback } from "react";
import type { NewsItem, Paper } from "./lib/tauri";

const isTauri = !!(window as any).__TAURI_INTERNALS__;

let appWindow: any = null;
let tauriLib: any = null;
if (isTauri) {
  import("@tauri-apps/api/window").then(m => { appWindow = m.getCurrentWindow(); });
  import("./lib/tauri").then(m => { tauriLib = m; });
}

const COLLAPSED_W = 80, COLLAPSED_H = 80;
const HOVER_W = 240, HOVER_H = 80;
const EXPANDED_W = 420;
const DEFAULT_EXPANDED_H = 800;
const MIN_EXPANDED_H = 300;
const MAX_EXPANDED_H = 1200;

const MOCK_NEWS: NewsItem[] = [
  { id: "1", title: "OpenAI发布GPT-5模型", title_en: "OpenAI Releases GPT-5", source: "TechCrunch", date: new Date(Date.now() - 300000).toISOString(), summary: "最新模型在推理和代码生成方面有重大改进", summary_en: "", url: "#" },
  { id: "2", title: "DeepMind AlphaFold 3 预测所有分子结构", title_en: "", source: "Nature", date: new Date(Date.now() - 3600000).toISOString(), summary: "将蛋白质结构预测扩展到DNA、RNA和小分子", summary_en: "", url: "#" },
  { id: "3", title: "Meta 开源 Llama 4 (400B参数)", title_en: "", source: "The Verge", date: new Date(Date.now() - 7200000).toISOString(), summary: "采用混合专家架构，性能领先", summary_en: "", url: "#" },
];
const MOCK_PAPERS: Paper[] = [
  { id: "p1", title: "Attention Is All You Need: Revisited", authors: ["A. Vaswani", "N. Shazeer"], venue: "NeurIPS", date: new Date(Date.now() - 1800000).toISOString(), abstract_text: "", abstract_en: "", links: ["#"] },
];

type NotifCard =
  | { type: "news"; data: NewsItem; uid: string; exiting: boolean }
  | { type: "paper"; data: Paper; uid: string; exiting: boolean };

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  let d: Date;
  if (dateStr.includes("T")) {
    d = new Date(dateStr);
  } else if (dateStr.includes(" ")) {
    d = new Date(dateStr.replace(" ", "T") + "Z");
  } else {
    d = new Date(dateStr + "T00:00:00");
  }
  if (isNaN(d.getTime())) return dateStr;
  const diff = Date.now() - d.getTime();
  if (diff < 0) return dateStr;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}天前`;
  return dateStr.slice(0, 10);
}

function getFreshness(dateStr: string): number {
  if (!dateStr) return 0;
  let d: Date;
  if (dateStr.includes("T")) d = new Date(dateStr);
  else if (dateStr.includes(" ")) d = new Date(dateStr.replace(" ", "T") + "Z");
  else d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return 0;
  const hours = (Date.now() - d.getTime()) / 3600000;
  if (hours < 1) return 1;
  if (hours < 3) return 0.8;
  if (hours < 6) return 0.6;
  if (hours < 12) return 0.4;
  if (hours < 24) return 0.2;
  return 0.05;
}

function CardItem({ card, onDismiss, onClick }: {
  card: NotifCard;
  onDismiss: () => void;
  onClick: () => void;
}) {
  const isNews = card.type === "news";
  const title = isNews ? (card.data.title || card.data.title_en) : card.data.title;
  const sub = isNews
    ? (card.data.summary || card.data.summary_en)
    : card.data.authors?.slice(0, 3).join(", ") || "";
  const badge = isNews ? card.data.source : (card.data.venue || "Paper");
  const freshness = getFreshness(card.data.date);

  return (
    <div className={card.exiting ? "card-slide-out" : "card-slide-in"}>
      <div
        onClick={onClick}
        className="group relative cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div
          className={`relative rounded-xl overflow-hidden border backdrop-blur-xl shadow-lg ${
            freshness >= 0.8
              ? (isNews ? "bg-blue-50/95 dark:bg-blue-950/40 border-blue-300/50" : "bg-purple-50/95 dark:bg-purple-950/40 border-purple-300/50")
              : freshness >= 0.4
                ? (isNews ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/30" : "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200/30")
                : (isNews ? "bg-white/90 dark:bg-[#1a1d2e]/90 border-slate-200/30 dark:border-slate-500/10" : "bg-white/90 dark:bg-[#1e1a2e]/90 border-slate-200/30 dark:border-slate-500/10")
          }`}
        >

          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/10 hover:bg-red-500 hover:text-white text-slate-400 z-10"
          >
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>

          <div className="px-3.5 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                isNews
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
              }`}>
                {badge}
              </span>
              <span className="text-[10px] text-slate-400 ml-auto mr-5">{timeAgo(card.data.date)}</span>
            </div>
            <h3 className="text-[12px] font-semibold leading-snug text-slate-800 dark:text-white line-clamp-2">
              {title}
            </h3>
            {sub && (
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{sub}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type WidgetFilterType = "all" | "twitter" | "wechat" | "rss";

const WIDGET_FILTER_KEY = "ai-hub-widget-filter";

const WECHAT_SOURCES = [
  "机器之心", "量子位", "九万里", "新智元", "AI前线", "智猩猩AI",
  "36氪(微信)", "电手", "数字生命卡兹克", "人民日报", "央视军事", "外军防务研究前沿",
];

function getCardSourceType(source: string): WidgetFilterType {
  if (source.startsWith("Twitter:")) return "twitter";
  if (WECHAT_SOURCES.includes(source)) return "wechat";
  return "rss";
}

export default function App() {
  const [cards, setCards] = useState<NotifCard[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [expandedH, setExpandedH] = useState(DEFAULT_EXPANDED_H);
  const [toast, setToast] = useState<NotifCard | null>(null);
  const [widgetFilter, setWidgetFilter] = useState<WidgetFilterType>(() => {
    try { return (localStorage.getItem(WIDGET_FILTER_KEY) as WidgetFilterType) || "all"; } catch { return "all"; }
  });
  const logoRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHRef = useRef(0);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Native drag on logo — distinguish drag from click
  const dragStartPos = useRef({ x: 0, y: 0, time: 0 });
  const wasDragged = useRef(false);

  useEffect(() => {
    const el = logoRef.current;
    if (!el || !isTauri) return;
    const onDown = (e: MouseEvent) => {
      if (e.buttons === 1) {
        dragStartPos.current = { x: e.screenX, y: e.screenY, time: Date.now() };
        wasDragged.current = false;
        appWindow?.startDragging();
      }
    };
    const onUp = (e: MouseEvent) => {
      const dx = Math.abs(e.screenX - dragStartPos.current.x);
      const dy = Math.abs(e.screenY - dragStartPos.current.y);
      if (dx > 4 || dy > 4) {
        wasDragged.current = true;
      }
    };
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => { el.removeEventListener("mousedown", onDown); window.removeEventListener("mouseup", onUp); };
  }, []);

  // Save/restore window position via Rust file storage
  useEffect(() => {
    if (!isTauri) return;
    let cleanup: (() => void) | null = null;
    (async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const { PhysicalPosition } = await import("@tauri-apps/api/dpi");
      const win = getCurrentWindow();

      // Restore saved position
      try {
        const pos = await invoke<[number, number] | null>("load_position");
        if (pos) {
          await win.setPosition(new PhysicalPosition(pos[0], pos[1]));
        }
      } catch {}

      // Listen for window move and save
      let saveTimer: ReturnType<typeof setTimeout> | null = null;
      const unlisten = await win.onMoved(({ payload }) => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          invoke("save_position", { x: payload.x, y: payload.y }).catch(() => {});
        }, 500);
      });
      cleanup = unlisten;
    })();
    return () => { cleanup?.(); };
  }, []);

  // Load data
  useEffect(() => {
    (async () => {
      try {
        let news: NewsItem[], papers: Paper[];
        if (isTauri) {
          const t = await import("./lib/tauri");
          tauriLib = t;
          [news, papers] = await Promise.all([
            t.getNews(50, []),
            t.getPapers(10),
          ]);
        } else {
          news = MOCK_NEWS;
          papers = MOCK_PAPERS;
        }
        setCards([
          ...news.map((n) => ({
            type: "news" as const, data: n, uid: `n-${n.id}`, exiting: false,
          })),
          ...papers.map((p) => ({
            type: "paper" as const, data: p, uid: `p-${p.id}`, exiting: false,
          })),
        ]);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Listen for new items + show toast popup
  useEffect(() => {
    if (!isTauri) return;
    let cancelled = false;
    let cleanupRef: (() => void) | null = null;
    (async () => {
      const { listen } = await import("@tauri-apps/api/event");
      if (cancelled) return;
      const unlisten = await listen<{ news: NewsItem[]; papers: Paper[] }>("new-items", (event) => {
        const { news, papers } = event.payload;
        const nc: NotifCard[] = [
          ...news.map((n) => ({ type: "news" as const, data: n, uid: `n-${n.id}-${Date.now()}`, exiting: false })),
          ...papers.map((p) => ({ type: "paper" as const, data: p, uid: `p-${p.id}-${Date.now()}`, exiting: false })),
        ];
        if (nc.length > 0) {
          setCards((prev) => [...nc, ...prev]);
          // Show toast notification for the first new item
          showToast(nc[0]);
        }
      });
      if (cancelled) unlisten();
      else cleanupRef = unlisten;
    })();
    return () => { cancelled = true; cleanupRef?.(); };
  }, []);

  function showToast(card: NotifCard) {
    if (expanded) return;
    setToast(card);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    // Resize window to show toast
    tauriLib?.resizeWidget(320, 140);
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      if (!expanded && !hovered) tauriLib?.resizeWidget(COLLAPSED_W, COLLAPSED_H);
    }, 5000);
  }

  // Collapse on window blur (click outside) — but not when opening chat window
  const skipBlurRef = useRef(false);
  useEffect(() => {
    if (!isTauri) return;
    let cleanupRef: (() => void) | null = null;
    (async () => {
      const { getCurrentWindow, getAllWindows } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      const unlisten = await win.onFocusChanged(({ payload: focused }) => {
        if (!focused && expanded) {
          if (skipBlurRef.current) { skipBlurRef.current = false; return; }
          setTimeout(async () => {
            try {
              const allWindows = await getAllWindows();
              const checks = await Promise.all(allWindows.map((w: any) => w.isFocused().catch(() => false)));
              if (checks.some((f: boolean) => f)) return;
            } catch {}
            setExpanded(false);
            setHovered(false);
            tauriLib?.resizeWidget(COLLAPSED_W, COLLAPSED_H);
          }, 200);
        }
      });
      cleanupRef = unlisten;
    })();
    return () => { cleanupRef?.(); };
  }, [expanded]);

  // Hover → expand window to show buttons; leave → shrink back
  function onMouseEnterLogo() {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setHovered(true);
    if (!expanded && isTauri) {
      tauriLib?.resizeWidget(HOVER_W, HOVER_H);
    }
  }
  function onMouseLeaveLogo() {
    hoverTimerRef.current = setTimeout(() => {
      setHovered(false);
      if (!expanded && isTauri) {
        tauriLib?.resizeWidget(COLLAPSED_W, COLLAPSED_H);
      }
    }, 300);
  }

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (isTauri) {
      try {
        const t = tauriLib || await import("./lib/tauri");
        if (next) {
          await t.resizeWidget(EXPANDED_W, expandedH);
        } else {
          await t.resizeWidget(COLLAPSED_W, COLLAPSED_H);
        }
      } catch (e) {
        console.error("resize failed:", e);
      }
    }
  }

  // Bottom resize handle drag
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizingRef.current = true;
    startYRef.current = e.clientY;
    startHRef.current = expandedH;

    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return;
      const delta = ev.clientY - startYRef.current;
      const newH = Math.max(MIN_EXPANDED_H, Math.min(MAX_EXPANDED_H, startHRef.current + delta));
      setExpandedH(newH);
      tauriLib?.resizeWidget(EXPANDED_W, newH);
    };
    const onUp = () => {
      resizingRef.current = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [expandedH]);

  function dismissCard(uid: string) {
    setCards((prev) => prev.map((c) => c.uid === uid ? { ...c, exiting: true } : c));
    setTimeout(() => setCards((prev) => prev.filter((c) => c.uid !== uid)), 250);
  }

  function dismissAll() {
    setCards((prev) => prev.map((c) => ({ ...c, exiting: true })));
    setTimeout(() => setCards([]), 250);
  }

  function clickCard(card: NotifCard) {
    if (card.type === "news") {
      tauriLib?.openInBrowser(card.data.url);
    } else {
      const links = card.data.links;
      if (links?.[0]) tauriLib?.openInBrowser(links[0]);
    }
    dismissCard(card.uid);
  }

  const count = cards.filter((c) => !c.exiting).length;
  const visibleCards = cards.filter(c => {
    if (c.exiting) return false;
    if (widgetFilter === "all") return true;
    const source = c.type === "news" ? c.data.source : "";
    return getCardSourceType(source) === widgetFilter;
  });

  function setFilter(f: WidgetFilterType) {
    setWidgetFilter(f);
    try { localStorage.setItem(WIDGET_FILTER_KEY, f); } catch {}
  }

  return (
    <div className="h-full w-full flex flex-col items-start">
      {/* Logo row: logo + hover buttons inline */}
      <div
        className="flex items-center flex-shrink-0"
        onMouseEnter={onMouseEnterLogo}
        onMouseLeave={onMouseLeaveLogo}
      >
        {/* Logo — draggable + clickable + effects */}
        <div
          ref={logoRef}
          onClick={() => { if (!wasDragged.current) toggleExpand(); }}
          className={`logo-wrapper relative w-[58px] h-[58px] cursor-pointer transition-all duration-300 select-none flex-shrink-0
            hover:scale-110 active:scale-95
            ${expanded ? "logo-glow-active" : count > 0 ? "logo-glow-pulse" : ""}
            m-[10px]
          `}
        >
          {/* Rainbow aura ring */}
          <div className="logo-aura" />
          {/* Orbiting particles */}
          <div className="logo-orbit">
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
            <div className="particle" />
          </div>
          {/* Sparkle twinkles */}
          <div className="logo-sparkles">
            <div className="star" />
            <div className="star" />
            <div className="star" />
            <div className="star" />
            <div className="star" />
          </div>
          {/* Hover ripple */}
          <div className="logo-ripple" />
          <img
            src="/logo-widget.png"
            alt="AI Hub"
            className="relative z-10 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
          {/* Badge */}
          {count > 0 && (
            <div className="absolute -top-2 -right-2 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold shadow-md z-20">
              {count > 99 ? "99+" : count}
            </div>
          )}
        </div>

        {/* Hover action buttons — inline right of logo */}
        <div className={`flex items-center gap-1.5 transition-all duration-200 overflow-hidden ${
          hovered || expanded ? "opacity-100 max-w-[200px] ml-1" : "opacity-0 max-w-0 ml-0"
        }`}>
          <button
            onClick={() => { skipBlurRef.current = true; tauriLib?.openChatWindow(); }}
            className="px-2 py-1 rounded-lg text-[10px] font-medium text-white bg-indigo-500/90 hover:bg-indigo-600 shadow-lg transition-all whitespace-nowrap"
          >
            AI
          </button>
          <button
            onClick={() => { skipBlurRef.current = true; import("@tauri-apps/api/core").then(m => m.invoke("open_settings_window")); }}
            className="px-2 py-1 rounded-lg text-[10px] font-medium text-white bg-slate-600/90 hover:bg-slate-700 shadow-lg transition-all whitespace-nowrap"
          >
            设置
          </button>
          {count > 0 && (
            <button
              onClick={dismissAll}
              className="px-2 py-1 rounded-lg text-[10px] font-medium text-white bg-slate-500/70 hover:bg-red-500/90 shadow-lg transition-all whitespace-nowrap"
            >
              清空
            </button>
          )}
        </div>
      </div>

      {/* Toast notification popup (when not expanded) */}
      {!expanded && toast && (
        <div
          className="w-full px-2 pt-1 card-slide-in"
          onClick={() => { clickCard(toast); setToast(null); if (!expanded && !hovered) tauriLib?.resizeWidget(COLLAPSED_W, COLLAPSED_H); }}
        >
          <div className="rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl px-3 py-2.5 cursor-pointer hover:bg-white dark:hover:bg-slate-700/90 transition-colors">
            <div className="flex items-center gap-2">
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                {toast.type === "news" ? toast.data.source : "新论文"}
              </span>
              <span className="ml-auto text-[9px] text-slate-400">刚刚</span>
            </div>
            <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 mt-1 line-clamp-2 leading-snug">
              {toast.type === "news" ? (toast.data.title || toast.data.title_en) : toast.data.title}
            </p>
          </div>
        </div>
      )}

      {/* Expanded card list */}
      {expanded && (
        <div className="w-full flex-1 overflow-hidden flex flex-col card-list-enter">
          {/* Source type filter pills */}
          <div className="flex items-center gap-1 px-3 pb-2 flex-shrink-0">
            {([
              ["all", "全部"],
              ["twitter", "𝕏"],
              ["wechat", "微信"],
              ["rss", "RSS"],
            ] as [WidgetFilterType, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                  widgetFilter === key
                    ? "bg-slate-800 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-200/60 text-slate-500 hover:bg-slate-200 dark:bg-slate-700/60 dark:text-slate-400 dark:hover:bg-slate-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-2">
            {visibleCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <p className="text-xs font-medium text-slate-500">全部已读</p>
                <p className="text-[10px] text-slate-400 mt-0.5">新内容会自动出现</p>
              </div>
            ) : (
              visibleCards.map((card) => (
                <CardItem
                  key={card.uid}
                  card={card}
                  onDismiss={() => dismissCard(card.uid)}
                  onClick={() => clickCard(card)}
                />
              ))
            )}
          </div>

          {/* Collapse button */}
          <div className="px-3 pb-1 flex-shrink-0">
            <button
              onClick={toggleExpand}
              className="w-full py-1.5 rounded-xl text-[11px] font-medium text-slate-400 hover:text-slate-600 bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/30 dark:border-white/5 hover:bg-white/80 transition-all"
            >
              收起 ↑
            </button>
          </div>

          {/* Resize handle */}
          <div
            onMouseDown={onResizeMouseDown}
            className="flex-shrink-0 h-4 flex items-center justify-center cursor-ns-resize group"
          >
            <div className="w-10 h-1 rounded-full bg-slate-300/40 group-hover:bg-slate-400/60 transition-colors" />
          </div>
        </div>
      )}
    </div>
  );
}
