"use client";

import { useLocale } from "@/i18n/context";

export default function LLMConfig() {
  const { locale } = useLocale();

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
          {locale === "zh" ? "LLM 配置" : "LLM Configuration"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "LLM 服务商" : "LLM Provider"}
            </label>
            <select disabled className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option>OpenRouter (290+ models)</option>
              <option>OpenAI</option>
              <option>Anthropic (Claude)</option>
              <option>DeepSeek</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key</label>
            <input type="password" disabled placeholder="sk-..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "模型" : "Model"}
            </label>
            <input disabled placeholder="deepseek/deepseek-chat-v3-0324:free" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
          </div>
        </div>
        <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
          {locale === "zh"
            ? "LLM 功能即将上线 — 配置后可启用智能摘要、双语翻译和跨模块联动"
            : "LLM features coming soon — enables smart summaries, bilingual translation, and cross-module updates"}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800/50">
        <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-4">
          {locale === "zh" ? "抓取调度" : "Fetch Schedule"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "资讯抓取间隔" : "News Interval"}
            </label>
            <select disabled className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option>2 {locale === "zh" ? "小时" : "hours"}</option>
              <option>4 {locale === "zh" ? "小时" : "hours"}</option>
              <option>8 {locale === "zh" ? "小时" : "hours"}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "论文抓取间隔" : "Papers Interval"}
            </label>
            <select disabled className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option>8 {locale === "zh" ? "小时" : "hours"}</option>
              <option>12 {locale === "zh" ? "小时" : "hours"}</option>
              <option>24 {locale === "zh" ? "小时" : "hours"}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {locale === "zh" ? "产品更新间隔" : "Provider Update Interval"}
            </label>
            <select disabled className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <option>24 {locale === "zh" ? "小时" : "hours"}</option>
            </select>
          </div>
        </div>
        <p className="mt-4 text-xs text-amber-600 dark:text-amber-400">
          {locale === "zh"
            ? "定时调度即将上线 — 需要先配置 LLM"
            : "Scheduled fetching coming soon — requires LLM configuration first"}
        </p>
      </div>
    </div>
  );
}
