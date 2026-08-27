const trim = (url: string) => url.replace(/\/$/, '');

/**
 * Standalone landing deploy:
 * - VITE_LANDING_SITE_URL = this site's public URL (e.g. https://landing.peplab.com.au)
 * - VITE_MAIN_SITE_URL    = shop / main app (e.g. https://peplab.com.au or https://peplab.ai)
 */
export const MAIN_SITE_URL = trim(
  import.meta.env.VITE_MAIN_SITE_URL || 'https://peplab.com.au',
);

export const LANDING_SITE_URL = trim(
  import.meta.env.VITE_LANDING_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://peplab.com.au'),
);

export const SHOP_URL = MAIN_SITE_URL;
export const COA_ARCHIVE_PATH = '/coa';
export const SHOP_PAGE_PATH = '/shop';

export function shopUrl(path = ''): string {
  if (!path) return `${MAIN_SITE_URL}/`;
  return `${MAIN_SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function shopPageUrl(): string {
  return shopUrl(SHOP_PAGE_PATH);
}

export function coaArchiveUrl(): string {
  return shopUrl(COA_ARCHIVE_PATH);
}

export function normalizeImageUrl(url: string | null | undefined): string {
  const raw = (url ?? '').trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return shopUrl(raw.startsWith('/') ? raw : `/${raw}`);
}
