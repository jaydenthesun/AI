"use client";

const KEY = "codepath_purchased_specialized_v1";

export function loadPurchasedCourseIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as unknown;
    return Array.isArray(data) ? data.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function addPurchasedCourseId(id: string) {
  const prev = loadPurchasedCourseIds();
  const next = Array.from(new Set([...prev, id]));
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function hasPurchasedCourse(id: string): boolean {
  return loadPurchasedCourseIds().includes(id);
}
