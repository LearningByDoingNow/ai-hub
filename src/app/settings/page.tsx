"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/context";
import ModulesManager from "@/components/settings/ModulesManager";
import SourcesManager from "@/components/settings/SourcesManager";
import ProvidersManager from "@/components/settings/ProvidersManager";
import LLMConfig from "@/components/settings/LLMConfig";

const tabs = [
  { key: "modules", labelZh: "模块管理", labelEn: "Modules" },
  { key: "sources", labelZh: "数据源管理", labelEn: "Data Sources" },
  { key: "providers", labelZh: "产品导航管理", labelEn: "Providers" },
  { key: "llm", labelZh: "LLM 配置", labelEn: "LLM Config" },
];

export default function SettingsPage() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState("modules");

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
        {locale === "zh" ? "设置" : "Settings"}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">
        {locale === "zh"
          ? "自定义模块、数据源、产品导航和 LLM 配置"
          : "Customize modules, data sources, providers, and LLM configuration"}
      </p>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {locale === "zh" ? tab.labelZh : tab.labelEn}
          </button>
        ))}
      </div>

      {activeTab === "modules" && <ModulesManager />}
      {activeTab === "sources" && <SourcesManager />}
      {activeTab === "providers" && <ProvidersManager />}
      {activeTab === "llm" && <LLMConfig />}
    </div>
  );
}
