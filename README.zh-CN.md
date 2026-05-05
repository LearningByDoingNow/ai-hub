<p align="center">
  <img src="docs/screenshots_new/home_0.png" alt="AI Hub" width="100%" />
</p>

<p align="center">
  <strong>AI 驱动的全球信息聚合平台</strong><br/>
  <sub>智能聚合全球优质信息源，覆盖科技、学术、国际时政等多领域，让你一站掌握全局动态</sub>
</p>

<p align="center">
  <a href="https://learningbydoingnow.github.io/ai-hub/">在线预览</a><sup>*</sup> |
  <a href="#快速开始">快速开始</a> |
  <a href="#核心功能">功能介绍</a> |
  <a href="#桌面组件">桌面组件</a> |
  <a href="docs/TECHNICAL.md">技术文档</a> |
  <a href="docs/USER_GUIDE.md">使用指南</a> |
  <a href="README.md">English</a>
</p>

<sub>* 在线预览仅为简略功能演示（只读），不包含 AI 对话、设置管理、定时抓取等完整功能。体验所有功能请 clone 本地运行。</sub>

---

## 项目简介

AI Hub 自动聚合 **77+ 全球优质信息源**的内容，涵盖 AI 科技、学术论文、国际时政等领域。提供现代化 WebUI 和原生 macOS 桌面组件，共享同一数据引擎和数据库。

**两种使用方式：**
- **WebUI** — 功能完整的网页界面（搜索、过滤、收藏、设置、AI 对话）
- **桌面组件** — 轻量浮动组件（实时通知、收藏、AI 助手）

两者共享相同数据库 — 收藏、已读状态、数据源配置实时同步。

---

## 核心功能

### 智能聚合引擎
- **77+ 精选数据源** — OpenAI、DeepMind、TechCrunch、BBC、金融时报、arXiv 等
- **智能过滤** — AI 相关性检测、7 天时效性窗口、去重
- **并行抓取** — 所有源并发请求，30 秒截止，全部完成仅需 ~8 秒
- **定时自动抓取** — 任意间隔（1 分钟到数小时），后台静默运行

---

### WebUI 网页端

#### 首页
暗色主题仪表盘，包含统计概览、最新资讯、近期论文和精选 AI 产品。

<img src="docs/screenshots_new/home_1.png" alt="首页 - 资讯" width="100%" />

<img src="docs/screenshots_new/home_2.png" alt="首页 - 论文" width="100%" />

<img src="docs/screenshots_new/home_3.png" alt="首页 - 产品" width="100%" />

#### AI 资讯聚合
实时聚合顶级 AI 信息源，支持来源分类过滤（Twitter、微信、RSS）和搜索。

<img src="docs/screenshots_new/ai-news.gif" alt="AI 资讯演示" width="100%" />

#### 论文追踪
追踪 arXiv 最新论文（cs.AI、cs.LG、cs.CL、cs.CV），直达论文和 PDF 链接。

<img src="docs/screenshots_new/paper.png" alt="论文追踪" width="100%" />

#### 国际时政
BBC、金融时报、纽约时报、路透社、卫报等全球新闻覆盖，支持来源过滤。

<img src="docs/screenshots_new/worldnews.png" alt="国际时政" width="100%" />

#### AI 产品导航
浏览 59+ AI 公司，9 大分类，直达官网、API 和文档。

<img src="docs/screenshots_new/ai-product.gif" alt="AI 产品导航演示" width="100%" />

#### 收藏夹
统一收藏系统，WebUI 与桌面组件共享 — 跨端管理你的书签。

<img src="docs/screenshots_new/shoucang.png" alt="收藏夹" width="100%" />

#### 设置与配置

完整的设置面板，5 个标签页：

| 标签页 | 说明 |
|--------|------|
| 数据抓取 | 一键抓取、定时抓取间隔、最近抓取记录 |
| 模块管理 | 创建/编辑内容模块（AI 资讯、论文、国际时政等） |
| 数据源 | 管理 77+ RSS 数据源，指定所属模块 |
| 产品管理 | AI 产品导航的增删改查 |
| LLM 配置 | 快速选择预设（OpenAI、Anthropic、DeepSeek、GLM 等） |

<img src="docs/screenshots_new/setting_0.png" alt="设置 - 数据抓取" width="100%" />
<img src="docs/screenshots_new/setting_module_2.png" alt="设置 - 模块管理" width="100%" />
<img src="docs/screenshots_new/setting_datasource_3.png" alt="设置 - 数据源" width="100%" />
<img src="docs/screenshots_new/setting_product_4.png" alt="设置 - 产品管理" width="100%" />
<img src="docs/screenshots_new/setting_llmconfig_5.png" alt="设置 - LLM 配置" width="100%" />

<details>
<summary><strong>数据抓取演示</strong></summary>
<img src="docs/screenshots_new/setting-fetch.gif" alt="数据抓取演示" width="100%" />
</details>

<details>
<summary><strong>LLM 配置演示</strong></summary>
<img src="docs/screenshots_new/setting-llm.gif" alt="LLM 配置演示" width="100%" />
</details>

---

### 桌面组件 (macOS)

原生浮动组件，常驻桌面，随时可用。

<table>
<tr>
<td width="50%">
<strong>展开卡片列表</strong><br/>
<img src="docs/screenshots_new/desktop_1.png" alt="桌面组件" width="100%" />
<br/><sub>已读标记、收藏、来源过滤、关闭卡片</sub>
</td>
<td width="50%">
<strong>桌面全景</strong><br/>
<img src="docs/screenshots_new/desktop_2.png" alt="全景" width="100%" />
<br/><sub>组件 + AI 对话 + 设置并排使用</sub>
</td>
</tr>
</table>

<img src="docs/screenshots_new/desktop-demo.gif" alt="桌面组件演示" width="100%" />

**组件功能：**
- 浮动 Logo 粒子特效 — 点击展开
- 来源分类过滤标签（全部、Twitter、微信、RSS、国际时政）
- 已读追踪（重启后保留）
- 收藏功能（与 WebUI 同步）
- 逐条关闭或一键清空
- AI 对话助手（流式输出）
- 设置面板（LLM 配置）
- 拖拽移动位置，拖拽底部调整高度

---

## 快速开始

### 环境要求

| 依赖 | 版本 | 用途 |
|------|------|------|
| **Node.js** | 18+（推荐 20+） | WebUI + 数据抓取引擎 |
| **npm** | 9+ | 包管理 |
| **Docker** | （可选） | 微信公众号源，运行 WeWe RSS |
| **Rust** | （可选） | 编译桌面组件 |

### 1. 克隆与安装

```bash
git clone https://github.com/LearningByDoingNow/ai-hub.git
cd ai-hub
npm install        # 安装依赖 + 自动初始化 SQLite 数据库（含 77+ 预置数据源）
```

### 2. 首次数据抓取

```bash
npm run fetch:all        # 从所有 77+ 数据源抓取最新内容（约 8 秒）
```

此命令将最新内容写入本地 SQLite 数据库，随时可重新运行获取最新数据。

> **关于微信源：** 预配置的微信源（`wx-*`）需要 Docker 运行 WeWe RSS（见下方[微信公众号数据源](#微信公众号数据源wewe-rss--docker)章节）。如果未配置 Docker/WeWe RSS，这些源会静默跳过 — **其余 60+ 数据源（RSS、arXiv 等）无需 Docker 即可正常工作。** 你可以随时后续再配置微信源。

### 3. 启动 WebUI

```bash
npm run dev              # 启动开发服务器 http://localhost:3000
```

打开 http://localhost:3000 即可看到所有聚合内容。

### 4. 配置 LLM（可选 — 用于 AI 对话）

```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```env
LLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4   # 任意 OpenAI 兼容接口
LLM_API_KEY=你的API密钥
LLM_MODEL=glm-4.5-air                                # 模型名称
LLM_TEMPERATURE=0.5
```

支持的 LLM 提供商：OpenAI、Anthropic、DeepSeek、智谱 GLM、Together AI、Groq、SiliconFlow、Ollama（本地）等。

也可以直接在 WebUI 中配置：**设置 → LLM 配置**（内置快速选择预设模板）。

---

## 可用命令

### 数据抓取

| 命令 | 说明 |
|------|------|
| `npm run fetch:all` | 一次性抓取新闻 + 论文（约 8 秒） |
| `npm run fetch` | 仅抓取新闻 |
| `npm run fetch:papers` | 仅抓取 arXiv 论文 |
| `npm run fetch:schedule` | 循环模式：每 4 小时自动抓取（前台运行） |

### WebUI 网页端

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器，支持热更新（http://localhost:3000） |
| `npm run build` | 生产构建 |
| `npm run start` | 启动生产服务器 |

### 桌面组件

| 命令 | 说明 |
|------|------|
| `npm run desktop:install` | 安装桌面组件依赖 |
| `npm run desktop:dev` | 开发模式启动桌面组件（支持热更新） |
| `npm run desktop:build` | 构建 .app 和 .dmg 安装包 |

### 快速启动（全套）

打开 **3 个终端** 体验完整功能：

```bash
# 终端 1：启动 WeWe RSS（如果使用微信源）
docker start wewe-rss

# 终端 2：启动 WebUI
npm run dev

# 终端 3：启动桌面组件
npm run desktop:dev
```

最简单的单终端启动：
```bash
npm run fetch:all && npm run dev
```

### 定时抓取方式

| 方式 | 操作 |
|------|------|
| **WebUI** | 设置 → 数据抓取 → 设置间隔（如 60 分钟） |
| **桌面组件** | 设置 → 设置间隔 |
| **终端** | `npm run fetch:schedule`（每 4 小时，前台运行） |
| **系统 cron** | `crontab -e` → `0 */4 * * * cd /path/to/ai-hub && npm run fetch:all` |

---

## 微信公众号数据源（WeWe RSS + Docker）

> **此部分完全可选。** 如果你不需要微信公众号内容，可以跳过本节。其他 60+ 数据源（RSS、arXiv 等）仅需 `npm install` 即可使用，无需 Docker。

AI Hub 通过 [WeWe RSS](https://github.com/cooderl/wewe-rss) 抓取微信公众号文章。WeWe RSS 是一个**独立的**开源项目，将微信订阅转换为标准 Atom 订阅源，以 Docker 容器形式在本地运行。

### 为什么需要 Docker？

微信没有官方 RSS 订阅接口。WeWe RSS 充当桥梁：
- 它运行一个 Docker 容器
- 定期扫描你配置的微信公众号
- 将文章以标准 Atom 格式暴露在 `http://localhost:4000`
- AI Hub 像抓取普通 RSS 一样抓取这些 Atom 源

### 前置条件

- 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 并确保运行中
- 一个微信账号（用于在 WeWe RSS 中授权登录）

### 部署步骤

```bash
# 第 1 步：拉取并启动 WeWe RSS 容器
docker run -d \
  --name wewe-rss \
  -p 4000:4000 \
  -e DATABASE_TYPE=sqlite \
  -e AUTH_CODE=你的授权码 \
  -v $(pwd)/wewe-data:/app/data \
  cooderl/wewe-rss:latest

# 第 2 步：确认容器在运行
docker ps | grep wewe-rss

# 第 3 步：打开管理面板
open http://localhost:4000
```

在 WeWe RSS 管理面板中：
1. 输入你设置的授权码登录
2. 用微信扫码授权
3. 搜索并添加你想关注的微信公众号

### 工作原理

```
微信公众号
    ↓ （WeWe RSS 通过授权的微信账号扫描）
WeWe RSS (Docker, localhost:4000)
    ↓ （Atom 订阅源: /feeds/MP_WXS_xxxxx.atom）
AI Hub engine.mjs（像普通 RSS 一样抓取）
    ↓
SQLite 数据库 → WebUI + 桌面组件
```

### 添加微信数据源到 AI Hub

AI Hub 已预配置 10+ 个微信源（指向 `localhost:4000`）。WeWe RSS 运行并添加公众号后，`npm run fetch:all` 即可自动抓取。

如需手动添加更多源：
1. 在 WeWe RSS 面板找到订阅地址（如 `http://localhost:4000/feeds/MP_WXS_3073282833.atom`）
2. 在 AI Hub → 设置 → 数据源 → **+ 添加数据源**：
   - 名称：`机器之心`（显示名称）
   - URL：WeWe RSS 中的订阅地址
   - 模块：选择目标模块（如"AI 资讯"或"国际时政"）

### 已预置的微信数据源

| 数据源 | 分类 |
|--------|------|
| 机器之心、新智元、智猩猩AI、36氪(微信)、电手、数字生命卡兹克 | AI 资讯 |
| 人民日报、央视军事、九万里、外军防务研究前沿 | 国际时政 |

### 日常使用

```bash
# 启动 WeWe RSS（系统重启后执行一次）
docker start wewe-rss

# 查看状态
docker ps | grep wewe-rss

# 停止（不需要时）
docker stop wewe-rss

# 查看日志（排查问题）
docker logs wewe-rss --tail 50
```

> **如果 WeWe RSS 未运行：** 微信源抓取会静默失败 — 你会看到结果少了一些，但不会报错。所有其他数据源正常工作。

---

## 桌面组件

### 开发模式运行

```bash
# 前置条件：需要安装 Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 首次运行：安装桌面组件依赖
npm run desktop:install

# 启动桌面组件（开发模式，支持热更新）
npm run desktop:dev
```

组件启动后会在桌面显示一个浮动 Logo，点击即可展开卡片列表。

> **注意：** 桌面组件和 WebUI 读取同一个 `data/ai-hub.db` 数据库。请确保至少运行过一次 `npm run fetch:all` 以获取数据。

### 构建安装包

```bash
npm run desktop:build

# 输出：
# .app → desktop/src-tauri/target/release/bundle/macos/AI Hub.app
# .dmg → desktop/src-tauri/target/release/bundle/dmg/AI Hub_0.1.0_aarch64.dmg
```

### 安装 DMG

从 [GitHub Releases](https://github.com/LearningByDoingNow/ai-hub/releases) 下载，拖入应用程序即可。

> **macOS 安全提示：** 如果提示"AI Hub 已损坏，无法打开"，在终端执行：
> ```bash
> xattr -cr /Applications/AI\ Hub.app
> ```
> 这是未签名应用的正常现象。

> **DMG 功能限制：** 独立安装包自带预装数据，可直接查看和 AI 对话。但**无法抓取新数据**（需要完整项目目录 + Node.js）。如需完整功能请 clone 仓库使用。

---

## 架构

```
ai-hub/
├── src/                  # Next.js WebUI (App Router)
│   ├── app/             # 页面 + API 路由
│   ├── components/      # React 组件
│   ├── lib/             # SQLite 查询、工具函数
│   └── i18n/            # 中英文翻译
├── desktop/              # Tauri 桌面组件
│   ├── src/             # React 前端
│   └── src-tauri/       # Rust 后端
├── scripts/              # 数据抓取引擎
│   ├── engine.mjs       # 并行抓取主引擎
│   ├── fetch-papers.mjs # arXiv 论文抓取
│   └── fetchers/        # RSS、网页、API 策略
├── data/                 # SQLite 数据库
│   └── ai-hub.db        # WebUI 和桌面组件共享
└── public/              # 静态资源
```

### 数据流

```
RSS/API 数据源 → engine.mjs (并行抓取 + 过滤)
                       ↓
              SQLite (data/ai-hub.db)
                   ↙        ↘
          Next.js WebUI    Tauri 桌面组件
              ↓                    ↓
        浏览器 (SSR)        原生 macOS 窗口
```

两端读写同一数据库 — 收藏、数据源、配置自动同步。

---

## 技术栈

| 层次 | 技术 |
|------|------|
| 网页端 | Next.js 16, React 19, Tailwind CSS 4 |
| 桌面端 | Tauri 2, Rust, React, Vite |
| 数据库 | SQLite (better-sqlite3) WAL 模式 |
| AI 对话 | OpenAI 兼容 API, SSE 流式 |
| 数据抓取 | rss-parser, 并行+截止时间 |
| 部署 | Vercel (WebUI), GitHub Releases (桌面端) |

---

## 文档

- **[技术文档](docs/TECHNICAL.md)** — 架构设计、数据库 Schema、API 参考
- **[使用指南](docs/USER_GUIDE.md)** — 功能详解、配置说明、常见问题

---

## 许可证

[MIT](LICENSE)
