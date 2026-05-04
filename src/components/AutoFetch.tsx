"use client";

import { useEffect, useRef } from "react";

export default function AutoFetch() {
  const running = useRef(false);

  useEffect(() => {
    const timer = setInterval(async () => {
      const mins = parseInt(localStorage.getItem("ai-hub-fetch-interval") || "0", 10);
      if (mins <= 0 || running.current) return;

      const lastStr = localStorage.getItem("ai-hub-last-fetch") || "0";
      const last = parseInt(lastStr, 10);
      if (Date.now() - last < mins * 60 * 1000) return;

      running.current = true;
      localStorage.setItem("ai-hub-last-fetch", String(Date.now()));
      try {
        const check = await fetch("/api/pipeline/run");
        const data = await check.json();
        if (data?.running) { running.current = false; return; }
        await fetch("/api/pipeline/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task: "all" }),
        });
      } catch { /* ignore */ }
      running.current = false;
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return null;
}
