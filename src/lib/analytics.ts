/**
 * GA4 ecommerce events via the GTM dataLayer already installed in index.html.
 * Currency is AUD. Prices passed in are the storefront unit prices.
 */

export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

export type TrackedLine = {
  productId: string;
  name: string;
  dosage?: number | string;
  price: number;
  quantity: number;
  isFree?: boolean;
};

const CURRENCY = 'AUD';
const PURCHASE_FIRED_PREFIX = 'peplab_ga4_purchase:';

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function roundMoney(amount: number): number {
  return Math.round((Number(amount) || 0) * 100) / 100;
}

function ensureDataLayer(): Record<string, unknown>[] {
  if (typeof window === 'undefined') return [];
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function toGa4Items(items: TrackedLine[]): Ga4Item[] {
  return items
    .filter((item) => !item.isFree && item.quantity > 0)
    .map((item) => ({
      item_id: item.productId,
      item_name: item.name,
      item_variant: item.dosage == null ? undefined : String(item.dosage),
      price: roundMoney(item.price),
      quantity: item.quantity,
    }));
}

function pushEcommerce(event: string, ecommerce: Record<string, unknown>): void {
  const dataLayer = ensureDataLayer();
  dataLayer.push({ ecommerce: null });
  dataLayer.push({ event, ecommerce });
}

export function trackViewItem(params: {
  itemId: string;
  itemName: string;
  price: number;
  itemVariant?: string;
  quantity?: number;
}): void {
  const quantity = params.quantity ?? 1;
  const price = roundMoney(params.price);
  const items: Ga4Item[] = [
    {
      item_id: params.itemId,
      item_name: params.itemName,
      item_variant: params.itemVariant,
      price,
      quantity,
    },
  ];
  pushEcommerce('view_item', {
    currency: CURRENCY,
    value: roundMoney(price * quantity),
    items,
  });
}

export function trackAddToCart(params: {
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  itemVariant?: string;
}): void {
  if (!params.quantity) return;
  const price = roundMoney(params.price);
  const items: Ga4Item[] = [
    {
      item_id: params.itemId,
      item_name: params.itemName,
      item_variant: params.itemVariant,
      price,
      quantity: params.quantity,
    },
  ];
  pushEcommerce('add_to_cart', {
    currency: CURRENCY,
    value: roundMoney(price * params.quantity),
    items,
  });
}

export function trackBeginCheckout(params: { items: TrackedLine[]; value: number }): void {
  const items = toGa4Items(params.items);
  if (!items.length) return;
  pushEcommerce('begin_checkout', {
    currency: CURRENCY,
    value: roundMoney(params.value),
    items,
  });
}

export function trackAddPaymentInfo(params: {
  items: TrackedLine[];
  value: number;
  shipping?: number;
  paymentType?: string;
}): void {
  const items = toGa4Items(params.items);
  if (!items.length) return;
  pushEcommerce('add_payment_info', {
    currency: CURRENCY,
    value: roundMoney(params.value),
    shipping: roundMoney(params.shipping ?? 0),
    payment_type: params.paymentType || 'payid',
    items,
  });
}

export function trackPurchase(params: {
  transactionId: string;
  items: TrackedLine[];
  value: number;
  shipping?: number;
}): void {
  const transactionId = String(params.transactionId || '').trim();
  if (!transactionId || typeof window === 'undefined') return;
  const items = toGa4Items(params.items);
  if (!items.length) return;
  try {
    const key = PURCHASE_FIRED_PREFIX + transactionId;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // Private mode can block sessionStorage. Still send the event once from this call.
  }
  pushEcommerce('purchase', {
    currency: CURRENCY,
    transaction_id: transactionId,
    value: roundMoney(params.value),
    shipping: roundMoney(params.shipping ?? 0),
    items,
  });
}
