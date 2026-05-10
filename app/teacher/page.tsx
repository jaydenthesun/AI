"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Activity, BellRing, LineChart, Users } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import {
  mockClassStudents,
  mockClassWeakAreas,
  mockInterventions,
  mockRecentSubmissions,
} from "@/data/mockTeacherData";

export default function TeacherPage() {
  const avgScore =
    mockClassStudents.reduce((acc, s) => acc + s.averageScore, 0) / mockClassStudents.length;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Instructor plane</div>
          <h1 className="mt-3 font-display text-4xl text-white">Teacher analytics core</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Class-level telemetry, AI feedback archives, and intervention signals — premium glass panels with mock classroom data.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard">
            <GlowButton variant="ghost">Learner view</GlowButton>
          </Link>
          <GlowButton>Export summary (mock)</GlowButton>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <GlassCard>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Roster energy</div>
            <Users className="h-5 w-5 text-cyan-200" />
          </div>
          <div className="mt-4 text-4xl font-semibold text-white">{mockClassStudents.length}</div>
          <p className="mt-2 text-sm text-zinc-400">Active pathways with adaptive tutors attached.</p>
        </GlassCard>
        <GlassCard delay={0.05}>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Class average</div>
            <LineChart className="h-5 w-5 text-fuchsia-200" />
          </div>
          <div className="mt-4 text-4xl font-semibold text-white">{Math.round(avgScore)}</div>
          <p className="mt-2 text-sm text-zinc-400">Aggregated over mock assignment + quiz heuristics.</p>
        </GlassCard>
        <GlassCard delay={0.1}>
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Interventions</div>
            <BellRing className="h-5 w-5 text-amber-200" />
          </div>
          <div className="mt-4 text-4xl font-semibold text-white">{mockInterventions.length}</div>
          <p className="mt-2 text-sm text-zinc-400">Suggested nudges awaiting human approval.</p>
        </GlassCard>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-0">
          <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold text-white">Student progress</div>
          <div className="divide-y divide-white/5">
            {mockClassStudents.map((s) => (
              <motion.div key={s.id} layout className="grid gap-4 px-6 py-5 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <div className="text-lg font-semibold text-white">{s.name}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-500">{s.engagement} engagement</div>
                  <p className="mt-3 text-sm text-zinc-400">Last: {s.lastSubmission}</p>
                </div>
                <div className="space-y-3 text-sm text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span>Roadmap</span>
                    <span className="text-white">{s.roadmapProgress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${s.roadmapProgress}%` }} />
                  </div>
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-100">
                    Weak focus: {s.weakArea}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Activity className="h-4 w-4 text-emerald-200" /> Class-wide weak spectra
            </div>
            <div className="mt-5 space-y-4">
              {mockClassWeakAreas.map((row) => (
                <div key={row.topic} className="flex items-center gap-4">
                  <div className="flex-1 text-sm text-zinc-300">{row.topic}</div>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.count * 10}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-orange-400"
                    />
                  </div>
                  <div className="w-12 text-right text-xs text-zinc-500">{row.count}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.05}>
            <div className="text-sm font-semibold text-white">Recent submissions</div>
            <div className="mt-4 space-y-3">
              {mockRecentSubmissions.map((row) => (
                <div key={row.student + row.title} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm">
                  <div>
                    <div className="font-semibold text-white">{row.student}</div>
                    <div className="text-xs text-zinc-400">{row.title}</div>
                  </div>
                  <div className="text-emerald-200">{row.score}</div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard delay={0.1}>
            <div className="text-sm font-semibold text-white">AI feedback history · suggested interventions</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-300">
              {mockInterventions.map((msg) => (
                <li key={msg} className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-3 py-3">
                  {msg}
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
