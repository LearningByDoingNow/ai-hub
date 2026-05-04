import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { getCurrentWindow } from "@tauri-apps/api/window";

const appWindow = getCurrentWindow();
const API_BASE = "http://localhost:3000";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SearchItem {
  id: string;
  type: "news" | "paper";
  title: string;
  source: string;
  date: string;
  summary: string;
  url: string;
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const [mentionMode, setMentionMode] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<SearchItem[]>([]);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [attachedItems, setAttachedItems] = useState<SearchItem[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => { if (e.buttons === 1) appWindow.startDragging(); };
    el.addEventListener("mousedown", handler);
    return () => el.removeEventListener("mousedown", handler);
  }, []);

  // @ mention search
  useEffect(() => {
    if (!mentionMode || mentionQuery.length < 1) {
      setMentionResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(mentionQuery)}`);
        const data = await res.json();
        setMentionResults(data);
        setMentionIdx(0);
      } catch { setMentionResults([]); }
    }, 200);
    return () => clearTimeout(timer);
  }, [mentionQuery, mentionMode]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);
    const lastAt = val.lastIndexOf("@");
    if (lastAt >= 0 && lastAt === val.length - 1) {
      setMentionMode(true);
      setMentionQuery("");
    } else if (mentionMode) {
      if (val.includes("@")) {
        setMentionQuery(val.slice(val.lastIndexOf("@") + 1));
      } else {
        setMentionMode(false);
      }
    }
  }

  function selectMention(item: SearchItem) {
    const lastAt = input.lastIndexOf("@");
    setInput(input.slice(0, lastAt));
    setAttachedItems((prev) => prev.some((i) => i.id === item.id) ? prev : [...prev, item]);
    setMentionMode(false);
    setMentionResults([]);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (mentionMode && mentionResults.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIdx((i) => Math.min(i + 1, mentionResults.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setMentionIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); selectMention(mentionResults[mentionIdx]); }
      else if (e.key === "Escape") { setMentionMode(false); }
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) send();
  }

  async function send() {
    if ((!input.trim() && attachedItems.length === 0) || loading) return;

    let content = input.trim();
    if (attachedItems.length > 0) {
      const refs = attachedItems.map((item) =>
        `\n\n---\n[${item.type === "news" ? "Article" : "Paper"}] ${item.title}\nSource: ${item.source} | Date: ${item.date}\nURL: ${item.url}\nContent: ${item.summary}`
      ).join("");
      content = content + refs;
    }

    const userMsg: Message = { role: "user", content };
    const displayMsg: Message = {
      role: "user",
      content: input.trim() + (attachedItems.length > 0
        ? "\n" + attachedItems.map((i) => `📎 ${i.title}`).join("\n")
        : ""),
    };

    const newMessages = [...messages, userMsg];
    setMessages([...messages, displayMsg, { role: "assistant", content: "" }]);
    setInput("");
    setAttachedItems([]);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: res.status }));
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `错误: ${data.error || res.status}` };
          return copy;
        });
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            try {
              const json = JSON.parse(line.slice(6));
              const delta = json.choices?.[0]?.delta?.content || json.delta?.text || "";
              if (delta) {
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + delta };
                  return copy;
                });
              }
            } catch {}
          }
        }
      }
    } catch (e) {
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[copy.length - 1].content === "") {
          copy[copy.length - 1] = { role: "assistant", content: `错误: 无法连接到 AI Hub (${API_BASE})，请确保 WebUI 已启动` };
        }
        return copy;
      });
    }
    setLoading(false);
  }

  return (
    <div className="h-full flex flex-col bg-white/80 dark:bg-[#0d0f1a]/80 backdrop-blur-2xl rounded-2xl overflow-hidden border border-white/20 dark:border-white/5 shadow-2xl">
      {/* Drag bar */}
      <div ref={dragRef} className="h-7 w-full cursor-grab active:cursor-grabbing flex-shrink-0 flex items-center justify-center">
        <div className="w-8 h-1 rounded-full bg-slate-300/50 dark:bg-white/10" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pb-2">
        <div className="flex items-center gap-2">
          <img src="/logo-widget.png" alt="AI Hub" className="w-7 h-7 rounded-lg" />
          <div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-white leading-none">AI 助手</h1>
            <p className="text-[10px] text-slate-400 mt-0.5">输入 @ 引用文章让 AI 分析</p>
          </div>
        </div>
        <button onClick={() => appWindow.close()} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-3 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <img src="/logo-widget.png" alt="AI Hub" className="w-14 h-14 rounded-2xl mb-3" />
            <p className="text-xs text-slate-500 mb-3">AI Hub 智能助手</p>
            <div className="flex flex-wrap gap-1.5 justify-center max-w-[300px]">
              {["AI Hub有什么功能？", "今天有什么AI新闻？", "最新的论文有哪些？", "帮我添加一个新的数据源"].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="px-2.5 py-1.5 rounded-lg text-[11px] text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 transition-colors"
                >{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
              msg.role === "user"
                ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 rounded-br-md"
                : "bg-white/80 dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200/30 dark:border-white/5 rounded-bl-md"
            }`}>
              {msg.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 max-w-none">
                  <ReactMarkdown>{msg.content || "..."}</ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              )}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div className="flex justify-start">
            <div className="bg-white/80 dark:bg-white/5 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-200/30 dark:border-white/5">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Attached Items */}
      {attachedItems.length > 0 && (
        <div className="border-t border-slate-100 dark:border-white/5 px-3 py-2">
          {attachedItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 mb-1 text-xs">
              <span className="text-indigo-500">📎</span>
              <span className="flex-1 truncate text-indigo-700 dark:text-indigo-300">{item.title}</span>
              <button onClick={() => setAttachedItems((prev) => prev.filter((i) => i.id !== item.id))} className="text-indigo-400 hover:text-red-500">×</button>
            </div>
          ))}
        </div>
      )}

      {/* @ Mention Dropdown */}
      {mentionMode && mentionResults.length > 0 && (
        <div className="mx-3 mb-1 max-h-40 overflow-y-auto rounded-xl border border-slate-200/50 dark:border-white/10 bg-white dark:bg-slate-800 shadow-lg">
          {mentionResults.map((item, i) => (
            <button
              key={item.id}
              onClick={() => selectMention(item)}
              className={`w-full text-left px-3 py-2 text-[12px] border-b border-slate-100/50 dark:border-white/5 last:border-0 ${
                i === mentionIdx ? "bg-indigo-50 dark:bg-indigo-950/30" : "hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">{item.type === "news" ? "📰" : "📄"}</span>
                <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{item.title}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{item.source} · {item.date?.slice(0, 10)}</div>
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3">
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入问题，@ 引用文章..."
            className="flex-1 rounded-xl bg-white/60 dark:bg-white/5 px-3.5 py-2.5 text-[13px] text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none border border-slate-200/30 dark:border-white/5 focus:border-indigo-400/50 transition-colors"
          />
          <button
            onClick={send}
            disabled={loading || (!input.trim() && attachedItems.length === 0)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 hover:shadow-lg hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 transition-all flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
