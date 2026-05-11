import { clodChatCompletion } from "./clod";
import { stripMarkdownBoldMarkers } from "./formatAnswer";
import { parseJsonObject } from "./jsonExtract";

export interface TeacherScoreResult {
  score: number;
  rationale: string;
  strengths: string[];
  gaps: string[];
}

function normalizeStringList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string").map((s) => stripMarkdownBoldMarkers(s.trim()));
}

export async function runTeacherScore(params: {
  submission: string;
  assignmentTitle?: string;
  studentName?: string;
  rubric?: string;
}): Promise<TeacherScoreResult> {
  const system = [
    "You are an experienced computer science instructor grading student work fairly and consistently.",
    "Return ONE JSON object only, no markdown fences, keys exactly:",
    '{"score": number, "rationale": string, "strengths": string[], "gaps": string[]}',
    "score: integer 0-100 inclusive.",
    "rationale: 2-4 plain sentences. No markdown bold (**).",
    "strengths: 1-4 short bullet-style strings; gaps: 1-4 areas to improve.",
    params.rubric?.trim()
      ? `Apply this rubric / criteria when judging:\n${params.rubric.trim()}`
      : "Judge correctness, clarity, and completeness for introductory–intermediate CS coursework.",
  ].join("\n");

  const user = [
    params.studentName ? `Student name: ${params.studentName}` : "",
    params.assignmentTitle ? `Assignment / task label: ${params.assignmentTitle}` : "",
    "Work submitted for grading:\n---\n" + params.submission.trim().slice(0, 28000) + "\n---",
  ]
    .filter(Boolean)
    .join("\n\n");

  const raw = await clodChatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.35, maxTokens: 1800 },
  );

  let parsed: { score?: number; rationale?: string; strengths?: unknown; gaps?: unknown };
  try {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    parsed = JSON.parse(start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned) as typeof parsed;
  } catch {
    parsed = {};
  }

  const scoreNum = typeof parsed.score === "number" ? Math.round(parsed.score) : NaN;
  const score = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, scoreNum)) : 72;

  return {
    score,
    rationale: stripMarkdownBoldMarkers(
      typeof parsed.rationale === "string" ? parsed.rationale : "Graded via model output; see strengths and gaps.",
    ),
    strengths: normalizeStringList(parsed.strengths).slice(0, 4),
    gaps: normalizeStringList(parsed.gaps).slice(0, 4),
  };
}

export function mockTeacherScore(submission: string): TeacherScoreResult {
  const len = submission.trim().length;
  const base = len < 20 ? 45 : len < 120 ? 62 : 74;
  const jitter = Math.min(12, Math.floor(len / 80));
  const score = Math.max(0, Math.min(100, base + jitter));

  return {
    score,
    rationale:
      len < 30
        ? "Submission is very short; encourage fuller explanations and examples."
        : "Heuristic preview score only — set CLOD_API_KEY for model-based grading aligned to your rubric.",
    strengths: len >= 60 ? ["Shows structured thinking", "Addresses the prompt"] : ["Attempt recorded"],
    gaps: len < 80 ? ["Expand reasoning and edge cases", "Add concrete examples"] : ["Deepen analysis"],
  };
}
