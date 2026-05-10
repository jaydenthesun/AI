"use client";

import type {
  CoursePlan,
  FeedbackEntry,
  OnboardingAnswers,
  PerformanceSnapshot,
  StudentProfile,
} from "@/data/types";

const PROFILE_KEY = "codepath_profile_v1";
const COURSE_KEY = "codepath_course_v1";
const PERF_KEY = "codepath_performance_v1";
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
  difficultySuccessRate: {},
  confidenceRatings: {},
  completedLessonIds: [],
  completedAssignmentIds: [],
  completedQuizIds: [],
  streakDays: 0,
  lastActiveDate: new Date().toISOString(),
  recentFeedback: [],
  codeSubmissions: [],
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
    return {
      ...base,
      ...parsed,
      recentFeedback: Array.isArray(parsed.recentFeedback) ? parsed.recentFeedback : [],
      codeSubmissions: Array.isArray(parsed.codeSubmissions) ? parsed.codeSubmissions : [],
    };
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
