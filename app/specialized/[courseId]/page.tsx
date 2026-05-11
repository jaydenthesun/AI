"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Circle, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { getSpecializedCourseById } from "@/data/specializedCourses";
import { getModulesForCourse } from "@/lib/specializedModules";
import { getCompletedModuleIds, moduleProgressFraction } from "@/lib/specializedProgress";
import { hasPurchasedCourse } from "@/lib/purchasedCourses";

export default function SpecializedCourseHubPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params.courseId;
  const course = useMemo(() => getSpecializedCourseById(courseId), [courseId]);

  const [ready, setReady] = useState(false);
  const [gateOk, setGateOk] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const refreshProgress = useCallback(() => {
    setCompleted(getCompletedModuleIds(courseId));
  }, [courseId]);

  useEffect(() => {
    const purchased = hasPurchasedCourse(courseId);
    setGateOk(!!course && purchased);
    refreshProgress();
    setReady(true);
  }, [courseId, course, refreshProgress]);

  useEffect(() => {
    function onFocus() {
      refreshProgress();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshProgress]);

  useEffect(() => {
    if (!ready) return;
    if (!course) {
      router.replace("/courses");
      return;
    }
    if (!hasPurchasedCourse(courseId)) {
      router.replace("/courses");
    }
  }, [ready, course, courseId, router]);

  const modules = course ? getModulesForCourse(course) : [];
  const pct = course ? moduleProgressFraction(course.id, modules.length) : 0;

  if (!ready || !course || !gateOk) {
    return (
      <div className="mx-auto flex min-h-[45vh] max-w-xl flex-col items-center justify-center px-4 text-center text-zinc-400">
        <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
        <p className="mt-6 text-sm">Opening specialized track…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyan-200/80 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Course store
          </Link>
          <div className="mt-4 text-xs uppercase tracking-[0.3em] text-cyan-200/70">Specialized track</div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl text-white">
            {course.title}
          </motion.h1>
          <p className="mt-4 max-w-2xl text-zinc-400">{course.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-zinc-500">
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-zinc-300">~{course.estimatedHours}h envelope</span>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-emerald-100">Unlocked</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <GlowButton variant="ghost">Dashboard</GlowButton>
          </Link>
          <Link href="/course-path">
            <GlowButton variant="ghost">Core course path</GlowButton>
          </Link>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Lab progress</div>
            <p className="mt-2 text-sm text-zinc-400">
              Complete modules in order or jump ahead — Jarvis (top-left) can coach checkpoints.
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold text-white">{pct}%</div>
            <div className="text-[11px] uppercase tracking-wider text-zinc-500">
              {completed.length}/{modules.length} checkpoints
            </div>
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </GlassCard>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-cyan-300" /> Modules & labs
        </div>
        <ul className="space-y-3">
          {modules.map((m, idx) => {
            const done = completed.includes(m.id);
            return (
              <motion.li
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  href={`/specialized/${course.id}/module/${m.id}`}
                  className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-black/35 p-5 transition hover:border-cyan-400/35 hover:bg-black/45 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-cyan-300">
                      {done ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5 opacity-50" />}
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                        Module {idx + 1} · ~{m.estimatedMinutes} min
                      </div>
                      <div className="mt-1 font-display text-lg text-white">{m.title}</div>
                      <p className="mt-2 text-sm text-zinc-400">{m.summary}</p>
                    </div>
                  </div>
                  <GlowButton variant="ghost" className="shrink-0 sm:ml-4">
                    Open →
                  </GlowButton>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
