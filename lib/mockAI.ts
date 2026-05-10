import type { CodeReviewResult, LearningStyle, OnboardingAnswers } from "@/data/types";
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

export function mockCodeReview(code: string, language: string): CodeReviewResult {
  const dialect = language === "python" ? "Pythonic idioms & typing" : "TS/JS structural typing";
  const routed = routeTask(3, "project_review");

  const lines = code.trim().split("\n").length;
  const readability = lines > 40 ? "Break into cohesive modules." : "Structure is approachable—tighten naming consistency.";
  const correctness =
    code.includes("return") && code.includes("function")
      ? "Core control flow parses; extend tests for regressions."
      : "Early draft—validate logic with runnable examples.";
  const bugs: string[] = [];
  if (code.includes("var ")) bugs.push("Prefer const/let to avoid leaky scope.");
  if (!code.includes("//") && lines > 20) bugs.push("Add rationale comments on non-obvious branches.");

  return {
    score: Math.min(
      100,
      68 + Math.min(22, Math.floor(lines / 3)) + (bugs.length === 0 ? 6 : -bugs.length * 4),
    ),
    correctness,
    readability,
    bugs,
    improvements: [
      "Add property-based checks for boundary inputs.",
      "Mirror Greptile diff view for structural debt.",
      "Instrument micro-benchmark before optimizing.",
    ],
    improvedCode: `${code.trim()}\n\n// ✨ Guided refinement\nexport const refined = hoistPure(parse(code));`,
    efficiency:
      routed.tier === "advanced"
        ? `Complexity posture looks healthy for ${dialect}—profile hot paths anyway.`
        : `Keep an eye on allocation churn in loops (${dialect}).`,
    nextLessonId: "lesson-2",
    practiceRecommendations: [
      "Debug mission: intermittent async race",
      "Algorithm vignette: two-pointer on streamed data",
    ],
  };
}
