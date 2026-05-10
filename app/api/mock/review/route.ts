import { NextResponse } from "next/server";
import { mockCodeReview } from "@/lib/mockAI";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { code?: string; language?: string };
  const payload = mockCodeReview(body.code ?? "", body.language ?? "typescript");
  return NextResponse.json(payload);
}
