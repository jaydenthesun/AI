"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Rocket, Radar, Flame, Target, BookOpenCheck, Gauge, MessageSquareText, ListChecks } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { ProgressRings } from "@/components/dashboard/ProgressRings";
import { WeeklyTrend } from "@/components/dashboard/WeeklyTrend";
import { useLocalCourse } from "@/lib/hooks/useLocalCourse";
import { adaptLearningPath } from "@/lib/feedbackLoop";
import { mockAdaptiveRecommendations } from "@/lib/mockAI";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, course, perf, ready } = useLocalCourse();

  useEffect(() => {
    if (!ready) return;
    if (!profile || !course) router.replace("/onboarding");
  }, [course, profile, ready, router]);

  if (!profile || !course) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-4 text-center text-zinc-400">
        <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
        <p className="mt-6 text-sm">Synthesizing your trajectory…</p>
      </div>
    );
  }

  const totalLessons = course.lessons.length;
  const done = perf.completedLessonIds.length;
  const lessonPct = totalLessons ? Math.min(100, (done / totalLessons) * 100) : 0;
  const roadmapPct =
    course.roadmap.length > 0
      ? Math.min(100, (course.roadmap.filter((w) => w.lessonIds.every((id) => perf.completedLessonIds.includes(id))).length /
          course.roadmap.length) *
          100)
      : lessonPct || 42;

  const adaptation = adaptLearningPath(perf, profile);
  const recs = mockAdaptiveRecommendations(profile.learningStyles);

  const currentLesson =
    course.lessons.find((l) => perf.completedLessonIds.includes(l.id) === false)?.id ?? course.lessons[0]?.id ?? "lesson-1";

  const currentMeta = course.lessons.find((l) => l.id === currentLesson);
  const nextLessonId =
    course.lessons.find((l, i) => {
      const idx = course.lessons.findIndex((x) => x.id === currentLesson);
      return i > idx && !perf.completedLessonIds.includes(l.id);
    })?.id ??
    course.lessons.find((l) => !perf.completedLessonIds.includes(l.id))?.id ??
    currentLesson;

  const assignmentEntries = Object.entries(perf.assignmentScores);
  const recentScores = [...Object.values(perf.assignmentScores), ...Object.values(perf.quizScores)];
  const meanScore = recentScores.length
    ? Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length)
    : null;

  const overallPct = Math.round(lessonPct * 0.55 + roadmapPct * 0.45);

  const difficultyLabel =
    profile.codingLevel === "advanced"
      ? meanScore !== null && meanScore > 85
        ? "Advanced · pace-up eligible"
        : "Advanced · calibrated"
      : profile.codingLevel === "intermediate"
        ? meanScore !== null && meanScore < 65
          ? "Intermediate · easing"
          : "Intermediate · steady"
        : meanScore !== null && meanScore < 60
          ? "Beginner · extra scaffolding"
          : "Beginner · supported";

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Orbital cockpit</div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-display text-4xl text-white"
          >
            Welcome back, {profile.name?.split?.(" ")?.[0] ?? "Explorer"}
          </motion.h1>
          <p className="mt-4 max-w-2xl text-zinc-400">{course.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={`/lesson/${currentLesson}`}>
            <GlowButton className="gap-2">
              <BookOpenCheck className="h-4 w-4" /> Resume orbit
            </GlowButton>
          </Link>
          <Link href="/course-path">
            <GlowButton variant="ghost">Full course path</GlowButton>
          </Link>
          <Link href="/code-review">
            <GlowButton variant="ghost">Open Greptile console</GlowButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Overall progress</div>
            <Gauge className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="mt-4 text-5xl font-semibold text-white">{overallPct}%</div>
          <p className="mt-3 text-xs text-zinc-500">Blended weekly roadmap + lesson completion (mock telemetry).</p>
        </GlassCard>
        <GlassCard delay={0.04}>
          <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Current lesson</div>
          <div className="mt-4 text-lg font-semibold leading-snug text-white">{currentMeta?.title ?? currentLesson}</div>
          <p className="mt-2 text-xs text-zinc-500">{done}/{totalLessons} lessons complete</p>
          <Link href={`/lesson/${currentLesson}`} className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-cyan-200 hover:text-white">
            Open lesson →
          </Link>
        </GlassCard>
        <GlassCard delay={0.08}>
          <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Recommended next</div>
          <div className="mt-4 text-lg font-semibold text-white">
            {course.lessons.find((l) => l.id === nextLessonId)?.title ?? "Stay on trajectory"}
          </div>
          <Link href={`/lesson/${nextLessonId}`} className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-fuchsia-200 hover:text-white">
            Jump ahead →
          </Link>
        </GlassCard>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Progress synthesis</div>
              <div className="mt-3 text-2xl font-semibold text-white">{course.title}</div>
              <p className="mt-4 text-sm text-zinc-400">{course.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-cyan-100/80">
                {adaptation.suggestedResourceTypes.map((t) => (
                  <span key={t} className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 capitalize">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <ProgressRings roadmap={roadmapPct} lessonsDone={lessonPct || 38} />
          </div>

          <div className="mt-10 rounded-3xl border border-white/10 bg-black/35 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Weekly analytics</div>
              <Rocket className="h-5 w-5 text-cyan-300" />
            </div>
            <WeeklyTrend />
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard delay={0.05}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Streak constellation</div>
              <Flame className="h-5 w-5 text-orange-300" />
            </div>
            <div className="mt-5 text-4xl font-semibold text-white">{perf.streakDays || 7} days</div>
            <p className="mt-3 text-xs text-zinc-500">
              Lightweight streak pacing tuned to motivation: {profile.motivationStyle.replaceAll("_", " ")}.
            </p>
          </GlassCard>

          <GlassCard delay={0.1}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Weak vs strong spectra</div>
              <Radar className="h-5 w-5 text-violet-300" />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-wide text-rose-200/70">Developing</div>
                <div className="mt-3 space-y-2 text-sm text-zinc-300">
                  {(perf.weakTopics.length ? perf.weakTopics : ["Async nuance", "Proof tactics"]).slice(0, 3).map((t) => (
                    <div key={t} className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-3 py-2">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-emerald-200/70">Momentum</div>
                <div className="mt-3 space-y-2 text-sm text-zinc-300">
                  {(perf.strongTopics.length ? perf.strongTopics : ["Data modeling", "UI craft"]).slice(0, 3).map((t) => (
                    <div key={t} className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-3 py-2">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard delay={0.14}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Adaptive next beats</div>
              <Target className="h-5 w-5 text-fuchsia-300" />
            </div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {recs.map((r) => (
                <li key={r} className="rounded-2xl border border-white/5 bg-black/35 px-3 py-3">
                  {r}
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard delay={0.18}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Recent feedback</div>
              <MessageSquareText className="h-5 w-5 text-cyan-200" />
            </div>
            {perf.recentFeedback.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">
                Complete a quiz, assignment, or code review to populate this feedback rail on your dashboard.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {perf.recentFeedback.slice(0, 5).map((f) => (
                  <div key={f.id} className="rounded-2xl border border-white/8 bg-black/35 px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-white">{f.title}</span>
                      {typeof f.score === "number" ? (
                        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs text-emerald-100">
                          {f.score}%
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-zinc-400">{f.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard delay={0.22}>
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Assignment scores</div>
              <ListChecks className="h-5 w-5 text-violet-300" />
            </div>
            {assignmentEntries.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-500">Submit an assignment to populate score trails.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {assignmentEntries.slice(0, 6).map(([aid, sc]) => (
                  <div key={aid} className="flex items-center gap-3">
                    <div className="flex-1 truncate text-xs text-zinc-400">{aid}</div>
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" style={{ width: `${sc}%` }} />
                    </div>
                    <div className="w-10 text-right text-sm text-white">{sc}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-zinc-400">
              <span className="text-zinc-500">Difficulty rail · </span>
              {difficultyLabel}
              {meanScore !== null ? ` · rolling mean ${meanScore}%` : ""}
            </div>
          </GlassCard>

          <GlassCard delay={0.26}>
            <div className="text-sm font-semibold text-white">AI tutor recommendation</div>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300">{adaptation.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {adaptation.nextLessonModifiers.slice(0, 4).map((m) => (
                <span key={m} className="rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-3 py-1 text-[11px] text-fuchsia-50">
                  {m}
                </span>
              ))}
            </div>
            <Link href="/model-routing" className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-cyan-200 hover:text-white">
              Why this routing →
            </Link>
          </GlassCard>
        </div>
      </div>

      {/* Roadmap strip */}
      <GlassCard className="p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Timeline</div>
            <h2 className="mt-2 font-display text-2xl text-white">Roadmap constellation</h2>
          </div>
          <div className="text-sm text-zinc-400">{course.estimatedWeeks} week envelope</div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {course.roadmap.map((w) => (
            <motion.div key={w.week} whileHover={{ y: -4 }} className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-5">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>Week {w.week}</span>
                <span>{w.lessonIds.length} lessons</span>
              </div>
              <div className="mt-3 text-lg font-semibold text-white">{w.title}</div>
              <p className="mt-3 text-sm text-zinc-400">{w.summary}</p>
              <div className="mt-5 flex gap-3">
                {w.lessonIds.map((lid) => (
                  <Link key={lid} href={`/lesson/${lid}`} className="text-xs uppercase tracking-[0.2em] text-cyan-200 hover:text-white">
                    {lid.replace("lesson-", "L")}
                  </Link>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Catalog */}
      <div className="grid gap-8 lg:grid-cols-2">
        <GlassCard>
          <div className="text-sm font-semibold text-white">Lesson fabric</div>
          <div className="mt-5 space-y-3">
            {course.lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lesson/${lesson.id}`}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/35 px-4 py-3 text-sm hover:border-cyan-400/30"
              >
                <div>
                  <div className="font-semibold text-white">{lesson.title}</div>
                  <div className="text-xs text-zinc-500">{lesson.estimatedMinutes} minutes • {lesson.topic}</div>
                </div>
                <span className="text-xs capitalize text-emerald-200">{lesson.status.replaceAll("_", " ")}</span>
              </Link>
            ))}
          </div>
        </GlassCard>

        <GlassCard delay={0.05}>
          <div className="text-sm font-semibold text-white">Assignments & quizzes</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Assignments</div>
              <div className="mt-3 space-y-2">
                {course.assignments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/assignment/${a.id}`}
                    className="block rounded-2xl border border-white/5 bg-black/40 px-3 py-2 text-sm text-zinc-200 hover:border-fuchsia-400/30"
                  >
                    {a.title}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Quizzes</div>
              <div className="mt-3 space-y-2">
                {course.quizzes.map((q) => (
                  <Link
                    key={q.id}
                    href={`/quiz/${q.id}`}
                    className="block rounded-2xl border border-white/5 bg-black/35 px-3 py-2 text-sm text-zinc-300 hover:border-cyan-400/30"
                  >
                    {q.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/15 p-4">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Projects</div>
            <div className="mt-3 space-y-3">
              {course.projects.map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/5 bg-black/40 p-4">
                  <div className="font-semibold text-white">{p.title}</div>
                  <p className="mt-2 text-xs text-zinc-400">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
