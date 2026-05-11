import type { CoursePlan, PerformanceSnapshot, StudentProfile } from "@/data/types";

export interface LearnerInsight {
  headline: string;
  detail: string;
  tone: "supportive" | "caution" | "accelerate";
}

function avg(nums: number[]): number {
  if (!nums.length) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

const defaultBehavior = {
  optionalChallengeSkips: 0,
  lessonSectionQuickCollapseCount: 0,
  quizTotalSeconds: 0,
  quizSessionsCompleted: 0,
  quizQuickGuessCount: 0,
  lessonBeatsCompleted: 0,
};

/**
 * Mock psych-aware interpretations — swap for model-backed inference later.
 */
export function inferLearnerNarratives(
  profile: StudentProfile,
  perf: PerformanceSnapshot,
  course: CoursePlan,
): LearnerInsight[] {
  const insights: LearnerInsight[] = [];
  const scores = [...Object.values(perf.assignmentScores), ...Object.values(perf.quizScores)];
  const mean = scores.length ? avg(scores) : null;

  const lessonsDone = perf.completedLessonIds.length;
  const totalLessons = Math.max(1, course.lessons.length);
  const completionVelocity = lessonsDone / totalLessons;

  const bs = perf.behaviorSignals ?? defaultBehavior;

  if (mean !== null && completionVelocity > 0.35 && mean < 72) {
    insights.push({
      headline: "Velocity vs depth tension",
      detail:
        "You’re moving through modules quickly while conceptual probes score modestly. The mentor lane will bias toward reflective checkpoints and slower theory expansions before escalating difficulty.",
      tone: "caution",
    });
  }

  if (bs.quizQuickGuessCount >= 2 && mean !== null && mean < 80) {
    insights.push({
      headline: "Rapid response pattern",
      detail:
        "Several quizzes completed with very short dwell times. That often correlates with pattern-matching without durable schemas—we’ll interleave prediction beats and micro-reflection prompts.",
      tone: "caution",
    });
  }

  if (bs.lessonBeatsCompleted >= 4 && mean !== null && mean >= 78) {
    insights.push({
      headline: "Hands-on absorption",
      detail:
        "Interactive beats are logging completions alongside solid scores—great signal for experiential learning. Optional stretch challenges will stay unlocked while guidance density stays high.",
      tone: "accelerate",
    });
  }

  if (bs.optionalChallengeSkips >= 3) {
    insights.push({
      headline: "Confidence-aware pacing",
      detail:
        "Optional stretch probes were skipped repeatedly. We’ll temporarily emphasize momentum-friendly wins and smaller-scope assignments before reintroducing adversarial extensions.",
      tone: "supportive",
    });
  }

  if (
    Object.keys(perf.timeSpentMinutesByLesson).length > 0 &&
    mean !== null &&
    mean >= 82 &&
    completionVelocity < 0.25
  ) {
    insights.push({
      headline: "Deep dwell, strong signals",
      detail:
        "Longer time-on-lesson with strong assessments suggests deliberate mastery rather than rushing. The path will introduce architecture-facing tasks earlier where your goal archetype allows.",
      tone: "accelerate",
    });
  }

  if (insights.length === 0) {
    insights.push({
      headline: "Calibration in flight",
      detail: `Tracking ${profile.motivationStyle.replaceAll("_", " ")} motivation and ${profile.codingLevel} voice — keep engaging quizzes and assignments so the adaptive layer sharpens its read on you.`,
      tone: "supportive",
    });
  }

  const facets = Object.entries(perf.weakTopicFacets ?? {});
  if (facets.length) {
    const [topic, facetList] = facets[0];
    insights.push({
      headline: `Nuanced gap on ${topic}`,
      detail: `Beyond “weak topic,” signals cluster around: ${facetList.slice(0, 3).join(", ")} — remediation will target those facets explicitly.`,
      tone: "supportive",
    });
  }

  return insights.slice(0, 4);
}
