"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Cpu,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Timer,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { WeeklyTrend } from "@/components/dashboard/WeeklyTrend";
import { mockTutorReply } from "@/lib/mockAI";
import { routeTask } from "@/lib/modelRouter";
import { shouldOfferVisualHint } from "@/lib/feedbackLoop";
import { lessonPreamble } from "@/lib/personalization";
import {
  bumpStreak,
  loadDisplayCoursePlan,
  loadPerformance,
  loadProfile,
  savePerformance,
  setCurrentLessonId,
} from "@/lib/storage";
import type { Lesson, LessonBeat, LessonSection } from "@/data/types";

function LessonBeatBlock({
  beat,
  revealed,
  onInteract,
}: {
  beat: LessonBeat;
  revealed: boolean;
  onInteract: () => void;
}) {
  if (beat.kind === "checkpoint" || beat.kind === "micro_reflect") {
    return (
      <div className="mt-4 rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-4 text-sm text-zinc-200">
        <div className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-200/80">{beat.kind.replaceAll("_", " ")}</div>
        <p className="mt-2">{beat.prompt}</p>
        {!revealed ? (
          <GlowButton variant="ghost" className="mt-3 w-full text-xs" onClick={onInteract}>
            Log reflection → adaptive engine
          </GlowButton>
        ) : (
          <p className="mt-3 text-xs text-emerald-200">Logged — pacing model updated.</p>
        )}
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-2xl border border-cyan-400/35 bg-cyan-400/10 p-4 text-sm text-zinc-100">
      <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/80">Prediction probe</div>
      <p className="mt-2">{beat.prompt}</p>
      <div className="mt-3 grid gap-2">
        {beat.options?.map((opt, idx) => (
          <button
            key={opt}
            type="button"
            disabled={revealed}
            onClick={onInteract}
            className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-left text-xs hover:border-cyan-400/40 disabled:opacity-60"
          >
            {opt}
            {revealed && beat.correctIndex === idx ? <span className="ml-2 text-emerald-300">· model anchor</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

function FallbackLesson(slug: string): Lesson {
  return {
    id: slug,
    title: "Sample orbit — Foundations",
    topic: "Adaptive systems",
    estimatedMinutes: 40,
    status: "in_progress",
    sections: [
      {
        id: "fs1",
        title: "Ingress",
        summary: "Establish context before mechanics.",
        expandedContent:
          "This sample lesson activates when no generated course is present. Complete onboarding to unlock your full constellation.",
        diagramPrompt: "Constellation graph of dependencies",
      },
      {
        id: "fs2",
        title: "Kernel",
        summary: "Micro kernel of the idea.",
        expandedContent: "Practice isolating variables, documenting invariants, and narrating runtime behavior.",
        codeExample: "function invariant(x){ return audit(x); }",
      },
    ],
    challenges: ["Trace runtime on paper", "Add two adversarial inputs"],
  };
}

export default function LessonPage() {
  const params = useParams<{ lessonId: string }>();
  const slug = params.lessonId;
  const profile = typeof window !== "undefined" ? loadProfile() : null;
  const course = typeof window !== "undefined" ? loadDisplayCoursePlan() : null;

  const lesson = useMemo(() => {
    const found = course?.lessons.find((l) => l.id === slug);
    return found ?? FallbackLesson(slug);
  }, [course?.lessons, slug]);

  const suggestVisual = useMemo(() => {
    if (typeof window === "undefined") return false;
    const perf = loadPerformance();
    return shouldOfferVisualHint(perf, lesson.id, profile?.learningStyles ?? []);
  }, [lesson.id, profile?.learningStyles]);

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(lesson.sections.map((s, i) => [s.id, i === 0])),
  );
  const [tutorOpen, setTutorOpen] = useState(true);
  const [tutorBusy, setTutorBusy] = useState(false);
  const [tutorThread, setTutorThread] = useState<Array<{ role: "you" | "agent"; content: string; meta?: string }>>([]);
  const [draft, setDraft] = useState("How should I prioritize practice this week?");
  const [timer, setTimer] = useState(0);
  const sectionOpenedAt = useRef<Record<string, number>>({});
  const [beatLogged, setBeatLogged] = useState<Record<string, boolean>>({});

  const routingSnippet = routeTask(2, "lesson_generation");

  const preamble = profile ? lessonPreamble(profile, lesson.topic) : null;

  function logBeatCompletion(beatId: string) {
    if (beatLogged[beatId]) return;
    setBeatLogged((m) => ({ ...m, [beatId]: true }));
    const perf = loadPerformance();
    savePerformance({
      ...perf,
      behaviorSignals: {
        ...perf.behaviorSignals,
        lessonBeatsCompleted: perf.behaviorSignals.lessonBeatsCompleted + 1,
      },
    });
  }

  function toggle(section: LessonSection) {
    const now = Date.now();
    const wasOpen = !!openSections[section.id];
    if (wasOpen) {
      const openedAt = sectionOpenedAt.current[section.id];
      if (openedAt && now - openedAt < 2000) {
        const perf = loadPerformance();
        savePerformance({
          ...perf,
          behaviorSignals: {
            ...perf.behaviorSignals,
            lessonSectionQuickCollapseCount: perf.behaviorSignals.lessonSectionQuickCollapseCount + 1,
          },
        });
      }
      delete sectionOpenedAt.current[section.id];
    } else {
      sectionOpenedAt.current[section.id] = now;
    }
    setOpenSections((s) => ({ ...s, [section.id]: !s[section.id] }));
  }

  function dispatchTutor() {
    setTutorBusy(true);
    setTimeout(() => {
      const reply = mockTutorReply(lesson.topic, {
        question: draft,
        learningStyles: profile?.learningStyles ?? ["visual"],
        codingLevel: profile?.codingLevel ?? "intermediate",
      });
      setTutorThread((prev) => [
        ...prev,
        { role: "you", content: draft },
        {
          role: "agent",
          content: reply.content + `\n\n_(${reply.media?.placeholder ?? "video bridge"})_`,
          meta: reply.routeReason,
        },
      ]);
      setDraft("");
      setTutorBusy(false);
      const perf = loadPerformance();
      const next = bumpStreak({
        ...perf,
        timeSpentMinutesByLesson: {
          ...perf.timeSpentMinutesByLesson,
          [lesson.id]: (perf.timeSpentMinutesByLesson[lesson.id] ?? 0) + Math.max(6, timer),
        },
      });
      savePerformance(next);
      setTimer(0);
    }, 780);
  }

  function markComplete() {
    const perf = loadPerformance();
    if (!perf.completedLessonIds.includes(lesson.id)) {
      savePerformance(
        bumpStreak({
          ...perf,
          completedLessonIds: [...perf.completedLessonIds, lesson.id],
        }),
      );
    }
    setCurrentLessonId(lesson.id);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-3xl">
          <div className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">Immersive module</div>
          <h1 className="mt-3 font-display text-4xl text-white">{lesson.title}</h1>
          <p className="mt-4 text-zinc-400">
            Estimated {lesson.estimatedMinutes} minutes • {lesson.topic} • Accent modal:{" "}
            {(course?.learningStyleAccent ?? profile?.learningStyles?.[0] ?? "multi").replaceAll("_", " ")}
          </p>
          {preamble ? (
            <div className="mt-4 rounded-2xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm leading-relaxed text-violet-50">
              <span className="text-[10px] uppercase tracking-[0.35em] text-violet-200/80">Personalized preamble · </span>
              {preamble}
            </div>
          ) : null}
          {suggestVisual ? (
            <div className="mt-4 rounded-2xl border border-cyan-400/35 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-50">
              You&apos;ve accumulated dwell time on this topic — the adaptive loop recommends a{" "}
              <span className="font-semibold text-white">visual explanation</span> next. Expand diagram sections or ask the tutor for
              a sketch brief.
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <GlowButton variant="ghost" className="gap-2 text-xs uppercase tracking-[0.2em]" onClick={() => setTimer((t) => t + 10)}>
              <Timer className="h-4 w-4" /> +10 focus minutes
            </GlowButton>
            <Link href="/dashboard">
              <GlowButton variant="ghost">Trajectory</GlowButton>
            </Link>
            <GlowButton onClick={markComplete}>Mark mastery checkpoint</GlowButton>
          </div>
        </div>
        <GlassCard className="w-full max-w-sm animate-floaty p-6">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Routed lane</span>
            <Sparkles className="h-4 w-4 text-cyan-200" />
          </div>
          <div className="mt-3 text-sm font-semibold text-white">{routingSnippet.primaryModel}</div>
          <p className="mt-3 text-xs text-zinc-400">{routingSnippet.reason}</p>
        </GlassCard>
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-5">
          {lesson.sections.map((section) => {
            const open = !!openSections[section.id];
            return (
              <motion.div layout key={section.id} className="overflow-hidden rounded-3xl border border-white/10 bg-surface/60 shadow-card backdrop-blur-xl">
                <button type="button" onClick={() => toggle(section)} className="flex w-full items-start justify-between gap-6 px-6 py-6 text-left">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
                      <Cpu className="h-4 w-4 text-cyan-300" /> {section.title}
                    </div>
                    <div className="mt-3 text-xl font-semibold text-white">{section.summary}</div>
                  </div>
                  <motion.span animate={{ rotate: open ? 90 : 0 }} className="text-zinc-500">
                    ›
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45 }}
                      className="border-t border-white/5 px-6 py-6"
                    >
                      <p className="text-sm leading-relaxed text-zinc-300">{section.expandedContent}</p>
                      {section.diagramPrompt && (
                        <div className="mt-4 rounded-3xl border border-dashed border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 p-5 text-xs text-cyan-100">
                          Animated diagram briefing: <span className="text-white">{section.diagramPrompt}</span>
                        </div>
                      )}
                      {section.codeExample && (
                        <pre className="mt-4 overflow-auto rounded-2xl border border-white/10 bg-black/60 p-4 font-mono text-xs text-emerald-100">
                          {section.codeExample}
                        </pre>
                      )}
                      {section.videoPlaceholder && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-black/55 p-4 text-xs text-zinc-400">
                          Video scaffold: <span className="text-white">{section.videoPlaceholder}</span>
                        </div>
                      )}
                      {section.beats?.map((beat) => (
                        <LessonBeatBlock
                          key={beat.id}
                          beat={beat}
                          revealed={!!beatLogged[beat.id]}
                          onInteract={() => logBeatCompletion(beat.id)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          <GlassCard className="p-8">
            <div className="text-sm font-semibold text-white">Practice challenges</div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {lesson.challenges.map((c, idx) => (
                <div key={c} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-zinc-200">
                  <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Probe {idx + 1}</div>
                  <div className="mt-2">{c}</div>
                </div>
              ))}
            </div>
            <WeeklyTrend />
          </GlassCard>
        </div>

        <GlassCard className="h-fit p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-violet-200" />
              <div className="text-sm font-semibold text-white">Clōd tutor braid</div>
            </div>
            <button type="button" onClick={() => setTutorOpen((x) => !x)} aria-label="Toggle tutor" className="rounded-full border border-white/10 p-2 text-zinc-300 hover:bg-white/5">
              {tutorOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </button>
          </div>
          {tutorOpen && (
            <>
              <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-2 text-sm">
                <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/5 p-4 text-xs text-cyan-100">
                  Nia will inject citations; Greptile will watch your repos. MVP streams mock scaffolding only.
                </div>
                {tutorThread.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`rounded-2xl border px-3 py-3 ${
                      msg.role === "you" ? "border-white/10 bg-black/35 text-zinc-200" : "border-violet-400/40 bg-violet-500/10 text-zinc-100"
                    }`}
                  >
                    {msg.role === "agent" && msg.meta ? (
                      <div className="mb-2 text-[10px] uppercase tracking-[0.3em] text-violet-200/70">{msg.meta}</div>
                    ) : null}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                ))}
              </div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm outline-none ring-cyan-400/40 focus:ring"
              />
              <GlowButton disabled={tutorBusy} onClick={dispatchTutor} className="mt-4 w-full">
                {tutorBusy ? "Routing…" : "Dispatch tutor"}
              </GlowButton>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
