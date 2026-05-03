export interface NewsItem {
  id: string;
  title: string;
  titleEn: string;
  source: string;
  date: string;
  summary: string;
  summaryEn: string;
  url: string;
}

export const newsItems: NewsItem[] = [
  {
    id: "news-1",
    title: "美国国防部与七大科技公司签署 AI 协议，Anthropic 被排除在外",
    titleEn: "Pentagon Signs AI Deal with 7 Tech Giants, Anthropic Excluded",
    source: "Reuters",
    date: "2026-05-02",
    summary: "美国国防部宣布与 OpenAI、Google、Microsoft、Nvidia、Amazon、SpaceX 和 Reflection 签署 AI 协议，允许在机密网络中使用其 AI 工具。Anthropic 因坚持安全护栏要求被列入黑名单。",
    summaryEn: "The Department of Defense announced agreements with OpenAI, Google, Microsoft, Nvidia, Amazon, SpaceX and Reflection to use their AI tools in classified networks. Anthropic was excluded over its insistence on safety guardrails.",
    url: "https://example.com/news/pentagon-ai",
  },
  {
    id: "news-2",
    title: "xAI 发布 Grok 4.3，百万上下文窗口，价格降低 40%",
    titleEn: "xAI Releases Grok 4.3 with 1M Context Window, 40% Price Cut",
    source: "TechCrunch",
    date: "2026-04-30",
    summary: "xAI 发布最新旗舰模型 Grok 4.3，推理能力作为永久激活状态，支持 100 万 token 上下文窗口和原生视频输入，定价大幅降低。",
    summaryEn: "xAI releases Grok 4.3 with reasoning as a permanent active state, 1M token context window, native video input support, and significantly reduced pricing.",
    url: "https://example.com/news/grok-43",
  },
  {
    id: "news-3",
    title: "DeepSeek-V4 系列开源发布，百万上下文仅需 27% 推理算力",
    titleEn: "DeepSeek-V4 Series Open-Sourced with 73% Inference Cost Reduction",
    source: "机器之心",
    date: "2026-04-24",
    summary: "深度求索发布 DeepSeek-V4-Pro（1.6T 参数）和 V4-Flash（284B 参数），通过混合注意力机制在百万上下文下仅需 27% 的推理算力和 10% 的 KV 缓存。",
    summaryEn: "DeepSeek releases V4-Pro (1.6T params) and V4-Flash (284B params), achieving 73% inference cost reduction and 90% KV cache savings at 1M context through hybrid attention.",
    url: "https://example.com/news/deepseek-v4",
  },
  {
    id: "news-4",
    title: "OpenAI GPT-5.5 发布，从被动语言模型转向主动 Agent 系统",
    titleEn: "OpenAI GPT-5.5 Released, Shifting from Passive LLM to Proactive Agent",
    source: "The Verge",
    date: "2026-04-24",
    summary: "OpenAI 发布 GPT-5.5 和 GPT-5.5 Pro，标志着从被动语言模型向主动 Agent 驱动系统的转变，在编码、计算机控制和商业场景中大幅提升。",
    summaryEn: "OpenAI releases GPT-5.5, representing a shift from passive language models to proactive agent-driven systems with major improvements in coding, computer control, and business use cases.",
    url: "https://example.com/news/gpt55",
  },
  {
    id: "news-5",
    title: "Anthropic 发布 Claude Opus 4.7，图像分辨率提升 3 倍",
    titleEn: "Anthropic Releases Claude Opus 4.7, 3x Image Resolution Boost",
    source: "Anthropic Blog",
    date: "2026-04-16",
    summary: "Anthropic 发布 Claude Opus 4.7，在 Agentic Coding 方面实现跨越式提升，视觉分辨率达到 3.75 百万像素，使视觉能力真正达到专业级。",
    summaryEn: "Anthropic releases Claude Opus 4.7 with a step-change improvement in agentic coding and 3.75 megapixel vision resolution, making visual capabilities genuinely professional-grade.",
    url: "https://example.com/news/opus47",
  },
  {
    id: "news-6",
    title: "阿里通义千问 Qwen3 系列全面开源，支持 119 种语言",
    titleEn: "Alibaba Open-Sources Full Qwen3 Series, Supporting 119 Languages",
    source: "量子位",
    date: "2026-04-05",
    summary: "阿里云正式开源 Qwen3 全系列模型（0.6B-235B），支持 119 种语言，在推理、编码和多语言理解方面多项基准领先。",
    summaryEn: "Alibaba Cloud fully open-sources Qwen3 series (0.6B-235B), supporting 119 languages and leading across multiple reasoning, coding, and multilingual benchmarks.",
    url: "https://example.com/news/qwen3",
  },
  {
    id: "news-7",
    title: "Gemini 3.1 Pro 发布，ARC-AGI-2 得分 77.1%",
    titleEn: "Gemini 3.1 Pro Released, Scoring 77.1% on ARC-AGI-2",
    source: "Google Blog",
    date: "2026-04-01",
    summary: "Google 发布 Gemini 3.1 Pro，在 ARC-AGI-2 推理基准中取得 77.1% 的最高分，为复杂多步骤 Agent 工作流进行了深度优化。",
    summaryEn: "Google releases Gemini 3.1 Pro, achieving the highest reasoning score of 77.1% on ARC-AGI-2, optimized for complex multi-step agentic workflows.",
    url: "https://example.com/news/gemini31",
  },
  {
    id: "news-8",
    title: "Mistral AI 获 €7.22 亿欧元融资，建设 13800 GPU 巴黎数据中心",
    titleEn: "Mistral AI Raises €722M to Build 13,800-GPU Paris Data Center",
    source: "Financial Times",
    date: "2026-03-28",
    summary: "欧洲 AI 领头羊 Mistral AI 新增 €7.22 亿欧元融资和 $8.3 亿美元债务融资，用于建设位于巴黎的大规模 GPU 数据中心。",
    summaryEn: "European AI leader Mistral AI adds €722M in funding and an $830M debt facility to power a massive 13,800-GPU data center in Paris.",
    url: "https://example.com/news/mistral-funding",
  },
  {
    id: "news-9",
    title: "月之暗面估值突破 100 亿美元，Kimi K2.5 收入超过去年全年",
    titleEn: "Moonshot Valuation Exceeds $10B, Kimi K2.5 Revenue Surpasses 2025 Total",
    source: "36氪",
    date: "2026-03-15",
    summary: "月之暗面在不到三年内估值暴涨超 30 倍至 100 亿美元，Kimi K2.5 发布不到一个月，累计收入已超过 2025 年全年总收入。",
    summaryEn: "Moonshot's valuation surges 30x in under 3 years to $10B. Kimi K2.5's revenue in under a month exceeded the company's entire 2025 revenue.",
    url: "https://example.com/news/moonshot-10b",
  },
  {
    id: "news-10",
    title: "智谱发布 GLM-5 与 Agent 模型，开源 SOTA 逼近 Claude Opus",
    titleEn: "Zhipu Releases GLM-5 and Agent Model, Open-Source SOTA Approaching Claude Opus",
    source: "机器之心",
    date: "2026-02-11",
    summary: "智谱 AI 发布新一代旗舰模型 GLM-5，在 Coding 与 Agent 能力上达到开源 SOTA，真实编程体感逼近 Claude Opus 4.5。",
    summaryEn: "Zhipu AI releases GLM-5 with SOTA open-source Coding and Agent capabilities, approaching Claude Opus 4.5 in real-world programming experience.",
    url: "https://example.com/news/glm5",
  },
];
