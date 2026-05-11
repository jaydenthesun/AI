"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { getSpecializedCourseById } from "@/data/specializedCourses";
import { addPurchasedCourseId } from "@/lib/purchasedCourses";

function SuccessInner() {
  const params = useSearchParams();
  const courseId = params.get("course") ?? "";
  const [done, setDone] = useState(false);

  const course = courseId ? getSpecializedCourseById(courseId) : undefined;

  useEffect(() => {
    if (!courseId || !course) return;
    addPurchasedCourseId(courseId);
    setDone(true);
  }, [courseId, course]);

  return (
    <div className="mx-auto max-w-xl space-y-8 px-4 py-20 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="border-emerald-400/30 bg-emerald-500/10 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/40 bg-emerald-400/15">
            <CheckCircle2 className="h-8 w-8 text-emerald-200" />
          </div>
          <h1 className="mt-6 font-display text-3xl text-white">Checkout complete</h1>
          {course ? (
            <>
              <p className="mt-4 text-zinc-300">
                <span className="text-white">{course.title}</span> is now unlocked in this browser.
              </p>
              <p className="mt-2 text-sm text-zinc-500">
                Return to the specialized course store anytime — your access flag lives in local storage for this MVP.
              </p>
            </>
          ) : (
            <p className="mt-4 text-zinc-400">
              {courseId ? "Course reference saved — verify purchase email from AllScale if applicable." : "No course id in URL."}
            </p>
          )}
          {done && course ? (
            <div className="mt-6 flex justify-center">
              <Sparkles className="h-5 w-5 text-cyan-200" />
            </div>
          ) : null}
        </GlassCard>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/courses">
          <GlowButton variant="ghost">Back to course store</GlowButton>
        </Link>
        <Link href="/dashboard">
          <GlowButton>Student cockpit</GlowButton>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-20 text-center text-zinc-500">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-full bg-white/10" />
          <p className="mt-4 text-sm">Confirming purchase…</p>
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}
