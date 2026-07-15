import type { CartItem } from '@/context/CartContext';
import { formatDosageLabel } from '@/products';
import { getSiteSetting, DEFAULT_FREE_GIFT_SETTINGS, type FreeGiftSettings } from '@/lib/settings';
import { loadProductsFromSupabase, normalizeImageUrl } from '@/lib/supabase-db';

function normalizeDosageKey(label: string): string {
  return label.replace(/\s+/g, ' ').trim().toLowerCase();
}

function findDosageImage(
  productId: string,
  dosageLabel: string,
  productImage: string,
  dosages: Array<{ mg: number | string; unit?: string; imageUrl?: string }> | undefined,
): string {
  const target = normalizeDosageKey(dosageLabel);
  for (const row of dosages ?? []) {
    const label = normalizeDosageKey(formatDosageLabel(row.mg, row.unit));
    if (label === target && row.imageUrl) {
      return normalizeImageUrl(row.imageUrl);
    }
  }
  for (const row of dosages ?? []) {
    if (row.imageUrl) return normalizeImageUrl(row.imageUrl);
  }
  return normalizeImageUrl(productImage);
}

/** Resolve the free-gift cart line using live product imagery from Supabase. */
export async function resolveFreeGiftCartItem(
  settings: FreeGiftSettings = DEFAULT_FREE_GIFT_SETTINGS,
): Promise<CartItem> {
  const giftSettings = { ...DEFAULT_FREE_GIFT_SETTINGS, ...settings };
  const products = await loadProductsFromSupabase();
  const product = products.find((p) => p.id === giftSettings.product_id);

  const dosage =
    giftSettings.dosage ||
    (product?.dosages?.[0]
      ? formatDosageLabel(product.dosages[0].mg, product.dosages[0].unit)
      : '3 mL');

  const image = product
    ? findDosageImage(giftSettings.product_id, dosage, product.image, product.dosages)
    : '';

  return {
    productId: `free-${giftSettings.product_id || 'bac-water'}`,
    name: giftSettings.name || 'BAC Water',
    dosage,
    price: 0,
    quantity: 1,
    image,
    isFree: true,
  };
}

export async function loadFreeGiftSettings(): Promise<FreeGiftSettings> {
  return getSiteSetting('free_gift_settings', DEFAULT_FREE_GIFT_SETTINGS);
}

export function isBrokenFreeGiftImage(image: string | null | undefined): boolean {
  const src = (image ?? '').trim();
  if (!src) return true;
  return src === '/bac-water.png' || /\/bac-water\.png$/i.test(src);
}
