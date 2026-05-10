import type { CodingLevel, LearningStyle } from "@/data/types";
import { routeTask } from "@/lib/modelRouter";
import type { TutorMessage } from "@/lib/mockAI";
import { clodChatCompletion } from "./clod";
import { stripMarkdownBoldMarkers } from "./formatAnswer";

/** Strip hypothetical videos / animations the model might still emit in prose. */
export function stripHypotheticalMediaFromAnswer(text: string): string {
  let s = text;
  s = s.replace(/_\([^)]*(?:animation|video|second|minute|loom|watch this)[^)]*\)_/gi, "");
  s = s.replace(/\([^)]*(?:\d+\s*-?\s*(?:second|minute)s?|animation|video\s+of)[^)]*\)/gi, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

export async function runLiveTutor(params: {
  topic: string;
  lessonTitle?: string;
  question: string;
  learningStyles: LearningStyle[];
  codingLevel: CodingLevel;
}): Promise<TutorMessage> {
  const tier = params.codingLevel === "advanced" ? 3 : params.codingLevel === "intermediate" ? 2 : 1;
  const decision = routeTask(tier, "lesson_generation");

  const learnerHint = `Learner coding level: ${params.codingLevel}. Preferred modalities: ${params.learningStyles.join(", ") || "balanced"}.`;

  const system = [
    "You are an expert programming tutor for a personalized CS platform.",
    learnerHint,
    "Answer clearly and pedagogically. Use concrete examples where helpful.",
    "Write in plain natural prose. Do NOT use markdown bold (double asterisks **like this**), fake emphasis, or ALL-CAPS headers — they look robotic; use normal sentences and light punctuation instead.",
    "Do not propose or describe hypothetical videos, animations, narrated clips, or seconds-long animations.",
    "Do not suggest watching external media; stay in text, brief code, or short diagram descriptions only.",
    "Respond with a single JSON object ONLY (no markdown outside the JSON), keys:",
    '{"content": string, "code": string | null, "diagramPrompt": string | null}',
    "Inside \"content\", plain text is preferred; minimal markdown lists (- item) are OK if needed — never **bold**.",
    "diagramPrompt: optional one-line idea for a static diagram only — no video or animation scenarios.",
    "Keep code examples short.",
  ].join("\n");

  const user = [
    params.lessonTitle ? `Lesson title: ${params.lessonTitle}` : "",
    `Lesson topic: ${params.topic}`,
    `Student question:\n${params.question}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  const raw = await clodChatCompletion(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { temperature: 0.55, maxTokens: 2200 },
  );

  type Parsed = {
    content?: string;
    code?: string | null;
    diagramPrompt?: string | null;
  };

  const parsed = parseJsonSafe<Parsed>(raw);

  const rawContent = typeof parsed.content === "string" ? parsed.content : raw;
  const content = stripMarkdownBoldMarkers(stripHypotheticalMediaFromAnswer(rawContent));
  const code = typeof parsed.code === "string" ? parsed.code : undefined;
  const diagramPrompt =
    typeof parsed.diagramPrompt === "string"
      ? stripMarkdownBoldMarkers(stripHypotheticalMediaFromAnswer(parsed.diagramPrompt))
      : undefined;

  return {
    routeReason: decision.reason,
    content,
    code,
    diagramPrompt: diagramPrompt || undefined,
  };
}

function parseJsonSafe<T>(text: string): Partial<T> {
  try {
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
    return JSON.parse(slice) as Partial<T>;
  } catch {
    return {};
  }
}
