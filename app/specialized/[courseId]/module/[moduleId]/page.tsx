"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { getSpecializedCourseById } from "@/data/specializedCourses";
import { getModulesForCourse } from "@/lib/specializedModules";
import { getCompletedModuleIds, markModuleComplete } from "@/lib/specializedProgress";
import { hasPurchasedCourse } from "@/lib/purchasedCourses";

export default function SpecializedModulePage() {
  const params = useParams<{ courseId: string; moduleId: string }>();
  const router = useRouter();
  const { courseId, moduleId } = params;

  const course = useMemo(() => getSpecializedCourseById(courseId), [courseId]);
  const modules = useMemo(() => (course ? getModulesForCourse(course) : []), [course]);
  const mod = useMemo(() => modules.find((m) => m.id === moduleId), [modules, moduleId]);

  const [ready, setReady] = useState(false);
  const [gateOk, setGateOk] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const purchased = hasPurchasedCourse(courseId);
    setGateOk(!!course && purchased);
    setComplete(getCompletedModuleIds(courseId).includes(moduleId));
    setReady(true);
  }, [courseId, course, moduleId]);

  useEffect(() => {
    if (!ready) return;
    if (!course) {
      router.replace("/courses");
      return;
    }
    if (!hasPurchasedCourse(courseId)) {
      router.replace("/courses");
      return;
    }
    if (!mod) {
      router.replace(`/specialized/${courseId}`);
    }
  }, [ready, course, courseId, mod, router]);

  function onMarkComplete() {
    if (!course) return;
    markModuleComplete(course.id, moduleId);
    setComplete(true);
  }

  if (!ready || !course || !gateOk || !mod) {
    return (
      <div className="mx-auto flex min-h-[45vh] max-w-xl flex-col items-center justify-center px-4 text-center text-zinc-400">
        <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
        <p className="mt-6 text-sm">Loading module…</p>
      </div>
    );
  }

  const idx = modules.findIndex((m) => m.id === mod.id);

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 sm:px-6 lg:py-16">
      <div>
        <Link
          href={`/specialized/${course.id}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-cyan-200/80 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> All modules
        </Link>
        <div className="mt-6 text-[11px] uppercase tracking-[0.25em] text-zinc-500">
          {course.title} · Module {idx + 1} of {modules.length}
        </div>
        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-display text-3xl text-white">
          {mod.title}
        </motion.h1>
        <p className="mt-4 text-zinc-400">{mod.summary}</p>
      </div>

      <GlassCard className="space-y-8 p-6 sm:p-8">
        {mod.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="font-display text-xl text-white">{s.heading}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{s.body}</p>
          </section>
        ))}

        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200/90">Checkpoint</div>
          <p className="mt-3 text-sm text-zinc-200">{mod.checkpoint}</p>
          <p className="mt-4 text-xs text-zinc-500">
            Optional: note your answer in your repo or journal — then mark complete to track progress on your dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
          {complete ? (
            <span className="flex items-center gap-2 text-sm text-emerald-200">
              <CheckCircle2 className="h-5 w-5" /> Marked complete
            </span>
          ) : (
            <GlowButton type="button" onClick={onMarkComplete}>
              Mark module complete
            </GlowButton>
          )}
          <Link href={`/specialized/${course.id}`}>
            <GlowButton variant="ghost">Back to track</GlowButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
