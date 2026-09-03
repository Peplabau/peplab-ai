/**
 * Edge Function: auspost-validate-address
 *
 * Checkout uses this before an order is created.
 * 1) Suburb/state/postcode against AusPost locality data
 * 2) If street/PO Box/locker lines are sent, Validate Shipments
 *    (POST /shipments/validation) — the same Shipping API as labels
 */
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

type Locality = { suburb: string; state: string; postcode: string };
type Address = {
  name: string;
  lines: string[];
  suburb: string;
  state: string;
  postcode: string;
  type?: string;
  email?: string;
};

function jsonOk(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizeState(raw: string): string {
  const key = raw.trim().toUpperCase().replace(/\./g, "");
  return STATE_MAP[key] || key.slice(0, 3);
}

function normalizePostcode(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 4);
}

function normalizeSuburb(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/\./g, "")
    .replace(/\bSAINT\b/g, "ST")
    .replace(/\s+/g, " ");
}

function uniqueSuburbs(rows: Locality[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of rows) {
    const name = row.suburb.trim();
    if (!name) continue;
    const key = normalizeSuburb(name);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out.slice(0, 12);
}

function creds() {
  return {
    base: (Deno.env.get("AUSPOST_BASE_URL") || "").replace(/\/$/, ""),
    apiKey: Deno.env.get("AUSPOST_API_KEY")?.trim() || "",
    password: Deno.env.get("AUSPOST_API_PASSWORD")?.trim() || "",
    accountNumber: Deno.env.get("AUSPOST_ACCOUNT_NUMBER")?.trim() || "",
  };
}

async function auspostFetch(
  path: string,
  init: RequestInit,
): Promise<{ ok: boolean; status: number; json: Record<string, unknown> }> {
  const { base, apiKey, password, accountNumber } = creds();
  if (!base || !apiKey || !password || !accountNumber) {
    return { ok: false, status: 500, json: { error: "Missing AusPost shipping secrets" } };
  }
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Account-Number": accountNumber,
      Authorization: `Basic ${btoa(`${apiKey}:${password}`)}`,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    json = { error: text.slice(0, 400) };
  }
  return { ok: res.ok, status: res.status, json };
}

function formatAusPostErrors(json: Record<string, unknown>): string {
  const errors = Array.isArray(json.errors) ? json.errors : [];
  if (!errors.length) {
    return typeof json.error === "string" ? json.error : JSON.stringify(json).slice(0, 280);
  }
  return errors
    .map((e) => {
      if (!e || typeof e !== "object") return String(e);
      const row = e as { message?: string; code?: string; name?: string; field?: string };
      return [row.field, row.message || row.code || row.name].filter(Boolean).join(": ");
    })
    .join(" | ");
}

function toAddressErrors(json: Record<string, unknown>): string[] {
  const errors = Array.isArray(json.errors) ? json.errors : [];
  const out: string[] = [];
  for (const e of errors) {
    if (!e || typeof e !== "object") continue;
    const row = e as { message?: string; field?: string; code?: string };
    const field = String(row.field || "").toLowerCase();
    const message = String(row.message || row.code || "").trim();
    if (field.includes(".from") || field.includes("addresses.from")) continue;
    if (!message) continue;
    if (isLockerRecipientEmailError(message)) continue;
    out.push(message);
  }
  if (out.length) return out;
  const fallback = formatAusPostErrors(json);
  if (fallback && !isLockerRecipientEmailError(fallback)) return [fallback];
  return [];
}

/** AusPost requires locker recipient email; checkout already has Contact email — do not block. */
function isLockerRecipientEmailError(message: string): boolean {
  const t = message.toLowerCase();
  return t.includes("email") && (t.includes("parcel locker") || t.includes("parcel collect"));
}

function inferType(lines: string[], addressType?: string): string | undefined {
  const text = lines.join(" ").toLowerCase();
  if (text.includes("parcel locker") || addressType === "parcel_locker") {
    return text.includes("parcel collect") ? "PARCEL_COLLECT" : "PARCEL_LOCKER";
  }
  if (text.includes("parcel collect")) return "PARCEL_COLLECT";
  return undefined;
}

function fromEnvAddress(): Address | null {
  const linesRaw = Deno.env.get("AUSPOST_FROM_LINES")?.trim();
  const suburb = Deno.env.get("AUSPOST_FROM_SUBURB")?.trim();
  const state = Deno.env.get("AUSPOST_FROM_STATE")?.trim();
  const postcode = Deno.env.get("AUSPOST_FROM_POSTCODE")?.trim();
  if (!linesRaw || !suburb || !state || !postcode) return null;
  return {
    name: (Deno.env.get("AUSPOST_FROM_NAME")?.trim() || "PEPLAB Australia").slice(0, 40),
    lines: linesRaw.split(/\n/).map((l) => l.trim()).filter(Boolean).slice(0, 3),
    suburb: suburb.toUpperCase(),
    state: normalizeState(state),
    postcode: normalizePostcode(postcode),
  };
}

async function shippingAddressLookup(
  suburb: string,
  state: string,
  postcode: string,
): Promise<{ found?: boolean; results?: unknown } | null> {
  const { base, apiKey, password, accountNumber } = creds();
  if (!base || !apiKey || !password || !accountNumber) return null;
  const qs = new URLSearchParams({ suburb, state, postcode });
  const res = await fetch(`${base}/address?${qs.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Account-Number": accountNumber,
      Authorization: `Basic ${btoa(`${apiKey}:${password}`)}`,
    },
  });
  if (res.status === 404) return null;
  const text = await res.text();
  try {
    return text ? (JSON.parse(text) as { found?: boolean; results?: unknown }) : {};
  } catch {
    return null;
  }
}

type PacLocality = { location?: string; suburb?: string; state?: string; postcode?: string | number };

function parsePacLocalities(json: Record<string, unknown>): Locality[] {
  const localities = json.localities as { locality?: PacLocality | PacLocality[] } | undefined;
  const raw = localities?.locality;
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list
    .map((row) => ({
      suburb: String(row.location || row.suburb || "").trim(),
      state: String(row.state || "").trim().toUpperCase(),
      postcode: String(row.postcode ?? "").replace(/\D/g, "").slice(0, 4),
    }))
    .filter((row) => row.suburb && row.postcode);
}

async function pacPostcodeLookup(postcode: string): Promise<Locality[]> {
  const apiKey = Deno.env.get("AUSPOST_API_KEY")?.trim();
  if (!apiKey) return [];
  const res = await fetch(
    `https://digitalapi.auspost.com.au/postcode/search.json?q=${encodeURIComponent(postcode)}`,
    { headers: { Accept: "application/json", "AUTH-KEY": apiKey } },
  );
  if (!res.ok) return [];
  return parsePacLocalities((await res.json()) as Record<string, unknown>);
}

function suburbsFromShippingResults(results: unknown): string[] {
  if (!Array.isArray(results)) return [];
  const names: string[] = [];
  for (const row of results) {
    if (typeof row === "string") names.push(row);
    else if (row && typeof row === "object") {
      const name = String((row as { suburb?: string; location?: string }).suburb || (row as { location?: string }).location || "").trim();
      if (name) names.push(name);
    }
  }
  return uniqueSuburbs(names.map((suburb) => ({ suburb, state: "", postcode: "" })));
}

async function validateLocality(suburb: string, state: string, postcode: string) {
  const shipping = await shippingAddressLookup(suburb, state, postcode);
  if (shipping && typeof shipping.found === "boolean") {
    const suggestions = suburbsFromShippingResults(shipping.results);
    if (shipping.found) return { valid: true as const, suburb, state, postcode, suggestions };
    return {
      valid: false as const,
      error: suggestions.length
        ? `Suburb does not match this postcode. Australia Post lists: ${suggestions.join(", ")}.`
        : "Suburb, state and postcode do not match an Australia Post delivery area.",
      suggestions,
    };
  }

  const localities = await pacPostcodeLookup(postcode);
  if (!localities.length) {
    return { valid: false as const, error: "This postcode is not a valid Australia Post delivery area.", suggestions: [] as string[] };
  }
  const inPostcode = localities.filter((row) => row.postcode === postcode);
  const pool = inPostcode.length ? inPostcode : localities;
  const stateMatch = pool.filter((row) => row.state === state);
  const searchPool = stateMatch.length ? stateMatch : pool;
  const hit = searchPool.find((row) => normalizeSuburb(row.suburb) === suburb);
  const suggestions = uniqueSuburbs(searchPool);
  if (hit) {
    return { valid: true as const, suburb: hit.suburb, state: hit.state, postcode: hit.postcode, suggestions };
  }
  if (pool.length && !stateMatch.length) {
    return {
      valid: false as const,
      error: `State does not match postcode ${postcode}. Australia Post uses ${pool[0].state}.`,
      suggestions,
    };
  }
  return {
    valid: false as const,
    error: suggestions.length
      ? `Suburb does not match this postcode. Australia Post lists: ${suggestions.join(", ")}.`
      : "Suburb, state and postcode do not match an Australia Post delivery area.",
    suggestions,
  };
}

async function pickProductId(shippingMethod?: string): Promise<string | null> {
  const wantExpress = (shippingMethod || "").toLowerCase().includes("express");
  const envId = wantExpress
    ? Deno.env.get("AUSPOST_PRODUCT_ID_EXPRESS")?.trim()
    : Deno.env.get("AUSPOST_PRODUCT_ID_STANDARD")?.trim();
  if (envId) return envId;

  const { accountNumber } = creds();
  const account = await auspostFetch(`/accounts/${encodeURIComponent(accountNumber)}`, { method: "GET" });
  if (!account.ok) return null;
  const raw = Array.isArray(account.json.postage_products)
    ? account.json.postage_products
    : Array.isArray(account.json.products)
    ? account.json.products
    : [];
  const ids = raw
    .map((row) => (row && typeof row === "object" ? String((row as { product_id?: string }).product_id || "").trim() : ""))
    .filter(Boolean);
  const prefs = wantExpress
    ? ["3K55", "3K33", "3E33", "EL1"]
    : ["7E55", "7E03", "7N85"];
  return prefs.find((id) => ids.includes(id)) || ids[0] || null;
}

async function validateShipment(to: Address, shippingMethod?: string): Promise<{ ok: boolean; error?: string }> {
  const from = fromEnvAddress();
  if (!from) {
    return { ok: true };
  }
  const productId = await pickProductId(shippingMethod);
  if (!productId) {
    return { ok: false, error: "Australia Post account has no postage product for checkout validation." };
  }

  const payload = {
    shipments: [
      {
        shipment_reference: "CHECKOUT-VALIDATE",
        from,
        to,
        items: [
          {
            item_reference: "CHECKOUT",
            product_id: productId,
            length: "20",
            width: "15",
            height: "10",
            weight: "0.5",
            authority_to_leave: true,
            safe_drop_enabled: true,
            allow_partial_delivery: false,
          },
        ],
      },
    ],
  };

  const validated = await auspostFetch("/shipments/validation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (validated.ok || validated.status === 200) return { ok: true };

  const messages = toAddressErrors(validated.json);
  if (!messages.length) return { ok: true };
  const joined = messages.join(" ");
  if (/suburb|state|postcode|address|parcel locker|parcel collect|po box/i.test(joined) || messages.length) {
    return {
      ok: false,
      error: messages[0] || "Australia Post rejected this delivery address.",
    };
  }
  return { ok: false, error: "Australia Post could not validate this address." };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonOk({ error: "Method not allowed" }, 405);

  let body: {
    suburb?: string;
    state?: string;
    postcode?: string;
    lines?: string[];
    address?: string;
    apartment?: string;
    address_type?: string;
    shipping_method?: string;
    name?: string;
    email?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return jsonOk({ valid: false, error: "Invalid JSON" }, 400);
  }

  const suburb = normalizeSuburb(body.suburb || "");
  const state = normalizeState(body.state || "");
  const postcode = normalizePostcode(body.postcode || "");
  if (!/^\d{4}$/.test(postcode)) {
    return jsonOk({ valid: false, error: "Enter a valid 4-digit Australian postcode." });
  }
  if (!state) return jsonOk({ valid: false, error: "Select an Australian state." });
  if (suburb.length < 2) {
    return jsonOk({ valid: false, error: "Enter a suburb Australia Post can deliver to." });
  }

  try {
    const locality = await validateLocality(suburb, state, postcode);
    if (!locality.valid) {
      return jsonOk({
        valid: false,
        error: locality.error,
        suggestions: locality.suggestions,
      });
    }

    const lines = [
      ...(Array.isArray(body.lines) ? body.lines : []),
      body.address || "",
      body.apartment || "",
    ]
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (!lines.length) {
      return jsonOk({
        valid: true,
        suburb: locality.suburb,
        state: locality.state,
        postcode: locality.postcode,
        suggestions: locality.suggestions,
      });
    }

    const to: Address = {
      name: (body.name || "Customer").trim().slice(0, 40) || "Customer",
      lines,
      suburb: locality.suburb,
      state: locality.state,
      postcode: locality.postcode,
    };
    const email = (body.email || "").trim();
    if (email) to.email = email;
    const type = inferType(lines, body.address_type);
    if (type) to.type = type;

    const shipment = await validateShipment(to, body.shipping_method);
    if (!shipment.ok) {
      return jsonOk({
        valid: false,
        error: shipment.error,
        suburb: locality.suburb,
        state: locality.state,
        postcode: locality.postcode,
        suggestions: locality.suggestions,
      });
    }

    return jsonOk({
      valid: true,
      suburb: locality.suburb,
      state: locality.state,
      postcode: locality.postcode,
      suggestions: locality.suggestions,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Australia Post lookup failed";
    return jsonOk({ valid: false, error: message }, 502);
  }
});
