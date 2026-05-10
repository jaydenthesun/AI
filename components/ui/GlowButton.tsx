"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function GlowButton({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300",
        variant === "primary" &&
          "bg-gradient-to-r from-cyan-300/90 via-cyan-400/80 to-violet-500/90 text-abyss shadow-glow hover:brightness-110 active:scale-[0.99]",
        variant === "ghost" && "border border-white/10 bg-white/5 text-white hover:bg-white/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
