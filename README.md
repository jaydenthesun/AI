# CodePath Agent

**CodePath Agent** is an MVP **AI-powered computer science learning platform** that builds a personalized coding course from onboarding signals and adapts over time using a local feedback loop. This repo implements the product spec as a **Next.js** app with **mock AI responses** and **browser `localStorage`** persistence so it runs **without paid API keys**. The architecture is structured so **real models** (Claude / Clōd), **Greptile-style code review**, **Nia-style retrieval**, auth, and databases can replace the mocks later.

## Product overview (PRD summary)

- **Onboarding** captures level, confidence, learning styles, motivation, interests, weekly hours, project style, goals, **preferred language**, and **attention span**.
- **Course generation** produces a personalized path: roadmap by week, lessons, quizzes, assignments, projects, assessments, difficulty framing, and estimates.
- **AI tutor** (lesson side panel) and **code review** return realistic mock outputs with visible **model routing** rationale.
- **Feedback loop** tracks quiz and assignment scores, lesson completion, time on lesson, quiz retries on weak scores, weak/strong topics, streaks, **recent feedback**, and **code submission history**—and feeds **adaptation copy** on the student dashboard.
- **Teacher dashboard** shows mock class roster, averages, weak areas, submissions, interventions, and **generated assignments** awaiting approval.

**Explicit MVP non-goals:** production AI APIs, full auth, payments, real media generation, full LMS, or live collaborative IDE.

## Stack

- **Next.js 14** (App Router), **React**, **TypeScript**, **Tailwind CSS**, **Framer Motion**
- Data: **localStorage** keys prefixed with `codepath_` (profile, course plan, performance snapshot)

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build + typecheck
```

## App routes (current)

| Route | Purpose |
|-------|---------|
| `/` | Landing — product story, routing teaser, links into flows |
| `/onboarding` | Multi-step intake → generates course + profile |
| `/dashboard` | Student cockpit — progress, roadmap strip, lessons/quizzes/assignments, feedback rail, AI recommendation |
| `/course-path` | Full syllabus view — timeline, assessments, projects |
| `/lesson/[lessonId]` | Lesson content, collapsible sections, **Clōd-style tutor chat**, visual-hint banner when dwell suggests it |
| `/assignment/[assignmentId]` | Artifact editor + rubric; updates performance + feedback |
| `/quiz/[quizId]` | Adaptive quiz; retries + scores feed the loop |
| `/code-review` | Paste code — weighted rubric **40/20/20/20** (correctness / readability / efficiency / problem-solving), mock Greptile lane |
| `/model-routing` | **Routing matrix demo** — task type → tier/provider/rationale |
| `/teacher` | Instructor analytics (mock students + generated assignments) |

## Project layout (high level)

```
app/           # Pages (see routes above) + app/api/mock/* for optional JSON mocks
components/    # UI (glass cards, nav, charts, code editor, routing diagram)
data/          # Shared TypeScript types + mock teacher roster data
lib/
  courseGenerator.ts   # Builds CoursePlan from onboarding answers
  feedbackLoop.ts      # Adaptation directives, quiz retries, topic merge, visual hint
  mockAI.ts              # Tutor replies, code review, recommendations
  modelRouter.ts        # Simulated tier routing + ROUTING_DEMO_MATRIX
  storage.ts            # localStorage CRUD + feedback append + cross-tab/window sync hooks
  hooks/useLocalCourse.ts
```

## Model routing (simulated)

Tasks are mapped to **cheap / mid / advanced / media** tiers with provider hints (**Clōd**, **Nia**, **Greptile**, **media**). Production would swap `routeTask()` internals for real SDK calls; the UI surfaces **why** each task class was routed.

## Integrations roadmap (not wired in MVP)

| Integration | Role |
|-------------|------|
| Claude / Clōd | Tutor, lessons, personalization |
| Nia | Retrieval over docs / curricula |
| Greptile | Deep code structure review |

## Persistence notes

- Completing **onboarding** writes profile + generated course.
- Quizzes, assignments, code review, and lesson tutor dispatches update **performance** and **recent feedback**.
- Older browsers without saved language/attention fields still load; **courseGenerator** defaults missing fields.

---

Built as a hackathon / MVP shell for **CodePath Agent**; extend `lib/mockAI.ts`, `lib/storage.ts`, and API routes when connecting real backends.
