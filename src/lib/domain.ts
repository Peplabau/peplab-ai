/**
 * PEPLAB domain routing — split deployments (recommended for SEO):
 *
 *   peplab.com.au  → This repo / Vercel project #1
 *                    Login entry + public SEO pages; shop requires sign-in.
 *                    index.html, sitemap, robots all use peplab.com.au.
 *
 *   peplab.ai      → Separate repo copy / Vercel project #2
 *                    Full open storefront. Apply files from deploy/peplab-ai/.
 *
 * Env (this .com.au deployment):
 *   VITE_SITE_URL           = https://peplab.com.au
 *   VITE_MAIN_APP_ORIGIN    = https://peplab.ai   (Shop now / open storefront)
 *   VITE_LOGIN_ONLY_HOSTS   = peplab.com.au,www.peplab.com.au
 *
 * Env (peplab.ai deployment — see deploy/peplab-ai/.env.example):
 *   VITE_SITE_URL           = https://peplab.ai
 *   VITE_MAIN_APP_ORIGIN    = https://peplab.ai
 *   VITE_LOGIN_ONLY_HOSTS   =   (empty — full shop)
 */

import { CONFIG } from './config';

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

/** Canonical site origin for this deployment (no trailing slash). */
export function siteOrigin(): string {
  return CONFIG.SITE_URL.replace(/\/$/, '');
}

/** Hostname shown in footers and legal copy, e.g. peplab.com.au */
export function siteHostname(): string {
  try {
    return new URL(siteOrigin()).hostname;
  } catch {
    return 'peplab.com.au';
  }
}

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

/** Paths on the login-only host that should not be indexed (auth entry, not public content). */
export function isLoginGatewayPath(pathname?: string): boolean {
  const p = (pathname ?? (typeof window !== 'undefined' ? window.location.pathname : '')).replace(/\/$/, '') || '/';
  return p === '/' || p === '/login' || p === '/signup' || p === '/forgot-password';
}

/**
 * Apply login-gateway branding to the static document shell.
 *
 * Called from `main.tsx` on boot and mirrored by an inline script in
 * `index.html` so the browser tab title updates before React loads.
 * Only auth entry routes — public pages (privacy, COA, calculator, …) keep SEO.
 */
export function applyLoginGatewayDocumentBranding(): void {
  if (!isLoginOnlyDomain() || !isLoginGatewayPath()) return;

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
