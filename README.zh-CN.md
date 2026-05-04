<p align="center">
  <img src="public/logo-transparent.png" alt="AI Hub" width="120" />
</p>

<h1 align="center">AI Hub</h1>

<p align="center">
  <strong>AI 驱动的全球信息聚合平台</strong><br/>
  <sub>智能聚合全球优质信息源，覆盖科技、学术、国际时政等多领域，让你一站掌握全局动态</sub>
</p>

<p align="center">
  <a href="#快速开始">快速开始</a> |
  <a href="#核心功能">功能介绍</a> |
  <a href="#桌面组件">桌面组件</a> |
  <a href="docs/TECHNICAL.md">技术文档</a> |
  <a href="docs/USER_GUIDE.md">使用指南</a> |
  <a href="README.md">English</a>
</p>

---

## 项目简介

AI Hub 自动聚合 **70+ 全球优质信息源**的内容，涵盖 AI 科技、学术论文、国际时政等领域。提供现代化 WebUI 和原生 macOS 桌面组件，共享同一数据引擎。

**两种使用方式：**
- **WebUI** — 功能完整的网页界面（搜索、设置、AI 对话、收藏等）
- **桌面组件** — 轻量浮动组件（实时通知、AI 对话、设置）

两者共享相同数据库和配置，可单独使用也可配合使用。

---

## 核心功能

### 智能聚合引擎
- **70+ 精选数据源** — OpenAI、DeepMind、TechCrunch、BBC、金融时报、arXiv 等
- **智能过滤** — AI 相关性检测、7 天时效性窗口、去重
- **并行抓取** — 所有源并发请求，30 秒截止，全部完成仅需 ~8 秒
- **定时自动抓取** — 任意间隔（1 分钟到数小时），后台静默运行

### WebUI 网页端
- **动态首页** — 实时统计、模块导航带数字
- **多模块支持** — AI 资讯、论文追踪、国际时政、AI 产品导航（支持自定义模块）
- **全文搜索** — 每个模块页面都有即时搜索
- **AI 助手** — 流式输出、@ 引用文章、Markdown 渲染、了解平台所有功能
- **精确时间** — 文章发布时间 + 相对时间双显示
- **时效性色彩** — 越新的文章颜色越鲜明
- **暗黑模式** — 完整明/暗主题切换
- **中英双语** — 界面完整支持中英文

### 桌面组件 (macOS)
- **浮动 Logo** — 置顶+轨道粒子+彩虹光环+星光特效
- **实时通知** — 新文章自动弹出 toast 卡片
- **卡片列表** — 点击展开，点击外部收起
- **AI 对话** — 流式输出+@引用（WebUI 在线时流式，离线时本地调用）
- **设置面板** — LLM 配置、抓取间隔、手动抓取
- **数据共享** — 和 WebUI 使用同一数据库

### AI 产品导航
- **59 家 AI 公司** — OpenAI、Anthropic、Google、Meta、NVIDIA、DeepSeek、Mistral 等
- **9 大分类** — 大模型、AI 助手、AI 编程、AI 绘画、AI 视频、AI 音频、AI 搜索、AI 基础设施、AI 机器人
- **直达链接** — 官网、API 控制台、文档、体验地址

---

## 快速开始

### 环境要求
- **Node.js** 18+（推荐 20+）
- **npm** 9+

### 安装

```bash
git clone https://github.com/LearningByDoingNow/ai-hub.git
cd ai-hub
npm install        # 安装依赖 + 自动初始化数据库和默认数据源
```

### 配置 LLM（可选，用于 AI 对话）

```bash
cp .env.example .env.local
# 编辑 .env.local 填入你的 LLM API 密钥
```

支持任何 OpenAI 兼容 API（OpenAI、智谱、DeepSeek、Ollama 等）

### 运行

```bash
npm run fetch:all  # 首次抓取（从 70+ 源拉取数据，约 8 秒）
npm run dev        # 启动 WebUI http://localhost:3000
```

打开 http://localhost:3000 即可使用。

---

## 桌面组件

### 从源码构建（需要 Rust）

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh  # 安装 Rust
npm run desktop:install
npm run desktop:build
```

### 安装 DMG

从 [GitHub Releases](https://github.com/LearningByDoingNow/ai-hub/releases) 下载，拖入应用程序即可。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 网页端 | Next.js 16, React 19, Tailwind CSS 4 |
| 桌面端 | Tauri 2, Rust, React, Vite |
| 数据库 | SQLite (better-sqlite3) WAL 模式 |
| AI 对话 | OpenAI 兼容 API, SSE 流式 |
| 数据抓取 | rss-parser, 并行+截止时间 |

---

## 文档

- **[技术文档](docs/TECHNICAL.md)** — 架构设计、数据库 Schema、API 参考
- **[使用指南](docs/USER_GUIDE.md)** — 功能详解、配置说明、常见问题

---

## 许可证

[MIT](LICENSE)
