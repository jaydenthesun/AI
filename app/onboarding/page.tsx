"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type {
  CodingLevel,
  InterestArea,
  LearningStyle,
  MotivationStyle,
  ProjectStyle,
} from "@/data/types";
import { generateCoursePlan } from "@/lib/courseGenerator";
import { saveCoursePlan, saveOnboardingProfile } from "@/lib/storage";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { cn } from "@/lib/cn";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  "Level & Confidence",
  "Learning DNA",
  "Interests & Time",
  "Goals & Closing",
];

const LEARNING_LABEL: Record<LearningStyle, string> = {
  visual: "Visual",
  step_by_step: "Step-by-step",
  reverse_engineering: "Reverse-engineering",
  game_based: "Game-based",
  project_based: "Project-based",
  challenge_based: "Challenge-based",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [codingLevel, setCodingLevel] = useState<CodingLevel>("beginner");
  const [confidence, setConfidence] = useState(6);
  const [learningStyles, setLearningStyles] = useState<LearningStyle[]>(["visual", "project_based"]);
  const [motivationStyle, setMotivationStyle] = useState<MotivationStyle>("milestones");
  const [weeklyHours, setWeeklyHours] = useState(6);
  const [interests, setInterests] = useState<InterestArea[]>(["ai", "websites"]);
  const [projectStyle, setProjectStyle] = useState<ProjectStyle>("guided");
  const [goals, setGoals] = useState(
    "Ship a portfolio-ready full-stack project and pass algorithmic interviews with confidence.",
  );

  const canNext = useMemo(() => {
    if (step === 0) return true;
    if (step === 1) return learningStyles.length > 0;
    if (step === 2) return interests.length > 0 && weeklyHours > 0;
    return goals.trim().length > 3;
  }, [goals, interests.length, learningStyles.length, step, weeklyHours]);

  function toggleStyle(s: LearningStyle) {
    setLearningStyles((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function toggleInterest(i: InterestArea) {
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  }

  function finish() {
    const answers = {
      codingLevel,
      learningStyles,
      interests,
      weeklyHours,
      goals: goals.trim(),
      projectStyle,
      confidence,
      motivationStyle,
    };
    saveOnboardingProfile(answers);
    const plan = generateCoursePlan(answers);
    saveCoursePlan(plan);
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:py-20">
      <div className="mb-10 text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Calibration</div>
        <h1 className="mt-3 font-display text-4xl text-white">Architect your cognition profile</h1>
        <p className="mt-4 text-zinc-400">
          CodePath Agent maps how you learn, then fabricates a living curriculum with milestones, assessments, and adaptive
          density.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, idx) => (
          <button
            key={label}
            type="button"
            onClick={() => setStep(idx)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide transition",
              step === idx
                ? "border-cyan-400/40 bg-cyan-400/10 text-white"
                : "border-white/10 bg-transparent text-zinc-500 hover:border-white/20",
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] text-white">
              {idx + 1}
            </span>
            {label}
          </button>
        ))}
      </div>

      <GlassCard className="p-8 sm:p-10">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h2 className="font-display text-2xl text-white">Coding level & confidence pulse</h2>
              <p className="mt-3 text-sm text-zinc-400">We baseline difficulty curves and scaffolding density.</p>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setCodingLevel(lvl)}
                    className={cn(
                      "rounded-2xl border p-5 text-left transition hover:border-cyan-300/50",
                      codingLevel === lvl
                        ? "border-cyan-300/70 bg-white/10"
                        : "border-white/10 bg-black/40",
                    )}
                  >
                    <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{lvl}</div>
                    <div className="mt-3 text-lg font-semibold capitalize text-white">{lvl}</div>
                    <p className="mt-2 text-sm text-zinc-400">
                      {lvl === "beginner" && "Foundations-heavy with forgiving feedback."}
                      {lvl === "intermediate" && "Blend systems thinking with accelerated builds."}
                      {lvl === "advanced" && "Research cadence & adversarial correctness."}
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-10">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Confidence (1–10)</span>
                  <span>{confidence}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={confidence}
                  onChange={(e) => setConfidence(Number(e.target.value))}
                  className="mt-3 w-full accent-cyan-300"
                />
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h2 className="font-display text-2xl text-white">Learning modality matrix</h2>
              <p className="mt-3 text-sm text-zinc-400">Select every channel that resonates. We multiplex them intelligently.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {(Object.keys(LEARNING_LABEL) as LearningStyle[]).map((s) => {
                  const selected = learningStyles.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleStyle(s)}
                      className={cn(
                        "flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
                        selected ? "border-cyan-300/70 bg-cyan-400/10" : "border-white/10 bg-black/40 hover:border-white/20",
                      )}
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">{LEARNING_LABEL[s]}</div>
                        <div className="text-xs text-zinc-500">Modality weighting</div>
                      </div>
                      {selected ? <Check className="h-5 w-5 text-cyan-300" /> : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-10">
                <div className="text-sm font-semibold text-white">Motivation vector</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {( ["streaks", "badges", "milestones", "intrinsic_curiosity"] as const ).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMotivationStyle(m)}
                      className={cn(
                        "rounded-2xl border px-4 py-4 text-sm capitalize transition",
                        motivationStyle === m
                          ? "border-violet-300/70 bg-violet-500/10 text-white"
                          : "border-white/10 bg-black/40 text-zinc-300 hover:border-white/20",
                      )}
                    >
                      {m.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h2 className="font-display text-2xl text-white">Interests & weekly cadence</h2>
              <p className="mt-3 text-sm text-zinc-400">We braid CS cores with lenses you actually care about.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                {(["games", "ai", "websites", "robotics", "cybersecurity", "apps"] as InterestArea[]).map((i) => {
                  const active = interests.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={cn(
                        "rounded-full px-5 py-2 text-sm capitalize transition",
                        active
                          ? "bg-gradient-to-r from-cyan-400/70 to-violet-500/80 text-black"
                          : "border border-white/10 bg-black/40 text-zinc-200 hover:border-cyan-300/40",
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
              <div className="mt-10">
                <div className="flex justify-between text-sm text-zinc-400">
                  <span>Weekly hours commitment</span>
                  <span>{weeklyHours}h</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={24}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="mt-3 w-full accent-fuchsia-300"
                />
              </div>

              <div className="mt-10">
                <div className="text-sm font-semibold text-white">Preferred project style</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {(["guided", "creative", "minimal_scaffold"] as ProjectStyle[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setProjectStyle(p)}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm capitalize",
                        projectStyle === p
                          ? "border-fuchsia-300/70 bg-fuchsia-400/10 text-white"
                          : "border-white/10 bg-black/40 text-zinc-300",
                      )}
                    >
                      {p.replaceAll("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h2 className="font-display text-2xl text-white">North star narrative</h2>
              <p className="mt-3 text-sm text-zinc-400">Your goals personalize milestones, proofs, and capstone rituals.</p>
              <textarea
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={8}
                className="mt-8 w-full rounded-2xl border border-white/10 bg-black/50 p-4 text-sm leading-relaxed text-white outline-none ring-cyan-400/40 focus:ring"
              />

              <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/10 p-6">
                <div className="text-sm font-semibold text-white">You&apos;ll receive instantly</div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                  <li>• Lessons • Quizzes • Projects • Assignments</li>
                  <li>• Assessments • Weekly milestones • Time estimates</li>
                  <li>• Adaptive progress tracking scaffolding</li>
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-between">
          <GlowButton variant="ghost" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </GlowButton>

          {step < STEPS.length - 1 ? (
            <GlowButton disabled={!canNext} onClick={() => canNext && setStep((s) => s + 1)} className="gap-2">
              Continue
              <ChevronRight className="h-4 w-4" />
            </GlowButton>
          ) : (
            <GlowButton onClick={finish} className="gap-2">
              Generate roadmap
              <ChevronRight className="h-4 w-4" />
            </GlowButton>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
