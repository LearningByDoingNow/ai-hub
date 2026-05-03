import crypto from "crypto";
import { execSync } from "child_process";

export function generateId(url) {
  return "news-" + crypto.createHash("md5").update(url).digest("hex").slice(0, 12);
}

export function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#\d+;/g, "")
    .replace(/&\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function truncate(str, maxLen = 300) {
  if (!str) return "";
  return str.length > maxLen ? str.slice(0, maxLen) + "..." : str;
}

export function todayDate() {
  return new Date().toISOString().split("T")[0];
}

export function parseDate(dateStr) {
  if (!dateStr) return todayDate();
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return todayDate();
    return d.toISOString().split("T")[0];
  } catch {
    return todayDate();
  }
}

export async function fetchWithTimeout(url, opts = {}, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
        ...opts.headers,
      },
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export function fetchWithCurl(url, timeout = 15) {
  try {
    const html = execSync(
      `curl -sL --max-time ${timeout} -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36" -H "Accept-Language: zh-CN,zh;q=0.9" "${url}"`,
      { maxBuffer: 10 * 1024 * 1024, timeout: timeout * 1000 }
    );
    return html.toString("utf-8");
  } catch {
    throw new Error(`curl failed for ${url}`);
  }
}
