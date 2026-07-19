/**
 * Map legacy / seed / marketing slugs → live Supabase `products.slug`.
 * Used so old sitemap / Google URLs redirect instead of showing "not found".
 */
export const PRODUCT_SLUG_ALIASES: Record<string, string> = {
  // Retatrutide was published as /product/retatrutide; live slug is `reta`
  retatrutide: 'reta',
  // Case / naming drift
  semaglutide: 'Semaglutide',
  // Seed / PeptideX-style slugs that never matched the storefront DB
  'bacteriostatic-water': 'bac-water',
  tb500: 'tb-500',
  'tb500-5mg': 'tb-500',
  hgh: 'hgh-191aa',
  epithalon: 'epitalon',
  'bpc-tb-combo': 'bpc-5mg-tb-5mg',
  'bpc-157-tb500': 'bpc-5mg-tb-5mg',
  'bpc-157-tb-500': 'bpc-5mg-tb-5mg',
  'gsh-glutathione': 'glutathione',
  'melanotan-ii': 'mt-2',
  melanotan: 'mt-2',
  'syringes-1ml-31g': '1ml-31g-6mm-syringes',
};

/** Resolve a URL slug to the canonical storefront slug (alias or itself). */
export function resolveProductSlug(slug: string): string {
  const trimmed = (slug || '').trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  // Exact alias first (preserves case-sensitive targets like Semaglutide)
  if (PRODUCT_SLUG_ALIASES[trimmed]) return PRODUCT_SLUG_ALIASES[trimmed];
  if (PRODUCT_SLUG_ALIASES[lower]) return PRODUCT_SLUG_ALIASES[lower];
  return trimmed;
}
