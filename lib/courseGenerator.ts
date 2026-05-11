import type {
  Assignment,
  Assessment,
  CoursePlan,
  Lesson,
  LearningStyle,
  OnboardingAnswers,
  Project,
  Quiz,
  WeeklyMilestone,
} from "@/data/types";
import {
  assessmentsForGoal,
  buildChallenges,
  buildPersonalizedLessonSections,
  derivePacingProfile,
  enrichAssignmentCopy,
  inferGoalArchetype,
  personalizeQuizQuestions,
  seedPerformanceForCourseGen,
} from "@/lib/personalization";

function accentStyle(styles: LearningStyle[]): LearningStyle {
  return styles[0] ?? "step_by_step";
}

function topicsFor(interests: OnboardingAnswers["interests"], level: OnboardingAnswers["codingLevel"]) {
  const base =
    level === "beginner"
      ? ["Foundations & Logic", "Data in motion", "Web surfaces", "Algorithms warm-up"]
      : level === "intermediate"
        ? ["Structures & APIs", "AI intuition", "Systems edges", "Security mindset"]
        : ["Distributed cognition", "Deep models", "Hardened systems", "Research pace"];

  const flair: Record<(typeof interests)[number], string> = {
    games: "Gameplay loops → engines",
    ai: "Neural vignettes → agents",
    websites: "JS runtimes → edge compute",
    robotics: "Sensors → control loops",
    cybersecurity: "Threat models → exploits (sandboxed)",
    apps: "Product loops → telemetry ethics",
  };

  interests.forEach((i) => {
    base.push(flair[i]);
  });

  return Array.from(new Set(base)).slice(0, 8);
}

function buildPersonalizedLesson(
  answers: OnboardingAnswers,
  id: string,
  title: string,
  topic: string,
  minutes: number,
  accent: LearningStyle,
): Lesson {
  const sections = buildPersonalizedLessonSections(answers, topic, id);
  const challenges = buildChallenges(answers.interests[0] ?? "apps", accent, topic);

  return {
    id,
    title,
    topic,
    estimatedMinutes: minutes,
    status: id.endsWith("1") ? "in_progress" : "available",
    sections,
    challenges,
  };
}

export function generateCoursePlan(answers: OnboardingAnswers): CoursePlan {
  const accent = accentStyle(answers.learningStyles);
  const topics = topicsFor(answers.interests, answers.codingLevel);
  const pacing = derivePacingProfile(answers.weeklyHours);
  const archetype = answers.goalArchetype ?? inferGoalArchetype(answers.goals);
  const assessmentFocus = assessmentsForGoal(archetype);
  const seedPerf = seedPerformanceForCourseGen();

  const weekCount = Math.min(pacing.roadmapWeekCap, Math.max(4, answers.weeklyHours));

  const lessons: Lesson[] = topics.map((topic, idx) => {
    const baseMinutes = 35 + idx * 5;
    const minutes = Math.max(22, Math.round(baseMinutes * pacing.lessonMinuteFactor));
    return buildPersonalizedLesson(
      answers,
      `lesson-${idx + 1}`,
      `Unit ${idx + 1}: ${topic}`,
      topic,
      minutes,
      accent,
    );
  });

  const primaryInterest = answers.interests[0] ?? "apps";

  const quizzes: Quiz[] = lessons.slice(0, 5).map((l, idx) => ({
    id: `quiz-${idx + 1}`,
    title: `Pulse check — ${l.topic}`,
    lessonRef: l.id,
    estimatedMinutes: pacing.recapBias === "aggressive" ? 10 : 12,
    questions: personalizeQuizQuestions(l.topic, primaryInterest, idx),
  }));

  const projects: Project[] = answers.interests.slice(0, 3).map((interest, idx) => ({
    id: `project-${idx + 1}`,
    title: `Build: ${interest} synthesis lab`,
    description: `A ${answers.projectStyle} project aligning ${interest} with ${topics[idx % topics.length]}. ${pacing.narrativeHook}`,
    milestones:
      archetype === "portfolio"
        ? ["Diagram + README story", "Core implementation", "Polish & demo capture", "Retro + metrics"]
        : archetype === "contests"
          ? ["Brute-force baseline", "Invariant proof sketch", "Optimized attempt", "Contest-style timed redo"]
          : ["Draft system diagram", "Implement core pathway", "Add validation & reflection", "Peer review simulation"],
    estimatedHours: Math.round((4 + answers.weeklyHours / 4) * (archetype === "casual_exploration" ? 0.85 : 1)),
  }));

  const assignments: Assignment[] = lessons.slice(0, 4).map((l, idx) => {
    const base: Assignment = {
      id: `assignment-${idx + 1}`,
      title: `Assignment — ${l.title}`,
      lessonRef: l.id,
      description: `Ship a concise artifact proving command of ${l.topic}. Align with "${answers.goals}".`,
      rubric:
        archetype === "pass_class"
          ? ["Correctness", "Exam-style clarity", "Edge enumeration", "Self-check narrative"]
          : archetype === "portfolio"
            ? ["Architecture clarity", "Polish", "Maintainability", "Demo storytelling"]
            : archetype === "contests"
              ? ["Correctness", "Complexity awareness", "Speed-ready structure", "Invariant commentary"]
              : ["Correctness", "Readability", "Tests/validation", "Narrative of tradeoffs"],
      estimatedMinutes: Math.round((45 + idx * 10) * pacing.lessonMinuteFactor),
    };
    const enriched = enrichAssignmentCopy(base, answers, seedPerf, l.topic);
    return { ...base, description: enriched.description, title: enriched.title };
  });

  const assessments: Assessment[] = [
    {
      id: "assessment-mid",
      title: "Mid-route systems thinking check",
      focuses: assessmentFocus.midFocus,
      estimatedMinutes: archetype === "casual_exploration" ? 32 : 40,
    },
    {
      id: "assessment-capstone",
      title: "Adaptive capstone rehearsal",
      focuses: assessmentFocus.capstoneFocus,
      estimatedMinutes: archetype === "contests" ? 55 : 60,
    },
  ];

  const roadmap: WeeklyMilestone[] = Array.from({ length: weekCount }).map((_, week) => ({
    week: week + 1,
    title:
      pacing.recapBias === "aggressive"
        ? `Week ${week + 1} — compressed mastery spine`
        : answers.weeklyHours >= 14
          ? `Week ${week + 1} — accelerated convergence`
          : `Week ${week + 1} — convergence`,
    summary:
      pacing.recapBias === "aggressive"
        ? `High-density recap for ${topics[week % topics.length]} with spaced reinforcement tuned to limited weekly hours.`
        : `Blend ${topics[week % topics.length]} with your ${accent.replaceAll("_", " ")} modality.`,
    lessonIds: lessons.slice(week, week + 2).map((l) => l.id),
  }));

  const lang = answers.preferredLanguage ?? "python";
  const attn = answers.attentionSpan ?? "medium_sessions";
  const langLabel = lang.replaceAll("_", " ").toUpperCase();
  const pace =
    attn === "short_bursts"
      ? "micro-session pacing"
      : attn === "deep_focus"
        ? "deep-focus blocks"
        : "balanced sessions";
  const goalLabel = archetype.replaceAll("_", " ");
  const subtitle = `${langLabel} • ${answers.codingLevel} • ${goalLabel} • ${answers.weeklyHours}h/wk • ${pace} • ${pacing.label}`;

  const optionalChallengeLessonIds =
    answers.weeklyHours >= 14 ? lessons.slice(-2).map((l) => l.id) : undefined;

  return {
    id: crypto.randomUUID(),
    title: `${langLabel} orbit — Personalized CS trajectory`,
    subtitle,
    generatedAt: new Date().toISOString(),
    learningStyleAccent: accent,
    roadmap,
    lessons,
    quizzes,
    projects,
    assignments,
    assessments,
    estimatedWeeks: roadmap.length,
    optionalChallengeLessonIds,
  };
}
