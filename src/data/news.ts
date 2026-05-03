export interface NewsItem {
  id: string;
  title: string;
  titleEn: string;
  source: string;
  date: string;
  summary: string;
  summaryEn: string;
  tags: string[];
  url: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "news-1",
    title: "OpenAI 发布 GPT-5，多模态能力大幅提升",
    titleEn: "OpenAI Launches GPT-5 with Major Multimodal Improvements",
    source: "TechCrunch",
    date: "2025-04-28",
    summary: "OpenAI 正式发布 GPT-5 模型，在推理能力、多模态理解和代码生成方面取得显著突破，成为目前最强大的通用大模型。",
    summaryEn: "OpenAI officially releases GPT-5, achieving significant breakthroughs in reasoning, multimodal understanding, and code generation, making it the most powerful general-purpose LLM.",
    tags: ["OpenAI", "GPT-5", "大模型"],
    url: "https://example.com/news/gpt5",
  },
  {
    id: "news-2",
    title: "DeepSeek-R2 开源发布，推理能力超越 GPT-4o",
    titleEn: "DeepSeek-R2 Open-Sourced, Surpassing GPT-4o in Reasoning",
    source: "机器之心",
    date: "2025-04-25",
    summary: "深度求索发布 DeepSeek-R2 系列模型并完全开源，在数学推理和代码生成等基准测试中超越多个闭源模型。",
    summaryEn: "DeepSeek releases and fully open-sources the DeepSeek-R2 series, surpassing multiple closed-source models in math reasoning and code generation benchmarks.",
    tags: ["DeepSeek", "开源", "推理"],
    url: "https://example.com/news/deepseek-r2",
  },
  {
    id: "news-3",
    title: "欧盟 AI 法案正式实施，全球监管格局生变",
    titleEn: "EU AI Act Takes Effect, Reshaping Global Regulatory Landscape",
    source: "Reuters",
    date: "2025-04-22",
    summary: "欧盟人工智能法案正式生效，要求高风险 AI 系统必须通过审核，对全球 AI 公司的合规策略产生深远影响。",
    summaryEn: "The EU AI Act officially takes effect, requiring high-risk AI systems to pass audits, profoundly impacting compliance strategies for AI companies worldwide.",
    tags: ["监管", "欧盟", "政策"],
    url: "https://example.com/news/eu-ai-act",
  },
  {
    id: "news-4",
    title: "Anthropic Claude 4 发布，支持百万级上下文窗口",
    titleEn: "Anthropic Releases Claude 4 with Million-Token Context Window",
    source: "The Verge",
    date: "2025-04-18",
    summary: "Anthropic 发布 Claude 4 系列模型，Opus 版本支持百万 token 上下文，在长文档理解和多步推理方面表现卓越。",
    summaryEn: "Anthropic releases the Claude 4 series, with the Opus version supporting a million-token context window, excelling in long document understanding and multi-step reasoning.",
    tags: ["Anthropic", "Claude", "长上下文"],
    url: "https://example.com/news/claude4",
  },
  {
    id: "news-5",
    title: "Google Gemini 2.5 Pro 登顶多项基准测试",
    titleEn: "Google Gemini 2.5 Pro Tops Multiple Benchmarks",
    source: "Google Blog",
    date: "2025-04-15",
    summary: "Google 发布 Gemini 2.5 Pro，在编码、数学和多模态推理等多项权威基准测试中取得第一，向开发者全面开放。",
    summaryEn: "Google releases Gemini 2.5 Pro, achieving top scores across multiple authoritative benchmarks in coding, math, and multimodal reasoning, now available to all developers.",
    tags: ["Google", "Gemini", "基准测试"],
    url: "https://example.com/news/gemini25",
  },
  {
    id: "news-6",
    title: "AI 编程工具市场爆发，Cursor 用户突破千万",
    titleEn: "AI Coding Tools Market Explodes, Cursor Surpasses 10M Users",
    source: "36氪",
    date: "2025-04-12",
    summary: "AI 辅助编程工具竞争白热化，Cursor 宣布月活用户突破 1000 万，GitHub Copilot 也推出重大更新以应对挑战。",
    summaryEn: "Competition in AI coding tools intensifies as Cursor announces 10 million monthly active users, while GitHub Copilot rolls out major updates to meet the challenge.",
    tags: ["AI 编程", "Cursor", "Copilot"],
    url: "https://example.com/news/ai-coding",
  },
  {
    id: "news-7",
    title: "Mistral 发布 Large 3 模型，挑战 GPT-4 级别性能",
    titleEn: "Mistral Releases Large 3 Model, Challenging GPT-4 Level Performance",
    source: "VentureBeat",
    date: "2025-04-08",
    summary: "法国 AI 公司 Mistral 发布旗舰模型 Large 3，在欧洲语言处理方面表现尤为突出，继续领跑欧洲 AI 生态。",
    summaryEn: "French AI company Mistral releases its flagship Large 3 model, particularly excelling in European language processing, continuing to lead the European AI ecosystem.",
    tags: ["Mistral", "欧洲", "开源"],
    url: "https://example.com/news/mistral-large3",
  },
  {
    id: "news-8",
    title: "阿里通义千问 Qwen3 系列全面开源",
    titleEn: "Alibaba Open-Sources Full Qwen3 Model Series",
    source: "量子位",
    date: "2025-04-05",
    summary: "阿里云正式开源通义千问 Qwen3 全系列模型，包括 0.6B 到 235B 多种规格，支持 119 种语言，在多项基准中领先。",
    summaryEn: "Alibaba Cloud fully open-sources the Qwen3 series, ranging from 0.6B to 235B parameters, supporting 119 languages and leading across multiple benchmarks.",
    tags: ["阿里", "Qwen", "开源"],
    url: "https://example.com/news/qwen3",
  },
];
