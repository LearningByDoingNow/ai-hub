/**
 * WeChat Public Account Fetcher
 *
 * Scrapes article lists from WeChat public accounts via Sogou WeChat Search.
 * source.url = account name (e.g. "机器之心")
 */

import * as cheerio from "cheerio";
import { generateId, stripHtml, truncate, parseDate, todayDate, fetchWithTimeout, fetchWithCurl } from "./utils.mjs";

const SOGOU_SEARCH_URL = "https://weixin.sogou.com/weixin";

export async function fetchWechat(source) {
  const accountName = source.url;
  const searchUrl = `${SOGOU_SEARCH_URL}?type=1&query=${encodeURIComponent(accountName)}`;

  let html;
  try {
    const res = await fetchWithTimeout(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Referer": "https://weixin.sogou.com/",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    html = fetchWithCurl(searchUrl);
  }

  let $ = cheerio.load(html);

  // Find the account link from search results
  const accountLink = $(".news-box .news-list li .txt-box h3 a").first().attr("href")
    || $("a[href*='gzh.chinaso.com']").first().attr("href")
    || $(".tit a").first().attr("href");

  // If we found the account page, fetch its article list
  if (accountLink) {
    try {
      const accountUrl = accountLink.startsWith("http") ? accountLink : `https://weixin.sogou.com${accountLink}`;
      const res2 = await fetchWithTimeout(accountUrl);
      if (res2.ok) {
        html = await res2.text();
        $ = cheerio.load(html);
      }
    } catch {
      // Continue with search results page
    }
  }

  // Strategy 1: Parse article list from account page
  let items = parseAccountPage($, source);

  // Strategy 2: If no results, try searching for recent articles by this account
  if (items.length === 0) {
    items = await searchArticles(accountName, source);
  }

  return items;
}

function parseAccountPage($, source) {
  const items = [];

  // Sogou WeChat account page article selectors
  const selectors = [
    ".news-list li",
    ".news-box .news-list2 li",
    "[class*='weui_media_box']",
    ".txt-box",
  ];

  let listElements = $([]);
  for (const sel of selectors) {
    listElements = $(sel);
    if (listElements.length > 0) break;
  }

  listElements.each((_, el) => {
    const $el = $(el);

    let title = stripHtml($el.find("h3 a, h4 a, .tit a, .txt-box h3").first().text());
    if (!title) title = stripHtml($el.find("a").first().text());
    if (!title || title.length < 4) return;

    let link = $el.find("h3 a, h4 a, .tit a").first().attr("href") || "";
    if (!link) link = $el.find("a").first().attr("href") || "";
    if (link && !link.startsWith("http")) link = `https://weixin.sogou.com${link}`;
    if (!link) return;

    let summary = stripHtml($el.find("p, .txt-info, .s-p").first().text());
    let date = $el.find(".s2, .date, time, .s-p").last().text().trim();
    date = date ? parseDate(date) : todayDate();

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

  return items.slice(0, 20);
}

async function searchArticles(accountName, source) {
  // Fallback: search for articles by account name
  const searchUrl = `${SOGOU_SEARCH_URL}?type=2&query=${encodeURIComponent(accountName)}`;

  let html;
  try {
    const res = await fetchWithTimeout(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Referer": "https://weixin.sogou.com/",
      },
    });
    if (!res.ok) return [];
    html = await res.text();
  } catch {
    try {
      html = fetchWithCurl(searchUrl);
    } catch {
      return [];
    }
  }

  const $ = cheerio.load(html);
  const items = [];

  // Parse article search results
  $(".news-list li, .txt-box, .news-box .news-list2 li").each((_, el) => {
    const $el = $(el);

    let title = stripHtml($el.find("h3 a, .tit a").first().text());
    if (!title || title.length < 4) return;

    let link = $el.find("h3 a, .tit a").first().attr("href") || "";
    if (link && !link.startsWith("http")) link = `https://weixin.sogou.com${link}`;
    if (!link) return;

    let summary = stripHtml($el.find("p, .txt-info").first().text());
    let date = $el.find(".s2, .date").first().text().trim();
    date = date ? parseDate(date) : todayDate();

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

  return items.slice(0, 20);
}
