import { NextResponse } from "next/server";
import { mockTeacherScore, runTeacherScore } from "@/lib/ai/teacherScorePipeline";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    submission?: string;
    assignmentTitle?: string;
    studentName?: string;
    rubric?: string;
  };

  const submission = typeof body.submission === "string" ? body.submission : "";
  if (!submission.trim()) {
    return NextResponse.json({ error: "submission is required" }, { status: 400 });
  }

  const assignmentTitle = typeof body.assignmentTitle === "string" ? body.assignmentTitle : undefined;
  const studentName = typeof body.studentName === "string" ? body.studentName : undefined;
  const rubric = typeof body.rubric === "string" ? body.rubric : undefined;

  if (process.env.CLOD_API_KEY) {
    try {
      const result = await runTeacherScore({ submission, assignmentTitle, studentName, rubric });
      return NextResponse.json({ ...result, mode: "live" as const });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Scoring failed";
      console.error("[api/teacher/score]", message);
      return NextResponse.json({
        ...mockTeacherScore(submission),
        mode: "fallback_heuristic" as const,
        warning: message,
      });
    }
  }

  return NextResponse.json({
    ...mockTeacherScore(submission),
    mode: "heuristic" as const,
    hint: "Set CLOD_API_KEY for AI-aligned scores.",
  });
}
