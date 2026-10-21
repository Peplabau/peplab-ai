const trim = (url: string) => url.replace(/\/$/, '');

function runtimeOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  const fromEnv = import.meta.env.VITE_MAIN_SITE_URL || import.meta.env.VITE_SITE_URL;
  return trim(fromEnv || 'https://peplab.ai');
}

/** This peplab.ai deployment origin. */
export const MAIN_SITE_URL = trim(import.meta.env.VITE_MAIN_SITE_URL || runtimeOrigin());

/** Shop lives on the same host (peplab.ai). */
export const SHOP_URL = MAIN_SITE_URL;

/** Storefront origin shown in landing links/footer. */
export const LANDING_SHOP_ORIGIN = MAIN_SITE_URL;

/** Landing path on this host. */
export const LANDING_SITE_URL = trim(
  import.meta.env.VITE_LANDING_SITE_URL || `${runtimeOrigin()}/landing`,
);

/** Published COA archive on this host. */
export const COA_ARCHIVE_PATH = '/coa';

/** Catalogue path on this host. */
export const SHOP_PAGE_PATH = '/shop';

/** Build a local storefront path — never bounce through another host. */
export function shopUrl(path = ''): string {
  if (!path) return SHOP_PAGE_PATH;
  return path.startsWith('/') ? path : `/${path}`;
}

/** Shop catalogue / home CTA — stay on peplab.ai. */
export function shopPageUrl(): string {
  return SHOP_PAGE_PATH;
}

/** COA archive page on peplab.ai. */
export function coaArchiveUrl(): string {
  return COA_ARCHIVE_PATH;
}

/** Prefix relative asset paths from this site. */
export function normalizeImageUrl(url: string | null | undefined): string {
  const raw = (url ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return `${MAIN_SITE_URL}${path}`;
}
