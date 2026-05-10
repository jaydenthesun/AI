"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function GlassCard({
  children,
  className,
  delay = 0,
  float = false,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  float?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.65, delay }}
      className={cn(
        "glass relative overflow-hidden rounded-3xl p-6 shadow-card",
        float && "animate-floaty",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -right-24 -top-24 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute -bottom-28 -left-10 h-52 w-52 rounded-full bg-violet-500/20 blur-3xl" />
      </div>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
