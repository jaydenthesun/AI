"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "M", focus: 42, probes: 18 },
  { day: "T", focus: 55, probes: 24 },
  { day: "W", focus: 48, probes: 20 },
  { day: "T", focus: 62, probes: 30 },
  { day: "F", focus: 58, probes: 28 },
  { day: "S", focus: 70, probes: 32 },
  { day: "S", focus: 64, probes: 27 },
];

export function WeeklyTrend() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) {
    return <div className="h-56 w-full min-h-[224px] animate-pulse rounded-2xl bg-white/5" />;
  }

  return (
    <div className="h-56 w-full min-h-[224px] min-w-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5eead4" stopOpacity={0.5} />
              <stop offset="95%" stopColor="#5eead4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorProbe" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c084fc" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" stroke="#52525b" tickLine={false} axisLine={false} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip
            contentStyle={{
              background: "rgba(12,15,24,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              color: "#e4e4e7",
            }}
          />
          <Area type="monotone" dataKey="focus" stroke="#5eead4" fillOpacity={1} fill="url(#colorFocus)" />
          <Area type="monotone" dataKey="probes" stroke="#c084fc" fillOpacity={1} fill="url(#colorProbe)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
