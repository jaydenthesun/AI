/** Mock Jarvis mentor responses — client-side only, no API keys. */

const PAGE_HINTS: Record<string, string> = {
  "/": "the product landing — onboarding entry points and learning OS positioning.",
  "/onboarding": "the onboarding pulse — level, modalities, goals, and roadmap seed.",
  "/dashboard": "your learner cockpit — streaks, milestones, and trajectory signals.",
  "/code-review": "the Code sanctum — paste code for structured Greptile-class AI review.",
  "/lesson": "an immersive lesson module — expand sections and use the Clōd tutor braid.",
  "/quiz": "an adaptive pulse check — quiz telemetry feeds weak/strong topic spectra.",
  "/assignment": "the assignment lattice — artifact editor plus tutor and AI review hooks.",
  "/teacher": "the instructor roster — add students and run AI scoring on submissions.",
  "/course-path": "your generated course path and weekly milestones.",
  "/model-routing": "transparent routing lanes across tutoring and review stacks.",
};

export function explainPageMock(pathname: string): string {
  const p = pathname || "/";
  if (PAGE_HINTS[p]) {
    return `You're on ${PAGE_HINTS[p]} Focus on one navigation goal per visit—don't scatter attention across too many surfaces.`;
  }
  if (p.startsWith("/lesson")) {
    return `You're in ${PAGE_HINTS["/lesson"]} Expand one section at a time and use the tutor for targeted questions.`;
  }
  if (p.startsWith("/quiz")) {
    return `You're in ${PAGE_HINTS["/quiz"]} Commit answers once confident—signals tune adaptive remixing.`;
  }
  if (p.startsWith("/assignment")) {
    return `You're in ${PAGE_HINTS["/assignment"]} Tie reflection to the rubric before submit.`;
  }
  const prefix = p.split("/").filter(Boolean)[0];
  const rough =
    prefix === "lesson"
      ? "a lesson page — work sections in order and dispatch the side tutor when stuck."
      : prefix === "quiz"
        ? "a quiz — answer probes to tighten adaptive routing."
        : prefix === "assignment"
          ? "an assignment — ship the artifact and reflect for adaptive grading signals."
          : "this surface in CodePath Agent.";
  return `This route (${pathname}) is ${rough} If something feels unclear, narrow to one objective and use the quick actions below.`;
}

export function getJarvisMockReply(userText: string, pathname: string): string {
  const t = userText.toLowerCase().trim();

  if (t.includes("explain") && (t.includes("page") || t.includes("screen") || t.includes("here"))) {
    return explainPageMock(pathname);
  }

  if (
    /review|lint|diff|pull request|bug in my code|typescript error|syntax/i.test(t) ||
    (t.includes("code") && (t.includes("check") || t.includes("quality")))
  ) {
    return `For structured review with correctness, readability, and improved sketches, open Code Review at /code-review. Paste your snippet there—the pipeline uses Clōd-style narrative feedback and optional Greptile repo context when configured. Start with one focused file before widening scope.`;
  }

  if (/lesson|learn|study|module|section|tutor/i.test(t) || (t.includes("stuck") && t.includes("lesson"))) {
    return `Lessons here stack Ingress → Mechanism → Mastery: anchor context, walk the mechanism, then ship a checkpoint artifact. Use the Clōd tutor braid on the lesson page for Socratic help tied to your topic. One invariant per session beats cramming three concepts.`;
  }

  if (/practice|drill|exercise|kata|task|homework|mini assignment/i.test(t)) {
    return `Try this micro practice block (15–25 min): pick one function from your last lesson, write it twice—once minimal, once production-shaped—then list two adversarial inputs and expected behavior. Shipped beats perfect; iterate with the tutor on gaps.`;
  }

  if (/next|progress|roadmap|should i|what now|stuck|prioritize/i.test(t)) {
    return `Next step discipline: (1) finish or checkpoint your current lesson or quiz so the adaptive loop gets signal; (2) if code-heavy, route one review pass on /code-review; (3) cap session goals at two outcomes. Check Dashboard for streak and weak-topic hints—they steer modality density.`;
  }

  if (/teacher|grade|score|student|class/i.test(t)) {
    return `On Teacher, add learners by name and paste submissions for AI scoring—scores stay in-browser for this MVP. Use consistent labels per assignment so averages stay meaningful.`;
  }

  if (/hello|hi |hey |jarvis|who are you/i.test(t)) {
    return `I'm CodePath Agent's onboard mentor—routing tone, pacing, and surface picks to this OS. I'm mock-powered here (no keys required), but I'm tuned for CS pedagogy, CodePath flows, and shipping discipline—not generic small talk.`;
  }

  return `Ground rule for CodePath: one objective per message. Tell me whether you're debugging, learning theory, or shipping an artifact—and I'll steer you to Dashboard, Lessons, Code Review, or Teacher surfaces. Right now you're at ${pathname}; narrow the problem and we compress the path.`;
}
