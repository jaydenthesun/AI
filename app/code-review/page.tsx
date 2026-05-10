"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Layers, ShieldHalf, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { CodeEditor } from "@/components/code/CodeEditor";
import { mockCodeReview } from "@/lib/mockAI";
import { routeTask } from "@/lib/modelRouter";
import type { CodeReviewResult } from "@/data/types";
import Link from "next/link";

export default function CodeReviewPage() {
  const [language, setLanguage] = useState("typescript");
  const [code, setCode] = useState(`function fetchUser(id: string) {\n  return fetch('/api/users/' + id);\n}`);
  const [result, setResult] = useState<CodeReviewResult | null>(null);
  const [loading, setLoading] = useState(false);

  const routing = routeTask(3, "project_review");

  function runReview() {
    setLoading(true);
    setTimeout(() => {
      setResult(mockCodeReview(code, language));
      setLoading(false);
    }, 900);
  }

  const scoreGlow = result ? Math.min(1, result.score / 100) : 0;

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Greptile-class console</div>
          <h1 className="mt-3 font-display text-4xl text-white">Code sanctum</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Paste submissions, orchestrate tiered reviews, and surface narrative feedback with cinematic telemetry. Outputs are mock
            JSON today; wire real Greptile + Claude when ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-sm text-white outline-none"
          >
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
          <Link href="/dashboard">
            <GlowButton variant="ghost">Dashboard</GlowButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <GlassCard className="p-0">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="text-sm font-semibold text-white">Submission stream</div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Cpu className="h-4 w-4 text-cyan-300" /> {routing.primaryModel}
              </div>
            </div>
            <div className="p-4">
              <CodeEditor height={420} language={language} value={code} onChange={(v) => setCode(v ?? "")} />
            </div>
          </GlassCard>
          <GlowButton onClick={runReview} className="w-full sm:w-auto">
            {loading ? "Entangling graphs…" : "Run AI review"}
          </GlowButton>
        </div>

        <div className="space-y-5">
          <GlassCard className="relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Score field</div>
                <div className="mt-2 text-sm text-zinc-400">{routing.reason}</div>
              </div>
              <ShieldHalf className="h-6 w-6 text-violet-200" />
            </div>
            <div className="relative mt-8 flex items-center justify-center">
              <motion.div
                className="absolute h-48 w-48 rounded-full bg-gradient-to-tr from-cyan-400/40 via-fuchsia-500/35 to-transparent blur-3xl"
                animate={{ scale: loading ? [1, 1.08, 1] : 1 }}
                transition={{ repeat: loading ? Infinity : 0, duration: 2.2 }}
              />
              <div
                className="relative grid h-44 w-44 place-items-center rounded-full border border-white/15 bg-black/70 shadow-glow"
                style={{ boxShadow: `0 0 ${60 + scoreGlow * 60}px rgba(94,234,212,${0.15 + scoreGlow * 0.35})` }}
              >
                <div className="text-center">
                  <div className="text-xs uppercase tracking-[0.4em] text-zinc-500">Score</div>
                  <div className="mt-2 font-display text-5xl text-white">{result ? result.score : "—"}</div>
                </div>
              </div>
            </div>
          </GlassCard>

          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <GlassCard>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Zap className="h-4 w-4 text-amber-300" /> Correctness & readability
                </div>
                <p className="mt-3 text-sm text-zinc-300">{result.correctness}</p>
                <p className="mt-3 text-sm text-zinc-300">{result.readability}</p>
              </GlassCard>

              <GlassCard delay={0.05}>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Layers className="h-4 w-4 text-cyan-200" /> Diagnostics
                </div>
                <ul className="mt-4 space-y-2 text-sm text-rose-100/90">
                  {result.bugs.map((b) => (
                    <li key={b} className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-3 py-2">
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 text-sm text-zinc-300">
                  <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Efficiency</div>
                  <p className="mt-2">{result.efficiency}</p>
                </div>
              </GlassCard>

              <GlassCard delay={0.1}>
                <div className="text-sm font-semibold text-white">Improvements</div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  {result.improvements.map((i) => (
                    <li key={i} className="rounded-2xl border border-white/10 bg-black/45 px-3 py-2">
                      {i}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 text-xs uppercase tracking-[0.3em] text-zinc-500">Refined sketch</div>
                <pre className="mt-3 max-h-56 overflow-auto rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs text-emerald-100">
                  {result.improvedCode}
                </pre>
              </GlassCard>

              <GlassCard delay={0.12}>
                <div className="text-sm font-semibold text-white">Routing handoff</div>
                <p className="mt-3 text-sm text-zinc-400">
                  Next lesson anchor: <span className="text-white">{result.nextLessonId}</span>
                </p>
                <div className="mt-4 space-y-2 text-sm text-zinc-300">
                  {result.practiceRecommendations.map((p) => (
                    <div key={p} className="rounded-2xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-3 py-2">
                      {p}
                    </div>
                  ))}
                </div>
                <Link href={`/lesson/${result.nextLessonId}`}>
                  <GlowButton className="mt-5 w-full">Jump to suggested lesson</GlowButton>
                </Link>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
