import type {
  AdaptationDirective,
  LearningStyle,
  OnboardingAnswers,
  PerformanceSnapshot,
} from "@/data/types";

function avg(nums: number[]): number {
  if (!nums.length) return 0.5;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function inferWeakFacets(topic: string): string[] {
  const t = topic.toLowerCase();
  const facets: string[] = [];
  if (/loop|iteration|recurs/.test(t)) facets.push("control_flow", "decomposition");
  if (/nest/.test(t)) facets.push("nested_complexity");
  if (/function|abstract|module/.test(t)) facets.push("abstraction");
  if (/async|await|concurren|race/.test(t)) facets.push("temporal_reasoning");
  if (/array|structure|data|graph/.test(t)) facets.push("representation");
  return facets.length ? facets : ["conceptual_transfer"];
}

export function adaptLearningPath(
  perf: PerformanceSnapshot,
  learner: Pick<OnboardingAnswers, "learningStyles" | "motivationStyle" | "codingLevel">,
): AdaptationDirective {
  const recentScores = [
    ...Object.values(perf.assignmentScores),
    ...Object.values(perf.quizScores),
  ];
  const meanScore = avg(recentScores) || 72;
  const weak = perf.weakTopics;
  const strong = perf.strongTopics;
  const repeatedStruggle = Object.entries(perf.retryCountByTopic).find(([, n]) => n >= 2);

  const prefersVisual = learner.learningStyles.includes("visual");
  const prefersProject = learner.learningStyles.includes("project_based");
  const prefersGame = learner.learningStyles.includes("game_based");
  const prefersChallenge = learner.learningStyles.includes("challenge_based");

  const directives: AdaptationDirective = {
    summary: "",
    nextLessonModifiers: [],
    suggestedResourceTypes: [],
  };

  if (repeatedStruggle) {
    directives.summary = `Repeated friction on “${repeatedStruggle[0]}” — scheduling an easier recap layer before new material.`;
    directives.nextLessonModifiers.push("Insert spaced-review beats and micro-quizzes on the struggling topic");
    directives.suggestedResourceTypes.push("review");
    if (prefersVisual) directives.suggestedResourceTypes.push("visual");
  } else if (meanScore < 70 || weak.length > strong.length) {
    directives.summary =
      "Performance signals struggle — injecting review primers and lower cognitive load checkpoints.";
    directives.nextLessonModifiers.push("Add worked examples with line-by-line narration");
    directives.suggestedResourceTypes.push("review");
    if (prefersVisual) directives.suggestedResourceTypes.push("visual");
  } else if (meanScore > 88) {
    directives.summary =
      "High mastery velocity — escalating challenge density while preserving conceptual hooks.";
    directives.nextLessonModifiers.push("Swap intermediate drills for open-ended extensions");
    directives.suggestedResourceTypes.push("challenge");
    if (prefersProject) directives.suggestedResourceTypes.push("project");
  } else {
    directives.summary =
      "Balanced trajectory — maintain mixed modalities with micro-assessments each unit.";
  }

  if (prefersProject) directives.suggestedResourceTypes.push("project");
  if (prefersGame) directives.suggestedResourceTypes.push("game");
  if (prefersChallenge) directives.suggestedResourceTypes.push("challenge");

  if (learner.codingLevel === "beginner") {
    directives.nextLessonModifiers.push("Include sandboxed mini-kata before assessments");
  }

  if (learner.motivationStyle === "streaks") {
    directives.nextLessonModifiers.push("Surface streak-safe micro goals (≤15m)");
  }

  const bs = perf.behaviorSignals ?? {
    optionalChallengeSkips: 0,
    lessonSectionQuickCollapseCount: 0,
    quizTotalSeconds: 0,
    quizSessionsCompleted: 0,
    quizQuickGuessCount: 0,
    lessonBeatsCompleted: 0,
  };

  if (bs.quizQuickGuessCount >= 2) {
    directives.summary +=
      " Rapid quiz cadence observed — inserting slower prediction beats before reveals.";
    directives.nextLessonModifiers.push("Insert deliberate pause prompts before revealing answers");
    directives.suggestedResourceTypes.push("review");
  }

  if (bs.optionalChallengeSkips >= 3) {
    directives.summary +=
      " Stretch probes deferred repeatedly — shrinking blast radius until confidence rebounds.";
    directives.nextLessonModifiers.push("Celebrate incremental proofs of skill before adversarial extensions");
  }

  // dedupe
  directives.suggestedResourceTypes = Array.from(new Set(directives.suggestedResourceTypes));

  return directives;
}

export function mergeTopicSignals(
  perf: PerformanceSnapshot,
  topic: string,
  score: number,
): PerformanceSnapshot {
  const weakTopicFacets = { ...(perf.weakTopicFacets ?? {}) };
  const next = { ...perf, weakTopics: [...perf.weakTopics], strongTopics: [...perf.strongTopics], weakTopicFacets };
  if (score < 75) {
    if (!next.weakTopics.includes(topic)) next.weakTopics.push(topic);
    next.strongTopics = next.strongTopics.filter((t) => t !== topic);
    next.weakTopicFacets[topic] = inferWeakFacets(topic);
  } else {
    if (!next.strongTopics.includes(topic)) next.strongTopics.push(topic);
    next.weakTopics = next.weakTopics.filter((t) => t !== topic);
    delete next.weakTopicFacets[topic];
  }
  next.difficultySuccessRate = {
    ...next.difficultySuccessRate,
    [topic]: score / 100,
  };
  return next;
}

/** Tracks quiz attempts; increments retries when mastery signal is low (PRD-style loop failures). */
export function recordQuizAttempt(
  perf: PerformanceSnapshot,
  topic: string,
  scorePct: number,
): PerformanceSnapshot {
  const retryCountByTopic = { ...perf.retryCountByTopic };
  if (scorePct < 75) {
    retryCountByTopic[topic] = (retryCountByTopic[topic] ?? 0) + 1;
  }
  return mergeTopicSignals({ ...perf, retryCountByTopic }, topic, scorePct);
}

export function recordTime(
  perf: PerformanceSnapshot,
  lessonId: string,
  minutes: number,
): PerformanceSnapshot {
  const prev = perf.timeSpentMinutesByLesson[lessonId] ?? 0;
  return {
    ...perf,
    timeSpentMinutesByLesson: {
      ...perf.timeSpentMinutesByLesson,
      [lessonId]: prev + minutes,
    },
  };
}

export function shouldOfferVisualHint(
  perf: PerformanceSnapshot,
  lessonId: string,
  styles: LearningStyle[],
): boolean {
  const time = perf.timeSpentMinutesByLesson[lessonId] ?? 0;
  return (styles.includes("visual") && time > 35) || time > 55;
}
