import type {
  Assignment,
  Assessment,
  CoursePlan,
  Lesson,
  LessonSection,
  LearningStyle,
  OnboardingAnswers,
  Project,
  Quiz,
  WeeklyMilestone,
} from "@/data/types";

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

function buildLesson(
  id: string,
  title: string,
  topic: string,
  minutes: number,
  style: LearningStyle,
): Lesson {
  const sections: LessonSection[] = [
    {
      id: `${id}-s1`,
      title: "Signal",
      summary: "Why this idea matters for your roadmap right now.",
      expandedContent:
        "We anchor the concept to your goals, then connect it to adjacent topics so knowledge compounding stays visible.",
      diagramPrompt: "Animated graph: concept → dependencies → projects",
    },
    {
      id: `${id}-s2`,
      title: "Mechanism",
      summary: "How the pieces collaborate under the hood.",
      expandedContent:
        "Walk through a minimal mental model, then stress-test edge cases with interactive prompts.",
      codeExample:
        style === "project_based"
          ? "// Scaffold: modular entrypoint\nexport function runLab(input: Signals) {\n  return synthesize(input);\n}"
          : "// Minimal kernel\nfunction step(state) {\n  return transform(state);\n}",
      videoPlaceholder: "60s loom-style walkthrough placeholder",
    },
    {
      id: `${id}-s3`,
      title: "Mastery checkpoint",
      summary: "Convert understanding into a tangible artifact.",
      expandedContent:
        "You will ship a micro-deliverable that mirrors how teams validate learning in production.",
    },
  ];

  const challenges =
    style === "game_based"
      ? ["Speed-run the bug hunt", "Achieve 3-star readability"]
      : style === "challenge_based"
        ? ["Optimize the hot path", "Prove the invariant"]
        : ["Refactor for clarity", "Add tests for two edge cases"];

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

  const lessons: Lesson[] = topics.map((topic, idx) =>
    buildLesson(
      `lesson-${idx + 1}`,
      `Unit ${idx + 1}: ${topic}`,
      topic,
      35 + idx * 5,
      accent,
    ),
  );

  const quizzes: Quiz[] = lessons.slice(0, 5).map((l, idx) => ({
    id: `quiz-${idx + 1}`,
    title: `Pulse check — ${l.topic}`,
    lessonRef: l.id,
    estimatedMinutes: 12,
    questions: [
      {
        id: `q-${idx}-1`,
        prompt: `Which signal best validates understanding of ${l.topic}?`,
        options: [
          "A runnable artifact with tests",
          "Memorized syntax only",
          "Copy-pasted solution",
          "Skipping edge cases",
        ],
        correctIndex: 0,
      },
      {
        id: `q-${idx}-2`,
        prompt: "What should you optimize first in a learning loop?",
        options: ["Feedback latency", "Font choice", "IDE theme", "Comment density"],
        correctIndex: 0,
      },
    ],
  }));

  const projects: Project[] = answers.interests.slice(0, 3).map((interest, idx) => ({
    id: `project-${idx + 1}`,
    title: `Build: ${interest} synthesis lab`,
    description: `A ${answers.projectStyle} project aligning ${interest} with ${topics[idx % topics.length]}.`,
    milestones: [
      "Draft system diagram",
      "Implement core pathway",
      "Add telemetry & reflection",
      "Peer review simulation",
    ],
    estimatedHours: 4 + answers.weeklyHours / 4,
  }));

  const assignments: Assignment[] = lessons.slice(0, 4).map((l, idx) => ({
    id: `assignment-${idx + 1}`,
    title: `Assignment — ${l.title}`,
    lessonRef: l.id,
    description: `Ship a concise artifact proving command of ${l.topic}. Align with "${answers.goals}".`,
    rubric: ["Correctness", "Readability", "Tests/validation", "Narrative of tradeoffs"],
    estimatedMinutes: 45 + idx * 10,
  }));

  const assessments: Assessment[] = [
    {
      id: "assessment-mid",
      title: "Mid-route systems thinking check",
      focuses: ["Architecture", "Complexity intuition", "Ethical product choices"],
      estimatedMinutes: 40,
    },
    {
      id: "assessment-capstone",
      title: "Adaptive capstone rehearsal",
      focuses: answers.interests.map((i) => `${i} integration`),
      estimatedMinutes: 60,
    },
  ];

  const roadmap: WeeklyMilestone[] = Array.from({ length: Math.min(8, Math.max(4, answers.weeklyHours)) }).map(
    (_, week) => ({
      week: week + 1,
      title: `Milestone ${week + 1} — convergence`,
      summary: `Blend ${topics[week % topics.length]} with your ${accent.replaceAll("_", " ")} modality.`,
      lessonIds: lessons.slice(week, week + 2).map((l) => l.id),
    }),
  );

  const lang = answers.preferredLanguage ?? "python";
  const attn = answers.attentionSpan ?? "medium_sessions";
  const langLabel = lang.replaceAll("_", " ").toUpperCase();
  const pace =
    attn === "short_bursts"
      ? "micro-session pacing"
      : attn === "deep_focus"
        ? "deep-focus blocks"
        : "balanced sessions";
  const subtitle = `${langLabel} • ${answers.codingLevel} track • ${answers.weeklyHours}h/week • ${pace} • ${accent.replaceAll("_", " ")} modality`;

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
  };
}
