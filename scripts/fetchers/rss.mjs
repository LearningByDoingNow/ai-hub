/**
 * RSS/Atom Feed Fetcher
 */
import Parser from "rss-parser";
import { generateId, stripHtml, truncate, parseDate } from "./utils.mjs";

const parser = new Parser({
  timeout: 8000,
  headers: { "User-Agent": "AI-Hub-Engine/2.0" },
});

export async function fetchRSS(source) {
  const result = await parser.parseURL(source.url);
  const items = [];

  for (const item of (result.items || []).slice(0, 20)) {
    const title = stripHtml(item.title || "");
    const summary = stripHtml(item.contentSnippet || item.content || item.summary || "");
    const url = item.link || "";
    const date = parseDate(item.isoDate);

    if (!title || !url) continue;

    items.push({
      id: generateId(url),
      title,
      title_en: source.lang === "en" ? title : "",
      source: source.name,
      date,
      summary: truncate(summary),
      summary_en: source.lang === "en" ? truncate(summary) : "",
      url,
    });
  }

  return items;
}
