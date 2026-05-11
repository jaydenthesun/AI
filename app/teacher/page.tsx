"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Sparkles, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import {
  addTeacherStudent,
  appendScoredSubmission,
  classAverageScore,
  loadTeacherRoster,
  teacherAverageScore,
  type TeacherStudent,
} from "@/lib/teacherStudents";

export default function TeacherPage() {
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [newName, setNewName] = useState("");
  const [draftByStudent, setDraftByStudent] = useState<Record<string, { label: string; body: string }>>({});
  const [scoringId, setScoringId] = useState<string | null>(null);

  useEffect(() => {
    setStudents(loadTeacherRoster());
    setHydrated(true);
  }, []);

  const classAvg = useMemo(() => classAverageScore(students), [students]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    addTeacherStudent(name);
    setStudents(loadTeacherRoster());
    setNewName("");
  }

  function draft(studentId: string) {
    return draftByStudent[studentId] ?? { label: "", body: "" };
  }

  function setDraft(studentId: string, patch: Partial<{ label: string; body: string }>) {
    setDraftByStudent((prev) => ({
      ...prev,
      [studentId]: { ...draft(studentId), ...patch },
    }));
  }

  async function scoreSubmission(student: TeacherStudent) {
    const { label, body } = draft(student.id);
    const submission = body.trim();
    if (!submission || scoringId) return;

    setScoringId(student.id);
    try {
      const res = await fetch("/api/teacher/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission,
          assignmentTitle: label.trim() || undefined,
          studentName: student.name,
        }),
      });
      if (!res.ok) {
        console.error(`Scoring failed: HTTP ${res.status}`);
        return;
      }
      const data = (await res.json()) as {

      const next = appendScoredSubmission(student.id, {
        label: label.trim() || "Submission",
        submission,
        score: typeof data.score === "number" ? data.score : 0,
        rationale: data.rationale ?? "",
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        gaps: Array.isArray(data.gaps) ? data.gaps : [],
      });
      setStudents(next);
      setDraft(student.id, { body: "", label: "" });
    } catch {
      console.error("Scoring request failed");
    } finally {
      setScoringId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Instructor plane</div>
          <h1 className="mt-3 font-display text-4xl text-white">Students</h1>
          <p className="mt-4 max-w-xl text-zinc-400">
            Add learners by name only—no sample roster. Paste written or code submissions and run AI scoring (Clōd when{" "}
            <code className="text-zinc-300">CLOD_API_KEY</code> is set). Data stays in this browser.
          </p>
        </div>
        <Link href="/dashboard">
          <GlowButton variant="ghost">Learner view</GlowButton>
        </Link>
      </div>

      <GlassCard>
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Plus className="h-4 w-4 text-cyan-200" /> Add student
        </div>
        <form onSubmit={handleAdd} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex-1">
            <span className="sr-only">Student name</span>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-2xl border border-white/10 bg-black/45 px-4 py-3 text-sm text-white outline-none ring-cyan-400/35 focus:ring"
            />
          </label>
          <GlowButton type="submit" className="shrink-0">
            Add
          </GlowButton>
        </form>
      </GlassCard>

      {hydrated && students.length === 0 ? (
        <GlassCard className="border-dashed border-white/15 bg-black/25">
          <div className="flex items-center gap-3 text-zinc-400">
            <Users className="h-8 w-8 shrink-0 text-zinc-600" />
            <p className="text-sm">No students yet. Add someone above—there are no template rows.</p>
          </div>
        </GlassCard>
      ) : null}

      {students.length > 0 ? (
        <div className="flex flex-wrap items-center gap-6 text-sm text-zinc-500">
          <span>
            Roster: <span className="text-white">{students.length}</span>
          </span>
          <span>
            Class average (AI-scored): <span className="text-white">{classAvg !== null ? `${classAvg}` : "—"}</span>
          </span>
        </div>
      ) : null}

      <div className="space-y-6">
        {students.map((s, idx) => {
          const avg = teacherAverageScore(s);
          const d = draft(s.id);
          const busy = scoringId === s.id;

          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
              <GlassCard>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <GraduationCap className="h-5 w-5 text-violet-200" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{s.name}</div>
                      <div className="mt-1 text-xs text-zinc-500">
                        Average (AI): <span className="text-zinc-300">{avg !== null ? `${avg} / 100` : "No scores yet"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sparkles className="h-4 w-4 text-amber-200" /> Score a submission
                  </div>
                  <p className="mt-2 text-xs text-zinc-500">
                    Optional label, then paste work. Uses Clōd when configured; otherwise a local heuristic preview.
                  </p>
                  <input
                    value={d.label}
                    onChange={(e) => setDraft(s.id, { label: e.target.value })}
                    placeholder="Assignment label (optional)"
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white outline-none ring-cyan-400/30 focus:ring"
                  />
                  <textarea
                    value={d.body}
                    onChange={(e) => setDraft(s.id, { body: e.target.value })}
                    rows={8}
                    placeholder="Paste student submission…"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-zinc-100 outline-none ring-cyan-400/35 focus:ring"
                  />
                  <GlowButton disabled={busy || !d.body.trim()} onClick={() => scoreSubmission(s)} className="mt-4 w-full sm:w-auto">
                    {busy ? "Scoring…" : "Score with AI"}
                  </GlowButton>
                </div>

                {s.submissions.length > 0 ? (
                  <div className="mt-8 border-t border-white/10 pt-6">
                    <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">Scoring history</div>
                    <ul className="mt-4 space-y-4">
                      {[...s.submissions].reverse().map((sub) => (
                        <li key={sub.id} className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="font-semibold text-white">{sub.label}</span>
                            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-0.5 text-emerald-100">
                              {sub.score} / 100
                            </span>
                          </div>
                          <p className="mt-3 text-zinc-300">{sub.rationale}</p>
                          {sub.strengths.length > 0 ? (
                            <div className="mt-3 text-xs text-emerald-100/90">
                              <span className="text-zinc-500">Strengths: </span>
                              {sub.strengths.join(" · ")}
                            </div>
                          ) : null}
                          {sub.gaps.length > 0 ? (
                            <div className="mt-2 text-xs text-amber-100/85">
                              <span className="text-zinc-500">Gaps: </span>
                              {sub.gaps.join(" · ")}
                            </div>
                          ) : null}
                          <div className="mt-3 text-[11px] text-zinc-600">{new Date(sub.scoredAt).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
