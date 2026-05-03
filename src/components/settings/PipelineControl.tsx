"use client";

import { useState, useEffect, useCallback } from "react";
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

export default function PipelineControl() {
  const { locale } = useLocale();
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [stats, setStats] = useState({ news: 0, papers: 0, sources: 0 });
  const [fetching, setFetching] = useState<string | null>(null);
  const [fetchOutput, setFetchOutput] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/pipeline/status");
      const data = await res.json();
      setRuns(data.runs || []);
      setStats(data.stats || { news: 0, papers: 0, sources: 0 });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  async function triggerFetch(task: string) {
    setFetching(task);
    setFetchOutput(null);
    try {
      const res = await fetch("/api/pipeline/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });
      const data = await res.json();
      setFetchOutput(data.output || data.error || "Done");
      fetchStatus();
    } catch (e) {
      setFetchOutput("Error: " + (e as Error).message);
    }
    setFetching(null);
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

      {/* Manual Trigger */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
          {locale === "zh" ? "手动抓取" : "Manual Fetch"}
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => triggerFetch("news")}
            disabled={!!fetching}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {fetching === "news"
              ? (locale === "zh" ? "抓取中..." : "Fetching...")
              : (locale === "zh" ? "抓取资讯" : "Fetch News")}
          </button>
          <button
            onClick={() => triggerFetch("papers")}
            disabled={!!fetching}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
          >
            {fetching === "papers"
              ? (locale === "zh" ? "抓取中..." : "Fetching...")
              : (locale === "zh" ? "抓取论文" : "Fetch Papers")}
          </button>
          <button
            onClick={() => triggerFetch("all")}
            disabled={!!fetching}
            className="rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
          >
            {fetching === "all"
              ? (locale === "zh" ? "抓取中..." : "Fetching...")
              : (locale === "zh" ? "全部抓取" : "Fetch All")}
          </button>
        </div>

        {fetchOutput && (
          <pre className="mt-4 max-h-60 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-green-400 font-mono">
            {fetchOutput}
          </pre>
        )}
      </div>

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
              <div
                key={run.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-2.5 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-block h-2 w-2 rounded-full ${
                    run.status === "success" ? "bg-green-500" : run.status === "running" ? "bg-amber-500" : "bg-red-500"
                  }`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {run.task_type}
                  </span>
                  <span className="text-xs text-slate-400">
                    +{run.items_processed} {locale === "zh" ? "条" : "items"}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {run.completed_at || run.started_at}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
