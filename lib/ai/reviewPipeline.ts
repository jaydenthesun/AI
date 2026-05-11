import type { CodeReviewResult } from "@/data/types";
import { routeTask } from "@/lib/modelRouter";
import { clodChatCompletion } from "./clod";
import { greptileQueryAboutCode } from "./greptile";
import { parseJsonObject } from "./jsonExtract";
import { stripMarkdownBoldMarkers } from "./formatAnswer";

export async function runLiveCodeReview(code: string, language: string): Promise<CodeReviewResult & { notes?: string }> {
  const decision = routeTask(3, "project_review");

  const gt = await greptileQueryAboutCode(code, language);
  const greptileBlock =
    gt.skipped || !gt.contextText.trim()
      ? ""
      : `Greptile repo-aware notes (index ${process.env.GREPTILE_REPOSITORY ?? "GREPTILE_REPOSITORY"}):\n${gt.contextText}`;

  const notes =
    gt.skipped ? "Greptile skipped — set GREPTILE_API_KEY, GREPTILE_GITHUB_TOKEN, GREPTILE_REPOSITORY." : "Greptile context attached.";

  const system = [
    "You are a rigorous senior reviewer producing structured feedback for learners.",
    decision.reason,
    greptileBlock ? "Use GREPTILE CONTEXT when it materially informs repo conventions or architecture." : "",
    "Write feedback in plain natural language. Do NOT use markdown bold (**text**); it reads artificial — normal sentences only.",
    "Return ONE JSON object ONLY (no markdown fences), keys exactly:",
    '{"score": number (0-100), "correctness": string, "readability": string, "bugs": string[], "improvements": string[], "improvedCode": string, "efficiency": string, "nextLessonId": string, "practiceRecommendations": string[]}',
    'nextLessonId must be a simple slug like "lesson-2" if unsure.',
    "bugs: concrete issues; use [] if none.",
    "improvedCode: full revised submission or clearly marked patch block. Preserve valid ** only if it is JavaScript/TypeScript exponentiation (e.g. x ** 2); otherwise avoid ** in comments.",
  ]
    .filter(Boolean)
    .join("\n");

  const user = ["Language:", language, "", "Submission:", "```", code.slice(0, 28000), "```", "", greptileBlock].join("\n");

  const raw = await clodChatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.35, maxTokens: 2800 },
  );

  const parsed = parseJsonObject<CodeReviewResult>(raw);

  const score = typeof parsed.score === "number" ? Math.max(0, Math.min(100, parsed.score)) : 72;
  const correctness = stripMarkdownBoldMarkers(
    typeof parsed.correctness === "string" ? parsed.correctness : "See narrative feedback.",
  );
  const readability = stripMarkdownBoldMarkers(
    typeof parsed.readability === "string" ? parsed.readability : "Review naming and structure.",
  );
  const bugs = Array.isArray(parsed.bugs)
    ? parsed.bugs.filter((b): b is string => typeof b === "string").map(stripMarkdownBoldMarkers)
    : [];
  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.filter((b): b is string => typeof b === "string").map(stripMarkdownBoldMarkers)
    : [];
  const improvedCode = typeof parsed.improvedCode === "string" ? parsed.improvedCode : code;
  const efficiency = stripMarkdownBoldMarkers(
    typeof parsed.efficiency === "string" ? parsed.efficiency : "Consider asymptotics and allocations.",
  );
  const nextLessonId = typeof parsed.nextLessonId === "string" ? parsed.nextLessonId : "lesson-2";
  const practiceRecommendations = Array.isArray(parsed.practiceRecommendations)
    ? parsed.practiceRecommendations.filter((b): b is string => typeof b === "string").map(stripMarkdownBoldMarkers)
    : ["Add tests for edge inputs", "Refactor for single responsibility"];

  return {
    score,
    correctness,
    readability,
    bugs,
    improvements,
    improvedCode,
    efficiency,
    nextLessonId,
    practiceRecommendations,
    notes,
  };
}
