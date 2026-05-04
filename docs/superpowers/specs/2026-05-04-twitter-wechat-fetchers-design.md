# Twitter & WeChat Fetchers Design

## Overview

Add Twitter and WeChat public account content fetching to ai-hub's existing multi-strategy fetch engine.

## Twitter (via RSSHub RSS)

**Approach:** Use RSSHub to convert Twitter user timelines into standard RSS feeds. Zero new fetcher code — reuses existing `fetchRSS`.

**RSSHub URL format:** `{base_url}/twitter/user/{username}`

**Configuration:**
- `pipeline_config` key `rsshub_base_url` — default `https://rsshub.app`, user can switch to self-hosted instance
- Sources added to `sources` table with type `rss`, lang `en`, module `news`

**Accounts:**

| Category | Accounts |
|----------|----------|
| AI Companies | OpenAI, AnthropicAI, GoogleDeepMind, xaboratory, MetaAI, MistralAI, deepaborev |
| AI People | sama, ylecun, karpathy, jimfan_ai |
| Intl News | Reuters, AP, BBCBreaking, CNNBreaking, AJEnglish |

**Filtering:** Existing `isAIRelated()` keyword filter applies to RSS sources. News accounts bypass this via `type: scrape` or separate module assignment.

## WeChat Public Accounts (New Fetcher)

**Approach:** New `wechat` fetcher type. Scrapes Sogou WeChat search results.

**File:** `scripts/fetchers/wechat.mjs`

**Mechanism:**
1. Hit `https://weixin.sogou.com/weixin?type=1&query={account_name}` to find account page
2. Follow to account's article list
3. Parse article titles, URLs, dates, summaries with cheerio
4. Return standard items array

**Registration:** Add to `scripts/fetchers/index.mjs` fetcher map as `wechat` type.

**Sources table entries:** type=`wechat`, url=account name (e.g. "机器之心"), lang=`zh`

**Accounts:** 机器之心, 量子位, 九万里, 新智元, AI前线

## User-Configurable Fetch Interval

- `pipeline_config` key `fetch_interval_hours` — default 4
- `engine.mjs` reads this at startup for cron schedule
- Frontend Settings page adds interval selector (1h / 2h / 4h / 6h / 12h / 24h)

## What Stays the Same

- Database schema (news table unchanged)
- Deduplication (MD5 of URL)
- AI keyword filtering for RSS sources
- 30-day retention cleanup
- Parallel fetch with 30s deadline

## Implementation Order

1. Create develop branch
2. Add `rsshub_base_url` and `fetch_interval_hours` to pipeline_config
3. Insert Twitter RSS sources into sources table
4. Implement `wechat.mjs` fetcher
5. Register wechat in index.mjs
6. Insert WeChat sources into sources table
7. Update engine.mjs to read configurable interval
8. Test end-to-end fetch cycle
