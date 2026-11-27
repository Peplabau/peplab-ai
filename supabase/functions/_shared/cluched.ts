/** Minimal Cluched Orchestration REST client for Edge Functions. */

export class CluchedError extends Error {
  status: number;
  apiErrorCode: unknown;
  constructor(status: number, message: string, apiErrorCode?: unknown) {
    super(message);
    this.status = status;
    this.apiErrorCode = apiErrorCode;
  }
}

function requiredEnv(name: string): string {
  const v = Deno.env.get(name)?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function cluchedConfig() {
  const apiBase = (Deno.env.get("CLUCHED_API_BASE")?.trim() || "https://api-eu1.orchestrapay.com")
    .replace(/\/$/, "");
  const apiVersion = Deno.env.get("CLUCHED_API_VERSION")?.trim() || "v202607";
  const secretKey = requiredEnv("CLUCHED_SECRET_KEY");
  const webhookSecret = Deno.env.get("CLUCHED_WEBHOOK_SECRET")?.trim() || "";
  const appUrl = (Deno.env.get("CLUCHED_APP_URL") || Deno.env.get("APP_URL") || "https://peplab.ai")
    .trim()
    .replace(/\/$/, "");
  return { apiBase, apiVersion, secretKey, webhookSecret, appUrl };
}

export async function cluched(
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { apiBase, apiVersion, secretKey } = cluchedConfig();
  const payload = method === "GET" ? undefined : body === undefined ? {} : body;
  const res = await fetch(`${apiBase}/${apiVersion}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    const raw = data.message;
    const msg = Array.isArray(raw) ? raw.join("; ") : typeof raw === "string" ? raw : `HTTP ${res.status}`;
    throw new CluchedError(res.status, msg, data.apiErrorCode);
  }
  return data;
}

export function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  if (aa.length !== bb.length) return false;
  let out = 0;
  for (let i = 0; i < aa.length; i++) out |= aa[i]! ^ bb[i]!;
  return out === 0;
}
