import type { PerformanceSnapshot } from "./types";

export interface TeacherStudentRow {
  id: string;
  name: string;
  roadmapProgress: number;
  lastSubmission: string;
  weakArea: string;
  engagement: "high" | "medium" | "low";
  averageScore: number;
  snapshot: Partial<PerformanceSnapshot>;
}

export const mockClassStudents: TeacherStudentRow[] = [
  {
    id: "s-ava",
    name: "Ava Chen",
    roadmapProgress: 78,
    lastSubmission: "Binary search debugger — 2h ago",
    weakArea: "Recursion edge cases",
    engagement: "high",
    averageScore: 88,
    snapshot: {
      weakTopics: ["Recursion", "Graphs"],
      strongTopics: ["Arrays", "Strings"],
      streakDays: 12,
    },
  },
  {
    id: "s-jon",
    name: "Jon Patel",
    roadmapProgress: 52,
    lastSubmission: "API mini-project — yesterday",
    weakArea: "Async patterns",
    engagement: "medium",
    averageScore: 74,
    snapshot: {
      weakTopics: ["Async/await"],
      strongTopics: ["HTML/CSS basics"],
      streakDays: 4,
    },
  },
  {
    id: "s-mei",
    name: "Mei Rodriguez",
    roadmapProgress: 91,
    lastSubmission: "Security lab write-up — 30m ago",
    weakArea: "Formal proofs",
    engagement: "high",
    averageScore: 93,
    snapshot: {
      weakTopics: ["Proof techniques"],
      strongTopics: ["Cryptography intuition", "Networks"],
      streakDays: 21,
    },
  },
];

export const mockClassWeakAreas = [
  { topic: "Async / concurrency", count: 9 },
  { topic: "Recursion intuition", count: 7 },
  { topic: "Algorithmic complexity", count: 6 },
  { topic: "Systems memory model", count: 4 },
];

export const mockInterventions = [
  "Offer visual trace diagrams for recursion-heavy cohort.",
  "Switch strugglers to project-based reinforcement for APIs.",
  "Schedule pair-debugging missions for concurrency topics.",
];

export const mockRecentSubmissions = [
  { student: "Ava Chen", title: "Heaps priority queue", score: 90 },
  { student: "Mei Rodriguez", title: "Buffer overflow sandbox", score: 95 },
  { student: "Jon Patel", title: "REST client refactor", score: 72 },
];

export const mockGeneratedAssignments = [
  {
    id: "gen-1",
    title: "Concurrency trace lab",
    summary: "AI-drafted for async weak spots · Greptile-ready rubric",
    targetTopics: ["Async / concurrency"],
    status: "pending_approval" as const,
  },
  {
    id: "gen-2",
    title: "Recursion visual workbook",
    summary: "Diagram-first remediation after cohort retries ≥2",
    targetTopics: ["Recursion intuition"],
    status: "approved" as const,
  },
  {
    id: "gen-3",
    title: "Game-loop state machine",
    summary: "Challenge modality for project-based learners",
    targetTopics: ["Gameplay loops"],
    status: "draft" as const,
  },
];
