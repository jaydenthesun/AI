import type { RouteDecision, ModelTier } from "@/data/types";

export type RoutingPurpose =
  | "quiz_grading"
  | "basic_explanation"
  | "simple_feedback"
  | "lesson_generation"
  | "assignment_generation"
  | "personalization"
  | "course_redesign"
  | "deep_reasoning"
  | "project_review"
  | "diagram"
  | "image"
  | "video_script";

/** Visible routing API — swap implementations for production providers. */
export function routeTask(
  complexity: 0 | 1 | 2 | 3,
  purpose: RoutingPurpose,
): RouteDecision {
  const mediaPurposes = new Set<RoutingPurpose>(["diagram", "image", "video_script"]);
  if (mediaPurposes.has(purpose)) {
    return {
      tier: "media",
      primaryModel: "media-stack-v2",
      provider: "media",
      reason: "Media generation routed to visualization & AV synthesis lane.",
    };
  }

  if (purpose === "project_review" || purpose === "course_redesign" || complexity >= 3) {
    return {
      tier: "advanced",
      primaryModel: "claude-opus-route",
      provider: complexity >= 2 ? "claude" : "greptile",
      reason:
        complexity >= 3
          ? "Deep reasoning requires Clōd tutoring core with retrieval priming."
          : "Architectural critique pairs Clōd with Greptile code graph.",
    };
  }

  if (
    purpose === "lesson_generation" ||
    purpose === "assignment_generation" ||
    purpose === "personalization" ||
    complexity === 2
  ) {
    return {
      tier: "mid",
      primaryModel: "claude-sonnet-route",
      provider: "claude",
      reason:
        purpose === "personalization"
          ? "Adaptive sequencing uses mid-tier Claude + Nia context packs."
          : "Lesson synthesis balanced for cost and coherence.",
    };
  }

  return {
    tier: "cheap",
    primaryModel: "claude-haiku-route",
    provider: purpose === "simple_feedback" ? "greptile" : "claude",
    reason:
      purpose === "simple_feedback"
        ? "Greptile handles structural scan; Claude Haiku summarizes."
        : "High-volume quizzes and summaries use efficient models.",
  };
}

/** Rows for the model-routing demo — maps PRD task classes to simulated router decisions. */
export const ROUTING_DEMO_MATRIX: Array<{
  taskLabel: string;
  purpose: RoutingPurpose;
  complexity: 0 | 1 | 2 | 3;
}> = [
  { taskLabel: "Basic explanations", purpose: "basic_explanation", complexity: 1 },
  { taskLabel: "Simple quizzes", purpose: "quiz_grading", complexity: 1 },
  { taskLabel: "Small feedback snippets", purpose: "simple_feedback", complexity: 1 },
  { taskLabel: "Lesson generation", purpose: "lesson_generation", complexity: 2 },
  { taskLabel: "Assignment generation", purpose: "assignment_generation", complexity: 2 },
  { taskLabel: "Personalized course creation", purpose: "personalization", complexity: 2 },
  { taskLabel: "Code marking / diff review", purpose: "deep_reasoning", complexity: 3 },
  { taskLabel: "Large project feedback", purpose: "project_review", complexity: 3 },
  { taskLabel: "Course redesign", purpose: "course_redesign", complexity: 3 },
  { taskLabel: "Diagrams & visual briefs", purpose: "diagram", complexity: 2 },
  { taskLabel: "Image synthesis", purpose: "image", complexity: 2 },
  { taskLabel: "Video / narration scripts", purpose: "video_script", complexity: 2 },
];

export function describeArchitectureFlow(): {
  flows: Array<{ from: string; to: string; label: string; tier: ModelTier }>;
  nodes: Array<{ id: string; label: string; role: string }>;
} {
  return {
    nodes: [
      { id: "claude", label: "Clōd", role: "Teaches • reasons • tutors" },
      { id: "nia", label: "Nia", role: "Retrieves PDFs, docs, curricula" },
      { id: "greptile", label: "Greptile", role: "Code graph & repository review" },
      { id: "media", label: "Media", role: "Diagrams • frames • narration scripts" },
    ],
    flows: [
      { from: "nia", to: "claude", label: "Context priming", tier: "mid" },
      { from: "greptile", to: "claude", label: "Structured review payloads", tier: "advanced" },
      { from: "claude", to: "media", label: "Visual briefs", tier: "media" },
      { from: "nia", to: "greptile", label: "Doc-linked code citations", tier: "cheap" },
    ],
  };
}
