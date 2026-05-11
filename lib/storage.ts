"use client";

import type {
  AdaptivePlanOverlay,
  CoursePlan,
  FeedbackEntry,
  OnboardingAnswers,
  PerformanceSnapshot,
  StudentProfile,
} from "@/data/types";
import { computeAdaptiveOverlay, mergeCoursePlanForDisplay } from "@/lib/courseMutations";

const PROFILE_KEY = "codepath_profile_v1";
const COURSE_KEY = "codepath_course_v1";
const PERF_KEY = "codepath_performance_v1";
const OVERLAY_KEY = "codepath_overlay_v1";
const CURRENT_LESSON_KEY = "codepath_current_lesson_v1";

const STORAGE_UPDATE_EVENT = "codepath-storage-update";

export function notifyStorageListeners() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(STORAGE_UPDATE_EVENT));
}

export const emptyPerformanceSnapshot = (): PerformanceSnapshot => ({
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
});

export function saveOnboardingProfile(answers: OnboardingAnswers, name = "Explorer") {
  const profile: StudentProfile = {
    ...answers,
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  if (typeof window === "undefined") return profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  notifyStorageListeners();
  return profile;
}

export function loadProfile(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StudentProfile;
  } catch {
    return null;
  }
}

export function saveCoursePlan(plan: CoursePlan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COURSE_KEY, JSON.stringify(plan));
  notifyStorageListeners();
}

export function loadAdaptiveOverlay(): AdaptivePlanOverlay | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(OVERLAY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdaptivePlanOverlay;
  } catch {
    return null;
  }
}

export function saveAdaptiveOverlay(overlay: AdaptivePlanOverlay) {
  if (typeof window === "undefined") return;
  localStorage.setItem(OVERLAY_KEY, JSON.stringify(overlay));
  notifyStorageListeners();
}

export function clearAdaptiveOverlay() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(OVERLAY_KEY);
  notifyStorageListeners();
}

/** Course merged with adaptive injections for UI navigation lists + timelines. */
export function loadDisplayCoursePlan(): CoursePlan | null {
  const base = loadCoursePlan();
  if (!base) return null;
  return mergeCoursePlanForDisplay(base, loadAdaptiveOverlay());
}

/** Recompute remediation overlays after performance mutations (mock adaptive engine). */
export function syncAdaptivePlanFromPerformance() {
  const base = loadCoursePlan();
  if (!base || typeof window === "undefined") return;
  const perf = loadPerformance();
  const prev = loadAdaptiveOverlay();
  const next = computeAdaptiveOverlay(base, perf, prev);
  saveAdaptiveOverlay(next);
}

export function loadCoursePlan(): CoursePlan | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(COURSE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CoursePlan;
  } catch {
    return null;
  }
}

export function savePerformance(snapshot: PerformanceSnapshot) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERF_KEY, JSON.stringify(snapshot));
  notifyStorageListeners();
}

export function loadPerformance(): PerformanceSnapshot {
  if (typeof window === "undefined") return emptyPerformanceSnapshot();
  const raw = localStorage.getItem(PERF_KEY);
  if (!raw) return emptyPerformanceSnapshot();
  try {
    const parsed = JSON.parse(raw) as Partial<PerformanceSnapshot>;
    const base = emptyPerformanceSnapshot();
    const merged = {
      ...base,
      ...parsed,
      recentFeedback: Array.isArray(parsed.recentFeedback) ? parsed.recentFeedback : [],
      codeSubmissions: Array.isArray(parsed.codeSubmissions) ? parsed.codeSubmissions : [],
      weakTopicFacets:
        parsed.weakTopicFacets && typeof parsed.weakTopicFacets === "object"
          ? (parsed.weakTopicFacets as PerformanceSnapshot["weakTopicFacets"])
          : {},
      behaviorSignals: {
        ...base.behaviorSignals,
        ...(parsed.behaviorSignals ?? {}),
      },
    };
    return merged;
  } catch {
    return emptyPerformanceSnapshot();
  }
}

export function appendFeedbackEntry(snapshot: PerformanceSnapshot, entry: Omit<FeedbackEntry, "id" | "at">): PerformanceSnapshot {
  const row: FeedbackEntry = {
    ...entry,
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `fb-${Date.now()}`,
    at: new Date().toISOString(),
  };
  return {
    ...snapshot,
    recentFeedback: [row, ...snapshot.recentFeedback].slice(0, 24),
  };
}

export function setCurrentLessonId(id: string | null) {
  if (typeof window === "undefined") return;
  if (!id) localStorage.removeItem(CURRENT_LESSON_KEY);
  else localStorage.setItem(CURRENT_LESSON_KEY, id);
}

export function getCurrentLessonId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_LESSON_KEY);
}

export function bumpStreak(snapshot: PerformanceSnapshot): PerformanceSnapshot {
  const today = new Date().toDateString();
  const last = snapshot.lastActiveDate
    ? new Date(snapshot.lastActiveDate).toDateString()
    : "";
  let streak = snapshot.streakDays;
  if (last !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (last === yesterday.toDateString()) streak += 1;
    else streak = Math.max(streak, 1);
  }
  return { ...snapshot, streakDays: streak, lastActiveDate: new Date().toISOString() };
}
