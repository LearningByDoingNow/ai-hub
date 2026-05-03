<p align="center">
  <img src="public/logo-transparent.png" alt="AI Hub" width="200" />
</p>

<h1 align="center">AI Hub</h1>

<p align="center">
  <strong>Your all-in-one AI industry intelligence platform</strong>
</p>

<p align="center">
  Track AI companies, aggregate news, follow research papers, and chat with an AI assistant — all in one place.
</p>

<p align="center">
  <a href="#features">Features</a> &bull;
  <a href="#demo">Demo</a> &bull;
  <a href="#getting-started">Getting Started</a> &bull;
  <a href="#deployment">Deployment</a> &bull;
  <a href="#architecture">Architecture</a> &bull;
  <a href="#contributing">Contributing</a>
</p>

---

## Features

- **AI Provider Directory** — Browse 100+ AI companies with category/region filtering
- **News Aggregation** — Auto-fetch from RSS feeds and web scraping with AI keyword filtering
- **Paper Tracking** — Follow cutting-edge research from arXiv
- **AI Chat Assistant** — Built-in chat powered by any OpenAI-compatible API, with `@mention` article context
- **Custom Modules** — Create personalized feeds by binding sources to modules
- **Favorites** — Bookmark news and papers for later reading
- **Full-text Search** — Search across all content types
- **Pipeline Control** — Manual or scheduled (every 4h via GitHub Actions) data fetching
- **i18n** — Chinese and English interface
- **Dark / Light Theme** — Automatic theme switching

## Demo

**Live:** [ai-hub-zeta-ten.vercel.app](https://ai-hub-zeta-ten.vercel.app)

<!-- Add screenshots here -->
<!-- ![Home](docs/screenshots/home.png) -->

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Database | SQLite (local) / Supabase (cloud) |
| Data Pipeline | RSS Parser, Cheerio, arXiv API |
| AI Chat | OpenAI-compatible API (OpenRouter, DeepSeek, etc.) |
| Scheduling | GitHub Actions (auto-fetch every 4h) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/LearningByDoingNow/ai-hub.git
cd ai-hub

# Install dependencies
npm install

# Initialize the database (SQLite, zero-config)
node scripts/seed-sqlite.mjs

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root directory:

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

> **Note:** SQLite works out of the box for local development. Supabase is only needed for cloud deployment (e.g., Vercel).

### Data Fetching

```bash
# Fetch news from all enabled sources
npm run fetch

# Fetch papers from arXiv
npm run fetch:papers

# Fetch everything
npm run fetch:all

# Run scheduled fetching (every 4 hours)
npm run fetch:schedule
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

> The app automatically uses Supabase when SQLite is not available (serverless environments).

### Supabase Setup

1. Create a new project on [supabase.com](https://supabase.com)
2. Run `scripts/create-tables.sql` in the SQL editor to create the schema
3. Add your Supabase credentials to `.env.local` or Vercel environment variables

### GitHub Actions

The workflow in `.github/workflows/fetch.yml` runs every 4 hours to fetch new data and auto-commits to the repo. No additional configuration needed.

## Architecture

```
src/
├── app/                  # Pages & API routes (Next.js App Router)
│   ├── api/              # RESTful API endpoints
│   ├── news/             # News listing page
│   ├── papers/           # Papers listing page
│   ├── providers/        # AI companies directory
│   ├── favorites/        # Bookmarked items
│   ├── feed/[id]/        # Custom module feeds
│   └── settings/         # Configuration dashboard
├── components/           # Reusable React components
│   ├── ChatWidget.tsx    # AI chat with streaming & @mentions
│   └── settings/         # Settings panel components
├── lib/                  # Core logic
│   ├── db.ts             # Database abstraction (SQLite + Supabase)
│   ├── sqlite.ts         # SQLite operations
│   ├── queries.ts        # Server-side data queries
│   └── supabase/         # Supabase client setup
├── i18n/                 # Internationalization (zh/en)
└── types/                # TypeScript interfaces

scripts/
├── engine.mjs            # News fetching engine (RSS + scraping)
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
  Next.js Dev Server      Vercel Production
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
| `npm run fetch:all` | Fetch news + papers |
| `npm run fetch:schedule` | Start scheduled fetching (every 4h) |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
