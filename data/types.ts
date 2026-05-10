export type CodingLevel =
  | "beginner"
  | "intermediate"
  | "advanced";

export type LearningStyle =
  | "visual"
  | "step_by_step"
  | "reverse_engineering"
  | "game_based"
  | "project_based"
  | "challenge_based";

export type InterestArea =
  | "games"
  | "ai"
  | "websites"
  | "robotics"
  | "cybersecurity"
  | "apps";

export type ProjectStyle =
  | "guided"
  | "creative"
  | "minimal_scaffold";

export type MotivationStyle =
  | "streaks"
  | "badges"
  | "milestones"
  | "intrinsic_curiosity";

export type PreferredLanguage =
  | "python"
  | "typescript"
  | "javascript"
  | "java"
  | "go"
  | "rust"
  | "cpp";

/** Preferred session shape — informs pacing copy and lesson density hints. */
export type AttentionSpan = "short_bursts" | "medium_sessions" | "deep_focus";

export interface OnboardingAnswers {
  codingLevel: CodingLevel;
  learningStyles: LearningStyle[];
  interests: InterestArea[];
  weeklyHours: number;
  goals: string;
  projectStyle: ProjectStyle;
  confidence: number; /* 1-10 */
  motivationStyle: MotivationStyle;
  /** Set during onboarding; optional for legacy stored profiles. */
  preferredLanguage?: PreferredLanguage;
  attentionSpan?: AttentionSpan;
}

export interface StudentProfile extends OnboardingAnswers {
  id: string;
  name: string;
  createdAt: string;
}

export type ItemStatus = "locked" | "available" | "in_progress" | "completed";

export interface LessonSection {
  id: string;
  title: string;
  summary: string;
  expandedContent: string;
  diagramPrompt?: string;
  codeExample?: string;
  videoPlaceholder?: string;
}

export interface Lesson {
  id: string;
  title: string;
  topic: string;
  estimatedMinutes: number;
  status: ItemStatus;
  sections: LessonSection[];
  challenges: string[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  lessonRef: string;
  questions: QuizQuestion[];
  estimatedMinutes: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  milestones: string[];
  estimatedHours: number;
}

export interface Assignment {
  id: string;
  title: string;
  lessonRef: string;
  description: string;
  rubric: string[];
  estimatedMinutes: number;
}

export interface Assessment {
  id: string;
  title: string;
  focuses: string[];
  estimatedMinutes: number;
}

export interface WeeklyMilestone {
  week: number;
  title: string;
  summary: string;
  lessonIds: string[];
}

export interface CoursePlan {
  id: string;
  title: string;
  subtitle: string;
  generatedAt: string;
  learningStyleAccent: LearningStyle;
  roadmap: WeeklyMilestone[];
  lessons: Lesson[];
  quizzes: Quiz[];
  projects: Project[];
  assignments: Assignment[];
  assessments: Assessment[];
  estimatedWeeks: number;
}

export type FeedbackKind = "assignment" | "quiz" | "code_review";

export interface FeedbackEntry {
  id: string;
  at: string;
  kind: FeedbackKind;
  title: string;
  summary: string;
  score?: number;
}

export interface CodeSubmissionEntry {
  id: string;
  at: string;
  language: string;
  score: number;
  excerpt: string;
}

export interface PerformanceSnapshot {
  assignmentScores: Record<string, number>;
  quizScores: Record<string, number>;
  timeSpentMinutesByLesson: Record<string, number>;
  retryCountByTopic: Record<string, number>;
  strongTopics: string[];
  weakTopics: string[];
  difficultySuccessRate: Record<string, number>;
  confidenceRatings: Record<string, number>;
  completedLessonIds: string[];
  completedAssignmentIds: string[];
  completedQuizIds: string[];
  streakDays: number;
  lastActiveDate: string;
  recentFeedback: FeedbackEntry[];
  codeSubmissions: CodeSubmissionEntry[];
}

export interface AdaptationDirective {
  summary: string;
  nextLessonModifiers: string[];
  suggestedResourceTypes: ("visual" | "project" | "game" | "review" | "challenge")[];
}

export type ModelTier = "cheap" | "mid" | "advanced" | "media";

export interface RouteDecision {
  tier: ModelTier;
  primaryModel: string;
  provider: "claude" | "greptile" | "nia" | "media";
  reason: string;
}

/** Subscores 0–100; overall score uses PRD weights: 40/20/20/20. */
export interface CodeReviewCategoryScores {
  correctness: number;
  readability: number;
  efficiency: number;
  problemSolving: number;
}

export interface CodeReviewResult {
  score: number;
  categoryScores: CodeReviewCategoryScores;
  correctness: string;
  readability: string;
  bugs: string[];
  improvements: string[];
  improvedCode: string;
  efficiency: string;
  problemSolving: string;
  nextLessonId: string;
  relatedLessonRecommendation: string;
  practiceRecommendations: string[];
}
