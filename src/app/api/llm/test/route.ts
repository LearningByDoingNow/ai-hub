import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const config = await req.json();
  const { apiKey, baseUrl, model, format } = config;

  if (!apiKey || !baseUrl) {
    return NextResponse.json({ ok: false, error: "API Key and Base URL are required" });
  }

  try {
    if (format === "anthropic") {
      const res = await fetch(`${baseUrl}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-sonnet-4-6",
          messages: [{ role: "user", content: "Say 'hello' in one word." }],
          max_tokens: 10,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ ok: false, error: `${res.status}: ${err.slice(0, 200)}` });
      }

      const data = await res.json();
      const reply = data.content?.[0]?.text || "";
      return NextResponse.json({ ok: true, message: `Connected! Model replied: "${reply}"` });
    }

    // OpenAI compatible format
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || "gpt-4o-mini",
        messages: [{ role: "user", content: "Say 'hello' in one word." }],
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ ok: false, error: `${res.status}: ${err.slice(0, 200)}` });
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ ok: true, message: `Connected! Model replied: "${reply}"` });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: (e as Error).message });
  }
}
