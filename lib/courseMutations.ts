import type { AdaptivePlanOverlay, CoursePlan, Lesson, PerformanceSnapshot } from "@/data/types";

export function emptyAdaptiveOverlay(): AdaptivePlanOverlay {
  return {
    injectedLessons: [],
    injectIntoWeekIndex: 0,
    prependLessonIdsToWeek: [],
    lastMutationAt: "",
    lastMutationSummary: "",
    planRevision: 0,
  };
}

function slugTopic(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28) || "topic";
}

export function buildRemediationLesson(remediationId: string, topic: string): Lesson {
  return {
    id: remediationId,
    title: `Adaptive rehearsal — ${topic}`,
    topic,
    estimatedMinutes: 22,
    status: "available",
    sections: [
      {
        id: `${remediationId}-r1`,
        title: "Friction map",
        summary: "Tracing where reasoning slipped",
        expandedContent: `This module exists because the adaptive engine detected repeated friction signals on “${topic}”. We slow the cadence, strip optional complexity, and replay invariants with deliberate checkpoints before allowing downstream concepts.`,
        diagramPrompt: `Interactive visualization: layered timeline of attempts vs expected state for “${topic}”, with draggable scrubber across failing inputs and annotated recovery paths.`,
        videoPlaceholder:
          "Storyboard (mock): 45s empathy hook → whiteboard invariant replay → live debugging with commentary on the exact misconception cluster Greptile flagged.",
      },
      {
        id: `${remediationId}-r2`,
        title: "Guided replay",
        summary: "Rebuild the mental model with supervision",
        expandedContent:
          "Walk the mechanism again with narration tuned for remediation: smaller steps, explicit assumptions, and immediate verification prompts after each transition.",
        codeExample: `// Remediation kernel — annotate each line aloud\nfunction replayInvariant(input) {\n  const normalized = guard(input);\n  return step(normalized);\n}`,
      },
    ],
    challenges: ["Voice-over the runtime on paper once", "Add two adversarial inputs that previously fooled you"],
  };
}

/** Computes overlay injections from struggle signals; idempotent per remediation id. */
export function computeAdaptiveOverlay(
  course: CoursePlan,
  perf: PerformanceSnapshot,
  previous: AdaptivePlanOverlay | null,
): AdaptivePlanOverlay {
  const struggle = Object.entries(perf.retryCountByTopic).find(([, n]) => n >= 2);
  if (!struggle) {
    return previous ?? emptyAdaptiveOverlay();
  }

  const [topicRaw] = struggle;
  const topic = topicRaw.trim() || "foundations";
  const remediationId = `remediation-${slugTopic(topic)}`;

  if (previous?.injectedLessons.some((l) => l.id === remediationId)) {
    return previous;
  }

  const lesson = buildRemediationLesson(remediationId, topic);

  return {
    injectedLessons: [lesson, ...(previous?.injectedLessons ?? [])],
    injectIntoWeekIndex: 0,
    prependLessonIdsToWeek: [remediationId],
    lastMutationAt: new Date().toISOString(),
    lastMutationSummary: `Inserted adaptive rehearsal after repeated friction on “${topic}”. Your roadmap week 1 now prioritizes this node.`,
    planRevision: (previous?.planRevision ?? 0) + 1,
  };
}

export function mergeCoursePlanForDisplay(base: CoursePlan, overlay: AdaptivePlanOverlay | null): CoursePlan {
  if (!overlay?.injectedLessons?.length) return base;

  const injectedIds = new Set(overlay.injectedLessons.map((l) => l.id));
  const lessons = [...overlay.injectedLessons, ...base.lessons.filter((l) => !injectedIds.has(l.id))];

  const roadmap = base.roadmap.map((w, idx) => {
    if (idx !== overlay.injectIntoWeekIndex) return w;
    const prepend = overlay.prependLessonIdsToWeek.filter((id) => !w.lessonIds.includes(id));
    if (!prepend.length) return w;
    return { ...w, lessonIds: [...prepend, ...w.lessonIds] };
  });

  return { ...base, lessons, roadmap };
}
