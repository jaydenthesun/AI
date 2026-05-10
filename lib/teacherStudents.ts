"use client";

const ROSTER_KEY = "codepath_teacher_roster_v1";

export interface TeacherScoredSubmission {
  id: string;
  label: string;
  submission: string;
  score: number;
  rationale: string;
  strengths: string[];
  gaps: string[];
  scoredAt: string;
}

export interface TeacherStudent {
  id: string;
  name: string;
  addedAt: string;
  submissions: TeacherScoredSubmission[];
}

export function loadTeacherRoster(): TeacherStudent[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(ROSTER_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return [];
    return data as TeacherStudent[];
  } catch {
    return [];
  }
}

export function saveTeacherRoster(students: TeacherStudent[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ROSTER_KEY, JSON.stringify(students));
}

export function addTeacherStudent(name: string): TeacherStudent {
  const trimmed = name.trim();
  const student: TeacherStudent = {
    id: crypto.randomUUID(),
    name: trimmed || "Unnamed student",
    addedAt: new Date().toISOString(),
    submissions: [],
  };
  const next = [...loadTeacherRoster(), student];
  saveTeacherRoster(next);
  return student;
}

export function teacherAverageScore(s: TeacherStudent): number | null {
  if (s.submissions.length === 0) return null;
  const sum = s.submissions.reduce((acc, x) => acc + x.score, 0);
  return Math.round(sum / s.submissions.length);
}

export function classAverageScore(students: TeacherStudent[]): number | null {
  const withScores = students.map(teacherAverageScore).filter((x): x is number => x !== null);
  if (withScores.length === 0) return null;
  return Math.round(withScores.reduce((a, b) => a + b, 0) / withScores.length);
}

export function appendScoredSubmission(
  studentId: string,
  partial: Pick<TeacherScoredSubmission, "label" | "submission" | "score" | "rationale" | "strengths" | "gaps">,
): TeacherStudent[] {
  const roster = loadTeacherRoster();
  const entry: TeacherScoredSubmission = {
    id: crypto.randomUUID(),
    scoredAt: new Date().toISOString(),
    ...partial,
  };
  const next = roster.map((s) =>
    s.id === studentId ? { ...s, submissions: [...s.submissions, entry] } : s,
  );
  saveTeacherRoster(next);
  return next;
}
