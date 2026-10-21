/** Main storefront homepage. */
export const HOME_PATH = '/';

/** Canonical shop / catalogue URL. */
export const SHOP_PATH = '/shop';

/** Marketing landing page (same app as shop). */
export const LANDING_PATH = '/landing';

/** Peptide reconstitution calculator. */
export const CALCULATOR_PATH = '/calculator';

/** Research peptide dosage / protocol chart. Temporarily unlinked from nav — path kept for restore. */
export const PROTOCOLS_PATH = '/protocols';

/** Published COA archive — all products with certificates on file. */
export const COA_ARCHIVE_PATH = '/coa';

/** Peptide research overview (educational / compliance content). */
export const RESEARCH_PATH = '/research';

/** Find Your Compound — research section compound index. */
export const RESEARCH_COMPOUNDS_PATH = '/research/compounds';

/** Dynamic compound research overview: `/research/compounds/:slug` */
export const RESEARCH_COMPOUND_SLUG_PATH = '/research/compounds/:slug';

/** Blog index. */
export const BLOG_PATH = '/blog';

/** Dynamic blog post: `/blog/:slug` */
export const BLOG_SLUG_PATH = '/blog/:slug';

import { CONFIG } from '@/lib/config';

/** Full URL for external links (subdomain override via env). */
export const LANDING_SITE_URL =
  import.meta.env.VITE_LANDING_SITE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}${LANDING_PATH}`
    : `${CONFIG.SITE_URL.replace(/\/$/, '')}${LANDING_PATH}`);
