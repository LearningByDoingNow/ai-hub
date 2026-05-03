/**
 * JSON API Fetcher
 *
 * source.config (JSON string or object):
 * {
 *   "itemsPath":   "JSON path to items array (e.g. 'hits' or 'data.articles')",
 *   "titleField":  "field name for title",
 *   "urlField":    "field name for URL",
 *   "summaryField": "field name for summary",
 *   "dateField":   "field name for date",
 *   "baseUrl":     "base URL prefix for relative links"
 * }
 *
 * Built-in: Hacker News, Reddit JSON API
 */

import { generateId, truncate, parseDate, fetchWithTimeout } from "./utils.mjs";

const API_PRESETS = {
  "hn": {
    url: "https://hn.algolia.com/api/v1/search_by_date?tags=story&query=AI+LLM+GPT+machine+learning&hitsPerPage=30",
    itemsPath: "hits",
    titleField: "title",
    urlField: "url",
    summaryField: "title",
    dateField: "created_at",
    baseUrl: "https://news.ycombinator.com/item?id=",
    idField: "objectID",
  },
  "reddit": {
    url: "https://www.reddit.com/r/MachineLearning/hot.json?limit=25",
    itemsPath: "data.children",
    titleField: "data.title",
    urlField: "data.url",
    summaryField: "data.selftext",
    dateField: "data.created_utc",
    baseUrl: "https://reddit.com",
  },
  "producthunt": {
    url: "https://www.producthunt.com/feed",
    type: "rss",
  },
};

function getNestedValue(obj, path) {
  return path.split(".").reduce((o, k) => o && o[k], obj);
}

export async function fetchAPI(source) {
  const config = typeof source.config === "string"
    ? JSON.parse(source.config || "{}")
    : source.config || {};

  // Check for built-in preset
  const presetName = config.preset || "";
  const preset = API_PRESETS[presetName] || {};
  const cfg = { ...preset, ...config };
  const targetUrl = cfg.url || source.url;

  const res = await fetchWithTimeout(targetUrl, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  let rawItems = cfg.itemsPath ? getNestedValue(json, cfg.itemsPath) : json;
  if (!Array.isArray(rawItems)) rawItems = [];

  const items = [];
  for (const raw of rawItems.slice(0, 30)) {
    const title = getNestedValue(raw, cfg.titleField || "title") || "";
    let url = getNestedValue(raw, cfg.urlField || "url") || "";
    const summary = getNestedValue(raw, cfg.summaryField || "") || "";
    let dateRaw = getNestedValue(raw, cfg.dateField || "");

    if (!title) continue;

    // Handle Unix timestamps
    if (typeof dateRaw === "number" && dateRaw > 1e9) {
      dateRaw = new Date(dateRaw * 1000).toISOString();
    }

    // Fallback URL for HN
    if (!url && cfg.idField && cfg.baseUrl) {
      url = cfg.baseUrl + getNestedValue(raw, cfg.idField);
    }
    if (!url) continue;

    items.push({
      id: generateId(url),
      title: truncate(title, 200),
      title_en: source.lang === "en" ? truncate(title, 200) : "",
      source: source.name,
      date: parseDate(dateRaw),
      summary: truncate(summary),
      summary_en: source.lang === "en" ? truncate(summary) : "",
      url,
    });
  }

  return items;
}
