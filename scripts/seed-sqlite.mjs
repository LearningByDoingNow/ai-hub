import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, "../data/ai-hub.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS providers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL,
    category TEXT NOT NULL, country TEXT NOT NULL,
    links TEXT NOT NULL DEFAULT '[]', tags TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS news (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, title_en TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL, date TEXT NOT NULL, summary TEXT NOT NULL,
    summary_en TEXT NOT NULL DEFAULT '', url TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS papers (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, authors TEXT NOT NULL DEFAULT '[]',
    venue TEXT NOT NULL DEFAULT '', date TEXT NOT NULL, abstract TEXT NOT NULL,
    abstract_en TEXT NOT NULL DEFAULT '', links TEXT NOT NULL DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS pipeline_config (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS pipeline_runs (
    id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))), task_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'running', items_processed INTEGER DEFAULT 0,
    error_message TEXT, started_at TEXT DEFAULT (datetime('now')), completed_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_news_date ON news(date DESC);
  CREATE INDEX IF NOT EXISTS idx_papers_date ON papers(date DESC);
  CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
  CREATE INDEX IF NOT EXISTS idx_providers_country ON providers(country);
`);

const insertProvider = db.prepare(`INSERT OR REPLACE INTO providers (id, name, description, category, country, links, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`);
const insertNews = db.prepare(`INSERT OR REPLACE INTO news (id, title, title_en, source, date, summary, summary_en, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
const insertPaper = db.prepare(`INSERT OR REPLACE INTO papers (id, title, authors, venue, date, abstract, abstract_en, links) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

// --- Providers ---
const providers = [
  { id: "openai", name: "OpenAI", description: "GPT 系列大模型，ChatGPT 对话助手", category: "大模型", country: "国外", links: [{ label: "官网", url: "https://openai.com" }, { label: "ChatGPT", url: "https://chat.openai.com" }, { label: "开放平台", url: "https://platform.openai.com" }, { label: "文档", url: "https://platform.openai.com/docs" }], tags: ["GPT-5.5", "GPT-5.4", "Codex", "DALL·E", "Sora"] },
  { id: "anthropic", name: "Anthropic", description: "Claude 系列大模型与 AI 安全研究", category: "大模型", country: "国外", links: [{ label: "官网", url: "https://www.anthropic.com" }, { label: "Claude", url: "https://claude.ai" }, { label: "开放平台", url: "https://console.anthropic.com" }, { label: "文档", url: "https://docs.anthropic.com" }], tags: ["Claude Opus 4.7", "Claude Sonnet 4.6", "Claude Haiku 4.5"] },
  { id: "google", name: "Google DeepMind", description: "Gemini 系列大模型", category: "大模型", country: "国外", links: [{ label: "官网", url: "https://deepmind.google" }, { label: "Gemini", url: "https://gemini.google.com" }, { label: "AI Studio", url: "https://aistudio.google.com" }, { label: "文档", url: "https://ai.google.dev/docs" }], tags: ["Gemini 3.1 Pro", "Gemini 3 Flash", "Gemma", "Veo"] },
  { id: "meta", name: "Meta AI", description: "LLaMA 开源大模型系列", category: "大模型", country: "国外", links: [{ label: "官网", url: "https://ai.meta.com" }, { label: "Meta AI", url: "https://www.meta.ai" }, { label: "LLaMA", url: "https://llama.meta.com" }, { label: "文档", url: "https://llama.meta.com/docs" }], tags: ["LLaMA 4 Scout", "LLaMA 4 Maverick", "开源"] },
  { id: "mistral", name: "Mistral AI", description: "欧洲领先的大模型公司，融资 $2.9B", category: "大模型", country: "国外", links: [{ label: "官网", url: "https://mistral.ai" }, { label: "Le Chat", url: "https://chat.mistral.ai" }, { label: "开放平台", url: "https://console.mistral.ai" }, { label: "文档", url: "https://docs.mistral.ai" }], tags: ["Mistral Large 3", "Mixtral", "开源"] },
  { id: "xai", name: "xAI", description: "Grok 系列大模型", category: "大模型", country: "国外", links: [{ label: "官网", url: "https://x.ai" }, { label: "Grok", url: "https://grok.com" }, { label: "开放平台", url: "https://console.x.ai" }, { label: "文档", url: "https://docs.x.ai" }], tags: ["Grok 4.3", "Grok 4.20", "100万上下文"] },
  { id: "microsoft", name: "Microsoft Azure AI", description: "Azure 云上的 AI 服务与模型托管", category: "AI 基础设施", country: "国外", links: [{ label: "官网", url: "https://azure.microsoft.com/en-us/products/ai-services" }, { label: "Copilot", url: "https://copilot.microsoft.com" }, { label: "Azure AI Studio", url: "https://ai.azure.com" }, { label: "文档", url: "https://learn.microsoft.com/en-us/azure/ai-services" }], tags: ["Copilot", "Azure OpenAI", "Phi-4"] },
  { id: "github-copilot", name: "GitHub Copilot", description: "AI 编程助手", category: "AI 编程", country: "国外", links: [{ label: "官网", url: "https://github.com/features/copilot" }, { label: "文档", url: "https://docs.github.com/en/copilot" }], tags: ["代码补全", "编程助手", "Agent"] },
  { id: "cursor", name: "Cursor", description: "AI 驱动的代码编辑器，月活突破千万", category: "AI 编程", country: "国外", links: [{ label: "官网", url: "https://cursor.com" }, { label: "文档", url: "https://docs.cursor.com" }], tags: ["IDE", "代码编辑", "Agent"] },
  { id: "claude-code", name: "Claude Code", description: "Anthropic 的终端 AI 编程工具", category: "AI 编程", country: "国外", links: [{ label: "官网", url: "https://docs.anthropic.com/en/docs/claude-code" }, { label: "GitHub", url: "https://github.com/anthropics/claude-code" }], tags: ["CLI", "终端", "Agentic Coding"] },
  { id: "windsurf", name: "Windsurf", description: "AI 编程 IDE（原 Codeium）", category: "AI 编程", country: "国外", links: [{ label: "官网", url: "https://windsurf.com" }, { label: "文档", url: "https://docs.windsurf.com" }], tags: ["IDE", "Cascade", "Agent"] },
  { id: "midjourney", name: "Midjourney", description: "AI 图像生成", category: "AI 绘画", country: "国外", links: [{ label: "官网", url: "https://www.midjourney.com" }, { label: "文档", url: "https://docs.midjourney.com" }], tags: ["V6", "图像生成", "艺术创作"] },
  { id: "stability", name: "Stability AI", description: "Stable Diffusion 开源图像生成模型", category: "AI 绘画", country: "国外", links: [{ label: "官网", url: "https://stability.ai" }, { label: "开放平台", url: "https://platform.stability.ai" }, { label: "文档", url: "https://platform.stability.ai/docs" }], tags: ["Stable Diffusion 3", "SDXL", "开源"] },
  { id: "blackforestlabs", name: "Black Forest Labs", description: "FLUX 图像生成模型，估值 $3.25B", category: "AI 绘画", country: "国外", links: [{ label: "官网", url: "https://blackforestlabs.ai" }], tags: ["FLUX", "图像生成", "开源"] },
  { id: "runway", name: "Runway", description: "AI 视频生成与编辑", category: "AI 视频", country: "国外", links: [{ label: "官网", url: "https://runwayml.com" }, { label: "文档", url: "https://docs.runwayml.com" }], tags: ["Gen-3 Alpha", "视频生成"] },
  { id: "pika", name: "Pika", description: "AI 视频生成平台", category: "AI 视频", country: "国外", links: [{ label: "官网", url: "https://pika.art" }], tags: ["视频生成", "特效"] },
  { id: "elevenlabs", name: "ElevenLabs", description: "AI 语音合成与克隆", category: "AI 音频", country: "国外", links: [{ label: "官网", url: "https://elevenlabs.io" }, { label: "开放平台", url: "https://elevenlabs.io/developers" }, { label: "文档", url: "https://elevenlabs.io/docs" }], tags: ["语音合成", "语音克隆", "TTS"] },
  { id: "suno", name: "Suno", description: "AI 音乐生成", category: "AI 音频", country: "国外", links: [{ label: "官网", url: "https://suno.com" }], tags: ["音乐生成", "歌曲创作"] },
  { id: "perplexity", name: "Perplexity", description: "AI 搜索引擎，ARR 超 $330M", category: "AI 搜索", country: "国外", links: [{ label: "官网", url: "https://www.perplexity.ai" }, { label: "开放平台", url: "https://docs.perplexity.ai" }], tags: ["AI 搜索", "问答", "Sonar"] },
  { id: "huggingface", name: "Hugging Face", description: "AI 模型社区与托管平台", category: "AI 基础设施", country: "国外", links: [{ label: "官网", url: "https://huggingface.co" }, { label: "模型库", url: "https://huggingface.co/models" }, { label: "文档", url: "https://huggingface.co/docs" }], tags: ["模型托管", "Transformers", "开源社区"] },
  { id: "replicate", name: "Replicate", description: "云端运行开源 AI 模型", category: "AI 基础设施", country: "国外", links: [{ label: "官网", url: "https://replicate.com" }, { label: "文档", url: "https://replicate.com/docs" }], tags: ["模型托管", "API"] },
  { id: "openrouter", name: "OpenRouter", description: "统一 API 访问多家 LLM 模型", category: "AI 基础设施", country: "国外", links: [{ label: "官网", url: "https://openrouter.ai" }, { label: "文档", url: "https://openrouter.ai/docs" }], tags: ["API 聚合", "模型路由"] },
  { id: "skild", name: "Skild AI", description: "通用机器人基础模型，估值 $14B", category: "AI 机器人", country: "国外", links: [{ label: "官网", url: "https://www.skild.ai" }], tags: ["机器人", "基础模型", "具身智能"] },
  { id: "wayve", name: "Wayve", description: "自动驾驶具身 AI，融资 $1.2B", category: "AI 机器人", country: "国外", links: [{ label: "官网", url: "https://wayve.ai" }], tags: ["自动驾驶", "具身 AI"] },
  { id: "deepseek", name: "DeepSeek（深度求索）", description: "DeepSeek 系列开源大模型", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.deepseek.com" }, { label: "对话", url: "https://chat.deepseek.com" }, { label: "开放平台", url: "https://platform.deepseek.com" }, { label: "文档", url: "https://api-docs.deepseek.com" }], tags: ["DeepSeek-V4-Pro", "DeepSeek-V4-Flash", "100万上下文", "开源"] },
  { id: "zhipu", name: "智谱 AI", description: "GLM 系列大模型，智谱清言对话助手", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.zhipuai.cn" }, { label: "智谱清言", url: "https://chatglm.cn" }, { label: "开放平台", url: "https://open.bigmodel.cn" }, { label: "文档", url: "https://open.bigmodel.cn/dev/api" }], tags: ["GLM-5", "Agent 模型", "视觉编程"] },
  { id: "baidu", name: "百度文心", description: "文心一言大模型与 AI 开发平台", category: "大模型", country: "国内", links: [{ label: "文心一言", url: "https://yiyan.baidu.com" }, { label: "千帆平台", url: "https://qianfan.cloud.baidu.com" }, { label: "文档", url: "https://cloud.baidu.com/doc/WENXINWORKSHOP" }], tags: ["文心 5.0", "ERNIE"] },
  { id: "alibaba", name: "阿里通义", description: "通义千问 Qwen 大模型系列", category: "大模型", country: "国内", links: [{ label: "通义千问", url: "https://tongyi.aliyun.com" }, { label: "模型广场", url: "https://modelscope.cn" }, { label: "百炼平台", url: "https://bailian.console.aliyun.com" }, { label: "文档", url: "https://help.aliyun.com/zh/model-studio" }], tags: ["Qwen3", "119种语言", "开源"] },
  { id: "moonshot", name: "月之暗面 Moonshot", description: "Kimi 智能助手，估值突破 $100亿", category: "AI 助手", country: "国内", links: [{ label: "Kimi", url: "https://kimi.moonshot.cn" }, { label: "开放平台", url: "https://platform.moonshot.cn" }, { label: "文档", url: "https://platform.moonshot.cn/docs" }], tags: ["Kimi K2.5", "Kimi Claw", "长上下文"] },
  { id: "minimax", name: "MiniMax", description: "海螺 AI，Agent 原生设计模型", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.minimaxi.com" }, { label: "海螺 AI", url: "https://hailuoai.com" }, { label: "开放平台", url: "https://platform.minimaxi.com" }, { label: "文档", url: "https://platform.minimaxi.com/document" }], tags: ["M2.5", "Agent", "视频生成"] },
  { id: "baichuan", name: "百川智能", description: "百川大模型", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.baichuan-ai.com" }, { label: "百小应", url: "https://ying.baichuan-ai.com" }, { label: "开放平台", url: "https://platform.baichuan-ai.com" }, { label: "文档", url: "https://platform.baichuan-ai.com/docs" }], tags: ["Baichuan", "百小应"] },
  { id: "stepfun", name: "阶跃星辰", description: "Step 系列大模型", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.stepfun.com" }, { label: "跃问", url: "https://yuewen.cn" }, { label: "开放平台", url: "https://platform.stepfun.com" }, { label: "文档", url: "https://platform.stepfun.com/docs" }], tags: ["Step-3", "跃问"] },
  { id: "doubao", name: "字节豆包", description: "豆包大模型与 AI 助手", category: "AI 助手", country: "国内", links: [{ label: "豆包", url: "https://www.doubao.com" }, { label: "火山引擎", url: "https://www.volcengine.com/product/doubao" }, { label: "文档", url: "https://www.volcengine.com/docs/82379" }], tags: ["豆包", "火山引擎", "Seed"] },
  { id: "iflytek", name: "科大讯飞", description: "讯飞星火大模型，全国产算力", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.iflytek.com" }, { label: "星火", url: "https://xinghuo.xfyun.cn" }, { label: "开放平台", url: "https://www.xfyun.cn" }, { label: "文档", url: "https://www.xfyun.cn/doc" }], tags: ["星火 X2", "语音识别", "国产算力"] },
  { id: "sensetime", name: "商汤科技", description: "日日新大模型与 AI 平台", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.sensetime.com" }, { label: "商量", url: "https://chat.sensetime.com" }, { label: "开放平台", url: "https://platform.sensenova.cn" }, { label: "文档", url: "https://platform.sensenova.cn/doc" }], tags: ["日日新 5.5", "商量", "SenseNova"] },
  { id: "01ai", name: "零一万物", description: "Yi 系列开源大模型", category: "大模型", country: "国内", links: [{ label: "官网", url: "https://www.01.ai" }, { label: "万知", url: "https://www.wanzhi.com" }, { label: "开放平台", url: "https://platform.01.ai" }, { label: "文档", url: "https://platform.01.ai/docs" }], tags: ["Yi-Lightning", "开源"] },
  { id: "zhihu-zhihai", name: "知乎直答", description: "知乎 AI 搜索与问答", category: "AI 搜索", country: "国内", links: [{ label: "知乎直答", url: "https://zhida.zhihu.com" }], tags: ["AI 搜索", "知识问答"] },
  { id: "tiangong", name: "天工 AI", description: "昆仑万维旗下 AI 搜索与助手", category: "AI 搜索", country: "国内", links: [{ label: "天工", url: "https://www.tiangong.cn" }], tags: ["AI 搜索", "天工大模型"] },
];

const news = [
  { id: "news-1", title: "美国国防部与七大科技公司签署 AI 协议，Anthropic 被排除在外", title_en: "Pentagon Signs AI Deal with 7 Tech Giants, Anthropic Excluded", source: "Reuters", date: "2026-05-02", summary: "美国国防部宣布与 OpenAI、Google、Microsoft、Nvidia、Amazon、SpaceX 和 Reflection 签署 AI 协议。Anthropic 因坚持安全护栏要求被列入黑名单。", summary_en: "The Department of Defense announced agreements with OpenAI, Google, Microsoft, Nvidia, Amazon, SpaceX and Reflection. Anthropic was excluded over its insistence on safety guardrails.", url: "https://example.com/news/pentagon-ai" },
  { id: "news-2", title: "xAI 发布 Grok 4.3，百万上下文窗口，价格降低 40%", title_en: "xAI Releases Grok 4.3 with 1M Context Window, 40% Price Cut", source: "TechCrunch", date: "2026-04-30", summary: "xAI 发布最新旗舰模型 Grok 4.3，推理能力作为永久激活状态，支持 100 万 token 上下文窗口和原生视频输入。", summary_en: "xAI releases Grok 4.3 with reasoning as a permanent active state, 1M token context window, and native video input support.", url: "https://example.com/news/grok-43" },
  { id: "news-3", title: "DeepSeek-V4 系列开源发布，百万上下文仅需 27% 推理算力", title_en: "DeepSeek-V4 Series Open-Sourced with 73% Inference Cost Reduction", source: "机器之心", date: "2026-04-24", summary: "深度求索发布 DeepSeek-V4-Pro（1.6T 参数）和 V4-Flash（284B 参数），通过混合注意力机制大幅降低推理成本。", summary_en: "DeepSeek releases V4-Pro (1.6T params) and V4-Flash (284B params), achieving major inference cost reduction through hybrid attention.", url: "https://example.com/news/deepseek-v4" },
  { id: "news-4", title: "OpenAI GPT-5.5 发布，从被动语言模型转向主动 Agent 系统", title_en: "OpenAI GPT-5.5 Released, Shifting from Passive LLM to Proactive Agent", source: "The Verge", date: "2026-04-24", summary: "OpenAI 发布 GPT-5.5，标志着从被动语言模型向主动 Agent 驱动系统的转变。", summary_en: "OpenAI releases GPT-5.5, representing a shift from passive language models to proactive agent-driven systems.", url: "https://example.com/news/gpt55" },
  { id: "news-5", title: "Anthropic 发布 Claude Opus 4.7，图像分辨率提升 3 倍", title_en: "Anthropic Releases Claude Opus 4.7, 3x Image Resolution Boost", source: "Anthropic Blog", date: "2026-04-16", summary: "Anthropic 发布 Claude Opus 4.7，在 Agentic Coding 方面实现跨越式提升。", summary_en: "Anthropic releases Claude Opus 4.7 with a step-change improvement in agentic coding.", url: "https://example.com/news/opus47" },
  { id: "news-6", title: "阿里通义千问 Qwen3 系列全面开源，支持 119 种语言", title_en: "Alibaba Open-Sources Full Qwen3 Series, Supporting 119 Languages", source: "量子位", date: "2026-04-05", summary: "阿里云正式开源 Qwen3 全系列模型（0.6B-235B），支持 119 种语言。", summary_en: "Alibaba Cloud fully open-sources Qwen3 series (0.6B-235B), supporting 119 languages.", url: "https://example.com/news/qwen3" },
  { id: "news-7", title: "Gemini 3.1 Pro 发布，ARC-AGI-2 得分 77.1%", title_en: "Gemini 3.1 Pro Released, Scoring 77.1% on ARC-AGI-2", source: "Google Blog", date: "2026-04-01", summary: "Google 发布 Gemini 3.1 Pro，在 ARC-AGI-2 推理基准中取得 77.1% 的最高分。", summary_en: "Google releases Gemini 3.1 Pro, achieving the highest reasoning score of 77.1% on ARC-AGI-2.", url: "https://example.com/news/gemini31" },
  { id: "news-8", title: "Mistral AI 获 €7.22 亿欧元融资，建设 13800 GPU 巴黎数据中心", title_en: "Mistral AI Raises €722M to Build 13,800-GPU Paris Data Center", source: "Financial Times", date: "2026-03-28", summary: "欧洲 AI 领头羊 Mistral AI 新增 €7.22 亿欧元融资，用于建设大规模 GPU 数据中心。", summary_en: "European AI leader Mistral AI adds €722M in funding to power a massive 13,800-GPU data center in Paris.", url: "https://example.com/news/mistral-funding" },
  { id: "news-9", title: "月之暗面估值突破 100 亿美元，Kimi K2.5 收入超过去年全年", title_en: "Moonshot Valuation Exceeds $10B, Kimi K2.5 Revenue Surpasses 2025 Total", source: "36氪", date: "2026-03-15", summary: "月之暗面在不到三年内估值暴涨超 30 倍至 100 亿美元。", summary_en: "Moonshot's valuation surges 30x in under 3 years to $10B.", url: "https://example.com/news/moonshot-10b" },
  { id: "news-10", title: "智谱发布 GLM-5 与 Agent 模型，开源 SOTA 逼近 Claude Opus", title_en: "Zhipu Releases GLM-5 and Agent Model, Open-Source SOTA Approaching Claude Opus", source: "机器之心", date: "2026-02-11", summary: "智谱 AI 发布 GLM-5，在 Coding 与 Agent 能力上达到开源 SOTA。", summary_en: "Zhipu AI releases GLM-5 with SOTA open-source Coding and Agent capabilities.", url: "https://example.com/news/glm5" },
];

const papers = [
  { id: "paper-1", title: "DeepSeek-V4: Hybrid Attention for Million-Token Efficiency", authors: ["DeepSeek AI"], venue: "arXiv 2026", date: "2026-04-24", abstract: "提出混合注意力机制，在百万 token 上下文下仅需 27% 的推理算力。", abstract_en: "Proposes hybrid attention achieving 27% inference FLOPs at 1M context.", links: [{ label: "arXiv", url: "https://arxiv.org" }, { label: "GitHub", url: "https://github.com/deepseek-ai" }] },
  { id: "paper-2", title: "GPT-5.5: From Language Models to Autonomous Agents", authors: ["OpenAI Research"], venue: "arXiv 2026", date: "2026-04-24", abstract: "介绍 GPT-5.5 如何从被动语言模型转变为主动 Agent 系统。", abstract_en: "Describes GPT-5.5's evolution from passive language model to proactive agent system.", links: [{ label: "arXiv", url: "https://arxiv.org" }, { label: "PDF", url: "https://arxiv.org" }] },
  { id: "paper-3", title: "Gemini 3.1 Pro: Reasoning at Scale with ARC-AGI-2", authors: ["Google DeepMind"], venue: "arXiv 2026", date: "2026-04-01", abstract: "Gemini 3.1 Pro 在 ARC-AGI-2 推理基准中达到 77.1%。", abstract_en: "Gemini 3.1 Pro achieves 77.1% on ARC-AGI-2.", links: [{ label: "arXiv", url: "https://arxiv.org" }, { label: "PDF", url: "https://arxiv.org" }] },
  { id: "paper-4", title: "Qwen3 Technical Report: Multilingual LLM at Scale", authors: ["Alibaba Cloud"], venue: "arXiv 2026", date: "2026-04-05", abstract: "Qwen3 全系列技术报告，支持 119 种语言。", abstract_en: "Full technical report for Qwen3 series supporting 119 languages.", links: [{ label: "arXiv", url: "https://arxiv.org" }, { label: "GitHub", url: "https://github.com/QwenLM" }] },
  { id: "paper-5", title: "Claude Mythos: Autonomous Zero-Day Vulnerability Discovery", authors: ["Anthropic Research"], venue: "Anthropic 2026", date: "2026-04-07", abstract: "Claude Mythos 自主发现数千个零日漏洞。", abstract_en: "Claude Mythos autonomously discovered thousands of zero-day vulnerabilities.", links: [{ label: "Paper", url: "https://anthropic.com/research" }] },
  { id: "paper-6", title: "Scaling Agentic AI: Reliable Multi-Step Task Execution in 2026", authors: ["R. Chen", "A. Kumar", "J. Williams"], venue: "ICML 2026", date: "2026-03-20", abstract: "综述 2026 年 AI Agent 技术进展。", abstract_en: "Surveys 2026 advances in AI agents.", links: [{ label: "arXiv", url: "https://arxiv.org" }, { label: "GitHub", url: "https://github.com" }] },
  { id: "paper-7", title: "LLaMA 4: Mixture-of-Experts for Open Multimodal AI", authors: ["Meta AI Research"], venue: "arXiv 2026", date: "2026-03-15", abstract: "Meta LLaMA 4 系列首次采用 MoE 架构。", abstract_en: "Meta LLaMA 4 series, the first to use MoE architecture.", links: [{ label: "arXiv", url: "https://arxiv.org" }, { label: "GitHub", url: "https://github.com/meta-llama" }] },
  { id: "paper-8", title: "GLM-5: Open-Source Agentic Coding at Frontier Scale", authors: ["Zhipu AI"], venue: "arXiv 2026", date: "2026-02-11", abstract: "智谱 GLM-5 在编码与 Agent 能力上达到开源 SOTA。", abstract_en: "GLM-5 achieves open-source SOTA in coding and agent capabilities.", links: [{ label: "arXiv", url: "https://arxiv.org" }, { label: "GitHub", url: "https://github.com/THUDM" }] },
];

// Seed data
console.log("Seeding SQLite database...");

const seedProviders = db.transaction(() => {
  for (const p of providers) {
    insertProvider.run(p.id, p.name, p.description, p.category, p.country, JSON.stringify(p.links), JSON.stringify(p.tags));
  }
});
seedProviders();
console.log(`  ✓ ${providers.length} providers`);

const seedNews = db.transaction(() => {
  for (const n of news) {
    insertNews.run(n.id, n.title, n.title_en, n.source, n.date, n.summary, n.summary_en, n.url);
  }
});
seedNews();
console.log(`  ✓ ${news.length} news items`);

const seedPapers = db.transaction(() => {
  for (const p of papers) {
    insertPaper.run(p.id, p.title, JSON.stringify(p.authors), p.venue, p.date, p.abstract, p.abstract_en, JSON.stringify(p.links));
  }
});
seedPapers();
console.log(`  ✓ ${papers.length} papers`);

db.close();
console.log(`Done! Database at: ${dbPath}`);
