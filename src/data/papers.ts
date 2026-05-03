export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  abstract: string;
  abstractEn: string;
  links: { label: string; url: string }[];
}

export const papers: Paper[] = [
  {
    id: "paper-1",
    title: "DeepSeek-V4: Hybrid Attention for Million-Token Efficiency",
    authors: ["DeepSeek AI"],
    venue: "arXiv 2026",
    date: "2026-04-24",
    abstract: "提出混合注意力机制（CSA + HCA），在百万 token 上下文下仅需 27% 的推理算力和 10% 的 KV 缓存，大幅提升长上下文推理效率。",
    abstractEn: "Proposes hybrid attention (CSA + HCA) achieving 27% inference FLOPs and 10% KV cache at 1M context, dramatically improving long-context efficiency.",
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com/deepseek-ai" },
    ],
  },
  {
    id: "paper-2",
    title: "GPT-5.5: From Language Models to Autonomous Agents",
    authors: ["OpenAI Research"],
    venue: "arXiv 2026",
    date: "2026-04-24",
    abstract: "介绍 GPT-5.5 如何从被动语言模型转变为主动 Agent 系统，能够在最少指令下跨应用执行复杂任务。",
    abstractEn: "Describes GPT-5.5's evolution from passive language model to proactive agent system capable of executing complex cross-application tasks with minimal instruction.",
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
    ],
  },
  {
    id: "paper-3",
    title: "Gemini 3.1 Pro: Reasoning at Scale with ARC-AGI-2",
    authors: ["Google DeepMind"],
    venue: "arXiv 2026",
    date: "2026-04-01",
    abstract: "Gemini 3.1 Pro 在 ARC-AGI-2 推理基准中达到 77.1%，论文详细分析了其多步骤 Agent 工作流的推理优化策略。",
    abstractEn: "Gemini 3.1 Pro achieves 77.1% on ARC-AGI-2, with detailed analysis of reasoning optimization strategies for complex multi-step agentic workflows.",
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
    ],
  },
  {
    id: "paper-4",
    title: "Qwen3 Technical Report: Multilingual LLM at Scale",
    authors: ["Alibaba Cloud"],
    venue: "arXiv 2026",
    date: "2026-04-05",
    abstract: "Qwen3 全系列技术报告，从 0.6B 到 235B，详述多语言预训练（119 种语言）、推理优化和开源策略。",
    abstractEn: "Full technical report for Qwen3 series (0.6B to 235B), detailing multilingual pretraining (119 languages), inference optimization, and open-source strategy.",
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com/QwenLM" },
    ],
  },
  {
    id: "paper-5",
    title: "Claude Mythos: Autonomous Zero-Day Vulnerability Discovery",
    authors: ["Anthropic Research"],
    venue: "Anthropic 2026",
    date: "2026-04-07",
    abstract: "介绍 Claude Mythos 如何自主发现数千个零日漏洞，包括存在 27 年的 OpenBSD 漏洞，探讨 AI 在网络安全中的前沿应用。",
    abstractEn: "Describes how Claude Mythos autonomously discovered thousands of zero-day vulnerabilities including 27-year-old OpenBSD bugs, exploring frontier AI applications in cybersecurity.",
    links: [
      { label: "Paper", url: "https://anthropic.com/research" },
    ],
  },
  {
    id: "paper-6",
    title: "Scaling Agentic AI: Reliable Multi-Step Task Execution in 2026",
    authors: ["R. Chen", "A. Kumar", "J. Williams"],
    venue: "ICML 2026",
    date: "2026-03-20",
    abstract: "综述 2026 年 AI Agent 技术进展，分析规划验证、自我纠错和多步骤任务执行的可靠性提升策略。",
    abstractEn: "Surveys 2026 advances in AI agents, analyzing planning verification, self-correction, and reliability improvements for multi-step task execution.",
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com" },
    ],
  },
  {
    id: "paper-7",
    title: "LLaMA 4: Mixture-of-Experts for Open Multimodal AI",
    authors: ["Meta AI Research"],
    venue: "arXiv 2026",
    date: "2026-03-15",
    abstract: "Meta LLaMA 4 系列技术报告，首次采用 MoE 架构，Scout（10M 上下文）和 Maverick（128 专家）在多模态基准中全面领先。",
    abstractEn: "Technical report for Meta LLaMA 4 series, the first to use MoE architecture. Scout (10M context) and Maverick (128 experts) lead across multimodal benchmarks.",
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com/meta-llama" },
    ],
  },
  {
    id: "paper-8",
    title: "GLM-5: Open-Source Agentic Coding at Frontier Scale",
    authors: ["Zhipu AI"],
    venue: "arXiv 2026",
    date: "2026-02-11",
    abstract: "智谱 GLM-5 技术报告，在编码与 Agent 能力上达到开源 SOTA，首个面向视觉编程的原生多模态 Coding 基座模型。",
    abstractEn: "Technical report for GLM-5, achieving open-source SOTA in coding and agent capabilities, the first native multimodal coding foundation model for visual programming.",
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com/THUDM" },
    ],
  },
];
