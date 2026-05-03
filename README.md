<p align="center">
  <img src="public/logo-transparent.png" alt="AI Hub" width="200" />
</p>

<h1 align="center">AI Hub</h1>

<p align="center">
  <strong>All-in-one AI Industry Intelligence Platform</strong>
</p>

<p align="center">
  Track AI companies, aggregate news, follow research papers, and chat with an AI assistant — all in one place.
</p>

<p align="center">
  <a href="https://ai-hub-zeta-ten.vercel.app">Live Demo</a> &bull;
  <a href="./README.zh-CN.md">中文文档</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

<p align="center">
  <a href="https://ai-hub-zeta-ten.vercel.app">
    <img src="docs/screenshots/home.png" alt="AI Hub Homepage" width="800" />
  </a>
</p>

---

## Features

- **AI Provider Directory** — Browse 100+ AI companies with category/region filtering
- **News Aggregation** — Auto-fetch from RSS feeds and web scraping with AI keyword filtering
- **Paper Tracking** — Follow cutting-edge research from arXiv
- **World Affairs** — Aggregate international news from major global media
- **AI Chat Assistant** — Built-in chat with `@mention` article context
- **Custom Modules** — Create personalized feed combinations
- **Favorites** — Bookmark news and papers
- **Full-text Search** — Search across all content types
- **Data Pipeline** — Manual or scheduled (every 4h via GitHub Actions) fetching
- **i18n** — Chinese and English interface
- **Dark / Light Theme** — Automatic theme switching

<details>
<summary>More Screenshots</summary>

| News | Settings |
|------|----------|
| ![News](docs/screenshots/news.png) | Pipeline control, module management, data sources, LLM config |

</details>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| Database | SQLite (local) / Supabase (cloud) |
| Data Pipeline | RSS Parser + Cheerio + arXiv API |
| AI Chat | OpenAI-compatible API (OpenRouter, DeepSeek, etc.) |
| Scheduling | GitHub Actions (every 4h) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or pnpm

### Installation

```bash
git clone https://github.com/LearningByDoingNow/ai-hub.git
cd ai-hub
npm install
node scripts/seed-sqlite.mjs   # Initialize database
npm run dev                     # Start dev server
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
# LLM Configuration (required for AI chat)
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your-api-key
LLM_MODEL=deepseek/deepseek-chat-v3-0324:free

# Optional: Supabase (for cloud deployment)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **Note:** SQLite works out of the box locally. Supabase is only needed for cloud deployment (e.g., Vercel).

### Data Fetching

```bash
npm run fetch          # Fetch news
npm run fetch:papers   # Fetch papers
npm run fetch:all      # Fetch everything
npm run fetch:schedule # Scheduled fetching (every 4h)
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

> The app automatically uses Supabase when SQLite is not available (serverless environments).

### Supabase Setup

1. Create a project on [supabase.com](https://supabase.com)
2. Run `scripts/create-tables.sql` in the SQL editor
3. Add Supabase credentials to environment variables

## Architecture

```
src/
├── app/                  # Pages & API routes (Next.js App Router)
│   ├── api/              # RESTful API endpoints
│   ├── news/             # News listing
│   ├── papers/           # Papers listing
│   ├── providers/        # AI provider directory
│   ├── favorites/        # Bookmarked items
│   ├── feed/[id]/        # Custom module feeds
│   └── settings/         # Configuration dashboard
├── components/           # React components
├── lib/                  # Core logic (database, queries)
├── i18n/                 # Internationalization (zh/en)
└── types/                # TypeScript interfaces

scripts/
├── engine.mjs            # News fetching engine
├── fetch-papers.mjs      # arXiv paper fetcher
├── fetchers/             # Modular fetch strategies
└── create-tables.sql     # Database schema
```

### Data Flow

```
RSS Feeds / Web / arXiv
        │
        ▼
  Fetch Engine (scripts/)
        │
        ▼
  SQLite (local) ──sync──▶ Supabase (cloud)
        │                        │
        ▼                        ▼
  Dev Server              Vercel Production
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |
| `npm run fetch` | Fetch news once |
| `npm run fetch:papers` | Fetch papers once |
| `npm run fetch:all` | Fetch everything |
| `npm run fetch:schedule` | Scheduled fetching (every 4h) |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

[MIT License](LICENSE)
