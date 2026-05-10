"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { CodeEditor } from "@/components/code/CodeEditor";
import { enrichAssignmentCopy } from "@/lib/personalization";
import {
  appendFeedbackEntry,
  bumpStreak,
  loadDisplayCoursePlan,
  loadPerformance,
  loadProfile,
  savePerformance,
  syncAdaptivePlanFromPerformance,
} from "@/lib/storage";
import { mergeTopicSignals } from "@/lib/feedbackLoop";

export default function AssignmentPage() {
  const params = useParams<{ assignmentId: string }>();
  const id = params.assignmentId;
  const course = typeof window !== "undefined" ? loadDisplayCoursePlan() : null;
  const assignment = useMemo(() => {
    const a = course?.assignments.find((x) => x.id === id);
    return (
      a ?? {
        id,
        title: "Sandbox assignment",
        lessonRef: "lesson-1",
        description: "Complete onboarding to bind real assignments. For now, ship a micro-function showing adaptive intent.",
        rubric: ["Clarity", "Structure", "Edge handling"],
        estimatedMinutes: 35,
      }
    );
  }, [course?.assignments, id]);

  const topic = useMemo(() => {
    const lesson = course?.lessons.find((l) => l.id === assignment.lessonRef);
    return lesson?.topic ?? "Foundations";
  }, [assignment.lessonRef, course?.lessons]);

  const presented = useMemo(() => {
    if (typeof window === "undefined") return null;
    const profile = loadProfile();
    if (!profile) return null;
    return enrichAssignmentCopy(assignment, profile, loadPerformance(), topic);
  }, [assignment, topic]);

  const [code, setCode] = useState(`// ${assignment.title}\nexport function deliverable(input: unknown) {\n  return { ok: true, echo: input };\n}\n`);
  const [reflection, setReflection] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit() {
    const heuristic = Math.min(
      100,
      60 + Math.min(28, reflection.length / 4) + (code.includes("export") ? 8 : -5),
    );
    const perf0 = bumpStreak(loadPerformance());
    const perf1 = mergeTopicSignals(perf0, topic, heuristic);
    const perf2 = appendFeedbackEntry(perf1, {
      kind: "assignment",
      title: assignment.title,
      summary: `Heuristic score ${heuristic}/100 • topic “${topic}” merged into adaptive spectra`,
      score: heuristic,
    });
    const next = {
      ...perf2,
      assignmentScores: {
        ...perf2.assignmentScores,
        [assignment.id]: heuristic,
      },
      completedAssignmentIds: Array.from(new Set([...perf2.completedAssignmentIds, assignment.id])),
    };
    savePerformance(next);
    syncAdaptivePlanFromPerformance();
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Assignment lattice</div>
          <h1 className="mt-2 font-display text-4xl text-white">{presented?.title ?? assignment.title}</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">{presented?.description ?? assignment.description}</p>
          {presented?.scenarioHook ? (
            <p className="mt-3 max-w-2xl rounded-2xl border border-cyan-400/25 bg-cyan-400/5 px-4 py-3 text-sm text-cyan-50">
              <span className="text-xs uppercase tracking-[0.25em] text-cyan-200/80">Scenario hook · </span>
              {presented.scenarioHook}
            </p>
          ) : null}
          <div className="mt-4 text-xs text-zinc-500">
            Mirrors lesson <span className="text-white">{assignment.lessonRef}</span> • Estimated {assignment.estimatedMinutes}{" "}
            minutes
          </div>
        </div>
        <Link href="/dashboard">
          <GlowButton variant="ghost">Mission control</GlowButton>
        </Link>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <GlassCard className="p-0">
          <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold text-white">Artifact editor</div>
          <div className="p-4">
            <CodeEditor height={340} language="typescript" value={code} onChange={(v) => setCode(v ?? "")} />
          </div>
        </GlassCard>

        <GlassCard>
          <div className="text-sm font-semibold text-white">Rubric & narrative</div>
          <div className="mt-5 space-y-3 text-sm text-zinc-400">
            {assignment.rubric.map((r) => (
              <div key={r} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/40 px-3 py-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" /> {r}
              </div>
            ))}
          </div>
          <label className="mt-8 block text-xs uppercase tracking-[0.3em] text-zinc-500">Confidence & reflection</label>
          <textarea
            rows={8}
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="Hypotheses, surprises, retries, what you would verify in production..."
            className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none ring-cyan-400/35 focus:ring"
          />

          {!submitted ? (
            <GlowButton onClick={submit} className="mt-6 w-full">
              Submit for adaptive grading
            </GlowButton>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-3xl border border-emerald-400/35 bg-emerald-400/10 p-6 text-sm text-emerald-100"
            >
              Submission ingested • Mock heuristic score recorded • Feedback loop merged weak/strong spectra for &ldquo;{topic}
              &rdquo;.{" "}
              <Link className="text-white underline underline-offset-4" href="/dashboard">
                Return to cockpit
              </Link>
              .
            </motion.div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
