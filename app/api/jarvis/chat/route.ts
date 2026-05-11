import { NextResponse } from "next/server";
import { runJarvisChat } from "@/lib/ai/jarvisPipeline";
import { getJarvisMockReply } from "@/lib/jarvisResponses";

type Hist = Array<{ role: "user" | "assistant"; content: string }>;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    pathname?: string;
    message?: string;
    history?: Hist;
  };

  const pathname = typeof body.pathname === "string" ? body.pathname : "/";
  const message = typeof body.message === "string" ? body.message : "";
  const history = Array.isArray(body.history) ? body.history.filter(isValidTurn) : [];

  if (!message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (!process.env.CLOD_API_KEY) {
    return NextResponse.json({
      reply: getJarvisMockReply(message, pathname),
      mode: "mock" as const,
      hint: "Set CLOD_API_KEY to use Clōd for Jarvis.",
    });
  }

  try {
    const reply = await runJarvisChat({
      pathname,
      userMessage: message,
      history,
    });
    return NextResponse.json({ reply, mode: "live" as const });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Jarvis request failed";
    console.error("[api/jarvis/chat]", msg);
    return NextResponse.json({
      reply: getJarvisMockReply(message, pathname),
      mode: "fallback_mock" as const,
      warning: msg,
    });
  }
}

function isValidTurn(m: unknown): m is { role: "user" | "assistant"; content: string } {
  if (!m || typeof m !== "object") return false;
  const o = m as { role?: string; content?: string };
  return (o.role === "user" || o.role === "assistant") && typeof o.content === "string";
}
