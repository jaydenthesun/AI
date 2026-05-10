import type {
  CodeReviewCategoryScores,
  CodeReviewResult,
  LearningStyle,
  OnboardingAnswers,
} from "@/data/types";
import { routeTask } from "./modelRouter";

export interface TutorMessage {
  routeReason: string;
  content: string;
  code?: string;
  diagramPrompt?: string;
  media?: { type: "video" | "image"; placeholder: string };
}

export function mockTutorReply(
  topic: string,
  learnerSnippet: Partial<Pick<OnboardingAnswers, "learningStyles" | "codingLevel">> & {
    question: string;
  },
): TutorMessage {
  const tier = learnerSnippet.codingLevel === "advanced" ? 3 : learnerSnippet.codingLevel === "intermediate" ? 2 : 1;
  const decision = routeTask(tier, "lesson_generation");

  const modality = learnerSnippet.learningStyles?.includes("visual")
    ? "Visual-first scaffolding with annotated diagrams."
    : learnerSnippet.learningStyles?.includes("reverse_engineering")
      ? "Start from outputs, rewind to invariants."
      : "Sequential decomposition with checkpoints.";

  return {
    routeReason: decision.reason,
    content: `${modality} Focus: ${topic}.\n\nYou asked: "${learnerSnippet.question}"\n\nHere's a synthesized path:\n• Frame the invariant\n• Derive minimal example\n• Scale to messy reality\nFeedback latency is tuned to mimic production review cycles.`,
    code: `// Mock tutor snippet\nfunction teach(${topic.replace(/\s+/g, "_")}) {\n  return distill(concept, learnerContext);\n}`,
    diagramPrompt: `Neural-studio diagram: layers of ${topic} with attention on failure modes.`,
    media: {
      type: "video",
      placeholder: "Clōd narration track + Nia-sourced citations (mock)",
    },
  };
}

export function mockAdaptiveRecommendations(styles: LearningStyle[]): string[] {
  const route = routeTask(2, "personalization");
  return [
    route.reason,
    styles.includes("project_based") ? "Queue a ship-ready micro-build this week." : "Add a kata ladder for rapid feedback.",
    styles.includes("game_based") ? "Unlock a leaderboard-friendly bug hunt variant." : "Schedule a readability duel with Greptile heuristics.",
  ];
}

function weightedOverall(c: CodeReviewCategoryScores): number {
  return Math.round(c.correctness * 0.4 + c.readability * 0.2 + c.efficiency * 0.2 + c.problemSolving * 0.2);
}

export function mockCodeReview(
  code: string,
  language: string,
  ctx?: {
    lessons?: Array<{ id: string; title: string; topic: string }>;
    weakTopics?: string[];
  },
): CodeReviewResult {
  const dialect = language === "python" ? "Pythonic idioms & typing" : "TS/JS structural typing";
  const routed = routeTask(3, "project_review");
  const lessons = ctx?.lessons ?? [];
  const weak = ctx?.weakTopics ?? [];

  const lines = code.trim().split(/\n/).length;
  const hasFn = code.includes("function") || code.includes("def ");
  const hasReturn = code.includes("return");

  let correctnessSub = 62 + Math.min(28, Math.floor(lines / 2));
  if (hasFn && hasReturn) correctnessSub += 10;
  if (code.includes("TODO")) correctnessSub -= 8;
  correctnessSub = Math.max(35, Math.min(98, correctnessSub));

  let readabilitySub = lines > 45 ? 58 : 78;
  if (code.includes("var ")) readabilitySub -= 12;
  readabilitySub = Math.max(40, Math.min(96, readabilitySub));

  let efficiencySub = lines > 60 ? 62 : 82;
  if (/for\s*\([^)]*\)\s*\{[\s\S]*?for\s*\(/.test(code)) efficiencySub -= 8;
  efficiencySub = Math.max(42, Math.min(94, efficiencySub));

  let problemSub = code.length > 120 ? 74 : 68;
  if (hasFn && code.includes("try")) problemSub += 6;
  problemSub = Math.max(45, Math.min(95, problemSub));

  const bugs: string[] = [];
  if (code.includes("var ")) bugs.push("Prefer const/let to avoid leaky scope.");
  if (!code.includes("//") && !code.includes("#") && lines > 18)
    bugs.push("Add rationale comments on non-obvious branches.");
  if (language === "typescript" && code.includes("any")) bugs.push("Replace implicit any with a precise type.");

  const penalty = bugs.length * 5;
  const categoryScores: CodeReviewCategoryScores = {
    correctness: Math.max(30, correctnessSub - penalty),
    readability: Math.max(35, readabilitySub - Math.floor(penalty / 2)),
    efficiency: Math.max(35, efficiencySub - Math.floor(penalty / 2)),
    problemSolving: Math.max(40, problemSub - Math.floor(penalty / 3)),
  };

  const score = weightedOverall(categoryScores);

  const correctness =
    hasFn && hasReturn
      ? "Core control flow is plausible—prove it with examples and guard clauses."
      : "Early sketch—tighten the happy path and enumerate failure modes before scaling.";
  const readability =
    lines > 40 ? "Break into cohesive modules and align naming with domain verbs." : "Readable skeleton—keep naming and branching symmetry consistent.";
  const efficiency =
    routed.tier === "advanced"
      ? `Asymptotics look acceptable for ${dialect}; validate IO-bound vs CPU-bound assumptions.`
      : `Watch allocation churn and repeated work in hot loops (${dialect}).`;
  const problemSolving =
    "Strengthen invariants: state assumptions explicitly, then encode them as checks or types.";

  const matched =
    weak.length && lessons.length
      ? lessons.find((l) => weak.some((w) => l.topic.toLowerCase().includes(w.toLowerCase())))
      : undefined;
  const fallbackLesson = lessons[1]?.id ?? lessons[0]?.id ?? "lesson-2";
  const nextLessonId = matched?.id ?? fallbackLesson;
  const relatedTitle = matched?.title ?? lessons.find((l) => l.id === nextLessonId)?.title ?? "Foundations module";

  return {
    score,
    categoryScores,
    correctness,
    readability,
    bugs,
    improvements: [
      "Add property-based checks for boundary inputs.",
      "Mirror Greptile-style structural diff for long-term maintainability.",
      "Instrument micro-benchmarks before optimizing hot paths.",
    ],
    improvedCode: `${code.trim()}\n\n// ✨ Guided refinement (mock)\nexport const refined = hoistPure(parse(source));\n`,
    efficiency,
    problemSolving,
    nextLessonId,
    relatedLessonRecommendation: `Bridge into “${relatedTitle}” to rehearse the patterns flagged above.`,
    practiceRecommendations: [
      "Debugging mission: reproduce + shrink an intermittent async race.",
      "Algorithm vignette: two-pointer walk on streamed metrics.",
    ],
  };
}
