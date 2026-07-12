/**
 * Centralized pricing utility.
 * All bundle discount calculations must go through this file.
 * Never store computed prices in the database — only originalPrice is persisted.
 */

import { DEFAULT_DISCOUNT_SETTINGS, type DiscountSettings } from '@/lib/settings';

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Explicit ids (e.g. legacy catalog) plus any product whose id or display name
 * indicates syringes — Supabase SKUs often differ (e.g. 6mm vs 8mm needle).
 */
export const NO_VOLUME_BUNDLE_PRODUCT_IDS = new Set<string>(['syringes-1ml-31g']);

function idOrNameIsSyringeAccessory(productId: string, productName?: string | null): boolean {
  const id = productId.toLowerCase();
  if (id.includes('syringe')) return true;
  const n = (productName ?? '').toLowerCase();
  if (n.includes('syringe')) return true;
  return false;
}

/** No volume bundle tiers or bundle/save marketing (Buy-1 site discount only). */
export function productExcludesVolumeBundle(productId: string, productName?: string | null): boolean {
  if (NO_VOLUME_BUNDLE_PRODUCT_IDS.has(productId)) return true;
  return idOrNameIsSyringeAccessory(productId, productName);
}

/** Cart / checkout line unit price (volume bundle skipped for syringes / excluded ids). */
export function getCartLineUnitPrice(
  productId: string,
  originalPrice: number,
  quantity: number,
  config?: Partial<BundleDiscountConfig>,
  productName?: string | null,
): number {
  if (productExcludesVolumeBundle(productId, productName)) {
    return getBuy1UnitPrice(originalPrice, config);
  }
  return getStackedBundleUnitPrice(originalPrice, quantity, config);
}

/** Fields used for stacked bundle pricing (Buy 1 off list, then extra % off subtotal). */
export type BundleDiscountConfig = Pick<
  DiscountSettings,
  'discount_enabled' | 'discount_percentage' | 'buy2_percentage' | 'buy3_percentage'
>;

function resolveBundleConfig(overrides?: Partial<BundleDiscountConfig>): BundleDiscountConfig {
  return {
    discount_enabled: overrides?.discount_enabled ?? DEFAULT_DISCOUNT_SETTINGS.discount_enabled,
    discount_percentage: overrides?.discount_percentage ?? DEFAULT_DISCOUNT_SETTINGS.discount_percentage,
    buy2_percentage: overrides?.buy2_percentage ?? DEFAULT_DISCOUNT_SETTINGS.buy2_percentage,
    buy3_percentage: overrides?.buy3_percentage ?? DEFAULT_DISCOUNT_SETTINGS.buy3_percentage,
  };
}

/** Per-unit price after the Buy 1 (storefront) discount only. */
export function getBuy1UnitPrice(originalPrice: number, config?: Partial<BundleDiscountConfig>): number {
  const c = resolveBundleConfig(config);
  if (!c.discount_enabled) return round2(originalPrice);
  return round2(originalPrice * (1 - c.discount_percentage / 100));
}

/**
 * Stacked bundle model (matches storefront quick-add / ProductCard):
 * - Buy 1: `discount_percentage` off list price.
 * - Buy 2: extra `buy2_percentage` off the **subtotal** at Buy 1 unit price: (buy1×2)×(1−buy2%).
 * - Buy 3+: extra `buy3_percentage` off the subtotal: (buy1×qty)×(1−buy3%).
 *
 * Example: list $110, Buy 1 = 20% → $88. Buy 2 total = ($88+$88)×0.95 = $167.20.
 */
export function getStackedBundleUnitPrice(
  originalPrice: number,
  quantity: number,
  config?: Partial<BundleDiscountConfig>,
): number {
  const c = resolveBundleConfig(config);
  const q = Math.max(1, quantity);
  const buy1 = getBuy1UnitPrice(originalPrice, c);
  if (q <= 1) return buy1;
  const subtotal = buy1 * q;
  const extraPct = q === 2 ? c.buy2_percentage : c.buy3_percentage;
  const total = round2(subtotal * (1 - extraPct / 100));
  return round2(total / q);
}

/**
 * Per-unit discounted price for `quantity` (alias for stacked bundle unit price).
 */
export function calculatePrice(
  originalPrice: number,
  quantity: number,
  config?: Partial<BundleDiscountConfig>,
): number {
  return getStackedBundleUnitPrice(originalPrice, quantity, config);
}

export interface BundlePrices {
  buy1: number;
  buy2: number;
  buy3: number;
  buy5: number;
  buy10: number;
}

/**
 * Return per-unit prices for all supported bundle tiers.
 */
export function getBundlePricing(
  originalPrice: number,
  config?: Partial<BundleDiscountConfig>,
): BundlePrices {
  const c = config;
  return {
    buy1: calculatePrice(originalPrice, 1, c),
    buy2: calculatePrice(originalPrice, 2, c),
    buy3: calculatePrice(originalPrice, 3, c),
    buy5: calculatePrice(originalPrice, 5, c),
    buy10: calculatePrice(originalPrice, 10, c),
  };
}

/**
 * Line total at stacked bundle per-unit price × quantity.
 */
export function getBundleTotal(originalPrice: number, quantity: number, config?: Partial<BundleDiscountConfig>): number {
  const unit = getStackedBundleUnitPrice(originalPrice, quantity, config);
  return round2(unit * quantity);
}

/**
 * Fixed storefront bundle badges (Buy 1 / 2 / 3+): always 20% / 25% / 30% OFF for display,
 * independent of real stacked pricing or admin percentages.
 */
export function getMarketingBundleOffLabel(quantity: number): '20% OFF' | '25% OFF' | '30% OFF' {
  const q = Math.floor(Math.max(1, quantity));
  if (q >= 3) return '30% OFF';
  if (q === 2) return '25% OFF';
  return '20% OFF';
}

/** Effective % off original list price (useful for badges), rounded to whole percent. */
export function getEffectiveListDiscountPercent(
  originalPrice: number,
  quantity: number,
  config?: Partial<BundleDiscountConfig>,
): number {
  if (originalPrice <= 0) return 0;
  const unit = getStackedBundleUnitPrice(originalPrice, quantity, config);
  return Math.max(0, Math.round((1 - unit / originalPrice) * 100));
}

/**
 * Discount label from effective savings vs list price.
 */
export function getDiscountLabel(
  originalPrice: number,
  quantity: number,
  config?: Partial<BundleDiscountConfig>,
): string {
  return `${getEffectiveListDiscountPercent(originalPrice, quantity, config)}% OFF`;
}

/**
 * Calculate the storefront display price using the admin-configured global discount.
 * If discount is disabled, returns the original price unchanged.
 */
export function getStorefrontPrice(
  originalPrice: number,
  discountEnabled: boolean,
  discountPercentage: number,
): number {
  if (!discountEnabled) return originalPrice;
  return round2(originalPrice * (1 - discountPercentage / 100));
}

/**
 * Calculate the savings amount for storefront display.
 * Returns 0 if discount is disabled.
 */
export function getStorefrontSavings(
  originalPrice: number,
  discountEnabled: boolean,
  discountPercentage: number,
): number {
  if (!discountEnabled) return 0;
  return round2(originalPrice * (discountPercentage / 100));
}

/**
 * Storefront bundle pricing model:
 * 1) apply the global storefront discount (Buy 1)
 * 2) apply an additional "extra" discount for Buy 2 / Buy 3
 *
 * Example:
 * - Buy1 = 20% off original → $88
 * - Buy2 total = ($88 * 2) - extra 5%
 * - Buy3 total = ($88 * 3) - extra 10%
 *
 * Applying extra % to each unit is equivalent to applying it to the Buy-1 subtotal.
 */
export function getStorefrontBundleUnitPrice(
  originalPrice: number,
  discountEnabled: boolean,
  discountPercentage: number,
  extraPercentageOff: number,
): number {
  const buy1Unit = getStorefrontPrice(originalPrice, discountEnabled, discountPercentage);
  return round2(buy1Unit * (1 - extraPercentageOff / 100));
}

export function getStorefrontBundleTotal(
  originalPrice: number,
  quantity: number,
  discountEnabled: boolean,
  discountPercentage: number,
  extraPercentageOff: number,
): number {
  return round2(
    getStorefrontBundleUnitPrice(originalPrice, discountEnabled, discountPercentage, extraPercentageOff) * quantity
  );
}

/**
 * Build a "Buy N" label. Centralised so the format is consistent everywhere.
 */
export function getBundleLabel(quantity: number): string {
  return `Buy ${quantity}`;
}

/**
 * Calculate the per-unit price for a custom percentage-off discount.
 * Used by admin-configured Buy 2 / Buy 3 bundle tiers.
 */
export function getCustomBundlePrice(originalPrice: number, percentageOff: number): number {
  return round2(originalPrice * (1 - percentageOff / 100));
}

/**
 * Calculate the total for a custom percentage bundle (per-unit × quantity).
 */
export function getCustomBundleTotal(originalPrice: number, quantity: number, percentageOff: number): number {
  return round2(getCustomBundlePrice(originalPrice, percentageOff) * quantity);
}
