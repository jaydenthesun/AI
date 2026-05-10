"use client";

import type { CoursePlan, OnboardingAnswers, PerformanceSnapshot, StudentProfile } from "@/data/types";

const PROFILE_KEY = "codepath_profile_v1";
const COURSE_KEY = "codepath_course_v1";
const PERF_KEY = "codepath_performance_v1";
const CURRENT_LESSON_KEY = "codepath_current_lesson_v1";

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
}

export function loadPerformance(): PerformanceSnapshot {
  if (typeof window === "undefined") return emptyPerformanceSnapshot();
  const raw = localStorage.getItem(PERF_KEY);
  if (!raw) return emptyPerformanceSnapshot();
  try {
    return { ...emptyPerformanceSnapshot(), ...(JSON.parse(raw) as PerformanceSnapshot) };
  } catch {
    return emptyPerformanceSnapshot();
  }
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
