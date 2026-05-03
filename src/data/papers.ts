export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  abstract: string;
  abstractEn: string;
  tags: string[];
  links: { label: string; url: string }[];
}

export const papers: Paper[] = [
  {
    id: "paper-1",
    title: "Scaling Laws for Neural Language Models: Beyond Chinchilla",
    authors: ["J. Smith", "A. Chen", "M. Patel"],
    venue: "arXiv 2025",
    date: "2025-04-26",
    abstract: "本文重新审视了大语言模型的缩放定律，发现在数据质量和混合精度训练的优化下，最优的模型规模与数据比例需要重新评估。",
    abstractEn: "This paper revisits scaling laws for large language models, finding that optimal model size-to-data ratios need reassessment under data quality optimization and mixed-precision training.",
    tags: ["Scaling Laws", "LLM", "Training"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
    ],
  },
  {
    id: "paper-2",
    title: "RLHF 2.0: Direct Preference Optimization at Scale",
    authors: ["L. Wang", "K. Zhou", "R. Davis"],
    venue: "ICML 2025",
    date: "2025-04-22",
    abstract: "提出了一种改进的直接偏好优化方法 DPO-v2，在大规模人类反馈数据集上的对齐效果显著优于标准 RLHF，同时训练成本降低 60%。",
    abstractEn: "Proposes DPO-v2, an improved direct preference optimization method that significantly outperforms standard RLHF on large-scale human feedback datasets while reducing training costs by 60%.",
    tags: ["RLHF", "Alignment", "DPO"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com" },
    ],
  },
  {
    id: "paper-3",
    title: "Efficient Inference for Mixture-of-Experts Models",
    authors: ["Y. Liu", "T. Brown", "S. Kim"],
    venue: "NeurIPS 2025",
    date: "2025-04-18",
    abstract: "提出了一种新的 MoE 推理优化方案，通过动态专家路由和内存共享策略，将 MoE 模型的推理延迟降低 3 倍。",
    abstractEn: "Proposes a new MoE inference optimization through dynamic expert routing and memory sharing, reducing MoE model inference latency by 3x.",
    tags: ["MoE", "Inference", "Efficiency"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com" },
    ],
  },
  {
    id: "paper-4",
    title: "Vision-Language Models: A Comprehensive Survey 2025",
    authors: ["X. Zhang", "H. Li", "W. Chen", "F. Müller"],
    venue: "arXiv 2025",
    date: "2025-04-14",
    abstract: "全面综述 2024-2025 年视觉语言模型的发展，涵盖架构创新、训练策略、应用场景和未来研究方向。",
    abstractEn: "A comprehensive survey of vision-language model developments in 2024-2025, covering architectural innovations, training strategies, applications, and future research directions.",
    tags: ["VLM", "Multimodal", "Survey"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
    ],
  },
  {
    id: "paper-5",
    title: "Chain-of-Thought Reasoning: When and Why It Works",
    authors: ["M. Johnson", "C. Park", "D. Nakamura"],
    venue: "ACL 2025",
    date: "2025-04-10",
    abstract: "系统性分析了思维链推理在不同任务类型上的效果差异，揭示了 CoT 有效的必要条件和失效场景。",
    abstractEn: "Systematically analyzes the effectiveness of chain-of-thought reasoning across different task types, revealing necessary conditions for CoT success and failure scenarios.",
    tags: ["CoT", "Reasoning", "Analysis"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
    ],
  },
  {
    id: "paper-6",
    title: "Agentic AI: Building Reliable Multi-Step Task Execution",
    authors: ["R. Chen", "A. Kumar", "J. Williams"],
    venue: "arXiv 2025",
    date: "2025-04-06",
    abstract: "提出了一个可靠的 AI Agent 框架，通过规划验证和自我纠错机制，显著提升了多步骤任务的完成率和可靠性。",
    abstractEn: "Proposes a reliable AI agent framework that significantly improves multi-step task completion rates and reliability through planning verification and self-correction mechanisms.",
    tags: ["Agent", "Planning", "Reliability"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "GitHub", url: "https://github.com" },
    ],
  },
  {
    id: "paper-7",
    title: "Quantization-Aware Training for Sub-4-Bit LLMs",
    authors: ["P. Gonzalez", "N. Tanaka", "E. Osei"],
    venue: "EMNLP 2025",
    date: "2025-04-02",
    abstract: "提出了一种新的量化感知训练方法，使大语言模型在 3-bit 量化下仅损失 2% 的性能，显著降低部署成本。",
    abstractEn: "Proposes a novel quantization-aware training method that enables LLMs to retain 98% performance at 3-bit quantization, significantly reducing deployment costs.",
    tags: ["Quantization", "Compression", "Deployment"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
    ],
  },
  {
    id: "paper-8",
    title: "Safety Alignment Beyond RLHF: Constitutional AI Revisited",
    authors: ["S. Lee", "O. Anderson", "K. Yamamoto"],
    venue: "arXiv 2025",
    date: "2025-03-28",
    abstract: "在 Constitutional AI 基础上提出改进框架，通过多层安全约束和对抗性训练，有效减少大模型的有害输出和幻觉问题。",
    abstractEn: "Builds upon Constitutional AI with an improved framework that effectively reduces harmful outputs and hallucinations through multi-layer safety constraints and adversarial training.",
    tags: ["Safety", "Alignment", "Constitutional AI"],
    links: [
      { label: "arXiv", url: "https://arxiv.org" },
      { label: "PDF", url: "https://arxiv.org" },
    ],
  },
];
