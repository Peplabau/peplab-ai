import { supabase } from '@/lib/supabase';
import { cached, TTL_PRODUCTS } from '@/lib/cache';
import { resolveProductSlug } from '@/lib/product-slug-aliases';
import type { Product } from '@/products';

const BEST_SELLER_COUNT = 8;
const HIGH_POPULARITY_COUNT = 8;

/** Canonical slug → units sold. Plain object so it can persist in localStorage. */
export type ProductSalesMap = Record<string, number>;

function salesKey(productId?: string | null, name?: string | null): string {
  const id = String(productId ?? '').trim();
  if (id) return resolveProductSlug(id).toLowerCase();
  const fromName = String(name ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return fromName ? resolveProductSlug(fromName).toLowerCase() : '';
}

function hasSales(sales: ProductSalesMap): boolean {
  return Object.keys(sales).length > 0;
}

const _loadHomepageProductSales = async (): Promise<ProductSalesMap> => {
  const sales: ProductSalesMap = {};
  try {
    const { data, error } = await supabase.rpc('get_homepage_product_sales');
    if (error) {
      console.warn('[product-sales] RPC unavailable, homepage keeps default order:', error.message);
      return sales;
    }
    for (const row of data ?? []) {
      const rawKey = String((row as { product_key?: string }).product_key ?? '').trim();
      const units = Number((row as { units_sold?: number }).units_sold);
      if (!rawKey || !Number.isFinite(units) || units <= 0) continue;
      const key = salesKey(rawKey, rawKey);
      if (!key) continue;
      sales[key] = (sales[key] ?? 0) + units;
    }
  } catch (err) {
    console.warn('[product-sales] failed to load sales rank:', err);
  }
  return sales;
};

/** Cached units sold per canonical product slug (paid / in-fulfilment orders). */
export const loadHomepageProductSales = (): Promise<ProductSalesMap> =>
  cached('products:homepage-sales', _loadHomepageProductSales, TTL_PRODUCTS, true, true);

export function unitsSoldForProduct(product: Product, sales: ProductSalesMap): number {
  if (!hasSales(sales)) return 0;
  return sales[salesKey(product.id, product.name)] ?? 0;
}

/**
 * Rank storefront peptides by units sold. Essentials stay last.
 * Top sellers fill the existing Best Sellers / High Popularity sections.
 * If sales data is missing, products keep their current order.
 */
export function rankCatalogBySales(products: Product[], sales: ProductSalesMap): Product[] {
  if (!products.length || !hasSales(sales)) return products;

  const essentials: Product[] = [];
  const peptides: Product[] = [];
  for (const product of products) {
    if (product.category === 'essentials' || product.type === 'essentials') essentials.push(product);
    else peptides.push(product);
  }

  peptides.sort((a, b) => {
    const sold = unitsSoldForProduct(b, sales) - unitsSoldForProduct(a, sales);
    if (sold !== 0) return sold;
    return a.name.localeCompare(b.name);
  });

  essentials.sort((a, b) => {
    const sold = unitsSoldForProduct(b, sales) - unitsSoldForProduct(a, sales);
    if (sold !== 0) return sold;
    return a.name.localeCompare(b.name);
  });

  const rankedPeptides = peptides.map((product, index) => {
    const sold = unitsSoldForProduct(product, sales);
    let category = product.category;
    if (sold > 0 && index < BEST_SELLER_COUNT) category = 'best-seller';
    else if (sold > 0 && index < BEST_SELLER_COUNT + HIGH_POPULARITY_COUNT) category = 'high-popularity';
    else category = 'popular';
    return category === product.category ? product : { ...product, category };
  });

  return [...rankedPeptides, ...essentials];
}
