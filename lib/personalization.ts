import type {
  Assignment,
  CodingLevel,
  InterestArea,
  LearningGoalArchetype,
  LearningStyle,
  LessonBeat,
  LessonSection,
  OnboardingAnswers,
  PerformanceSnapshot,
  PreferredLanguage,
  QuizQuestion,
  StudentProfile,
} from "@/data/types";
import { getTeachingVoice } from "./teachingVoice";

/** Cold-start perf shape for course generation (no browser storage). */
export function seedPerformanceForCourseGen(): PerformanceSnapshot {
  return {
    assignmentScores: {},
    quizScores: {},
    timeSpentMinutesByLesson: {},
    retryCountByTopic: {},
    strongTopics: [],
    weakTopics: [],
    weakTopicFacets: {},
    difficultySuccessRate: {},
    confidenceRatings: {},
    completedLessonIds: [],
    completedAssignmentIds: [],
    completedQuizIds: [],
    streakDays: 0,
    lastActiveDate: new Date().toISOString(),
    recentFeedback: [],
    codeSubmissions: [],
    behaviorSignals: {
      optionalChallengeSkips: 0,
      lessonSectionQuickCollapseCount: 0,
      quizTotalSeconds: 0,
      quizSessionsCompleted: 0,
      quizQuickGuessCount: 0,
      lessonBeatsCompleted: 0,
    },
  };
}

export function lessonPreamble(profile: StudentProfile, lessonTopic: string): string {
  const voice = getTeachingVoice(profile.codingLevel);
  const interests = profile.interests.join(", ").replaceAll("_", " ");
  return `${voice.label} voice · ${voice.vocabularyTier.replaceAll("_", " ")} vocabulary · anchoring “${lessonTopic}” through your lenses (${interests}). ${voice.toneHint}`;
}

export function buildChallenges(interest: InterestArea, style: LearningStyle, topic: string): string[] {
  const baseGame = [`Ship a ${topic} mini-demo inspired by game loop cadence`, "Stress-test one boundary input live"];
  const baseSec = [`Model a defensive helper illustrating ${topic}`, "Threat-model one misuse path"];
  const baseRobo = [`Simulate noisy sensor stream applying ${topic}`, "Graph failure recovery"];
  const baseAi = [`Batch-style vignette using ${topic}`, "Log tensor/feature intuition"];
  const map: Record<InterestArea, string[]> = {
    games: baseGame,
    cybersecurity: baseSec,
    robotics: baseRobo,
    ai: baseAi,
    websites: [`Latency-aware snippet for ${topic}`, "Sketch UX failure handling"],
    apps: [`Mobile-safe utility demonstrating ${topic}`, "Telemetry note for prod readiness"],
  };
  const themed = map[interest];
  if (style === "challenge_based") return [...themed, "Optimize hot path with complexity note"];
  if (style === "game_based") return [...themed, "Speed-run debug relay"];
  return themed;
}

export interface PacingProfile {
  label: string;
  lessonMinuteFactor: number;
  recapBias: "light" | "standard" | "aggressive";
  roadmapWeekCap: number;
  narrativeHook: string;
}

export function derivePacingProfile(weeklyHours: number): PacingProfile {
  if (weeklyHours <= 4) {
    return {
      label: "Retention-first orbit",
      lessonMinuteFactor: 0.82,
      recapBias: "aggressive",
      roadmapWeekCap: 6,
      narrativeHook: "Short weekly bandwidth → tighter loops, aggressive recap beats, fewer parallel tracks.",
    };
  }
  if (weeklyHours >= 14) {
    return {
      label: "Acceleration lane",
      lessonMinuteFactor: 1.12,
      recapBias: "light",
      roadmapWeekCap: 10,
      narrativeHook: "High availability → stretch milestones, optional challenges, and specialization hooks.",
    };
  }
  return {
    label: "Balanced cadence",
    lessonMinuteFactor: 1,
    recapBias: "standard",
    roadmapWeekCap: 8,
    narrativeHook: "Steady cadence with mixed modalities and weekly checkpoints.",
  };
}

export function inferGoalArchetype(goalsText: string): LearningGoalArchetype {
  const g = goalsText.toLowerCase();
  if (/\b(icpc|codeforces|leetcode|competitive|contest|olympiad)\b/.test(g)) return "contests";
  if (/\b(class|course|exam|gpa|pass|credit|semester)\b/.test(g)) return "pass_class";
  if (/\b(portfolio|job|career|ship|startup|freelance)\b/.test(g)) return "portfolio";
  return "casual_exploration";
}

function interestLens(interest: InterestArea, topic: string): string {
  switch (interest) {
  switch (interest) {
    case "games":
      return `Frame "${topic}" around player state, inventory slots, enemy waves, or animation ticks—systems players already feel.`;
    case "cybersecurity":
      return `Ground "${topic}" in auth flows, policy checks, exploit surfaces (sandboxed), or packet/session boundaries.`;
    case "robotics":
      return `Tie "${topic}" to sensor sampling, motor commands, PID intuition, or obstacle maps updating each tick.`;
    case "ai":
      return `Explain "${topic}" via embeddings queues, batch tensors, reward traces, or conversational context windows.`;
    case "websites":
      return `Relate "${topic}" to DOM trees, hydration, edge handlers, or UX-critical latency budgets.`;
    case "apps":
      return `Connect "${topic}" to offline queues, push pipelines, permissions, and telemetry that ships safely.`;
    default:
      return `Anchor "${topic}" to product loops users touch daily—make the computation emotionally relevant.`;
  }
}

function richDiagramFor(topic: string, style: LearningStyle): string {
  const base = `Interactive visualization for “${topic}”:`;
  if (style === "visual") {
    return `${base} layered canvas with animated edges showing data flow, color-coded hot states, and draggable probes scrubbing time.`;
  }
  if (topic.toLowerCase().includes("sort") || topic.toLowerCase().includes("algorithm")) {
    return `${base} merge-sort recursion splitting arrays into progressively smaller partitions while animating merge reconstruction with color-coded comparisons (spec-grade brief for media model).`;
  }
  return `${base} execution map with stepped highlighting, memory lane snapshots, and expandable call graph snippets.`;
}

function richVideoScript(topic: string): string {
  return `Storyboard (mock): cold open with concrete failure mode → whiteboard invariant → live refactor → 20s recap mnemonic for “${topic}”. VO emphasizes mental model + one deliberate mistake corrected on camera.`;
}

function readingDensity(styles: LearningStyle[], voice: ReturnType<typeof getTeachingVoice>, topic: string): string {
  const dense = styles.includes("reading_focused") || styles.includes("step_by_step");
  if (!dense) {
    return `Concept kernel for ${topic}: stress-test with two adversarial inputs and one happy path.`;
  }
  return `Extended brief on ${topic}: historical motivation (why teams cared), formal intuition, notation appendix, and pitfalls catalog (${voice.vocabularyTier} tier).`;
}

export function annotateCodeExample(
  code: string,
  level: CodingLevel,
  lang: PreferredLanguage | undefined,
): string {
  const L = lang ?? "python";
  const comment = L === "python" ? "#" : "//";
  if (level === "beginner") {
    return `${comment} Line-by-line walkthrough (beginner lane)\n${code
      .split("\n")
      .map((line, i) => `${comment} Step ${i + 1}: ${line.trim() ? "execute / bind" : "(blank)"}\n${line}`)
      .join("\n")}`;
  }
  if (level === "intermediate") {
    return `${comment} Intermediate scaffold — tighten names & invariants before scaling.\n${code}`;
  }
  return `${comment} Production-style sketch — revisit complexity & IO assumptions before shipping.\n${code}`;
}

export function sectionBeats(topic: string, styles: LearningStyle[], idPrefix: string): LessonBeat[] {
  const interactive =
    styles.includes("game_based") || styles.includes("challenge_based") || styles.includes("reverse_engineering");
  if (!interactive) return [];

  return [
    {
      id: `${idPrefix}-predict`,
      kind: "predict",
      prompt: `Before the next reveal: what state breaks first if inputs violate assumptions for “${topic}”?`,
      options: ["Boundary overflow", "Stale cache", "Happy path only", "Concurrency race"],
      correctIndex: 0,
    },
    {
      id: `${idPrefix}-checkpoint`,
      kind: "checkpoint",
      prompt: `Checkpoint: narrate one invariant you will protect while practicing ${topic}.`,
    },
  ];
}

export function buildPersonalizedLessonSections(
  answers: OnboardingAnswers,
  topic: string,
  lessonId: string,
): LessonSection[] {
  const voice = getTeachingVoice(answers.codingLevel);
  const styles = answers.learningStyles;
  const primaryInterest = answers.interests[0] ?? "apps";
  const lens = interestLens(primaryInterest, topic);
  const recap =
    derivePacingProfile(answers.weeklyHours).recapBias === "aggressive"
      ? "Aggressive recap lane: spaced prompts will reappear between sessions because your weekly time budget is tight."
      : "Review beats appear at natural mastery checkpoints.";

  const s1: LessonSection = {
    id: `${lessonId}-s1`,
    title: "Signal",
    summary: `Why ${topic} matters for your trajectory (${voice.label}).`,
    expandedContent: `${readingDensity(styles, voice, topic)}\n\n${lens}\n\n${recap}`,
    diagramPrompt: richDiagramFor(topic, styles.includes("visual") ? "visual" : "step_by_step"),
    beats: sectionBeats(topic, styles, `${lessonId}-s1`),
  };

  const kernelExample =
    answers.codingLevel === "advanced"
      ? `export function kernel(state: State): Next {\n  return compactTransition(state);\n}`
      : `function step(x) {\n  return x + 1;\n}`;

  const s2: LessonSection = {
    id: `${lessonId}-s2`,
    title: "Mechanism",
    summary: `How ${topic} behaves under realistic constraints.`,
    expandedContent: `${voice.toneHint} Walk the runtime mentally: inputs → transitions → observable outputs. Stress one failure mode relevant to ${primaryInterest}.`,
    codeExample: annotateCodeExample(kernelExample, answers.codingLevel, answers.preferredLanguage),
    videoPlaceholder: richVideoScript(topic),
    beats: styles.includes("game_based") ? sectionBeats(topic, styles, `${lessonId}-s2`).slice(0, 1) : [],
  };

  const s3: LessonSection = {
    id: `${lessonId}-s3`,
    title: "Mastery checkpoint",
    summary: "Ship a micro-artifact that proves transfer, not memorization.",
    expandedContent: `Deliverable should mirror ${answers.projectStyle.replaceAll("_", " ")} preferences and respect ${voice.evaluationStrictness.toLowerCase()}`,
    beats:
      styles.includes("challenge_based") ?
        [
          {
            id: `${lessonId}-micro`,
            kind: "micro_reflect",
            prompt: `Name one optimization or refactor you would postpone until after correctness locks for ${topic}.`,
          },
        ]
      : [],
  };

  return [s1, s2, s3];
}

export function personalizeQuizQuestions(topic: string, interest: InterestArea, idx: number): QuizQuestion[] {
  const scenario =
    interest === "games"
      ? "enemy wave scheduler"
      : interest === "cybersecurity"
        ? "rate-limited auth endpoint"
        : interest === "robotics"
          ? "lidar sampling loop"
          : interest === "ai"
            ? "batch inference queue"
            : "production web handler";

  return [
    {
      id: `q-${idx}-1`,
      prompt: `In your ${scenario} context, which artifact best proves mastery of ${topic}?`,
      options: [
        "Runnable module + tests/logging",
        "Slides without execution",
        "Copy-paste without adaptation",
        "Skipping failure paths",
      ],
      correctIndex: 0,
    },
    {
      id: `q-${idx}-2`,
      prompt: "Where should adaptive tutors invest latency first?",
      options: ["Feedback on misconceptions", "Theme tweaks", "Font pairing debates", "Passive PDF dumps"],
      correctIndex: 0,
    },
  ];
}

export function enrichAssignmentCopy(
  assignment: Assignment,
  answers: Pick<OnboardingAnswers, "interests" | "codingLevel" | "goals" | "goalArchetype">,
  perf: PerformanceSnapshot,
  lessonTopic: string,
): { title: string; description: string; scenarioHook: string } {
  const interest = answers.interests[0] ?? "apps";
  const weak = perf.weakTopics[0];
  const archetype = answers.goalArchetype ?? inferGoalArchetype(answers.goals);

  const hooks: Record<InterestArea, string> = {
    games: `Design a loop-driven mechanic (e.g., spawning waves or inventory reconciliation) that exercises ${lessonTopic}.`,
    cybersecurity: `Ship a defensive helper around ${lessonTopic}—think validators, scanners, or hardened parsers (sandboxed).`,
    robotics: `Model a sensor→actuator decision slice illustrating ${lessonTopic} under noisy inputs.`,
    ai: `Represent ${lessonTopic} as data you would feed through a small inference or feature pipeline.`,
    websites: `Implement a UX-critical pathway where ${lessonTopic} impacts latency or state sync.`,
    apps: `Build a mobile-facing utility demonstrating ${lessonTopic} with clear failure messaging.`,
  };

  let tilt = hooks[interest];
  if (weak && lessonTopic.toLowerCase().includes(weak.toLowerCase())) {
    tilt += ` Extra scaffolding: remediate "${weak}" with deliberate micro-tests before expanding scope.`;
  }

  const goalNote =
    archetype === "contests"
      ? " Optimize for clarity under time pressure—document invariants you rely on."
      : archetype === "pass_class"
        ? " Align artifacts with exam-style reliability: predictable outputs + edge cases enumerated."
        : archetype === "portfolio"
          ? " Polish README intent, architecture sketch, and demo script—shipping narrative matters."
          : " Explore freely—prioritize curiosity spikes over throughput.";

  return {
    title: assignment.title.startsWith("Assignment") ? assignment.title : `Assignment — ${assignment.title}`,
    description: `${assignment.description}\n\n${tilt}\n\n${goalNote}`,
    scenarioHook: tilt,
  };
}

export function assessmentsForGoal(archetype: LearningGoalArchetype | undefined): { midFocus: string[]; capstoneFocus: string[] } {
  const a = archetype ?? "casual_exploration";
  if (a === "pass_class") {
    return {
      midFocus: ["Concept synthesis", "Exam-style reasoning", "Worked proofs"],
      capstoneFocus: ["Timed rehearsal", "Multi-topic integration", "Confidence checklist"],
    };
  }
  if (a === "portfolio") {
    return {
      midFocus: ["Architecture narrative", "Polish & UX", "Telemetry ethics"],
      capstoneFocus: ["Capstone demo story", "Scale tradeoffs", "Stakeholder explanation"],
    };
  }
  if (a === "contests") {
    return {
      midFocus: ["Complexity bounding", "Invariant spotting", "Contest pacing"],
      capstoneFocus: ["Optimization sprint", "Multi-constraint problems", "Stress testing"],
    };
  }
  return {
    midFocus: ["Exploratory depth", "Creative extensions", "Low-pressure mastery"],
    capstoneFocus: ["Playful capstone", "Cross-topic tinkering", "Reflection journal"],
  };
}
