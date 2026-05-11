/** Greptile codebase query — https://docs.greptile.com (POST /v2/query) */

export interface GreptileRepoRef {
  remote: string;
  repository: string;
  branch: string;
}

export function greptileRepoFromEnv(): GreptileRepoRef | null {
  const repository = process.env.GREPTILE_REPOSITORY?.trim();
  if (!repository) return null;

  return {
    remote: process.env.GREPTILE_REMOTE?.trim() || "github",
    repository,
    branch: process.env.GREPTILE_BRANCH?.trim() || "main",
  };
}

export async function greptileQueryAboutCode(code: string, language: string, hint?: string) {
  const apiKey = process.env.GREPTILE_API_KEY;
  const githubToken = process.env.GREPTILE_GITHUB_TOKEN;
  const base = (process.env.GREPTILE_BASE_URL ?? "https://api.greptile.com/v2").replace(/\/$/, "");
  const repo = greptileRepoFromEnv();

  if (!apiKey || !githubToken || !repo) {
    return { skipped: true as const, contextText: "" };
  }

  const content = [
    hint ?? `Give concise codebase-aware observations relevant to this ${language} snippet (patterns, risks, related modules).`,
    "```",
    code.slice(0, 24000),
    "```",
  ].join("\n");

  const res = await fetch(`${base}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "X-GitHub-Token": githubToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content }],
      repositories: [repo],
      stream: false,
      genius: true,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Greptile HTTP ${res.status}: ${raw.slice(0, 400)}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { skipped: false as const, contextText: raw.slice(0, 8000) };
  }

  return { skipped: false as const, contextText: stringifyGreptileForPrompt(data) };
}

function stringifyGreptileForPrompt(data: unknown): string {
  if (typeof data === "string") return data.slice(0, 8000);
  const obj = data as Record<string, unknown>;
  const msg =
    (typeof obj.message === "string" && obj.message) ||
    (typeof obj.answer === "string" && obj.answer) ||
    (typeof obj.response === "string" && obj.response);
  if (msg) return msg.slice(0, 8000);
  try {
    return JSON.stringify(data).slice(0, 8000);
  } catch {
    return "";
  }
}
