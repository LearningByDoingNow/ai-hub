/**
 * WeChat Public Account Fetcher
 *
 * Scrapes article lists from WeChat public accounts via Sogou WeChat Search.
 * source.url = account name (e.g. "机器之心")
 *
 * Only returns articles published within the last 24 hours.
 */

import * as cheerio from "cheerio";
import { generateId, stripHtml, truncate, fetchWithCurl } from "./utils.mjs";

const SOGOU_SEARCH_URL = "https://weixin.sogou.com/weixin";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export async function fetchWechat(source) {
  const accountName = source.url;

  // Search for articles by account name (type=2 = article search)
  const searchUrl = `${SOGOU_SEARCH_URL}?type=2&s_from=input&query=${encodeURIComponent(accountName)}&ie=utf8`;

  let html;
  try {
    html = fetchWithCurl(searchUrl, 10);
  } catch {
    return [];
  }

  if (!html || html.length < 500) return [];

  const $ = cheerio.load(html);
  const now = Date.now();
  const items = [];

  // Extract unix timestamps from timeConvert() calls in the HTML
  const timestampMap = new Map();
  const timePattern = /timeConvert\('(\d+)'\)/g;
  let match;
  const allTimestamps = [];
  while ((match = timePattern.exec(html)) !== null) {
    allTimestamps.push(parseInt(match[1]) * 1000);
  }

  // Parse articles from search results
  $(".news-list li, .news-list2 li").each((idx, el) => {
    const $el = $(el);

    let title = stripHtml($el.find("h3 a, h4 a").first().text());
    if (!title || title.length < 4) return;

    let link = $el.find("h3 a, h4 a").first().attr("href") || "";
    if (link && !link.startsWith("http")) link = `https://weixin.sogou.com${link}`;
    if (!link) return;

    // Get the timestamp for this item (timestamps appear in DOM order)
    const timestamp = allTimestamps[idx];
    if (!timestamp) return;

    // Only include articles from the last 24 hours
    if (now - timestamp > MAX_AGE_MS) return;

    const date = new Date(timestamp).toISOString();
    let summary = stripHtml($el.find("p, .txt-info").first().text());

    items.push({
      id: generateId(link),
      title: truncate(title, 200),
      title_en: "",
      source: source.name,
      date,
      summary: truncate(summary),
      summary_en: "",
      url: link,
    });
  });

  return items;
}
