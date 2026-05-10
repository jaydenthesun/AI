"use client";

import { useEffect, useState } from "react";
import type { CoursePlan, PerformanceSnapshot, StudentProfile } from "@/data/types";
import {
  emptyPerformanceSnapshot,
  loadCoursePlan,
  loadPerformance,
  loadProfile,
} from "@/lib/storage";

export function useLocalCourse() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [course, setCourse] = useState<CoursePlan | null>(null);
  const [perf, setPerf] = useState<PerformanceSnapshot>(() => emptyPerformanceSnapshot());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function sync() {
      setProfile(loadProfile());
      setCourse(loadCoursePlan());
      setPerf(loadPerformance());
      setReady(true);
    }
    sync();
    function onStorage(e: StorageEvent) {
      if (e.key === "codepath_performance_v1" || e.key === "codepath_course_v1" || e.key === "codepath_profile_v1") sync();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    window.addEventListener("codepath-storage-update", sync);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
      window.removeEventListener("codepath-storage-update", sync);
    };
  }, []);

  return { profile, course, perf, ready, setCourse, setPerf, setProfile };
}
