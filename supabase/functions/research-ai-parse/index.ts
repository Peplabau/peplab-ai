/**
 * Edge Function: research-ai-parse
 *
 * Admins upload/paste research document text; OpenAI classifies it into the
 * research_articles CMS field shape (headings, body, tables, FAQs, etc.).
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   OPENAI_API_KEY = sk-...
 *
 * Optional:
 *   OPENAI_MODEL = gpt-4o-mini  (default)
 *
 * Requires a signed-in admin JWT (profiles.is_admin = true).
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-authorization, x-supabase-api-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

const MAX_CHARS = 60_000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function requireAdmin(req: Request): Promise<
  | { ok: true; userId: string }
  | { ok: false; response: Response }
> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")?.trim() || "";
  if (!supabaseUrl || !serviceKey) {
    return {
      ok: false,
      response: jsonResponse(
        { error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" },
        500,
      ),
    };
  }

  const authHeader = req.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "").trim() || "";
  if (!token) {
    return {
      ok: false,
      response: jsonResponse({ error: "Unauthorized — admin JWT required" }, 401),
    };
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const {
    data: { user },
    error: userErr,
  } = await adminClient.auth.getUser(token);
  if (userErr || !user) {
    // Fallback via anon client (some projects prefer this path)
    const userClient = createClient(supabaseUrl, anonKey || serviceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const again = await userClient.auth.getUser();
    if (again.error || !again.data.user) {
      return {
        ok: false,
        response: jsonResponse({ error: "Invalid or expired session — sign in again" }, 401),
      };
    }
    const { data: profile, error: profileErr } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", again.data.user.id)
      .maybeSingle();
    if (profileErr || !profile?.is_admin) {
      return { ok: false, response: jsonResponse({ error: "Admin only" }, 403) };
    }
    return { ok: true, userId: again.data.user.id };
  }

  const { data: profile, error: profileErr } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (profileErr || !profile?.is_admin) {
    return { ok: false, response: jsonResponse({ error: "Admin only" }, 403) };
  }

  return { ok: true, userId: user.id };
}

const SYSTEM_PROMPT = `You are an editor for PEPLAB Australia research peptide overviews.
Convert the supplied source document into a structured research article JSON object.

Rules:
- Educational / research-use tone only. Never give dosing advice for human use.
- Prefer plain English with accurate scientific terminology.
- Keep citations as markdown links when URLs or DOIs are present: [label](url).
- Invent nothing material that is not supported by the source; if a body section is missing, leave it as an empty string or empty array.
- slug: lowercase kebab-case from the compound name (required).
- product_slug: best guess storefront slug (often shorter, e.g. reta for Retatrutide); empty string if unknown.
- status must be "draft".
- author_name may be null.
- published_at may be null.
- coa_body: short COA guidance tailored to the compound if the source mentions testing; otherwise a brief generic HPLC/identity/content note.
- related: only include clearly related compounds mentioned in the source (label + optional slug/kind/href).

SEO + listing fields are REQUIRED — always fill these from the document (never leave blank):
- name: compound display name
- slug: URL slug
- category / eyebrow: research category (e.g. "GLP-1 / Incretin")
- seo_title: ~50–60 chars, format "{Name} Research Overview | PEPLAB Australia"
- seo_description: 140–160 chars meta description for Google; include compound + research focus; research-use tone
- card_title: short hub title, usually "What is {Name}?"
- card_description: 1–2 sentence plain-English teaser for the Find Your Compound card
- h1: page H1, usually "{Name} Research Overview"
- subtitle: short supporting line under the H1

Return ONLY a JSON object with exactly these keys:
{
  "slug": string,
  "name": string,
  "category": string,
  "product_slug": string,
  "card_title": string,
  "card_description": string,
  "seo_title": string,
  "seo_description": string,
  "eyebrow": string,
  "h1": string,
  "subtitle": string,
  "intro": string,
  "what_is_heading": string,
  "what_is_body": string,
  "feature_rows": [{"feature": string, "details": string}],
  "mechanism_heading": string,
  "mechanism_intro": string,
  "mechanism_sections": [{"title": string, "body": string, "link_label"?: string, "link_url"?: string}],
  "mechanism_footer": string,
  "findings_heading": string,
  "findings_sections": [{"title": string, "body": string, "link_label"?: string, "link_url"?: string}],
  "glance_rows": [{"area": string, "investigated": string, "distinction": string}],
  "safety_body": string,
  "coa_heading": string,
  "coa_body": string,
  "faqs": [{"q": string, "a": string}],
  "related": [{"label": string, "slug"?: string, "kind"?: "product"|"category"|"research", "href"?: string}],
  "status": "draft",
  "author_name": string|null,
  "published_at": null
}`;

Deno.serve(async (req) => {
  // CORS preflight must return quickly with allow headers (no auth).
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const openaiKey = Deno.env.get("OPENAI_API_KEY")?.trim();
    if (!openaiKey) {
      console.error("research-ai-parse: OPENAI_API_KEY missing");
      return jsonResponse(
        {
          error:
            "Missing OPENAI_API_KEY. Add it under Supabase → Edge Functions → Secrets, then redeploy research-ai-parse.",
        },
        500,
      );
    }

    const model = Deno.env.get("OPENAI_MODEL")?.trim() || "gpt-4o-mini";
    const body = await req.json().catch(() => null);
    const documentText = String(body?.document_text ?? body?.text ?? "").trim();
    const hintName = String(body?.compound_name ?? "").trim();

    if (!documentText) {
      return jsonResponse({ error: "document_text is required" }, 400);
    }
    if (documentText.length < 40) {
      return jsonResponse(
        { error: "Document is too short — paste more research content." },
        400,
      );
    }

    const clipped =
      documentText.length > MAX_CHARS
        ? `${documentText.slice(0, MAX_CHARS)}\n\n[Truncated for length]`
        : documentText;

    const userPrompt = [
      hintName ? `Compound hint: ${hintName}` : null,
      "Source document:",
      clipped,
    ]
      .filter(Boolean)
      .join("\n\n");

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const openaiJson = await openaiRes.json().catch(() => null);
    if (!openaiRes.ok) {
      const msg =
        openaiJson?.error?.message ||
        openaiJson?.error ||
        `OpenAI request failed (${openaiRes.status})`;
      return jsonResponse({ error: String(msg) }, 502);
    }

    const content = openaiJson?.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return jsonResponse({ error: "OpenAI returned empty content" }, 502);
    }

    let article: Record<string, unknown>;
    try {
      article = JSON.parse(content);
    } catch {
      return jsonResponse({ error: "Failed to parse AI JSON response" }, 502);
    }

    article.status = "draft";
    article.published_at = null;

    return jsonResponse({
      ok: true,
      article,
      model,
      truncated: documentText.length > MAX_CHARS,
    });
  } catch (err) {
    console.error("research-ai-parse:", err);
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unexpected error" },
      500,
    );
  }
});
