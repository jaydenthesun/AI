"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  bumpStreak,
  loadDisplayCoursePlan,
  loadPerformance,
  savePerformance,
  syncAdaptivePlanFromPerformance,
} from "@/lib/storage";
import { recordQuizAttempt } from "@/lib/feedbackLoop";
import { appendFeedbackEntry } from "@/lib/storage";
import { cn } from "@/lib/cn";

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();
  const router = useRouter();
  const id = params.quizId;
  const course = typeof window !== "undefined" ? loadDisplayCoursePlan() : null;

  const quiz = useMemo(() => {
    const q = course?.quizzes.find((x) => x.id === id);
    return (
      q ?? {
        id,
        title: "Sample pulse check",
        lessonRef: "lesson-1",
        estimatedMinutes: 10,
        questions: [
          {
            id: "x1",
            prompt: "What tightens the adaptive loop fastest?",
            options: ["Lowering feedback latency", "More slides", "Longer videos", "Passive reading"],
            correctIndex: 0,
          },
        ],
      }
    );
  }, [course?.quizzes, id]);

  const topic = useMemo(() => {
    const lesson = course?.lessons.find((l) => l.id === quiz.lessonRef);
    return lesson?.topic ?? "Foundations";
  }, [course?.lessons, quiz.lessonRef]);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const sessionStartedAtRef = useRef<number | null>(null);
  useEffect(() => {
    sessionStartedAtRef.current = Date.now();
  }, [id]);

  const scorePct = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct += 1;
    });
    return quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0;
  }, [answers, quiz.questions, submitted]);

  function toggleAnswer(qid: string, idx: number) {
    if (submitted) return;
    setAnswers((a) => ({ ...a, [qid]: idx }));
  }

  function finish() {
    setSubmitted(true);
    let correct = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct += 1;
    });
    const pct = quiz.questions.length ? Math.round((correct / quiz.questions.length) * 100) : 0;
    const started = sessionStartedAtRef.current ?? Date.now();
    const elapsed = Math.max(0, (Date.now() - started) / 1000);
    const answeredAll = quiz.questions.every((q) => answers[q.id] !== undefined);
    const quickGuess = answeredAll && elapsed < 5;

    const perf0 = bumpStreak(loadPerformance());
    const perf1 = recordQuizAttempt(perf0, topic, pct);
    const perf2 = appendFeedbackEntry(perf1, {
      kind: "quiz",
      title: quiz.title,
      summary: `Score ${pct}% • retries on weak topics increment when below mastery threshold`,
      score: pct,
    });
    const perf3 = {
      ...perf2,
      quizScores: { ...perf2.quizScores, [quiz.id]: pct },
      completedQuizIds: Array.from(new Set([...perf2.completedQuizIds, quiz.id])),
      behaviorSignals: {
        ...perf2.behaviorSignals,
        quizTotalSeconds: perf2.behaviorSignals.quizTotalSeconds + elapsed,
        quizSessionsCompleted: perf2.behaviorSignals.quizSessionsCompleted + 1,
        quizQuickGuessCount: perf2.behaviorSignals.quizQuickGuessCount + (quickGuess ? 1 : 0),
      },
    };
    savePerformance(perf3);
    syncAdaptivePlanFromPerformance();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Adaptive probe</div>
          <h1 className="mt-2 font-display text-4xl text-white">{quiz.title}</h1>
          <p className="mt-3 text-sm text-zinc-400">
            ~{quiz.estimatedMinutes} min • binds to {quiz.lessonRef} • updates weak/strong spectra
          </p>
        </div>
        <GlowButton variant="ghost" onClick={() => router.back()}>
          Back
        </GlowButton>
      </div>

      <div className="mt-10 space-y-5">
        {quiz.questions.map((q, qi) => (
          <GlassCard key={q.id} delay={qi * 0.04}>
            <div className="text-sm font-semibold text-white">
              {qi + 1}. {q.prompt}
            </div>
            <div className="mt-4 grid gap-3">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;
                const reveal = submitted && idx === q.correctIndex;
                const wrongPick = submitted && selected && idx !== q.correctIndex;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleAnswer(q.id, idx)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-left text-sm transition",
                      selected ? "border-cyan-400/70 bg-cyan-400/15 text-white" : "border-white/10 bg-black/40 text-zinc-300",
                      reveal && "border-emerald-400/70 bg-emerald-500/10",
                      wrongPick && "border-rose-400/70 bg-rose-500/10",
                    )}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </GlassCard>
        ))}
      </div>

      {!submitted ? (
        <GlowButton
          className="mt-10 w-full"
          disabled={quiz.questions.some((q) => answers[q.id] === undefined)}
          onClick={finish}
        >
          Commit answers
        </GlowButton>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 space-y-4">
          <GlassCard className="border-emerald-400/30 bg-emerald-500/10 text-emerald-50">
            <div className="text-sm uppercase tracking-[0.25em] text-emerald-200/70">Trajectory signal</div>
            <div className="mt-3 text-3xl font-semibold text-white">{scorePct}% calibrated</div>
            <p className="mt-4 text-sm text-emerald-100/90">
              Mock grading recorded. Adaptive engine will remix upcoming modality density based on score + dwell patterns.
            </p>
          </GlassCard>
          <Link href="/dashboard">
            <GlowButton variant="ghost" className="w-full">
              Return to cockpit
            </GlowButton>
          </Link>
        </motion.div>
      )}
    </div>
  );
}
