import { clodChatCompletion, type ClodMessage } from "./clod";
import { stripMarkdownBoldMarkers } from "./formatAnswer";

export async function runJarvisChat(params: {
  pathname: string;
  userMessage: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
}): Promise<string> {
  const routeHint = `Current app pathname: ${params.pathname}`;

  const system = [
    "You are Jarvis, the premium in-app mentor for CodePath Agent — an adaptive computer science learning OS.",
    "You guide learners through onboarding, dashboard trajectory, lessons (with tutor braid), quizzes, assignments, code review (/code-review), teacher roster & AI scoring (/teacher), course path, and model routing concepts.",
    routeHint,
    "Answer in plain natural English. Never use markdown bold double-asterisks (**). Keep responses focused: roughly 3–8 short paragraphs or bullet lines unless the user asks for depth.",
    "Sound like a calm senior mentor: precise, encouraging, shipping-oriented — not a generic chatbot.",
    "When relevant, point to concrete surfaces by path name (e.g. /code-review, /dashboard) without sounding like a manual.",
  ].join("\n");

  const hist: ClodMessage[] = params.history.slice(-10).map((m) => ({
    role: m.role,
    content: m.content.slice(0, 8000),
  }));

  const messages: ClodMessage[] = [
    { role: "system", content: system },
    ...hist,
    { role: "user", content: params.userMessage.slice(0, 12000) },
  ];

  const raw = await clodChatCompletion(messages, { temperature: 0.55, maxTokens: 1600 });
  return stripMarkdownBoldMarkers(raw.trim());
}
