# Technical Documentation

## Architecture Overview

AI Hub follows a shared-database architecture where both WebUI and Desktop Widget read/write the same SQLite database.

```
┌─────────────────────────────────────────────────────────────┐
│                        Data Sources                          │
│  RSS Feeds (70+)  |  arXiv API  |  Web Scraping  |  HN API │
└────────────────────────────┬────────────────────────────────┘
                             │ node scripts/engine.mjs
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    SQLite Database                           │
│                 data/ai-hub.db (WAL mode)                    │
│  Tables: news, papers, providers, sources, modules, ...     │
└──────────────────┬─────────────────────┬────────────────────┘
                   │                     │
    ┌──────────────▼──────────┐  ┌──────▼───────────────┐
    │     Next.js WebUI       │  │  Tauri Desktop Widget │
    │  (localhost:3000)       │  │  (native macOS app)   │
    │  - SSR pages            │  │  - Rust backend       │
    │  - API routes           │  │  - React frontend     │
    │  - Streaming chat       │  │  - SQLite direct read │
    └─────────────────────────┘  └───────────────────────┘
```

## Database Schema

### `news`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | MD5 hash of URL (`news-xxxx`) |
| title | TEXT | Article title (original language) |
| title_en | TEXT | English title (if source is EN) |
| source | TEXT | Source name |
| date | TEXT | Publish time (ISO 8601 or YYYY-MM-DD) |
| summary | TEXT | Article summary/snippet |
| summary_en | TEXT | English summary |
| url | TEXT | Original article URL |
| created_at | TEXT | Database insert time (UTC) |

### `papers`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | MD5 hash of arXiv ID |
| title | TEXT | Paper title |
| authors | TEXT | JSON array of author names |
| venue | TEXT | e.g., "arXiv 2026 [cs.AI]" |
| date | TEXT | Publication date |
| abstract | TEXT | Paper abstract (500 chars) |
| abstract_en | TEXT | English abstract |
| links | TEXT | JSON array of {label, url} |
| created_at | TEXT | Insert time |

### `providers`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | URL-safe slug |
| name | TEXT | Company name |
| description | TEXT | One-line description |
| category | TEXT | e.g., "大模型", "AI 编程" |
| country | TEXT | ISO country code |
| links | TEXT | JSON array of {label, url} |
| tags | TEXT | JSON array of product/model names |

### `sources`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | URL-safe slug |
| name | TEXT | Display name |
| type | TEXT | "rss", "scrape", "api", "arxiv" |
| url | TEXT | RSS feed URL |
| lang | TEXT | "zh" or "en" |
| enabled | INTEGER | 1=active, 0=disabled |
| module | TEXT | Primary module ID |

### `modules`
| Column | Type | Description |
|--------|------|-------------|
| id | TEXT PK | Module identifier |
| name | TEXT | Chinese name |
| name_en | TEXT | English name |
| icon | TEXT | Icon identifier |
| sort_order | INTEGER | Display order |

### `pipeline_runs`
Tracks fetch execution history with timing, item counts, and status.

---

## API Routes (WebUI)

### `POST /api/chat`
Streaming LLM chat with article context.

**Request:**
```json
{ "messages": [{ "role": "user", "content": "..." }] }
```

**Response:** SSE stream (`text/event-stream`)
```
data: {"choices":[{"delta":{"content":"Hello"}}]}
data: {"choices":[{"delta":{"content":" world"}}]}
data: [DONE]
```

**Features:**
- Automatically detects article URLs and fetches full content
- Supports OpenAI and Anthropic API formats
- Dynamic system prompt with platform context

### `GET /api/search?q=query`
Full-text search across news and papers.

**Response:**
```json
[{ "id": "...", "type": "news", "title": "...", "source": "...", "date": "...", "summary": "...", "url": "..." }]
```

### `POST /api/pipeline/run`
Trigger background data fetch.

**Request:** `{ "task": "all" | "news" | "papers" }`

### `GET /api/pipeline/run`
Check if fetch is currently running.

### `GET /api/pipeline/status`
Get pipeline stats, run history, and recent items.

### `GET /api/modules`
List all configured modules.

---

## Fetching Engine

### `scripts/engine.mjs`
Main orchestrator for news fetching.

**Strategies:**
1. **RSS** (`fetchers/rss.mjs`) — Standard RSS/Atom feeds via `rss-parser`
2. **Scrape** (`fetchers/scrape.mjs`) — Web scraping with CSS selectors
3. **API** (`fetchers/api.mjs`) — JSON API endpoints (Hacker News)

**Pipeline:**
1. Load enabled sources from database
2. Fetch all sources in parallel (8s per-source timeout, 30s global deadline)
3. Filter by AI relevance keywords (for news module)
4. Filter by 7-day freshness
5. Insert with `INSERT OR IGNORE` (deduplication by URL hash)
6. WAL checkpoint for immediate visibility
7. `process.exit(0)` to avoid Node.js socket hang

### `scripts/fetch-papers.mjs`
Dedicated arXiv paper fetcher using Atom XML API.

---

## Desktop Widget (Tauri)

### Rust Backend Commands
| Command | Description |
|---------|-------------|
| `get_news(limit, module_ids)` | Fetch news from SQLite |
| `get_news_since(since)` | Get news after timestamp |
| `search_content(query)` | Full-text search |
| `chat_with_llm(messages)` | Call LLM API |
| `trigger_fetch()` | Run engine.mjs |
| `save_llm_config(...)` | Save to .env.local |
| `open_chat_window()` | Open chat panel |
| `open_settings_window()` | Open settings panel |
| `resize_widget(w, h)` | Resize main window |

### Background Poller
- Checks every 15 seconds for new data in database
- Emits `new-items` event to frontend
- Sends native macOS notifications
- Auto-triggers fetch based on configured interval

### Database Location Priority
1. `AIHUB_DB_PATH` environment variable
2. `{cwd}/data/ai-hub.db`
3. `{cwd}/../data/ai-hub.db`
4. Walk up from executable (5 levels)
5. `~/Desktop/ai-hub/data/ai-hub.db`
6. `~/.aihub/ai-hub.db` (standalone, auto-created with bundled data)

---

## Configuration

### `.env.local`
```bash
LLM_BASE_URL=https://api.openai.com/v1    # Any OpenAI-compatible endpoint
LLM_API_KEY=sk-xxx                          # API key
LLM_MODEL=gpt-4o                            # Model name
LLM_TEMPERATURE=0.5                         # 0-2
FETCH_INTERVAL_MIN=60                       # Auto-fetch interval (0=off)
```

### Supported LLM Providers
- OpenAI (GPT-4o, GPT-4, etc.)
- Anthropic Claude (via /v1/messages)
- ZhipuAI (GLM-4)
- DeepSeek
- Ollama (local)
- Any OpenAI-compatible API

---

## Build & Deploy

### WebUI on Vercel
```bash
npm run build   # Creates .next/ production build
# Push to GitHub → Vercel auto-deploys
```

### Desktop for macOS
```bash
npm run desktop:build
# Output: desktop/src-tauri/target/release/bundle/macos/AI Hub.app
```

### CI/CD (GitHub Actions)
The `.github/workflows/fetch.yml` runs hourly data fetches.
Multi-platform desktop builds can be added with Tauri's CI action.
