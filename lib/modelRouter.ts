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
