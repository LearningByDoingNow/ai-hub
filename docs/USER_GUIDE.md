# User Guide / 使用指南

## Getting Started

### First Run

After `npm install`, the system automatically:
1. Creates the SQLite database
2. Initializes 4 default modules (AI News, Papers, World News, AI Products)
3. Imports 27 curated default data sources

Run your first fetch:
```bash
npm run fetch:all
```
This takes ~8 seconds and pulls the latest content from all sources.

### Configuring AI Chat

1. Copy `.env.example` to `.env.local`
2. Set your LLM API key (supports OpenAI, ZhipuAI, DeepSeek, Ollama, etc.)
3. Restart the dev server

Example for different providers:
```bash
# OpenAI
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-xxx
LLM_MODEL=gpt-4o

# ZhipuAI (智谱)
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
LLM_API_KEY=your-key
LLM_MODEL=glm-4-flash

# DeepSeek
LLM_BASE_URL=https://api.deepseek.com/v1
LLM_API_KEY=your-key
LLM_MODEL=deepseek-chat

# Ollama (local)
LLM_BASE_URL=http://localhost:11434/v1
LLM_API_KEY=ollama
LLM_MODEL=llama3
```

---

## WebUI Features

### Homepage
The homepage displays:
- **Live stats** — Data source count, total content, auto-update status
- **Module cards** — Each module with real-time content count, click to navigate
- **Latest news** — 6 most recent articles
- **Recent papers** — 4 latest research papers
- **Featured AI products** — Top 6 companies

### Browsing Content
Each module page (AI News, Papers, World News) features:
- **Search bar** — Instant filtering by title, source, summary, or author
- **Grid/List toggle** — Switch between card grid and list view
- **Time indicators** — Relative time (e.g., "3 min ago") + precise publish time
- **Freshness styling** — Newer articles have blue tint, older ones fade to white
- **Source badges** — Color-coded source labels
- **Read More** — Click to open original article

### AI Assistant
The floating chat widget (bottom-right) provides:

**Basic questions:**
- "What's the latest news?" — Covers ALL modules, not just AI
- "What are the recent papers about transformers?"
- "What can AI Hub do?" — Guides you through features

**@ Article References:**
1. Type `@` in the chat input
2. Start typing to search articles/papers
3. Select from dropdown → article attached as context
4. Ask questions like "Summarize this" or "What are the implications?"

**Tips:**
- The assistant knows about all platform features and can guide you
- It responds in the same language you use
- Shift+Enter for multiline input

### Settings (WebUI)
Access via the gear icon in the navigation bar:

- **Data Fetching** — Manual fetch button + configurable auto-fetch interval
- **Module Management** — Create/edit/delete content modules
- **Data Sources** — Add/edit RSS feeds, assign to modules
- **Product Management** — CRUD for AI company directory
- **LLM Configuration** — API endpoint, key, model, temperature

### Auto-Fetch
Set a fetch interval in Settings → Data Fetching:
- Enter minutes (e.g., `30` for every 30 minutes)
- Set `0` to disable
- Works in background while WebUI is open
- Persists across page refreshes

---

## Desktop Widget Features

### Basic Interaction
- **Click logo** — Expand/collapse card list
- **Drag logo** — Move widget anywhere on screen
- **Hover logo** — Show action buttons (AI, Settings, Clear)
- **Click outside** — Auto-collapse the list

### Toast Notifications
When new articles arrive:
- A brief toast card appears below the logo (5 seconds)
- Click to open the article in browser
- Badge count updates on logo

### Settings Panel
Click "设置" button to open settings:
- **LLM Config** — API URL, key, model, temperature
- **Fetch Interval** — Auto-fetch every N minutes
- **Manual Fetch** — "立即抓取所有数据" button

### AI Chat
Click "AI" button to open chat window:
- Type `@` to search and attach articles
- Streaming responses (when WebUI is running)
- Falls back to local API call (when WebUI is offline)
- Supports markdown in responses

---

## Adding Custom Sources

### Via WebUI Settings
1. Go to Settings → Data Sources
2. Click "Add Source"
3. Fill in:
   - **Name** — Display name
   - **URL** — RSS feed URL
   - **Type** — Usually "rss"
   - **Language** — "zh" or "en"
   - **Module** — Which module to assign to
4. Save → new source will be included in next fetch

### Finding RSS Feeds
- Most blogs have `/feed`, `/rss`, or `/atom.xml`
- YouTube channels: `https://www.youtube.com/feeds/videos.xml?channel_id=XXXXX`
- Reddit: `https://www.reddit.com/r/MachineLearning/.rss`
- Use browser extensions like "Get RSS Feed URL"

### Creating Custom Modules
1. Settings → Module Management → Add
2. Set name (Chinese + English), icon, sort order
3. Assign RSS sources to the new module
4. Module appears in navigation automatically

---

## Tips & Tricks

### Performance
- First fetch takes ~8 seconds (parallel, all sources)
- Subsequent fetches are fast (only new items inserted)
- Database stays small (~1MB for thousands of articles)
- 7-day auto-cleanup keeps content fresh

### Best Practices
- Set auto-fetch to 30-60 minutes for good balance
- Use `@` in AI chat to get article-specific analysis
- Create custom modules for niche topics (e.g., "Robotics", "Climate")
- The AI assistant can help you add sources: just ask "add a source for [topic]"

---

## FAQ

**Q: Can I use this without an LLM API key?**
A: Yes! Everything works except the AI chat feature.

**Q: How do I add Chinese news sources?**
A: Many Chinese tech sites have RSS: 36Kr (`https://36kr.com/feed`), IT Home (`https://www.ithome.com/rss/`), etc.

**Q: The desktop widget shows stale data.**
A: Make sure auto-fetch is configured, or click "立即抓取" in settings.

**Q: Can I deploy the WebUI publicly?**
A: Yes, deploy to Vercel with a Supabase database for cloud hosting.

**Q: Does it work on Windows/Linux?**
A: WebUI works everywhere. Desktop widget currently builds for macOS; Windows/Linux support can be added via Tauri's cross-platform build.
