/**
 * Edge Function: auspost-create-label
 *
 * Creates an Australia Post domestic shipment + printable label for one order.
 *
 * Secrets (Supabase → Edge Functions → Secrets):
 *   AUSPOST_API_KEY              = test/prod API key
 *   AUSPOST_API_PASSWORD         = password from AusPost welcome pack
 *   AUSPOST_ACCOUNT_NUMBER       = 2005401703 (domestic test) / live account
 *   AUSPOST_BASE_URL             = https://digitalapi.auspost.com.au/test/shipping/v1
 *                                  (prod: https://digitalapi.auspost.com.au/shipping/v1)
 *   AUSPOST_PRODUCT_ID_EXPRESS   = optional override (otherwise picked from Get Accounts)
 *   AUSPOST_PRODUCT_ID_STANDARD  = optional override (otherwise picked from Get Accounts)
 *   AUSPOST_FROM_NAME            = PEPLAB Australia
 *   AUSPOST_FROM_LINES           = street address (must match a real AU locality)
 *   AUSPOST_FROM_SUBURB          = suburb (e.g. SYDNEY) — must match postcode
 *   AUSPOST_FROM_STATE           = NSW
 *   AUSPOST_FROM_POSTCODE        = 2000
 *   AUSPOST_FROM_PHONE           = optional
 *   AUSPOST_FROM_EMAIL           = optional
 *
 * Auth: requires a logged-in JWT (admin UI only).
 */
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type AddressIn = {
  name?: string;
  lines?: string[];
  suburb?: string;
  state?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  type?: string;
};

type CreateLabelBody = {
  order_number?: string;
  shipping_method?: string;
  to?: AddressIn;
  weight_kg?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
};

type AccountProduct = {
  product_id: string;
  type?: string;
  group?: string;
  name?: string;
};

function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function basicAuthHeader(apiKey: string, password: string): string {
  return `Basic ${btoa(`${apiKey}:${password}`)}`;
}

function splitLines(raw: string): string[] {
  return raw
    .split(/\n/)
    .flatMap((line) => {
      // Keep "Unit 1, 22 Main St" as one line when possible; only split on newlines.
      return [line.trim()];
    })
    .filter(Boolean)
    .slice(0, 3);
}

const STATE_MAP: Record<string, string> = {
  NSW: "NSW",
  VIC: "VIC",
  QLD: "QLD",
  SA: "SA",
  WA: "WA",
  TAS: "TAS",
  ACT: "ACT",
  NT: "NT",
  "NEW SOUTH WALES": "NSW",
  VICTORIA: "VIC",
  QUEENSLAND: "QLD",
  "SOUTH AUSTRALIA": "SA",
  "WESTERN AUSTRALIA": "WA",
  TASMANIA: "TAS",
  "AUSTRALIAN CAPITAL TERRITORY": "ACT",
  "NORTHERN TERRITORY": "NT",
};

function normalizeState(raw: string): string {
  const key = raw.trim().toUpperCase().replace(/\./g, "");
  return STATE_MAP[key] || key.slice(0, 3);
}

function normalizePostcode(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.slice(0, 4).padStart(4, "0");
}

function inferToAddressType(lines: string[], explicit?: string): string | undefined {
  const raw = (explicit || "").trim().toUpperCase();
  if (raw === "PARCEL_LOCKER" || raw === "PARCEL_COLLECT" || raw === "STANDARD_ADDRESS") return raw;
  const text = lines.join(" ").toLowerCase();
  if (/parcel\s+locker/.test(text)) return "PARCEL_LOCKER";
  if (/parcel\s+collect/.test(text)) return "PARCEL_COLLECT";
  return undefined;
}

/** AusPost locality matching is strict — suburb UPPERCASE, state abbrev, 4-digit postcode. */
function normalizeAddress(addr: AddressIn, fallbackName = "Recipient"): AddressIn {
  const lines = (addr.lines || [])
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 3);
  const type = inferToAddressType(lines, addr.type);
  return {
    name: (addr.name || fallbackName).trim().slice(0, 40),
    lines,
    suburb: (addr.suburb || "").trim().toUpperCase(),
    state: normalizeState(addr.state || ""),
    postcode: normalizePostcode(addr.postcode || ""),
    phone: addr.phone?.trim() || undefined,
    email: addr.email?.trim() || undefined,
    ...(type ? { type } : {}),
  };
}

function resolveFromAddressFromEnv(): AddressIn | null {
  const name = Deno.env.get("AUSPOST_FROM_NAME")?.trim() || "PEPLAB Australia";
  const linesRaw = Deno.env.get("AUSPOST_FROM_LINES")?.trim();
  const suburb = Deno.env.get("AUSPOST_FROM_SUBURB")?.trim();
  const state = Deno.env.get("AUSPOST_FROM_STATE")?.trim();
  const postcode = Deno.env.get("AUSPOST_FROM_POSTCODE")?.trim();
  if (!linesRaw || !suburb || !state || !postcode) return null;
  return normalizeAddress({
    name,
    lines: splitLines(linesRaw),
    suburb,
    state,
    postcode,
    phone: Deno.env.get("AUSPOST_FROM_PHONE")?.trim() || undefined,
    email: Deno.env.get("AUSPOST_FROM_EMAIL")?.trim() || undefined,
  });
}

async function auspostFetch(
  path: string,
  init: RequestInit & { accountNumber: string; apiKey: string; password: string },
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const base = (Deno.env.get("AUSPOST_BASE_URL") || "").replace(/\/$/, "");
  if (!base) {
    return { ok: false, status: 500, json: { error: "Missing AUSPOST_BASE_URL secret" } };
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Account-Number": init.accountNumber,
      Authorization: basicAuthHeader(init.apiKey, init.password),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    json = { error: text.slice(0, 500) || res.statusText };
  }
  return { ok: res.ok, status: res.status, json };
}

function parseAccountProducts(accountJson: Record<string, unknown>): AccountProduct[] {
  const raw = Array.isArray(accountJson.postage_products)
    ? accountJson.postage_products
    : Array.isArray(accountJson.products)
    ? accountJson.products
    : [];
  const out: AccountProduct[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const id = String(r.product_id || r.code || "").trim();
    if (!id) continue;
    out.push({
      product_id: id,
      type: typeof r.type === "string" ? r.type : undefined,
      group: typeof r.group === "string" ? r.group : undefined,
      name: typeof r.name === "string"
        ? r.name
        : typeof r.product_type === "string"
        ? r.product_type
        : undefined,
    });
  }
  return out;
}

/** Prefer account lodgement / merchant address when secrets don't match AusPost locality DB. */
function extractAccountFromAddress(
  accountJson: Record<string, unknown>,
  fallbackName: string,
): AddressIn | null {
  const candidates: unknown[] = [];
  if (Array.isArray(accountJson.addresses)) candidates.push(...accountJson.addresses);
  if (Array.isArray(accountJson.locations)) candidates.push(...accountJson.locations);
  if (accountJson.address && typeof accountJson.address === "object") {
    candidates.push(accountJson.address);
  }
  for (const loc of accountJson.locations || []) {
    if (loc && typeof loc === "object" && (loc as { address?: unknown }).address) {
      candidates.push((loc as { address: unknown }).address);
    }
  }

  for (const c of candidates) {
    if (!c || typeof c !== "object") continue;
    const a = c as Record<string, unknown>;
    const linesRaw = a.lines;
    const lines = Array.isArray(linesRaw)
      ? linesRaw.map((l) => String(l).trim()).filter(Boolean)
      : typeof a.line1 === "string"
      ? [a.line1, typeof a.line2 === "string" ? a.line2 : ""].map((s) => s.trim()).filter(Boolean)
      : typeof a.address === "string"
      ? [a.address]
      : [];
    const suburb = String(a.suburb || "").trim();
    const state = String(a.state || "").trim();
    const postcode = String(a.postcode || "").trim();
    if (!lines.length || !suburb || !state || !postcode) continue;
    return normalizeAddress({
      name: String(a.name || a.business_name || fallbackName),
      lines,
      suburb,
      state,
      postcode,
      phone: typeof a.phone === "string" ? a.phone : undefined,
      email: typeof a.email === "string" ? a.email : undefined,
    });
  }
  return null;
}

/** Products that need IDENTITY_ON_DELIVERY / no ATL — skip for default PEPLAB labels. */
function isRestrictedDeliveryProduct(p: AccountProduct): boolean {
  const hay = `${p.product_id} ${p.name || ""} ${p.type || ""} ${p.group || ""}`.toUpperCase();
  return (
    /^XID\d/i.test(p.product_id) ||
    /^ID\d/i.test(p.product_id) ||
    /^IC\d/i.test(p.product_id) ||
    /IDENTITY|SIGNATURE|PERSON_TO_PERSON|PTI/i.test(hay)
  );
}

function isExpressProduct(p: AccountProduct): boolean {
  const hay = `${p.product_id} ${p.name || ""} ${p.type || ""} ${p.group || ""}`;
  return /express/i.test(hay) || /^3[EKPWVX]/i.test(p.product_id) || /^EL/i.test(p.product_id) || /^ECM/i.test(p.product_id);
}

function isParcelPostProduct(p: AccountProduct): boolean {
  const hay = `${p.product_id} ${p.name || ""} ${p.type || ""} ${p.group || ""}`;
  return /parcel\s*post/i.test(hay) || /^7[ENO]/i.test(p.product_id);
}

/**
 * Prefer simple Parcel Post / Express (e.g. 7E55, 3K55).
 * Never default to Identity-on-Delivery (XID2) — those need extra features.
 */
function pickProductId(
  products: AccountProduct[],
  shippingMethod?: string,
): { productId: string; group: string; available: string[] } {
  const method = (shippingMethod || "standard").toLowerCase();
  const wantExpress = method.includes("express");
  const envExpress = Deno.env.get("AUSPOST_PRODUCT_ID_EXPRESS")?.trim();
  const envStandard = Deno.env.get("AUSPOST_PRODUCT_ID_STANDARD")?.trim();
  const available = products.map((p) => p.product_id);
  const usable = products.filter((p) => !isRestrictedDeliveryProduct(p));

  if (wantExpress && envExpress && available.includes(envExpress)) {
    return { productId: envExpress, group: "Express Post", available };
  }
  if (!wantExpress && envStandard && available.includes(envStandard)) {
    return { productId: envStandard, group: "Parcel Post", available };
  }

  // Preferred known testbed / contract codes (first match wins).
  const expressPrefs = ["3K55", "3K33", "3K03", "3E33", "3E03", "3P85", "3V85", "EL1", "ECM8"];
  const standardPrefs = ["7E55", "7E03", "7N85", "7N35", "7O85"];

  if (wantExpress) {
    for (const id of expressPrefs) {
      if (available.includes(id)) return { productId: id, group: "Express Post", available };
    }
    const express = usable.find((p) => isExpressProduct(p));
    if (express) return { productId: express.product_id, group: "Express Post", available };
  }

  for (const id of standardPrefs) {
    if (available.includes(id)) return { productId: id, group: "Parcel Post", available };
  }
  const parcel = usable.find((p) => isParcelPostProduct(p));
  if (parcel) return { productId: parcel.product_id, group: "Parcel Post", available };

  const anySimple = usable[0];
  if (anySimple) {
    return {
      productId: anySimple.product_id,
      group: isExpressProduct(anySimple) ? "Express Post" : "Parcel Post",
      available,
    };
  }

  // Absolute last resort — still avoid XID if possible
  const nonIdentity = products.find((p) => !/^XID|^ID\d|^IC\d/i.test(p.product_id));
  if (nonIdentity) {
    return {
      productId: nonIdentity.product_id,
      group: isExpressProduct(nonIdentity) ? "Express Post" : "Parcel Post",
      available,
    };
  }

  const fallback = wantExpress ? envExpress || "3K55" : envStandard || "7E55";
  return {
    productId: fallback,
    group: wantExpress ? "Express Post" : "Parcel Post",
    available,
  };
}

function extractTracking(shipment: Record<string, unknown>): string {
  const items = Array.isArray(shipment.items) ? shipment.items : [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const td = (item as { tracking_details?: { article_id?: string; consignment_id?: string } })
      .tracking_details;
    if (td?.article_id) return String(td.article_id);
    if (td?.consignment_id) return String(td.consignment_id);
  }
  if (typeof shipment.shipment_summary === "object" && shipment.shipment_summary) {
    const summary = shipment.shipment_summary as { tracking_summary?: string };
    if (summary.tracking_summary) return String(summary.tracking_summary);
  }
  return "";
}

function extractLabelUrl(labelJson: Record<string, unknown>): string {
  const labels = Array.isArray(labelJson.labels) ? labelJson.labels : [];
  for (const label of labels) {
    if (!label || typeof label !== "object") continue;
    const url = (label as { url?: string }).url;
    if (url) return String(url);
  }
  return "";
}

function formatAusPostErrors(json: Record<string, unknown>): string {
  const errors = Array.isArray(json.errors) ? json.errors : [];
  if (!errors.length) {
    return typeof json.error === "string" ? json.error : JSON.stringify(json).slice(0, 400);
  }
  return errors
    .map((e) => {
      if (!e || typeof e !== "object") return String(e);
      const row = e as { message?: string; code?: string; name?: string; field?: string };
      return [row.code || row.name, row.field, row.message].filter(Boolean).join(": ");
    })
    .join(" | ");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return jsonError("Method not allowed", 405);
  }

  try {
    const apiKey = Deno.env.get("AUSPOST_API_KEY")?.trim();
    const password = Deno.env.get("AUSPOST_API_PASSWORD")?.trim();
    const accountNumber = Deno.env.get("AUSPOST_ACCOUNT_NUMBER")?.trim();
    if (!apiKey || !password || !accountNumber) {
      return jsonError(
        "Missing AUSPOST_API_KEY, AUSPOST_API_PASSWORD, or AUSPOST_ACCOUNT_NUMBER secrets.",
        500,
      );
    }

    const body = (await req.json()) as CreateLabelBody;
    const orderNumber = (body.order_number || "").trim();
    const toRaw = body.to;
    if (!orderNumber) return jsonError("order_number is required");
    if (!toRaw?.name?.trim() || !toRaw.suburb?.trim() || !toRaw.state?.trim() || !toRaw.postcode?.trim()) {
      return jsonError("to.name, to.suburb, to.state, and to.postcode are required");
    }
    const toLines = (toRaw.lines || []).map((l) => l.trim()).filter(Boolean);
    if (!toLines.length) return jsonError("to.lines must include at least one street address line");

    const auth = { accountNumber, apiKey, password };

    // Load account products + lodgement address (required on testbed — product IDs differ from prod).
    const account = await auspostFetch(`/accounts/${encodeURIComponent(accountNumber)}`, {
      method: "GET",
      accountNumber,
      apiKey,
      password,
    });
    if (!account.ok) {
      return jsonError(
        `Get Accounts failed (check API key/password/account): ${formatAusPostErrors(account.json)}`,
        account.status || 502,
      );
    }

    const products = parseAccountProducts(account.json);
    const picked = pickProductId(products, body.shipping_method);
    if (!products.length) {
      return jsonError(
        "No postage products on this AusPost account. Check AUSPOST_ACCOUNT_NUMBER / testbed credentials.",
        500,
      );
    }
    if (products.length && !products.some((p) => p.product_id === picked.productId)) {
      return jsonError(
        `Product ${picked.productId} is not on this account. Available: ${picked.available.join(", ") || "none"}. Set AUSPOST_PRODUCT_ID_STANDARD / EXPRESS to one of these.`,
        400,
      );
    }

    const fromEnv = resolveFromAddressFromEnv();
    const fromAccount = extractAccountFromAddress(account.json, fromEnv?.name || "PEPLAB Australia");
    // Prefer env if complete; otherwise fall back to account lodgement address.
    let from = fromEnv || fromAccount;
    if (!from?.lines?.length) {
      return jsonError(
        "Set AUSPOST_FROM_* secrets (LINES/SUBURB/STATE/POSTCODE must be a real matching AU locality), or ensure Get Accounts returns a lodgement address.",
        500,
      );
    }

    const to = normalizeAddress({
      ...toRaw,
      lines: toLines,
    });

    const weight = Math.min(Math.max(Number(body.weight_kg) || 0.5, 0.01), 22);
    const length = Math.min(Math.max(Number(body.length_cm) || 20, 1), 105);
    const width = Math.min(Math.max(Number(body.width_cm) || 15, 1), 105);
    const height = Math.min(Math.max(Number(body.height_cm) || 10, 1), 105);

    const buildPayload = (fromAddr: AddressIn) => ({
      shipments: [
        {
          shipment_reference: orderNumber.slice(0, 50),
          customer_reference_1: orderNumber.slice(0, 50),
          email_tracking_enabled: true,
          from: fromAddr,
          to,
          items: [
            {
              item_reference: orderNumber.slice(0, 50),
              product_id: picked.productId,
              length: String(length),
              width: String(width),
              height: String(height),
              weight: String(weight),
              // Standard Parcel/Express: allow ATL + safe drop (not Identity-on-Delivery).
              authority_to_leave: true,
              safe_drop_enabled: true,
              allow_partial_delivery: false,
            },
          ],
        },
      ],
    });

    let created = await auspostFetch("/shipments", {
      method: "POST",
      body: JSON.stringify(buildPayload(from)),
      ...auth,
    });

    // If suburb/state/postcode mismatch is on the FROM address, retry with account lodgement address.
    const errText = formatAusPostErrors(created.json);
    if (
      !created.ok &&
      /suburb.*state.*postcode|postcode.*doesn't match|does not match/i.test(errText) &&
      fromAccount &&
      fromEnv &&
      (fromAccount.suburb !== fromEnv.suburb ||
        fromAccount.postcode !== fromEnv.postcode ||
        fromAccount.state !== fromEnv.state)
    ) {
      from = fromAccount;
      created = await auspostFetch("/shipments", {
        method: "POST",
        body: JSON.stringify(buildPayload(from)),
        ...auth,
      });
    }

    if (!created.ok) {
      return jsonError(
        `Create shipment failed: ${formatAusPostErrors(created.json)}. ` +
          `Using product ${picked.productId} (available: ${picked.available.join(", ")}). ` +
          `From: ${from.suburb} ${from.state} ${from.postcode}. To: ${to.suburb} ${to.state} ${to.postcode}. ` +
          `Fix mismatched suburb/state/postcode on the order or AUSPOST_FROM_* secrets.`,
        created.status || 502,
      );
    }

    const shipments = Array.isArray(created.json.shipments) ? created.json.shipments : [];
    const shipment = (shipments[0] || {}) as Record<string, unknown>;
    const shipmentId = typeof shipment.shipment_id === "string" ? shipment.shipment_id : "";
    if (!shipmentId) {
      return jsonError("AusPost did not return a shipment_id", 502);
    }
    const trackingNumber = extractTracking(shipment);
    if (!trackingNumber) {
      return jsonError("AusPost did not return a tracking/article id", 502);
    }

    const labelPayload = {
      wait_for_label_url: true,
      unlabelled_articles_only: false,
      preferences: [
        {
          type: "PRINT",
          format: "PDF",
          groups: [
            {
              group: picked.group,
              layout: "A4-1pp",
              branded: true,
              left_offset: 0,
              top_offset: 0,
            },
          ],
        },
      ],
      shipments: [{ shipment_id: shipmentId }],
    };

    const labelled = await auspostFetch("/labels", {
      method: "POST",
      body: JSON.stringify(labelPayload),
      ...auth,
    });
    if (!labelled.ok) {
      return new Response(
        JSON.stringify({
          success: true,
          tracking_number: trackingNumber,
          shipment_id: shipmentId,
          label_url: null,
          product_id: picked.productId,
          warning: `Shipment created but label failed: ${formatAusPostErrors(labelled.json)}`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const labelUrl = extractLabelUrl(labelled.json);

    return new Response(
      JSON.stringify({
        success: true,
        tracking_number: trackingNumber,
        shipment_id: shipmentId,
        label_url: labelUrl || null,
        product_id: picked.productId,
        from_used: `${from.suburb} ${from.state} ${from.postcode}`,
        to_used: `${to.suburb} ${to.state} ${to.postcode}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return jsonError(msg, 500);
  }
});
