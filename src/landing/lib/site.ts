const trim = (url: string) => url.replace(/\/$/, '');

function runtimeOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  const fromEnv = import.meta.env.VITE_MAIN_SITE_URL || import.meta.env.VITE_SITE_URL;
  return trim(fromEnv || 'https://peplab.ai');
}

/** Main storefront origin for this deployment. */
export const MAIN_SITE_URL = trim(import.meta.env.VITE_MAIN_SITE_URL || runtimeOrigin());

/** Alias: shop lives at the main site root. */
export const SHOP_URL = MAIN_SITE_URL;

/**
 * Marketing landing — /landing on the main site when embedded.
 * Override with VITE_LANDING_SITE_URL for standalone subdomain deploys.
 */
export const LANDING_SITE_URL = trim(
  import.meta.env.VITE_LANDING_SITE_URL || `${runtimeOrigin()}/landing`,
);

/** Published COA archive on the main shop site. */
export const COA_ARCHIVE_PATH = '/coa';

/** Canonical shop / catalogue path on the main site. */
export const SHOP_PAGE_PATH = '/shop';

/**
 * Storefront the marketing landing sends shoppers to.
 * /landing can be served on peplab.ai; its shop CTAs still open peplab.com.au.
 */
export const LANDING_SHOP_ORIGIN = 'https://peplab.com.au';

/** Build an absolute URL on peplab.com.au. */
export function shopUrl(path = ''): string {
  if (!path) return `${LANDING_SHOP_ORIGIN}/`;
  return `${LANDING_SHOP_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Shop catalogue page. */
export function shopPageUrl(): string {
  return shopUrl(SHOP_PAGE_PATH);
}

/** COA archive page — batch certificates published for verification. */
export function coaArchiveUrl(): string {
  return shopUrl(COA_ARCHIVE_PATH);
}

/** Prefix relative asset paths from the main site. */
export function normalizeImageUrl(url: string | null | undefined): string {
  const raw = (url ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  const base = MAIN_SITE_URL || 'https://peplab.ai';
  return `${base}${path}`;
}
