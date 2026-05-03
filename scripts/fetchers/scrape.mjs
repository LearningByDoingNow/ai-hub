/**
 * Universal Web Scraper
 *
 * source.config (JSON string or object):
 * {
 *   "list":    "CSS selector for article list items",
 *   "title":   "CSS selector for title (relative to list item)",
 *   "link":    "CSS selector for link (relative to list item)",
 *   "summary": "CSS selector for summary (optional)",
 *   "date":    "CSS selector for date (optional)",
 *   "linkAttr": "attribute name for href (default: 'href')",
 *   "baseUrl":  "base URL for relative links"
 * }
 *
 * Built-in presets: provide source.url matching a known domain
 * and config will be auto-applied.
 */

import * as cheerio from "cheerio";
import { generateId, stripHtml, truncate, parseDate, todayDate, fetchWithTimeout, fetchWithCurl } from "./utils.mjs";

// Built-in presets for popular sites
const PRESETS = {
  "jiqizhixin.com": {
    url: "https://www.jiqizhixin.com/articles",
    list: ".article-item, .article-card, [class*='article']",
    title: "a, h4, .title",
    link: "a",
    summary: "p, .summary, .desc",
    date: "time, .date, .time, span[class*='date']",
    baseUrl: "https://www.jiqizhixin.com",
  },
  "qbitai.com": {
    url: "https://www.qbitai.com/category/ai",
    list: ".post-item, .article-item, article, [class*='post']",
    title: "a, h2, h3, .title",
    link: "a",
    summary: "p, .excerpt, .desc",
    date: "time, .date, span[class*='date']",
    baseUrl: "https://www.qbitai.com",
  },
  "zhihu.com": {
    url: "https://www.zhihu.com/topic/19813032/hot",
    list: ".ContentItem, .List-item",
    title: "h2 a, .ContentItem-title a",
    link: "h2 a, .ContentItem-title a",
    summary: ".RichContent-inner, .CopyrightRichTextContent",
    date: "time",
    baseUrl: "https://www.zhihu.com",
  },
  "csdn.net": {
    url: "https://blog.csdn.net/nav/ai",
    list: ".feedlist_mod, .blog-list-box li, [class*='blog-item']",
    title: "a, h2, .title",
    link: "a",
    summary: "p, .desc",
    date: "time, .date, span[class*='time']",
    baseUrl: "https://blog.csdn.net",
  },
  "juejin.cn": {
    url: "https://juejin.cn/tag/AI",
    list: ".entry, .content-box, [class*='entry']",
    title: "a, .title-row a, .title",
    link: "a, .title-row a",
    summary: ".abstract, .content-box .desc",
    date: "time, .date, .meta-list .item",
    baseUrl: "https://juejin.cn",
  },
  "arxiv.org": {
    url: "https://arxiv.org/list/cs.AI/recent",
    list: ".meta, dt",
    title: ".list-title a, .descriptor + a",
    link: ".list-title a, a[href*='/abs/']",
    summary: "",
    date: "",
    baseUrl: "https://arxiv.org",
  },
};

function getPreset(url) {
  for (const [domain, preset] of Object.entries(PRESETS)) {
    if (url.includes(domain)) return preset;
  }
  return null;
}

function resolveUrl(href, baseUrl) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  if (href.startsWith("//")) return "https:" + href;
  if (href.startsWith("/")) return (baseUrl || "") + href;
  return href;
}

export async function fetchScrape(source) {
  const config = typeof source.config === "string"
    ? JSON.parse(source.config || "{}")
    : source.config || {};

  const preset = getPreset(source.url);
  const cfg = { ...preset };
  for (const [k, v] of Object.entries(config)) {
    if (v !== undefined && v !== "") cfg[k] = v;
  }
  const targetUrl = cfg.url || source.url;

  if (!cfg.list) {
    throw new Error("No 'list' CSS selector. Configure selectors or use a supported site.");
  }

  let html;
  try {
    const res = await fetchWithTimeout(targetUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    html = fetchWithCurl(targetUrl);
  }
  const $ = cheerio.load(html);

  const items = [];
  const baseUrl = cfg.baseUrl || new URL(targetUrl).origin;

  // Support regex-based link matching: if list starts with "regex:" use filter mode
  // Also support "links:" prefix to match href containing a substring
  let listElements;
  if (cfg.list && cfg.list.startsWith("regex:")) {
    const pattern = new RegExp(cfg.list.slice(6));
    listElements = $("a").filter((_, el) => pattern.test($(el).attr("href") || ""));
  } else if (cfg.list && cfg.list.startsWith("links:")) {
    const substring = cfg.list.slice(6);
    listElements = $("a").filter((_, el) => ($(el).attr("href") || "").includes(substring));
  } else {
    listElements = $(cfg.list);
  }

  listElements.each((_, el) => {
    const $el = $(el);

    // Extract title
    let title = "";
    if (cfg.title) {
      const $title = $el.find(cfg.title).first();
      title = stripHtml($title.text());
    }
    if (!title) title = stripHtml($el.text()).slice(0, 100);
    if (!title) return;

    // Extract link — if element itself is <a>, use its href directly
    let link = "";
    if ($el.is("a")) {
      link = $el.attr("href") || "";
    } else if (cfg.link) {
      link = $el.find(cfg.link).first().attr(cfg.linkAttr || "href") || "";
    }
    if (!link) {
      link = $el.find("a").first().attr("href") || "";
    }
    link = resolveUrl(link, baseUrl);
    if (!link) return;

    // Extract summary
    let summary = "";
    if (cfg.summary) {
      summary = stripHtml($el.find(cfg.summary).first().text());
    }

    // Extract date
    let date = todayDate();
    if (cfg.date) {
      const dateText = $el.find(cfg.date).first().text() || $el.find(cfg.date).first().attr("datetime") || "";
      if (dateText) date = parseDate(dateText);
    }

    items.push({
      id: generateId(link),
      title: truncate(title, 200),
      title_en: source.lang === "en" ? truncate(title, 200) : "",
      source: source.name,
      date,
      summary: truncate(summary),
      summary_en: source.lang === "en" ? truncate(summary) : "",
      url: link,
    });
  });

  return items.slice(0, 30);
}
