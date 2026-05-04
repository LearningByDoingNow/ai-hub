/**
 * Twitter/X Fetcher
 *
 * Uses Twitter's syndication timeline endpoint (no auth required).
 * source.url = Twitter username (e.g. "OpenAI")
 *
 * Rate limiting: Twitter syndication allows 30 req / 15-min window.
 * A global queue serializes requests with 5s intervals.
 */

import { generateId, truncate, fetchWithCurl } from "./utils.mjs";

const SYNDICATION_URL = "https://syndication.twitter.com/srv/timeline-profile/screen-name";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
// Twitter syndication allows 30 requests per 15-min window.
// With 16 accounts at 5s intervals = 80s total, well within the 30-request budget.
const REQUEST_DELAY_MS = 5000;

let queue = Promise.resolve();

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export async function fetchTwitter(source) {
  // Serialize all Twitter requests with delay to avoid 429 (30 req / 15 min window)
  const result = await (queue = queue.then(async () => {
    await sleep(REQUEST_DELAY_MS);
    return _fetchTwitter(source);
  }));
  return result;
}

async function _fetchTwitter(source) {
  const username = source.url;
  const url = `${SYNDICATION_URL}/${username}`;

  // Use curl to bypass Cloudflare TLS fingerprinting that blocks Node.js fetch
  const html = fetchWithCurl(url, 12);
  if (!html || html.length < 100) throw new Error("Empty response (rate limited)");

  // Extract __NEXT_DATA__ JSON from the HTML
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s);
  if (!match) throw new Error("No timeline data found");

  const data = JSON.parse(match[1]);
  const hasResults = data?.props?.pageProps?.contextProvider?.hasResults;
  const entries = data?.props?.pageProps?.timeline?.entries;
  if (!entries || entries.length === 0) {
    if (!hasResults) throw new Error("Rate limited or account unavailable");
    return [];
  }

  const now = Date.now();
  const items = [];

  for (const entry of entries) {
    const tweet = entry?.content?.tweet;
    if (!tweet) continue;

    // Skip retweets
    if (tweet.retweeted_status_id_str) continue;

    const createdAt = new Date(tweet.created_at);
    if (isNaN(createdAt.getTime())) continue;

    // Only include tweets from the last 24 hours
    if (now - createdAt.getTime() > MAX_AGE_MS) continue;

    const text = tweet.full_text || tweet.text || "";
    if (!text) continue;

    const tweetUrl = `https://x.com/${username}/status/${tweet.id_str}`;
    const date = createdAt.toISOString();

    items.push({
      id: generateId(tweetUrl),
      title: truncate(text, 200),
      title_en: source.lang === "en" ? truncate(text, 200) : "",
      source: source.name,
      date,
      summary: truncate(text, 300),
      summary_en: source.lang === "en" ? truncate(text, 300) : "",
      url: tweetUrl,
    });
  }

  return items;
}
