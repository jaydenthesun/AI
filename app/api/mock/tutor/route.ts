import { NextResponse } from "next/server";
import { mockTutorReply } from "@/lib/mockAI";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    topic?: string;
    question?: string;
    learningStyles?: string[];
    codingLevel?: "beginner" | "intermediate" | "advanced";
  };

  const reply = mockTutorReply(body.topic ?? "Foundations", {
    question: body.question ?? "",
    learningStyles: (body.learningStyles as never) ?? ["visual"],
    codingLevel: body.codingLevel ?? "intermediate",
  });

  return NextResponse.json(reply);
}
