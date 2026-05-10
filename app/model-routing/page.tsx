"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Route } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GlowButton } from "@/components/ui/GlowButton";
import { ModelArchitecture } from "@/components/routing/ModelArchitecture";
import { ROUTING_DEMO_MATRIX, routeTask } from "@/lib/modelRouter";
import type { ModelTier } from "@/data/types";
import { cn } from "@/lib/cn";

const tierBadge: Record<ModelTier, string> = {
  cheap: "border-emerald-400/40 bg-emerald-400/10 text-emerald-100",
  mid: "border-cyan-400/40 bg-cyan-400/10 text-cyan-50",
  advanced: "border-fuchsia-400/40 bg-fuchsia-400/15 text-fuchsia-50",
  media: "border-amber-400/40 bg-amber-400/10 text-amber-50",
};

export default function ModelRoutingPage() {
  const [highlightTier, setHighlightTier] = useState<ModelTier | null>(null);

  const rows = useMemo(
    () =>
      ROUTING_DEMO_MATRIX.map((row) => ({
        ...row,
        decision: routeTask(row.complexity, row.purpose),
      })),
    [],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-14 sm:px-6 lg:py-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Integration blueprint</div>
          <h1 className="mt-3 flex items-center gap-3 font-display text-4xl text-white">
            <Route className="h-9 w-9 text-cyan-300" /> Model routing demo
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Each row simulates the router that would dispatch to Claude (Clōd), Greptile, Nia context packs, or a media lane. Swap{" "}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">routeTask</code> internals for production SDK
            calls — the UI contract stays stable.
          </p>
        </div>
        <Link href="/">
          <GlowButton variant="ghost">Product landing</GlowButton>
        </Link>
      </div>

      <GlassCard className="overflow-hidden p-0">
        <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold text-white">PRD routing matrix (simulated)</div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 bg-black/40 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-6 py-4 font-medium">Task type</th>
                <th className="px-4 py-4 font-medium">Input complexity</th>
                <th className="px-4 py-4 font-medium">Tier</th>
                <th className="px-4 py-4 font-medium">Primary provider</th>
                <th className="px-6 py-4 font-medium">Router rationale</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const active = highlightTier === null || highlightTier === row.decision.tier;
                return (
                  <motion.tr
                    key={row.taskLabel}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: active ? 1 : 0.35 }}
                    className={cn("border-b border-white/5 hover:bg-white/[0.03]", idx % 2 === 0 && "bg-black/20")}
                  >
                    <td className="px-6 py-4 font-medium text-white">{row.taskLabel}</td>
                    <td className="px-4 py-4 text-zinc-400">{row.complexity}</td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          setHighlightTier((t) => (t === row.decision.tier ? null : row.decision.tier))
                        }
                        className={cn(
                          "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition",
                          tierBadge[row.decision.tier],
                        )}
                      >
                        {row.decision.tier}
                      </button>
                    </td>
                    <td className="px-4 py-4 capitalize text-zinc-300">{row.decision.provider}</td>
                    <td className="max-w-md px-6 py-4 text-zinc-400">{row.decision.reason}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-white/10 px-6 py-4 text-xs text-zinc-500">
          Cheap → Haiku-class teaching summaries & quiz grading. Mid → Sonnet-class lesson + assignment synthesis with Nia priming.
          Advanced → Opus / Greptile graph reviews & redesigns. Media → diagram / frame / narration stacks.
        </p>
      </GlassCard>

      <div>
        <h2 className="font-display text-2xl text-white">Architecture lanes</h2>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">
          Same topology as the landing page — duplicated here so mentors can validate orchestration without scrolling marketing copy.
        </p>
        <div className="mt-8">
          <ModelArchitecture />
        </div>
      </div>
    </div>
  );
}
