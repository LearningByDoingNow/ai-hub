"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useLocale } from "@/i18n/context";

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

export default function ChatWidget() {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // @ mention state
  const [mentionMode, setMentionMode] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<SearchItem[]>([]);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [attachedItems, setAttachedItems] = useState<SearchItem[]>([]);

  // Draggable state
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const [entrance, setEntrance] = useState(true);
  const [showTip, setShowTip] = useState(false);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const hasMoved = useRef(false);

  // Resize state
  const [size, setSize] = useState({ w: 384, h: 520 });
  const resizing = useRef(false);
  const resizeStart = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => {
    setPos({ x: window.innerWidth - 80, y: window.innerHeight * 0.62 });
    setMounted(true);
    setTimeout(() => setEntrance(false), 1500);
    if (!localStorage.getItem("ai-hub-tip-seen")) {
      setTimeout(() => setShowTip(true), 2200);
      setTimeout(() => {
        setShowTip(false);
        localStorage.setItem("ai-hub-tip-seen", "1");
      }, 12000);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Search when @ query changes
  useEffect(() => {
    if (!mentionMode || mentionQuery.length < 1) {
      setMentionResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(mentionQuery)}`);
      const data = await res.json();
      setMentionResults(data);
      setMentionIdx(0);
    }, 200);
    return () => clearTimeout(timer);
  }, [mentionQuery, mentionMode]);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setInput(val);

    // Detect @ trigger
    const lastAt = val.lastIndexOf("@");
    if (lastAt >= 0 && lastAt === val.length - 1) {
      setMentionMode(true);
      setMentionQuery("");
    } else if (mentionMode) {
      const afterAt = val.slice(val.lastIndexOf("@") + 1);
      if (val.includes("@")) {
        setMentionQuery(afterAt);
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

  function removeAttached(id: string) {
    setAttachedItems((prev) => prev.filter((i) => i.id !== id));
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
    // Append attached items as context
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
    setMessages([...messages, displayMsg]);
    setInput("");
    setAttachedItems([]);
    setLoading(true);

    // Add empty assistant message for streaming
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: `Error: ${data.error || res.status}` };
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

          // Parse SSE lines
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
            try {
              const json = JSON.parse(line.slice(6));
              const delta = json.choices?.[0]?.delta?.content
                || json.delta?.text
                || "";
              if (delta) {
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    role: "assistant",
                    content: copy[copy.length - 1].content + delta,
                  };
                  return copy;
                });
              }
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        if (copy[copy.length - 1].content === "") {
          copy[copy.length - 1] = { role: "assistant", content: "Network error" };
        }
        return copy;
      });
    }
    setLoading(false);
  }

  // Drag handlers
  function onPointerDown(e: React.PointerEvent) {
    dragging.current = true;
    hasMoved.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved.current = true;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 56, dragStart.current.px + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 56, dragStart.current.py + dy)),
    });
  }
  function onPointerUp() { dragging.current = false; }
  function handleClick() { if (!hasMoved.current) setOpen(!open); }

  if (!mounted) return null;

  return (
    <>
      {/* Floating Button with entrance animation */}
      {!open && (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={(e) => { if (showTip) { setShowTip(false); localStorage.setItem("ai-hub-tip-seen", "1"); } handleClick(); }}
          style={{ left: pos.x, top: pos.y, touchAction: "none" }}
          className={`fixed z-50 flex h-16 w-16 cursor-grab items-center justify-center active:cursor-grabbing hover:scale-110 active:scale-95 transition-all duration-700 select-none ${
            entrance ? "opacity-0 scale-50 blur-sm" : "opacity-100 scale-100 blur-0"
          }`}
        >
          {/* Sparkle ring on entrance */}
          {!entrance && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-[-8px] rounded-full animate-ping opacity-20 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" style={{ animationDuration: "2s", animationIterationCount: "3" }} />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <div
                  key={deg}
                  className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 animate-sparkle"
                  style={{
                    left: `${50 + 42 * Math.cos((deg * Math.PI) / 180)}%`,
                    top: `${50 + 42 * Math.sin((deg * Math.PI) / 180)}%`,
                    animationDelay: `${deg * 5}ms`,
                    animationDuration: "1.5s",
                    animationFillMode: "forwards",
                  }}
                />
              ))}
            </div>
          )}
          <img src="/logo-widget.png" alt="Chat" draggable={false} className="h-full w-full object-contain pointer-events-none drop-shadow-lg select-none" />

          {/* First-visit tooltip */}
          {showTip && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-xl animate-fade-in">
              <div className="font-medium">{locale === "zh" ? "👋 你好！我是 AI 助手" : "👋 Hi! I'm AI Assistant"}</div>
              <div className="text-xs text-slate-300 mt-0.5">{locale === "zh" ? "点击我开始对话，输入 @ 引用文章" : "Click to chat, type @ to reference articles"}</div>
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45" />
            </div>
          )}
        </div>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className="fixed z-50 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          style={{
            width: size.w,
            height: size.h,
            left: Math.max(8, Math.min(pos.x, window.innerWidth - size.w - 8)),
            top: Math.max(8, pos.y - size.h - 10),
          }}
        >
          {/* Resize handle — top-left corner */}
          <div
            onPointerDown={(e) => {
              resizing.current = true;
              resizeStart.current = { x: e.clientX, y: e.clientY, w: size.w, h: size.h };
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (!resizing.current) return;
              const dw = resizeStart.current.x - e.clientX;
              const dh = resizeStart.current.y - e.clientY;
              setSize({
                w: Math.max(320, Math.min(800, resizeStart.current.w + dw)),
                h: Math.max(400, Math.min(900, resizeStart.current.h + dh)),
              });
            }}
            onPointerUp={() => { resizing.current = false; }}
            style={{ touchAction: "none" }}
            className="absolute -top-1 -left-1 z-10 h-4 w-4 cursor-nw-resize"
            title="Drag to resize"
          >
            <svg className="h-4 w-4 text-slate-300 dark:text-slate-600" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="3" cy="3" r="1.5" />
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="3" cy="8" r="1.5" />
            </svg>
          </div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <img src="/logo-widget.png" alt="" className="h-8 w-8" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">AI Hub Assistant</h3>
                <p className="text-xs text-slate-400">
                  {locale === "zh" ? "输入 @ 引用文章让 AI 分析" : "Type @ to reference articles for AI analysis"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-slate-400 dark:text-slate-500 mt-6 space-y-2">
                <p>{locale === "zh" ? "👋 你好！我是 AI Hub 助手" : "👋 Hi! I'm AI Hub Assistant"}</p>
                <div className="text-xs space-y-1">
                  <p className="font-medium">{locale === "zh" ? "试试这些指令：" : "Try these:"}</p>
                  <p>@ {locale === "zh" ? "引用文章让我分析" : "Reference an article for analysis"}</p>
                  <p>{locale === "zh" ? "\"最近 AI 有什么热点？\"" : "\"What's trending in AI?\""}</p>
                  <p>{locale === "zh" ? "\"对比 GPT-5.5 和 Claude Opus 4.7\"" : "\"Compare GPT-5.5 vs Claude Opus 4.7\""}</p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2 max-w-none">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-2.5 dark:bg-slate-800">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Attached Items */}
          {attachedItems.length > 0 && (
            <div className="border-t border-slate-100 px-3 py-2 dark:border-slate-800">
              {attachedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 rounded-lg bg-blue-50 px-2 py-1 mb-1 text-xs dark:bg-blue-950/30">
                  <span className="text-blue-600 dark:text-blue-400">📎</span>
                  <span className="flex-1 truncate text-blue-700 dark:text-blue-300">{item.title}</span>
                  <button onClick={() => removeAttached(item.id)} className="text-blue-400 hover:text-red-500">×</button>
                </div>
              ))}
            </div>
          )}

          {/* @ Mention Dropdown */}
          {mentionMode && mentionResults.length > 0 && (
            <div className="absolute bottom-16 left-3 right-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              {mentionResults.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => selectMention(item)}
                  className={`w-full text-left px-3 py-2 text-sm border-b border-slate-100 last:border-0 dark:border-slate-700 ${
                    i === mentionIdx ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{item.type === "news" ? "📰" : "📄"}</span>
                    <span className="flex-1 truncate text-slate-700 dark:text-slate-200">{item.title}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{item.source} · {item.date}</div>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-slate-200 px-3 py-3 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={locale === "zh" ? "输入消息，@ 引用文章..." : "Message, @ to reference..."}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                onClick={send}
                disabled={(!input.trim() && attachedItems.length === 0) || loading}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
