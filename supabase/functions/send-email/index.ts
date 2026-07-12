/**
 * Edge Function: send-email
 *
 * Dashboard: Edge Functions → Create → name: send-email → paste this file.
 * Secrets (Edge Functions → send-email → Secrets, or Project Settings → Edge Functions):
 *   RESEND_API_KEY       = re_...
 *   RESEND_FROM_EMAIL    = contact@peplab.com.au
 *
 * Settings: allow unauthenticated invoke if you use guest checkout
 *   (CLI: supabase/config.toml verify_jwt = false for this function)
 */
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const key = Deno.env.get("RESEND_API_KEY");
    const from = Deno.env.get("RESEND_FROM_EMAIL");
    if (!key || !from) {
      return new Response(
        JSON.stringify({
          error:
            "Missing RESEND_API_KEY or RESEND_FROM_EMAIL on the function. Add them under Edge Function secrets.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    type AttachmentIn = {
      filename?: string;
      content_id?: string;
      content_type?: string;
      path?: string;
      content?: string;
    };

    const body = (await req.json()) as {
      to?: string;
      subject?: string;
      html?: string;
      text?: string;
      attachments?: AttachmentIn[];
    };

    if (!body.to || !body.subject || !body.html) {
      return new Response(JSON.stringify({ error: "to, subject, and html are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.html.length > 500000) {
      return new Response(JSON.stringify({ error: "html too large" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let attachmentsPayload: Record<string, unknown>[] | undefined;
    if (body.attachments != null && body.attachments.length > 0) {
      if (body.attachments.length > 12) {
        return new Response(JSON.stringify({ error: "too many attachments" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      attachmentsPayload = [];
      for (const a of body.attachments) {
        const fn = typeof a.filename === "string" ? a.filename.trim() : "";
        if (!fn || fn.length > 255) {
          return new Response(JSON.stringify({ error: "invalid attachment filename" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const path = typeof a.path === "string" ? a.path.trim() : "";
        const content = typeof a.content === "string" ? a.content.trim() : "";
        if ((path && content) || (!path && !content)) {
          return new Response(JSON.stringify({ error: "each attachment needs path or content, not both" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (path) {
          let u: URL;
          try {
            u = new URL(path);
          } catch {
            return new Response(JSON.stringify({ error: "invalid attachment path URL" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          if (u.protocol !== "https:") {
            return new Response(JSON.stringify({ error: "attachment path must be https" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
        if (content.length > 18_000_000) {
          return new Response(JSON.stringify({ error: "attachment content too large" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const cid = typeof a.content_id === "string" ? a.content_id.trim() : "";
        if (cid.length > 127) {
          return new Response(JSON.stringify({ error: "content_id too long" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const row: Record<string, string> = { filename: fn };
        if (cid) row.content_id = cid;
        const ct = typeof a.content_type === "string" ? a.content_type.trim() : "";
        if (ct) row.content_type = ct;
        if (path) row.path = path;
        else row.content = content;
        attachmentsPayload.push(row);
      }
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: body.to,
        subject: body.subject,
        html: body.html,
        ...(body.text ? { text: body.text } : {}),
        ...(attachmentsPayload?.length ? { attachments: attachmentsPayload } : {}),
      }),
    });

    const resText = await res.text();
    if (!res.ok) {
      return new Response(JSON.stringify({ error: resText || res.statusText || String(res.status) }), {
        status: res.status >= 400 && res.status < 600 ? res.status : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resText || JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
