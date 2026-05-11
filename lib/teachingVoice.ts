import type { CodingLevel } from "@/data/types";

export interface TeachingVoice {
  label: string;
  toneHint: string;
  vocabularyTier: "supportive_plain" | "technical_balanced" | "engineering_dense";
  analogyDensity: "high" | "medium" | "low";
  evaluationStrictness: string;
}

export function getTeachingVoice(level: CodingLevel): TeachingVoice {
  switch (level) {
    case "beginner":
      return {
        label: "Guided mentor",
        toneHint: "Momentum-first: celebrate small wins, introduce jargon only after intuition lands.",
        vocabularyTier: "supportive_plain",
        analogyDensity: "high",
        evaluationStrictness: "Reward runnable understanding; frame gaps as next reps, not failures.",
      };
    case "intermediate":
      return {
        label: "Systems coach",
        toneHint: "Blend abstraction with debugging rigor—assume comfort with syntax, not with architecture.",
        vocabularyTier: "technical_balanced",
        analogyDensity: "medium",
        evaluationStrictness: "Expect tradeoff narration and test-backed claims.",
      };
    case "advanced":
      return {
        label: "Staff-track reviewer",
        toneHint: "Treat the learner like a junior engineer: concise, dense, production-aware.",
        vocabularyTier: "engineering_dense",
        analogyDensity: "low",
        evaluationStrictness: "Stress maintainability, complexity posture, and operational realism.",
      };
    default:
      return getTeachingVoice("intermediate");
  }
}
