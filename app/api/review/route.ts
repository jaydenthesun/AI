import { NextResponse } from "next/server";
import { runLiveCodeReview } from "@/lib/ai/reviewPipeline";
import { mockCodeReview } from "@/lib/mockAI";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { code?: string; language?: string };

  const code = body.code ?? "";
  const language = body.language ?? "typescript";

  if (process.env.CLOD_API_KEY) {
    try {
      const result = await runLiveCodeReview(code, language);
      const { notes, ...payload } = result;
      return NextResponse.json({ ...payload, mode: "live" as const, notes });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Review pipeline failed";
      console.error("[api/review]", message);
      return NextResponse.json({
        ...mockCodeReview(code, language),
        mode: "fallback_mock" as const,
        warning: message,
      });
    }
  }

  return NextResponse.json({
    ...mockCodeReview(code, language),
    mode: "mock" as const,
    hint: "Set CLOD_API_KEY for Clōd reviews; add Greptile env vars for repo-aware context.",
  });
}
