import { NextResponse } from "next/server";
import type { CodingLevel, LearningStyle } from "@/data/types";
import { runLiveTutor } from "@/lib/ai/tutorPipeline";
import { mockTutorReply } from "@/lib/mockAI";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    topic?: string;
    lessonTitle?: string;
    question?: string;
    learningStyles?: LearningStyle[];
    codingLevel?: CodingLevel;
  };

  const topic = body.topic ?? "Foundations";
  const lessonTitle = body.lessonTitle?.trim();
  const question = body.question ?? "";
  const learningStyles = Array.isArray(body.learningStyles) ? body.learningStyles : (["visual"] as LearningStyle[]);
  const codingLevel = body.codingLevel ?? "intermediate";

  if (process.env.CLOD_API_KEY) {
    try {
      const reply = await runLiveTutor({
        topic,
        lessonTitle,
        question,
        learningStyles,
        codingLevel,
      });
      return NextResponse.json({ ...reply, mode: "live" as const });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Tutor pipeline failed";
      console.error("[api/tutor]", message);
      const fallback = mockTutorReply(topic, { question, learningStyles, codingLevel });
      return NextResponse.json({
        ...fallback,
        mode: "fallback_mock" as const,
        warning: message,
      });
    }
  }

  const fallback = mockTutorReply(topic, { question, learningStyles, codingLevel });
  return NextResponse.json({
    ...fallback,
    mode: "mock" as const,
    hint: "Set CLOD_API_KEY to enable live Clōd tutoring.",
  });
}
