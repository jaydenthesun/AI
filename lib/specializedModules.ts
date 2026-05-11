import type { SpecializedCourse } from "@/data/specializedCourses";

export interface SpecializedModule {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  sections: { heading: string; body: string }[];
  checkpoint: string;
}

export function getModulesForCourse(course: SpecializedCourse): SpecializedModule[] {
  const overview: SpecializedModule = {
    id: "overview",
    title: "Track orientation",
    summary: `Map the ${course.title} lane: themes, pacing, and how Jarvis can coach each lab.`,
    estimatedMinutes: 25,
    sections: [
      { heading: "Why this track", body: course.description },
      { heading: "Topics you'll touch", body: course.topics.join(" · ") },
      { heading: "Skills inventory", body: course.skills.join(" · ") },
    ],
    checkpoint: "In one sentence, what outcome will you ship from this track?",
  };

  const labs: SpecializedModule[] = course.gamesAndLabs.map((labTitle, i) => ({
    id: `lab-${i}`,
    title: labTitle,
    summary: `Hands-on sprint ${i + 1}: structured drills aligned to ${course.badge}.`,
    estimatedMinutes: 40 + i * 5,
    sections: [
      {
        heading: "Objective",
        body: `Produce a tangible artifact for “${labTitle}”, grounded in ${course.topics[i % course.topics.length] ?? course.topics[0]}.`,
      },
      {
        heading: "Practice loop",
        body: `Sketch → measure → refine. Apply ${course.skills[i % course.skills.length] ?? course.skills[0]} with tight iteration cadence.`,
      },
      {
        heading: "Jarvis cue",
        body: "Use the Jarvis button (top-left) to pressure-test assumptions, edge cases, or a mini rubric before you call this lab done.",
      },
    ],
    checkpoint: `What did you validate while working on “${labTitle}”?`,
  }));

  const capstone: SpecializedModule = {
    id: "capstone",
    title: "Integration capstone",
    summary: "Weave labs into one storyline and capture what stuck.",
    estimatedMinutes: Math.min(90, 35 + course.estimatedHours),
    sections: [
      {
        heading: "Deliverable",
        body: `Combine at least two labs from ${course.title} into one cohesive demo, write-up, or repo narrative.`,
      },
      {
        heading: "Retro",
        body: `Reflect on strengths across: ${course.skills.slice(0, 5).join(", ")}.`,
      },
    ],
    checkpoint: "Three bullets: win, risk, next experiment.",
  };

  return [overview, ...labs, capstone];
}
