import { invoke } from "@tauri-apps/api/core";

export interface NewsItem {
  id: string;
  title: string;
  title_en: string;
  source: string;
  date: string;
  summary: string;
  summary_en: string;
  url: string;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  date: string;
  abstract_text: string;
  abstract_en: string;
  links: string[];
}

export interface Module {
  id: string;
  name: string;
  name_en: string;
  icon: string;
  sort_order: number;
}

export async function getNews(limit: number, moduleIds?: string[]): Promise<NewsItem[]> {
  return invoke("get_news", { limit, moduleIds: moduleIds ?? [] });
}

export async function getNewsSince(since: string): Promise<NewsItem[]> {
  return invoke("get_news_since", { since });
}

export async function getPapers(limit: number): Promise<Paper[]> {
  return invoke("get_papers", { limit });
}

export async function getPapersSince(since: string): Promise<Paper[]> {
  return invoke("get_papers_since", { since });
}

export async function getModules(): Promise<Module[]> {
  return invoke("get_modules");
}

export async function chatWithLlm(messages: { role: string; content: string }[]): Promise<string> {
  return invoke("chat_with_llm", { messages });
}

export async function openInBrowser(url: string): Promise<void> {
  return invoke("open_in_browser", { url });
}

export async function openChatWindow(): Promise<void> {
  return invoke("open_chat_window");
}

export async function resizeWidget(width: number, height: number): Promise<void> {
  return invoke("resize_widget", { width, height });
}
