"use client";

import { motion } from "framer-motion";

export function ProgressRings({
  roadmap,
  lessonsDone,
}: {
  roadmap: number;
  lessonsDone: number;
}) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const offsetRoadmap = c * (1 - roadmap / 100);

  return (
    <div className="relative flex items-center gap-10">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
          <motion.circle
            cx="70"
            cy="70"
            r={r}
            stroke="url(#paint0)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offsetRoadmap }}
            transition={{ duration: 1.2 }}
          />
          <defs>
            <linearGradient id="paint0" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#5eead4" />
              <stop offset="1" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">Trajectory</div>
          <div className="font-display text-3xl text-white">{Math.round(roadmap)}%</div>
        </div>
      </div>

      <div className="relative h-28 w-28">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="46" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
          <motion.circle
            cx="60"
            cy="60"
            r="46"
            stroke="#f472b6"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 46}
            initial={{ strokeDashoffset: 2 * Math.PI * 46 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 46 * (1 - lessonsDone / 100) }}
            transition={{ duration: 1 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[10px] text-zinc-500">Lessons</div>
          <div className="text-xl text-white">{Math.round(lessonsDone)}%</div>
        </div>
      </div>
    </div>
  );
}
