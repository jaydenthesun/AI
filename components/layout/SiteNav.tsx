"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Orbit } from "lucide-react";

const links = [
  { href: "/", label: "Product" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/code-review", label: "Code Review" },
  { href: "/teacher", label: "Teacher" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-abyss/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/30 via-violet-400/30 to-fuchsia-400/30 shadow-glow">
            <Orbit className="h-5 w-5 text-cyan-200" />
          </span>
          <div className="leading-tight">
            <div>CodePath Agent</div>
            <div className="text-[11px] font-normal text-zinc-400">Learning OS</div>
          </div>
        </Link>
        <nav className="flex max-w-[52vw] flex-wrap items-center justify-end gap-1 sm:max-w-none md:flex md:max-w-none">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} className="relative px-2 py-1 text-[13px] text-zinc-300 md:px-3 md:py-2 md:text-sm">
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10 shadow-[0_0_30px_rgba(94,234,212,0.15)]"
                  />
                )}
                <span className={cn("relative", active && "text-white")}>{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <Link
          href="/onboarding"
          className="rounded-full bg-gradient-to-r from-cyan-400/90 to-violet-500/90 px-4 py-2 text-xs font-semibold text-abyss shadow-glow transition hover:brightness-110"
        >
          Launch roadmap
        </Link>
      </div>
    </header>
  );
}
