"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale } from "@/i18n/context";

interface PipelineRun {
  id: string;
  task_type: string;
  status: string;
  items_processed: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

// removed fixed options

export default function PipelineControl() {
  const { locale } = useLocale();
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [stats, setStats] = useState({ news: 0, papers: 0, sources: 0 });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [recentNews, setRecentNews] = useState<{ id: string; title: string; source: string; date: string }[]>([]);
  const [fetching, setFetching] = useState(false);
  const [fetchOutput, setFetchOutput] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const triggerRef = useRef<() => void>(undefined);

  const [autoInterval, setAutoInterval] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("ai-hub-fetch-interval") || "0", 10);
    }
    return 0;
  });

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/pipeline/status");
      const data = await res.json();
      setRuns(data.runs || []);
      setStats(data.stats || { news: 0, papers: 0, sources: 0 });
      setRecentNews(data.recentNews || []);
      setLastUpdated(data.lastUpdated || null);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  function startTimer() {
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const triggerFetch = useCallback(async () => {
    setFetching(true);
    setFetchOutput(null);
    startTimer();
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "all" }),
      });
      const data = await res.json();
      if (data.status === "already_running") {
        setFetchOutput(locale === "zh" ? "已有任务在运行中，请稍候..." : "A task is already running...");
        setFetching(false);
        stopTimer();
        return;
      }
      const poll = setInterval(async () => {
        const statusRes = await fetch("/api/pipeline/run").catch(() => null);
        const statusData = statusRes ? await statusRes.json() : null;
        if (!statusData?.running) {
          clearInterval(poll);
          stopTimer();
          setFetching(false);
          setFetchOutput(locale === "zh" ? "抓取完成！" : "Fetch complete!");
          fetchStatus();
        }
      }, 3000);
      setTimeout(() => { clearInterval(poll); stopTimer(); setFetching(false); }, 180000);
    } catch (e) {
      setFetchOutput("Error: " + (e as Error).message);
      setFetching(false);
      stopTimer();
    }
  }, [locale, fetchStatus]);

  triggerRef.current = triggerFetch;

  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (autoInterval > 0) {
      autoRef.current = setInterval(() => { triggerRef.current?.(); }, autoInterval * 60 * 1000);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [autoInterval]);

  function handleIntervalChange(val: number) {
    setAutoInterval(val);
    localStorage.setItem("ai-hub-fetch-interval", String(val));
  }

  function formatLastUpdated(ts: string | null) {
    if (!ts) return locale === "zh" ? "从未更新" : "Never";
    const date = new Date(ts.includes("T") ? ts : ts.replace(" ", "T"));
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return locale === "zh" ? "刚刚更新" : "Just now";
    if (mins < 60) return locale === "zh" ? `${mins} 分钟前` : `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return locale === "zh" ? `${hours} 小时前` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return locale === "zh" ? `${days} 天前` : `${days}d ago`;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <div className="text-2xl font-bold text-blue-600">{stats.news}</div>
          <div className="text-sm text-slate-500">{locale === "zh" ? "条资讯" : "News Articles"}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <div className="text-2xl font-bold text-violet-600">{stats.papers}</div>
          <div className="text-sm text-slate-500">{locale === "zh" ? "篇论文" : "Papers"}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <div className="text-2xl font-bold text-emerald-600">{stats.sources}</div>
          <div className="text-sm text-slate-500">{locale === "zh" ? "个数据源" : "Active Sources"}</div>
        </div>
      </div>

      {/* Fetch & Auto-fetch */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-900 dark:text-slate-100">
            {locale === "zh" ? "数据抓取" : "Data Fetching"}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${lastUpdated ? "bg-green-400" : "bg-slate-300"}`} />
            {locale === "zh" ? "上次更新：" : "Last: "}
            <span className="font-medium text-slate-600 dark:text-slate-300">{formatLastUpdated(lastUpdated)}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={triggerFetch}
            disabled={fetching}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {fetching
              ? (locale === "zh" ? `抓取中... ${elapsed}s` : `Fetching... ${elapsed}s`)
              : (locale === "zh" ? "立即抓取" : "Fetch Now")}
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-slate-500">{locale === "zh" ? "定时抓取：每" : "Auto: every "}</span>
            <input
              type="number"
              min={0}
              max={1440}
              value={autoInterval}
              onChange={(e) => handleIntervalChange(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-16 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-sm text-slate-700 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
            />
            <span className="text-sm text-slate-500">{locale === "zh" ? "分钟" : "min"}</span>
          </div>
        </div>

        {fetching && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 dark:bg-blue-950/30">
            <svg className="h-4 w-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {locale === "zh" ? "正在抓取所有资讯和论文..." : "Fetching all sources..."}
            </span>
          </div>
        )}

        {!fetching && fetchOutput && (
          <div className={`mt-4 rounded-lg px-4 py-3 text-sm ${
            fetchOutput.startsWith("Error")
              ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
              : "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
          }`}>
            {fetchOutput}
          </div>
        )}

        {autoInterval > 0 && !fetching && (
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            {locale === "zh"
              ? `定时抓取已开启，每 ${autoInterval} 分钟自动更新（设为 0 关闭）`
              : `Auto-fetch on, every ${autoInterval} min (set 0 to disable)`}
          </div>
        )}
      </div>

      {/* Recently Added */}
      {recentNews.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
            {locale === "zh" ? "最近抓取" : "Recently Fetched"}
          </h3>
          <div className="space-y-1.5">
            {recentNews.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{item.source}</span>
                  <span className="truncate text-slate-700 dark:text-slate-300">{item.title}</span>
                </div>
                <span className="shrink-0 ml-2 text-xs text-slate-400">{item.date?.slice(0, 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run History */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
          {locale === "zh" ? "运行记录" : "Run History"}
        </h3>
        {runs.length === 0 ? (
          <p className="text-sm text-slate-400">{locale === "zh" ? "暂无运行记录" : "No runs yet"}</p>
        ) : (
          <div className="space-y-2">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    run.status === "success" ? "bg-green-500" : run.status === "running" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{run.task_type}</span>
                  <span className="text-xs text-slate-400">+{run.items_processed} {locale === "zh" ? "条" : "items"}</span>
                </div>
                <span className="text-xs text-slate-400">{run.completed_at || run.started_at}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
