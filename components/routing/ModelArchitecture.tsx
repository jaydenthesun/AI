"use client";

import { motion } from "framer-motion";
import { describeArchitectureFlow } from "@/lib/modelRouter";
import type { ModelTier } from "@/data/types";
import { cn } from "@/lib/cn";

const tierColor: Record<ModelTier, string> = {
  cheap: "from-emerald-400/40 to-teal-400/10",
  mid: "from-cyan-400/50 to-blue-500/10",
  advanced: "from-fuchsia-400/50 to-violet-600/20",
  media: "from-amber-300/40 to-orange-500/10",
};

export function ModelArchitecture({ interactive = true }: { interactive?: boolean }) {
  const { flows, nodes } = describeArchitectureFlow();
  return (
    <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-surface/70 p-8 shadow-card backdrop-blur-xl">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="relative z-10 grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Model router</div>
          <h3 className="mt-2 font-display text-2xl text-white">Teach · Retrieve · Review · Render</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Every task is cost-aware. Clōd anchors pedagogy, Nia grounds facts, Greptile scrutinizes code structure, and Media
            synthesizes visual explanations.
          </p>
          <div className="mt-6 space-y-3">
            {flows.map((flow, idx) => (
              <motion.div
                key={flow.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={cn(
                  "flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3",
                  interactive && "hover:border-cyan-400/30",
                )}
              >
                <div>
                  <div className="text-sm text-white">
                    {flow.from} <span className="text-zinc-500">→</span> {flow.to}
                  </div>
                  <div className="text-xs text-zinc-400">{flow.label}</div>
                </div>
                <span
                  className={cn(
                    "rounded-full bg-gradient-to-r px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white",
                    tierColor[flow.tier],
                  )}
                >
                  {flow.tier}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] p-6 shadow-inner">
          <div className="pointer-events-none absolute inset-0 animate-pulse-glow rounded-[28px] bg-[radial-gradient(circle_at_50%_50%,rgba(94,234,212,0.08),transparent_60%)]" />
          <div className="relative space-y-4">
            {nodes.map((node, i) => (
              <motion.div
                key={node.id}
                drag={interactive}
                dragConstraints={{ left: -10, right: 10, top: -6, bottom: 6 }}
                whileHover={{ scale: 1.02 }}
                className="rounded-2xl border border-white/10 bg-abyss/80 p-4 shadow-[0_0_40px_rgba(129,140,248,0.15)]"
                style={{ marginLeft: i % 2 === 0 ? 0 : 18 }}
              >
                <div className="text-sm font-semibold text-white">{node.label}</div>
                <div className="text-xs text-zinc-400">{node.role}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
