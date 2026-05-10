"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Bolt,
  Brain,
  Cpu,
  LineChart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { ParticleField } from "@/components/effects/ParticleField";
import { ModelArchitecture } from "@/components/routing/ModelArchitecture";
import { WeeklyTrend } from "@/components/dashboard/WeeklyTrend";

export default function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center px-4 pb-24 pt-10 sm:px-6">
        <motion.div style={{ y: heroY }} className="relative overflow-hidden rounded-[40px] border border-white/10 bg-surface/60 shadow-card backdrop-blur-2xl">
          <ParticleField />
          <div className="relative z-10 grid gap-10 px-6 py-14 sm:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-18">
            <div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-100">
                <Sparkles className="h-3.5 w-3.5" />
                Adaptive CS OS
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="mt-6 font-display text-4xl font-semibold leading-tight text-white sm:text-6xl lg:text-[3.65rem]"
              >
                The future tutor for{" "}
                <span className="text-glow bg-gradient-to-r from-cyan-300 via-white to-violet-300 bg-clip-text text-transparent">
                  ambitious builders
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-5 max-w-xl text-lg text-zinc-400"
              >
                CodePath Agent composes personalization, multimodal tutoring, cinematic lessons, adaptive feedback loops, and
                intelligent routing into one premium learning surface.
              </motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-10 flex flex-wrap gap-4">
                <Link href="/onboarding">
                  <GlowButton className="w-full sm:w-auto">Initialize your roadmap</GlowButton>
                </Link>
                <Link href="/dashboard">
                  <GlowButton variant="ghost" className="w-full sm:w-auto">
                    Preview dashboard
                  </GlowButton>
                </Link>
              </motion.div>

              <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {[
                  { label: "Adaptive depth", value: "Live" },
                  { label: "Model routing", value: "Tiered" },
                  { label: "Review layer", value: "Greptile-style" },
                  { label: "Knowledge mesh", value: "Nia-ready" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/5 bg-black/40 p-3">
                    <div className="text-[11px] uppercase tracking-wide text-zinc-500">{item.label}</div>
                    <div className="mt-1 text-sm font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] p-6 shadow-glow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Synthetic cockpit</div>
                    <div className="mt-2 text-xl font-semibold text-white">Live learning telemetry</div>
                  </div>
                  <Bolt className="h-8 w-8 text-cyan-300" />
                </div>
                <div className="mt-6 rounded-3xl border border-white/10 bg-abyss/80 p-4">
                  <WeeklyTrend />
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-3">
                      <div className="text-xs text-emerald-200">Confidence lift</div>
                      <div className="mt-2 text-2xl font-semibold text-white">+18%</div>
                    </div>
                    <div className="rounded-2xl border border-fuchsia-400/25 bg-fuchsia-400/10 p-3">
                      <div className="text-xs text-fuchsia-100">Next action</div>
                      <div className="mt-2 text-sm text-white">Micro-capstone rehearsal</div>
                    </div>
                  </div>
                </div>
                <motion.div className="absolute -right-5 -bottom-10 hidden rounded-3xl border border-white/15 bg-black/70 p-4 shadow-card lg:block" animate={{ y: [0, -12, 0] }} transition={{ duration: 6, repeat: Infinity }}>
                  <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Greptile</div>
                  <div className="mt-3 text-lg font-semibold text-white">Code graph scan</div>
                  <div className="mt-2 text-xs text-emerald-200">Structural health: Stable</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature matrix */}
      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-3">
        {[
          {
            title: "AI tutor mesh",
            copy: "Explanations, challenges, diagrams, code, and pacing tuned to modality — all mock-ready for real APIs.",
            icon: Brain,
          },
          {
            title: "Adaptive engine",
            copy: "Continuous loop across scores, retries, dwell time, and confidence reshapes what's next.",
            icon: Cpu,
          },
          {
            title: "Executive analytics",
            copy: "Cinematic dashboards for learners and mentors with interventions that feel decisive.",
            icon: LineChart,
          },
          {
            title: "Code sanctum",
            copy: "Immersive review console with correctness, readability, efficiency, and next-lesson bridging.",
            icon: ShieldCheck,
          },
        ].map((f, idx) => (
          <GlassCard key={f.title} delay={idx * 0.06} float>
            <f.icon className="h-7 w-7 text-cyan-200" />
            <h3 className="mt-4 font-display text-xl text-white">{f.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{f.copy}</p>
          </GlassCard>
        ))}
      </section>

      {/* Routing anatomy */}
      <section className="mx-auto max-w-6xl space-y-8 px-4 pb-24 sm:px-6">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Orchestration</div>
          <h2 className="mt-2 font-display text-3xl text-white md:text-4xl">Transparent model routing</h2>
          <p className="mt-4 text-zinc-400">
            Tasks flow across cheap, mid, advanced, and media lanes. Clōd teaches, Nia retrieves, Greptile reviews. This MVP visualizes that contract so future integrations slide in cleanly.
          </p>
        </div>
        <ModelArchitecture />
      </section>

      {/* Story scroll */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-28 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-3xl text-white">From onboarding pulse to cinematic lessons</h2>
          <ul className="mt-8 space-y-5 text-zinc-300">
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300 shadow-glow" />
              Guided intake maps level, modality, stamina, motivations, goals, interests, cadence.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_30px_rgba(167,139,250,0.6)]" />
              Generates lessons, quizzes, projects, milestones, timelines, assessments with completion estimates.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_26px_rgba(244,114,182,0.55)]" />
              Adaptive side panel tutors, expandable sections, and motion-rich transitions keep focus high.
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/lesson/lesson-1">
              <GlowButton variant="ghost">Open sample lesson</GlowButton>
            </Link>
            <Link href="/course-path">
              <GlowButton variant="ghost">Course path</GlowButton>
            </Link>
            <Link href="/model-routing">
              <GlowButton variant="ghost">Routing demo</GlowButton>
            </Link>
            <Link href="/code-review">
              <GlowButton>Try code review</GlowButton>
            </Link>
          </div>
        </div>
        <GlassCard className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">Personalized stack</div>
              <div className="text-lg font-semibold text-white">Latency-aware orchestration</div>
            </div>
            <Sparkles className="h-6 w-6 text-fuchsia-200" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Clōd teaching core", "Nia retrieval mesh", "Greptile diff mind", "Media synthesis"].map((layer) => (
              <div key={layer} className="rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-zinc-200">
                {layer}
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* Integrations teaser */}
      <section className="mx-auto mb-28 max-w-6xl px-4 sm:px-6">
        <GlassCard>
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-display text-2xl text-white">Future integrations</h3>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Payments via AllScale, tutor marketplaces via Clustly, partnership rails with Blockchain for Good Alliance,
                Claude / Greptile / Nia production paths, biometric focus signals, real media pipelines.
              </p>
            </div>
            <Link href="/onboarding">
              <GlowButton>Start the onboarding flow</GlowButton>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
