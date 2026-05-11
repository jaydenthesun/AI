"use client";

const KEY = "codepath_specialized_progress_v1";

export type SpecializedProgressMap = Record<string, { completedModuleIds: string[] }>;

export function loadSpecializedProgress(): SpecializedProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return {};
    return data as SpecializedProgressMap;
  } catch {
    return {};
  }
}

function saveSpecializedProgress(map: SpecializedProgressMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

export function getCompletedModuleIds(courseId: string): string[] {
  return loadSpecializedProgress()[courseId]?.completedModuleIds ?? [];
}

export function markModuleComplete(courseId: string, moduleId: string) {
  const map = loadSpecializedProgress();
  const prev = map[courseId]?.completedModuleIds ?? [];
  const nextIds = Array.from(new Set([...prev, moduleId]));
  map[courseId] = { completedModuleIds: nextIds };
  saveSpecializedProgress(map);
  return nextIds;
}

export function moduleProgressFraction(courseId: string, totalModules: number): number {
  if (totalModules <= 0) return 0;
  const done = getCompletedModuleIds(courseId).length;
  return Math.min(100, Math.round((done / totalModules) * 100));
}
