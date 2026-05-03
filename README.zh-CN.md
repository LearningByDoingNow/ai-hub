<p align="center">
  <img src="public/logo-transparent.png" alt="AI Hub" width="200" />
</p>

<h1 align="center">AI Hub</h1>

<p align="center">
  <strong>一站式 AI 行业情报平台</strong>
</p>

<p align="center">
  追踪 AI 公司动态、聚合行业资讯、关注前沿论文、内置 AI 对话助手。
</p>

<p align="center">
  <a href="https://ai-hub-zeta-ten.vercel.app">在线演示</a> &bull;
  <a href="./README.md">English</a>
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
    <img src="docs/screenshots/home.png" alt="AI Hub 首页" width="800" />
  </a>
</p>

---

## 功能特性

- **AI 产品导航** — 浏览 100+ AI 公司，支持分类/地区筛选
- **AI 资讯聚合** — 自动从 RSS、网页抓取 AI 新闻，AI 关键词过滤
- **论文追踪** — 追踪 arXiv 前沿研究论文
- **国际时政** — 聚合全球主流媒体国际新闻
- **AI 聊天助手** — 内置 AI 对话，支持 `@提及` 引用文章内容
- **自定义模块** — 创建个性化订阅源组合
- **收藏夹** — 收藏新闻和论文
- **全文搜索** — 跨内容类型搜索
- **数据管线** — 手动或定时（每 4 小时 GitHub Actions）抓取数据
- **中英双语** — 界面支持中文和英文切换
- **深色/浅色主题** — 自动主题切换

<details>
<summary>更多截图</summary>

| 新闻页 | 设置页 |
|--------|--------|
| ![News](docs/screenshots/news.png) | 管线控制、模块管理、数据源、LLM 配置 |

</details>

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 16 (App Router, Turbopack) |
| 语言 | TypeScript 5 |
| UI | React 19 + Tailwind CSS 4 |
| 数据库 | SQLite（本地）/ Supabase（云端） |
| 数据管线 | RSS Parser + Cheerio + arXiv API |
| AI 对话 | OpenAI 兼容 API（OpenRouter、DeepSeek 等） |
| 定时任务 | GitHub Actions（每 4 小时） |
| 部署 | Vercel |

## 快速开始

### 环境要求

- Node.js >= 20
- npm 或 pnpm

### 安装

```bash
git clone https://github.com/LearningByDoingNow/ai-hub.git
cd ai-hub
npm install
node scripts/seed-sqlite.mjs   # 初始化数据库
npm run dev                     # 启动开发服务器
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

### 环境变量

创建 `.env.local` 文件：

```env
# LLM 配置（AI 对话功能需要）
LLM_BASE_URL=https://openrouter.ai/api/v1
LLM_API_KEY=your-api-key
LLM_MODEL=deepseek/deepseek-chat-v3-0324:free

# 可选：Supabase（云端部署需要）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> **提示：** 本地开发 SQLite 开箱即用，Supabase 仅在云端部署（如 Vercel）时需要。

### 数据抓取

```bash
npm run fetch          # 抓取新闻
npm run fetch:papers   # 抓取论文
npm run fetch:all      # 全部抓取
npm run fetch:schedule # 定时抓取（每 4 小时）
```

## 部署

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入仓库
3. 添加环境变量：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`
4. 部署

> 当 SQLite 不可用时（serverless 环境），应用自动切换到 Supabase。

### Supabase 配置

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `scripts/create-tables.sql`
3. 配置环境变量

## 项目结构

```
src/
├── app/                  # 页面 & API 路由（Next.js App Router）
│   ├── api/              # RESTful API
│   ├── news/             # 新闻页
│   ├── papers/           # 论文页
│   ├── providers/        # AI 产品目录
│   ├── favorites/        # 收藏
│   ├── feed/[id]/        # 自定义模块
│   └── settings/         # 设置面板
├── components/           # React 组件
├── lib/                  # 核心逻辑（数据库、查询）
├── i18n/                 # 国际化（中文/英文）
└── types/                # TypeScript 类型

scripts/
├── engine.mjs            # 新闻抓取引擎
├── fetch-papers.mjs      # arXiv 论文抓取
├── fetchers/             # 模块化抓取策略
└── create-tables.sql     # 数据库建表
```

### 数据流

```
RSS / 网页 / arXiv
       │
       ▼
 抓取引擎 (scripts/)
       │
       ▼
 SQLite (本地) ──同步──▶ Supabase (云端)
       │                       │
       ▼                       ▼
 本地开发服务器          Vercel 生产环境
```

## 可用脚本

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 生产构建 |
| `npm run start` | 运行生产服务器 |
| `npm run lint` | 运行 ESLint |
| `npm run fetch` | 抓取新闻 |
| `npm run fetch:papers` | 抓取论文 |
| `npm run fetch:all` | 全部抓取 |
| `npm run fetch:schedule` | 定时抓取（每 4 小时） |

## 参与贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feat/amazing-feature`)
5. 发起 Pull Request

## 许可证

[MIT License](LICENSE)
