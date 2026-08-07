/**
 * Dual-domain PEPLAB storefront (same Vercel project, both Production).
 *
 * LOCKED .com.au / OPEN .ai (current):
 *   peplab.com.au  → Login entry + public SEO pages. Shop requires sign-in;
 *                    after login, full access stays on this domain.
 *   peplab.ai      → Full open shop (VITE_SITE_URL / VITE_MAIN_APP_ORIGIN).
 *
 * To open the full shop on both domains again, clear VITE_LOGIN_ONLY_HOSTS.
 *
 * Env:
 *   VITE_SITE_URL           = https://peplab.ai
 *   VITE_MAIN_APP_ORIGIN    = https://peplab.ai
 *   VITE_LOGIN_ONLY_HOSTS   = peplab.com.au,www.peplab.com.au
 */

/** Hosts that only render the login/auth flow. Empty = full shop everywhere. */
const DEFAULT_LOGIN_ONLY_HOSTS = 'peplab.com.au,www.peplab.com.au';

/** Full origin (protocol + host) of the open storefront. */
const DEFAULT_MAIN_APP_ORIGIN = 'https://peplab.ai';

/** Marker in the URL hash that identifies a cross-domain login handoff. */
export const CROSS_DOMAIN_LOGIN_HASH_TYPE = 'cross-domain-login';

/** Browser tab title on the login-only host (peplab.com.au / staging.*). */
export const LOGIN_GATEWAY_PAGE_TITLE = 'PEPLAB | Sign in';

/** Subtitle under the PEPLAB wordmark in the inline loading shell on login-only hosts. */
export const LOGIN_GATEWAY_LOADING_EYEBROW = 'SIGN IN';

/** Short meta description for the login gateway — no shop/SEO copy. */
export const LOGIN_GATEWAY_META_DESCRIPTION =
  'Sign in to your PEPLAB account. Member access for existing customers.';

function parseHostList(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Only hosts listed in VITE_LOGIN_ONLY_HOSTS are gated.
 * - unset → DEFAULT_LOGIN_ONLY_HOSTS
 * - empty string → unlocked (full shop on every host)
 */
function resolveLoginOnlyHosts(): string[] {
  const raw = import.meta.env.VITE_LOGIN_ONLY_HOSTS;
  if (typeof raw === 'string') {
    return parseHostList(raw);
  }
  return parseHostList(DEFAULT_LOGIN_ONLY_HOSTS);
}

const LOGIN_ONLY_HOSTS = resolveLoginOnlyHosts();

export const MAIN_APP_ORIGIN: string = (
  import.meta.env.VITE_MAIN_APP_ORIGIN ?? DEFAULT_MAIN_APP_ORIGIN
).replace(/\/+$/, '');

/**
 * True when the current page is being served from a host that should be
 * locked down to the login flow only.
 *
 * We match on `hostname` (no port) *and* on `host` (with port) so a dev
 * override like `VITE_LOGIN_ONLY_HOSTS=localhost:5173` still works.
 */
export function isLoginOnlyDomain(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname.toLowerCase();
  const host = window.location.host.toLowerCase();
  return LOGIN_ONLY_HOSTS.includes(hostname) || LOGIN_ONLY_HOSTS.includes(host);
}

/** Build an absolute URL on the main storefront. */
export function mainAppUrl(pathAndQuery: string = '/'): string {
  const path = pathAndQuery.startsWith('/') ? pathAndQuery : `/${pathAndQuery}`;
  return `${MAIN_APP_ORIGIN}${path}`;
}

/**
 * Build the cross-domain login handoff URL.
 *
 * Encodes the Supabase access + refresh tokens (plus the intended landing
 * path) in the URL *hash*. Hash fragments are never sent to the server —
 * they never appear in HTTP logs, referer headers, or Vercel edge logs —
 * which is why we prefer them over the query string for token material.
 *
 * The main app reads this hash in `main.tsx` before React mounts,
 * calls `supabase.auth.setSession(...)`, wipes the hash, and navigates to
 * `next`.
 */
export function buildCrossDomainLoginUrl(params: {
  accessToken: string;
  refreshToken: string;
  next?: string;
}): string {
  const hash = new URLSearchParams({
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
    type: CROSS_DOMAIN_LOGIN_HASH_TYPE,
    next: params.next ?? '/dashboard',
  }).toString();
  return `${MAIN_APP_ORIGIN}/#${hash}`;
}

/**
 * Apply login-gateway branding to the static document shell.
 *
 * Called from `main.tsx` on boot and mirrored by an inline script in
 * `index.html` so the browser tab title updates before React loads.
 */
export function applyLoginGatewayDocumentBranding(): void {
  if (!isLoginOnlyDomain()) return;

  document.title = LOGIN_GATEWAY_PAGE_TITLE;

  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  };

  setMeta('meta[name="description"]', LOGIN_GATEWAY_META_DESCRIPTION);
  setMeta('meta[name="robots"]', 'noindex, nofollow');
  setMeta('meta[property="og:title"]', LOGIN_GATEWAY_PAGE_TITLE);
  setMeta('meta[property="og:description"]', LOGIN_GATEWAY_META_DESCRIPTION);
  setMeta('meta[property="og:site_name"]', 'PEPLAB');
  setMeta('meta[name="twitter:title"]', LOGIN_GATEWAY_PAGE_TITLE);
  setMeta('meta[name="twitter:description"]', LOGIN_GATEWAY_META_DESCRIPTION);

  const eyebrow = document.getElementById('app-loading-eyebrow');
  if (eyebrow) eyebrow.textContent = LOGIN_GATEWAY_LOADING_EYEBROW;
}
