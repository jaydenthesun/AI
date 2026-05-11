"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CircleDollarSign,
  Cpu,
  Gamepad2,
  Lock,
  Radar,
  Shield,
  Sparkles,
  Unlock,
  Waves,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import type { CourseTheme, SpecializedCourse } from "@/data/specializedCourses";
import { specializedCourses } from "@/data/specializedCourses";
import { addPurchasedCourseId, loadPurchasedCourseIds } from "@/lib/purchasedCourses";

const themeIcon: Record<CourseTheme, typeof Gamepad2> = {
  games: Gamepad2,
  security: Shield,
  ai_agents: Cpu,
  systems: Radar,
  data_viz: Waves,
};

function formatUsdc(cents: number) {
  return (cents / 100).toFixed(2);
}

export default function SpecializedCoursesPage() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeError, setNoticeError] = useState(false);
  const [owned, setOwned] = useState<string[]>([]);

  useEffect(() => {
    setOwned(loadPurchasedCourseIds());
  }, []);

  const unlocked = useMemo(() => new Set(owned), [owned]);

  async function startCheckout(course: SpecializedCourse) {
    setNotice(null);
    setNoticeError(false);
    setBusyId(course.id);
    try {
      const res = await fetch("/api/checkout/allscale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id }),
      });
      const data = (await res.json()) as {
        mode?: string;
        checkoutUrl?: string | null;
        message?: string;
        error?: string;
        courseId?: string;
      };

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      if (data.mode === "demo") {
        setNoticeError(false);
        setNotice(data.message ?? "Demo mode — configure AllScale keys for live USDC checkout.");
        return;
      }

      const failed = !res.ok || Boolean(data.error);
      setNoticeError(failed);
      setNotice(
        data.error ??
          (failed ? `Checkout failed (HTTP ${res.status}).` : "Could not start checkout."),
      );
    } catch {
      setNoticeError(true);
      setNotice("Network error — try again.");
    } finally {
      setBusyId(null);
    }
  }

  function unlockDemo(course: SpecializedCourse) {
    addPurchasedCourseId(course.id);
    setOwned(loadPurchasedCourseIds());
    setNoticeError(false);
    setNotice(`Demo unlocked: ${course.title}.`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Specialized tracks</div>
          <h1 className="mt-3 font-display text-4xl text-white">Course checkout · USDC via AllScale</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Premium lanes with new topics, sharpened skills, and game-style labs. Pay in{" "}
            <span className="text-zinc-200">USDC</span> through{" "}
            <a
              href="https://docs.allscale.io/allscale-checkout"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-300 underline underline-offset-4 hover:text-cyan-200"
            >
              AllScale
            </a>{" "}
            hosted checkout — keys live server-side only.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/course-path">
            <GlowButton variant="ghost">Personal course path</GlowButton>
          </Link>
          <Link href="/dashboard">
            <GlowButton variant="ghost">Dashboard</GlowButton>
          </Link>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/35 px-5 py-4 text-sm text-zinc-400">
        <div className="flex flex-wrap items-start gap-3">
          <CircleDollarSign className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" aria-hidden />
          <span>
            Server creates an AllScale <strong className="font-medium text-zinc-200">checkout intent</strong> priced in{" "}
            <strong className="font-medium text-zinc-200">USDC</strong> (<code className="text-cyan-200/90">stable_coin: 2</code>
            ). Set <code className="rounded bg-black/50 px-1 text-[13px] text-zinc-300">ALLSCALE_API_KEY</code> and{" "}
            <code className="rounded bg-black/50 px-1 text-[13px] text-zinc-300">ALLSCALE_API_SECRET</code> in{" "}
            <code className="rounded bg-black/50 px-1 text-[13px] text-zinc-300">.env.local</code> (never commit secrets). Use{" "}
            <code className="rounded bg-black/50 px-1 text-[13px] text-zinc-300">NEXT_PUBLIC_APP_URL</code> for stable post-pay redirects in production.
            If checkout returns “Forbidden”, check the merchant dashboard <strong className="font-medium text-zinc-300">IP allowlist</strong> — your deploy IP must be allowed.
          </span>
        </div>
      </div>

      {notice ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl border px-4 py-3 text-sm ${
            noticeError
              ? "border-amber-400/35 bg-amber-500/10 text-amber-50"
              : "border-cyan-400/25 bg-cyan-500/10 text-cyan-50"
          }`}
          role={noticeError ? "alert" : "status"}
        >
          {notice}
        </motion.div>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        {specializedCourses.map((course, idx) => {
          const Icon = themeIcon[course.themes[0] ?? "games"];
          const ownedCourse = unlocked.has(course.id);

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <GlassCard className="relative flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                      <Icon className="h-5 w-5 text-cyan-200" />
                    </span>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.25em] text-zinc-500">{course.badge}</div>
                      <h2 className="mt-1 font-display text-xl text-white">{course.title}</h2>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold text-white">${formatUsdc(course.amountCentsUsdc)}</div>
                    <div className="text-[11px] uppercase tracking-wider text-zinc-500">USDC</div>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-zinc-400">{course.tagline}</p>
                <p className="mt-3 text-sm text-zinc-500">{course.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {course.themes.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-zinc-400">
                      {t.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Topics</div>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                      {course.topics.slice(0, 4).map((t) => (
                        <li key={t}>· {t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Skills</div>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                      {course.skills.slice(0, 4).map((s) => (
                        <li key={s}>· {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Games & labs</div>
                    <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                      {course.gamesAndLabs.slice(0, 3).map((g) => (
                        <li key={g}>· {g}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
                  {ownedCourse ? (
                    <span className="flex items-center gap-2 text-sm text-emerald-200">
                      <Unlock className="h-4 w-4" /> Unlocked here
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm text-zinc-500">
                      <Lock className="h-4 w-4" /> Not unlocked
                    </span>
                  )}
                  <span className="text-xs text-zinc-600">~{course.estimatedHours}h track</span>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  {ownedCourse ? (
                    <Link href={`/specialized/${course.id}`}>
                      <GlowButton className="gap-2">
                        <Sparkles className="h-4 w-4" /> Open track
                      </GlowButton>
                    </Link>
                  ) : (
                    <>
                      <GlowButton disabled={busyId === course.id} onClick={() => startCheckout(course)}>
                        {busyId === course.id ? (
                          "Opening checkout…"
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" /> Buy with USDC
                          </>
                        )}
                      </GlowButton>
                      <GlowButton variant="ghost" type="button" onClick={() => unlockDemo(course)}>
                        Unlock demo (local)
                      </GlowButton>
                    </>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
