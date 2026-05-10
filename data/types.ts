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

export interface OnboardingAnswers {
  codingLevel: CodingLevel;
  learningStyles: LearningStyle[];
  interests: InterestArea[];
  weeklyHours: number;
  goals: string;
  projectStyle: ProjectStyle;
  confidence: number; /* 1-10 */
  motivationStyle: MotivationStyle;
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

export interface CodeReviewResult {
  score: number;
  correctness: string;
  readability: string;
  bugs: string[];
  improvements: string[];
  improvedCode: string;
  efficiency: string;
  nextLessonId: string;
  practiceRecommendations: string[];
}
