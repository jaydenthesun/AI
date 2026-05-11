/** OpenAI-compatible chat completions via CLōD — https://clod.io/docs */

export interface ClodMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function clodChatCompletion(
  messages: ClodMessage[],
  options?: { temperature?: number; maxTokens?: number },
): Promise<string> {
  const apiKey = process.env.CLOD_API_KEY;
  const base = (process.env.CLOD_BASE_URL ?? "https://api.clod.io/v1").replace(/\/$/, "");
  const model = process.env.CLOD_MODEL ?? "DeepSeek V3";

  if (!apiKey) {
    throw new Error("CLOD_API_KEY is not set");
  }

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options?.temperature ?? 0.55,
      max_completion_tokens: options?.maxTokens ?? 2048,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Clōd HTTP ${res.status}: ${raw.slice(0, 500)}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Clōd returned non-JSON");
  }

  const obj = data as {
    choices?: Array<{ message?: { content?: string | null } }>;
    error?: { message?: string };
  };

  if (obj.error?.message) {
    throw new Error(obj.error.message);
  }

  const text = obj.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("Clōd returned empty content");
  }

  return text;
}
