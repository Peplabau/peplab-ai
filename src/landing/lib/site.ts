const trim = (url: string) => url.replace(/\/$/, '');

function runtimeOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return trim(import.meta.env.VITE_MAIN_SITE_URL || 'https://peplab.com.au');
}

/** Main storefront — peplab.com.au (shop at /). */
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

/** Build an absolute URL on the main shop site. */
export function shopUrl(path = ''): string {
  if (!path) return `${MAIN_SITE_URL}/`;
  return `${MAIN_SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
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
  return shopUrl(raw.startsWith('/') ? raw : `/${raw}`);
}
