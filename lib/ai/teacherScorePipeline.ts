import { clodChatCompletion } from "./clod";
import { stripMarkdownBoldMarkers } from "./formatAnswer";

export interface TeacherScoreResult {
  score: number;
  rationale: string;
  strengths: string[];
  gaps: string[];
}

function normalizeList(v: unknown): string[] {
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
    "You are an experienced computer science instructor grading student work fairly.",
    "Return ONE JSON object only, keys exactly:",
    '{"score": number, "rationale": string, "strengths": string[], "gaps": string[]}',
    "score: integer 0-100. rationale: 2-4 plain sentences. No markdown bold (**).",
    params.rubric?.trim()
      ? `Rubric:\n${params.rubric.trim()}`
      : "Use standard intro CS criteria: correctness, clarity, completeness.",
  ].join("\n");

  const user = [
    params.studentName ? `Student: ${params.studentName}` : "",
    params.assignmentTitle ? `Assignment: ${params.assignmentTitle}` : "",
    "Submission:\n---\n" + params.submission.trim().slice(0, 28000) + "\n---",
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
      typeof parsed.rationale === "string" ? parsed.rationale : "Graded response; see strengths and gaps.",
    ),
    strengths: normalizeList(parsed.strengths).slice(0, 4),
    gaps: normalizeList(parsed.gaps).slice(0, 4),
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
        ? "Submission is very short; encourage fuller explanations."
        : "Heuristic preview — set CLOD_API_KEY for full AI grading.",
    strengths: len >= 60 ? ["Structured attempt", "Addresses the prompt"] : ["Attempt recorded"],
    gaps: len < 80 ? ["Expand reasoning", "Add examples"] : ["Deepen analysis"],
  };
}
