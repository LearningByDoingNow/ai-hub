<p align="center">
  <img src="docs/screenshots_new/home_0.png" alt="AI Hub" width="100%" />
</p>

<p align="center">
  <strong>AI-Powered Global Information Aggregation Platform</strong><br/>
  <sub>Smart fetching, filtering, and aggregation — never miss what matters</sub>
</p>

<p align="center">
  <a href="https://learningbydoingnow.github.io/ai-hub/">Live Preview</a><sup>*</sup> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#desktop-widget">Desktop Widget</a> •
  <a href="docs/TECHNICAL.md">Tech Docs</a> •
  <a href="docs/USER_GUIDE.md">User Guide</a> •
  <a href="README.zh-CN.md">中文</a>
</p>

<sub>* Online preview is a simplified read-only demo. For full features (AI chat, settings, auto-fetch, desktop widget), please clone and run locally.</sub>

---

## What is AI Hub?

AI Hub automatically aggregates content from **77+ premium global sources** across multiple domains — AI technology, academic papers, international affairs, and more. It features a modern WebUI and a native macOS desktop widget, both powered by the same data engine and sharing a unified database.

**Two ways to use:**
- **WebUI** — Full-featured web interface with search, filtering, favorites, settings, AI chat
- **Desktop Widget** — Lightweight floating widget with real-time notifications, favorites, and AI assistant

Both share the same database and configuration — favorites, read status, and sources stay in sync.

---

## Features

### Intelligent Aggregation Engine
- **77+ curated data sources** — OpenAI, DeepMind, TechCrunch, BBC, Financial Times, arXiv, and more
- **Smart filtering** — AI-relevance detection, 7-day freshness window, duplicate prevention
- **Parallel fetching** — All sources fetched concurrently with 30s deadline, completes in ~8 seconds
- **Configurable auto-fetch** — Set any interval (1min to hours), runs in background

---

### WebUI

#### Homepage
Dark-themed dashboard with stats overview, latest news, recent papers, and featured AI products.

<img src="docs/screenshots_new/home_1.png" alt="Homepage - News" width="100%" />

<img src="docs/screenshots_new/home_2.png" alt="Homepage - Papers" width="100%" />

<img src="docs/screenshots_new/home_3.png" alt="Homepage - Products" width="100%" />

#### AI News Aggregation
Real-time AI news from top sources with source-type filtering (Twitter, WeChat, RSS) and search.

https://github.com/user-attachments/assets/placeholder-ai-news

> Video: `docs/screenshots_new/ai-0.mov`

#### Paper Tracker
Track cutting-edge research papers from arXiv (cs.AI, cs.LG, cs.CL, cs.CV) with direct links to papers and PDFs.

<img src="docs/screenshots_new/paper.png" alt="Paper Tracker" width="100%" />

#### World News
International affairs coverage from BBC, Financial Times, NYT, Reuters, Guardian, and more — with source filtering.

<img src="docs/screenshots_new/worldnews.png" alt="World News" width="100%" />

#### AI Products Directory
Browse 59+ AI companies across 9 categories with direct links to official sites, APIs, and documentation.

https://github.com/user-attachments/assets/placeholder-ai-product

> Video: `docs/screenshots_new/ai_product.mov`

#### Favorites
Unified favorites system shared between WebUI and Desktop Widget — save and manage your bookmarks.

<img src="docs/screenshots_new/shoucang.png" alt="Favorites" width="100%" />

#### Settings & Configuration

Comprehensive settings panel with 5 tabs:

| Tab | Description |
|-----|-------------|
| Data Fetching | One-click fetch, auto-fetch interval, recent fetch history |
| Module Management | Create/edit content modules (AI News, Papers, World News, etc.) |
| Data Sources | Manage 77+ RSS sources, assign to modules |
| Product Management | CRUD for AI products directory |
| LLM Configuration | Quick-select presets (OpenAI, Anthropic, DeepSeek, GLM, etc.) |

<img src="docs/screenshots_new/setting_0.png" alt="Settings - Data Fetch" width="100%" />
<img src="docs/screenshots_new/setting_module_2.png" alt="Settings - Modules" width="100%" />
<img src="docs/screenshots_new/setting_datasource_3.png" alt="Settings - Data Sources" width="100%" />
<img src="docs/screenshots_new/setting_product_4.png" alt="Settings - Products" width="100%" />
<img src="docs/screenshots_new/setting_llmconfig_5.png" alt="Settings - LLM" width="100%" />

https://github.com/user-attachments/assets/placeholder-setting-fetch

> Video: `docs/screenshots_new/setting_fetch_data_1.mov`

https://github.com/user-attachments/assets/placeholder-setting-llm

> Video: `docs/screenshots_new/setting_llm_config.mov`

---

### Desktop Widget (macOS)

A native floating widget that lives on your desktop — always accessible, never in the way.

<table>
<tr>
<td width="50%">
<strong>Expanded Card List</strong><br/>
<img src="docs/screenshots_new/desktop_1.png" alt="Desktop Widget" width="100%" />
<br/><sub>Read status, favorites, source filtering, dismiss cards</sub>
</td>
<td width="50%">
<strong>Full Desktop View</strong><br/>
<img src="docs/screenshots_new/desktop_2.png" alt="Desktop Full" width="100%" />
<br/><sub>Widget + AI Chat + Settings side by side</sub>
</td>
</tr>
</table>

https://github.com/user-attachments/assets/placeholder-ai-video

> Video: `docs/screenshots_new/ai-video.mov`

**Widget Features:**
- Floating logo with particle effects — click to expand
- Source-type filter tabs (All, Twitter, WeChat, RSS, World)
- Read tracking (persisted across restarts)
- Favorites (synced with WebUI)
- Dismiss individual cards or clear all
- AI Chat assistant with streaming responses
- Settings panel with LLM configuration
- Drag to reposition, resize by dragging bottom edge

---

## Quick Start

### Prerequisites
- **Node.js** 18+ (recommend 20+)
- **npm** 9+

### Installation

```bash
git clone https://github.com/LearningByDoingNow/ai-hub.git
cd ai-hub
npm install        # Installs deps + auto-initializes database with default sources
```

### Configure LLM (Optional, for AI Chat)

```bash
cp .env.example .env.local
# Edit .env.local with your LLM API key
```

Supports any OpenAI-compatible API (OpenAI, Anthropic, DeepSeek, GLM, Ollama, etc.)

### Run

```bash
npm run fetch:all  # First fetch — pulls data from all 77+ sources (~8 seconds)
npm run dev        # Start WebUI at http://localhost:3000
```

That's it! Open http://localhost:3000 to see your aggregated content.

### Auto-fetch (Optional)

Set up automatic fetching via:
- **WebUI**: Settings → Data Fetching → Set interval
- **Desktop Widget**: Settings → Set interval
- **Cron job**: `npm run fetch:schedule` (runs every 4 hours)

---

## Desktop Widget

### Build from Source (requires Rust)

```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build
npm run desktop:install
npm run desktop:build

# Output:
# .app → desktop/src-tauri/target/release/bundle/macos/AI Hub.app
# .dmg → desktop/src-tauri/target/release/bundle/dmg/AI Hub_0.1.0_aarch64.dmg
```

### Install from DMG

Download from [GitHub Releases](https://github.com/LearningByDoingNow/ai-hub/releases) and drag to Applications.

> **macOS Security Warning:** If you see "AI Hub is damaged and can't be opened", run:
> ```bash
> xattr -cr /Applications/AI\ Hub.app
> ```
> This is normal for unsigned apps.

> **DMG Limitations:** The standalone DMG includes pre-bundled data for immediate viewing and AI chat. However, **fetching new data is not available** without the full project directory + Node.js. For full functionality including auto-fetch, clone the repository instead.

---

## Architecture

```
ai-hub/
├── src/                  # Next.js WebUI (App Router)
│   ├── app/             # Pages + API routes
│   ├── components/      # React components
│   ├── lib/             # SQLite queries, utilities
│   └── i18n/            # Bilingual translations
├── desktop/              # Tauri Desktop Widget
│   ├── src/             # React frontend
│   └── src-tauri/       # Rust backend
├── scripts/              # Data fetching engine
│   ├── engine.mjs       # Main parallel fetcher
│   ├── fetch-papers.mjs # arXiv paper fetcher
│   └── fetchers/        # RSS, scrape, API strategies
├── data/                 # SQLite database
│   └── ai-hub.db        # Shared by WebUI + Desktop
└── public/              # Static assets
```

### Data Flow

```
RSS/API Sources → engine.mjs (parallel fetch + filter)
                       ↓
              SQLite (data/ai-hub.db)
                   ↙        ↘
          Next.js WebUI    Tauri Desktop Widget
              ↓                    ↓
        Browser (SSR)     Native macOS Window
```

Both apps read/write the same database — favorites, sources, and configuration stay in sync automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| WebUI | Next.js 16, React 19, Tailwind CSS 4 |
| Desktop | Tauri 2, Rust, React, Vite |
| Database | SQLite (better-sqlite3) with WAL mode |
| AI Chat | OpenAI-compatible API, SSE streaming |
| Fetching | rss-parser, parallel with deadline |
| Deploy | Vercel (WebUI), GitHub Releases (Desktop) |

---

## Documentation

- **[Technical Documentation](docs/TECHNICAL.md)** — Architecture deep-dive, database schema, API reference
- **[User Guide](docs/USER_GUIDE.md)** — Feature walkthrough, configuration tips, FAQ

---

## License

[MIT](LICENSE)
