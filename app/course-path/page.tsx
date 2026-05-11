"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookMarked, CalendarClock, ClipboardCheck, Hammer, Sparkles, Layers } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { useLocalCourse } from "@/lib/hooks/useLocalCourse";
import { specializedCourses } from "@/data/specializedCourses";
import { loadPurchasedCourseIds } from "@/lib/purchasedCourses";
import { getModulesForCourse } from "@/lib/specializedModules";
import { moduleProgressFraction } from "@/lib/specializedProgress";

export default function CoursePathPage() {
  const router = useRouter();
  const { profile, course, perf, ready } = useLocalCourse();
  const [purchasedSpecIds, setPurchasedSpecIds] = useState<string[]>([]);

  useEffect(() => {
    setPurchasedSpecIds(loadPurchasedCourseIds());
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!profile || !course) router.replace("/onboarding");
  }, [course, profile, ready, router]);

  if (!profile || !course) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-xl flex-col items-center justify-center px-4 text-center text-zinc-400">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/10" />
        <p className="mt-4 text-sm">Loading course constellation…</p>
      </div>
    );
  }

  const totalLessons = course.lessons.length;
  const completedWeeks = course.roadmap.filter((w) =>
    w.lessonIds.every((id) => perf.completedLessonIds.includes(id)),
  ).length;
  const roadmapPct = course.roadmap.length ? Math.round((completedWeeks / course.roadmap.length) * 100) : 0;
  const lessonPct = totalLessons ? Math.round((perf.completedLessonIds.length / totalLessons) * 100) : 0;
  const blendedProgress = Math.round(lessonPct * 0.55 + roadmapPct * 0.45);

  const difficultyLabel =
    profile.codingLevel === "advanced" ? "Stretch / research-adjacent" : profile.codingLevel === "intermediate" ? "Balanced challenge" : "Foundations-first";

  const ownedSpecialized = specializedCourses.filter((c) => purchasedSpecIds.includes(c.id));

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Personalized orbit</div>
          <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-display text-4xl text-white">
            {course.title}
          </motion.h1>
          <p className="mt-4 max-w-2xl text-zinc-400">{course.subtitle}</p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-zinc-500">
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-zinc-300">
              {(profile.preferredLanguage ?? "python").toUpperCase()} syntax lane
            </span>
            <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-zinc-300">
              ~{course.estimatedWeeks} week envelope
            </span>
            <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-3 py-1 text-violet-100">
              Recommended difficulty: {difficultyLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <GlowButton variant="ghost">Student cockpit</GlowButton>
          </Link>
          <Link href={`/lesson/${course.lessons[0]?.id ?? "lesson-1"}`}>
            <GlowButton className="gap-2">
              <Sparkles className="h-4 w-4" /> Resume lessons
            </GlowButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <GlassCard>
          <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Blended progress</div>
          <div className="mt-3 text-4xl font-semibold text-white">{blendedProgress}%</div>
          <p className="mt-2 text-xs text-zinc-500">Lessons + weekly roadmap completion.</p>
        </GlassCard>
        <GlassCard delay={0.04}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
            <BookMarked className="h-4 w-4 text-cyan-300" /> Lessons
          </div>
          <div className="mt-3 text-4xl font-semibold text-white">
            {perf.completedLessonIds.length}/{totalLessons}
          </div>
        </GlassCard>
        <GlassCard delay={0.08}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
            <CalendarClock className="h-4 w-4 text-fuchsia-300" /> Assessments
          </div>
          <div className="mt-3 text-4xl font-semibold text-white">{course.assessments.length}</div>
          <p className="mt-2 text-xs text-zinc-500">Timed checkpoints along the path.</p>
        </GlassCard>
        <GlassCard delay={0.12}>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
            <Hammer className="h-4 w-4 text-amber-300" /> Projects
          </div>
          <div className="mt-3 text-4xl font-semibold text-white">{course.projects.length}</div>
        </GlassCard>
      </div>

      <GlassCard className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Weekly roadmap</div>
            <h2 className="mt-2 font-display text-2xl text-white">Timeline</h2>
          </div>
          <p className="text-sm text-zinc-400">Generated locally — swap for Claude + Nia-backed planners later.</p>
        </div>
        <div className="relative mt-10 border-l border-white/10 pl-6">
          {course.roadmap.map((w, idx) => {
            const done = w.lessonIds.every((id) => perf.completedLessonIds.includes(id));
            return (
              <motion.div
                key={w.week}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="relative pb-12 last:pb-0"
              >
                <span
                  className={`absolute -left-[29px] top-1 flex h-4 w-4 rounded-full border-2 ${
                    done ? "border-emerald-400 bg-emerald-400/40" : "border-white/25 bg-black"
                  }`}
                />
                <div className="text-xs text-zinc-500">Week {w.week}</div>
                <div className="mt-1 text-lg font-semibold text-white">{w.title}</div>
                <p className="mt-2 text-sm text-zinc-400">{w.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {w.lessonIds.map((lid) => (
                    <Link
                      key={lid}
                      href={`/lesson/${lid}`}
                      className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-cyan-100 hover:border-cyan-400/40"
                    >
                      {lid}
                    </Link>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-8 lg:grid-cols-2">
        <GlassCard>
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <ClipboardCheck className="h-4 w-4 text-emerald-300" /> Assessments
          </div>
          <ul className="mt-5 space-y-4">
            {course.assessments.map((a) => (
              <li key={a.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="font-semibold text-white">{a.title}</div>
                <div className="mt-2 text-xs text-zinc-500">~{a.estimatedMinutes} minutes</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {a.focuses.map((f) => (
                    <span key={f} className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-zinc-300">
                      {f}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard delay={0.05}>
          <div className="text-sm font-semibold text-white">Projects & deliverables</div>
          <div className="mt-5 space-y-4">
            {course.projects.map((p) => (
              <div key={p.id} className="rounded-2xl border border-white/10 bg-black/40 p-5">
                <div className="font-semibold text-white">{p.title}</div>
                <p className="mt-2 text-sm text-zinc-400">{p.description}</p>
                <div className="mt-4 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  ~{p.estimatedHours.toFixed(1)} hours
                </div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  {p.milestones.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="text-cyan-400/80">•</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {ownedSpecialized.length > 0 ? (
        <GlassCard className="mt-10 border-violet-400/15 bg-violet-500/[0.04]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-violet-200/80">
                <Layers className="h-4 w-4" /> Alongside your core path
              </div>
              <h2 className="mt-3 font-display text-2xl text-white">Specialized tracks</h2>
              <p className="mt-3 max-w-2xl text-sm text-zinc-400">
                Premium lanes with labs and checkpoints — open any track to continue where you left off.
              </p>
            </div>
            <Link href="/courses" className="text-xs uppercase tracking-[0.2em] text-cyan-200 hover:text-white">
              Browse store →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ownedSpecialized.map((spec) => {
              const modules = getModulesForCourse(spec);
              const pct = moduleProgressFraction(spec.id, modules.length);
              return (
                <Link
                  key={spec.id}
                  href={`/specialized/${spec.id}`}
                  className="rounded-3xl border border-white/10 bg-black/40 p-5 transition hover:border-violet-400/35"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-display text-lg text-white">{spec.title}</div>
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-zinc-400">{pct}%</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{spec.tagline}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">
                    <Sparkles className="h-3.5 w-3.5" /> Open labs
                  </div>
                </Link>
              );
            })}
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}
