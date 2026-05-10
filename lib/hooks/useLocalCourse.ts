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
    setProfile(loadProfile());
    setCourse(loadCoursePlan());
    setPerf(loadPerformance());
    setReady(true);
  }, []);

  return { profile, course, perf, ready, setCourse, setPerf, setProfile };
}
