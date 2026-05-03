/**
 * AI Hub Universal Fetch Engine v2
 *
 * Multi-strategy fetcher:
 *   - rss:    Standard RSS/Atom feed parsing
 *   - scrape: HTML scraping with CSS selectors (cheerio)
 *   - api:    JSON API endpoints
 *   - hn:     Hacker News API (built-in)
 */

import { fetchRSS } from "./rss.mjs";
import { fetchScrape } from "./scrape.mjs";
import { fetchAPI } from "./api.mjs";

const fetchers = {
  rss: fetchRSS,
  scrape: fetchScrape,
  api: fetchAPI,
};

export async function fetchSource(source) {
  const type = source.type || "rss";
  const fetcher = fetchers[type];

  if (!fetcher) {
    return { source: source.name, items: [], error: `Unknown type: ${type}` };
  }

  try {
    const items = await fetcher(source);
    return { source: source.name, items, error: null };
  } catch (err) {
    return { source: source.name, items: [], error: err.message };
  }
}
