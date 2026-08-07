/** Main storefront homepage (peplab.ai). */
export const HOME_PATH = '/';

/** Canonical shop / catalogue URL. */
export const SHOP_PATH = '/shop';

/** Marketing landing page (same app as shop). */
export const LANDING_PATH = '/landing';

/** Peptide reconstitution calculator. */
export const CALCULATOR_PATH = '/calculator';

/** Research peptide dosage / protocol chart. */
export const PROTOCOLS_PATH = '/protocols';

/** Published COA archive — all products with certificates on file. */
export const COA_ARCHIVE_PATH = '/coa';

/** Full URL for external links (subdomain override via env). */
export const LANDING_SITE_URL =
  import.meta.env.VITE_LANDING_SITE_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.origin}${LANDING_PATH}`
    : 'https://peplab.ai/landing');
