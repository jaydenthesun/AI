/**
 * Premium specialized tracks — purchased via AllScale checkout (USDC / USDT).
 * Prices are native stable-coin cents (100 = 1.00 coin). Min order > 0.10 coin per AllScale rules.
 */

export type CourseTheme = "games" | "security" | "ai_agents" | "systems" | "data_viz";

export interface SpecializedCourse {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** USDC-native price in cents (stable_coin: USDC) */
  amountCentsUsdc: number;
  estimatedHours: number;
  themes: CourseTheme[];
  topics: string[];
  skills: string[];
  gamesAndLabs: string[];
  badge: string;
}

export const specializedCourses: SpecializedCourse[] = [
  {
    id: "spec-neon-arcade",
    slug: "neon-arcade-game-systems",
    title: "Neon Arcade Lab",
    tagline: "Ship tight game loops, juice, and telemetry like a studio prototype.",
    description:
      "A specialized lane beyond the core roadmap: entity-style updates, collision intuition, scoring arcs, and difficulty ramps—wired to CodePath’s adaptive streak loop.",
    amountCentsUsdc: 2900,
    estimatedHours: 18,
    themes: ["games"],
    topics: ["Game loops", "ECS-lite patterns", "Browser Canvas/WebGPU bridge", "Difficulty curves"],
    skills: ["TypeScript", "Performance budgeting", "Input handling", "Observability hooks"],
    gamesAndLabs: ["Neon Runner checkpoint sprint", "Boss-wave modifier DSL", "Leaderboard replay ghosts"],
    badge: "Game systems",
  },
  {
    id: "spec-cipher-forge",
    slug: "cipher-forge-security-games",
    title: "Cipher Forge",
    tagline: "CTF-flavored cryptography with secure coding habits baked in.",
    description:
      "New topic stack: symmetric vs asymmetric flows, threat modeling mini-games, sandboxed exploit narratives—still grounded in shipping safer APIs.",
    amountCentsUsdc: 3400,
    estimatedHours: 22,
    themes: ["security"],
    topics: ["Applied crypto vignettes", "Auth/session pitfalls", "Secrets hygiene", "Bug-bounty mindset"],
    skills: ["Python / TS tooling", "Static reasoning", "Red-team / blue-team framing"],
    gamesAndLabs: ["Cipher ladder puzzles", "Timing-attack awareness lab", "JWT fracture sandbox"],
    badge: "Security games",
  },
  {
    id: "spec-agent-arena",
    slug: "agent-arena-ai-orchestration",
    title: "Agent Arena",
    tagline: "Orchestrate multi-agent workflows with scoring rubrics and guardrails.",
    description:
      "Specialized AI skills: planner roles, tool routing, evaluation harnesses, and arena-style benchmarks tied to CodePath Agent metaphors.",
    amountCentsUsdc: 3900,
    estimatedHours: 20,
    themes: ["ai_agents"],
    topics: ["Multi-agent graphs", "Evaluation suites", "Safety envelopes", "Prompt + tool contracts"],
    skills: ["Orchestration patterns", "Regression harnesses", "Latency-aware UX"],
    gamesAndLabs: ["Arena ladder duels", "Swarm debugging relay", "Policy breach escape room"],
    badge: "AI orchestration",
  },
  {
    id: "spec-signal-drift",
    slug: "signal-drift-streaming-labs",
    title: "Signal Drift",
    tagline: "Streaming data + live viz—gameified dashboards that react to chaos.",
    description:
      "Fresh skills path: windowing streams, backpressure intuition, chart grammar, and incident narratives rendered as interactive drills.",
    amountCentsUsdc: 2700,
    estimatedHours: 16,
    themes: ["data_viz"],
    topics: ["Stream semantics", "Window operators", "Dashboard ergonomics", "Drift detection toy models"],
    skills: ["Event pipelines", "Observability UX", "Chart storytelling"],
    gamesAndLabs: ["Signal surfing time trials", "Drift detector boss fights", "Ops theater replay"],
    badge: "Streaming & viz",
  },
  {
    id: "spec-kernel-quest",
    slug: "kernel-quest-systems-intuition",
    title: "Kernel Quest",
    tagline: "Systems intuition via sandbox VMs and syscall storylines.",
    description:
      "Specialized systems arc: scheduling fairy tales, memory maps as quests, and concurrency traps presented as narrative checkpoints—not a kernel course, a mental model forge.",
    amountCentsUsdc: 3200,
    estimatedHours: 24,
    themes: ["systems"],
    topics: ["Scheduling snapshots", "Virtual memory metaphors", "Concurrency hazards", "IO paths"],
    skills: ["Reasoning under complexity", "Debugging distributed ghosts", "Benchmark literacy"],
    gamesAndLabs: ["Syscall trading card battles", "Deadlock dungeon seeds", "VM snapshot puzzles"],
    badge: "Systems quests",
  },
];

export function getSpecializedCourseById(id: string): SpecializedCourse | undefined {
  return specializedCourses.find((c) => c.id === id);
}
