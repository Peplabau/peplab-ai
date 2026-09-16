/**
 * Google Ads conversion tracking (gtag).
 * Global tag lives in index.html; this fires the Purchase event once per order.
 */

export const GOOGLE_ADS_SEND_TO = 'AW-18402839116/I_wlCN6pxOUcEMyUlMdE';
export const GOOGLE_ADS_PURCHASE_SEND_TO = [
  GOOGLE_ADS_SEND_TO,
  'AW-18406019358/Oe5BCLW3leccEJ6i1shE',
] as const;

const TRACKED_ORDERS_KEY = 'peplab_gads_purchase_ids';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function alreadyTracked(transactionId: string): boolean {
  try {
    const raw = sessionStorage.getItem(TRACKED_ORDERS_KEY);
    const ids: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) && ids.includes(transactionId);
  } catch {
    return false;
  }
}

function markTracked(transactionId: string): void {
  try {
    const raw = sessionStorage.getItem(TRACKED_ORDERS_KEY);
    const ids: unknown = raw ? JSON.parse(raw) : [];
    const next = Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [];
    if (!next.includes(transactionId)) next.push(transactionId);
    sessionStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(next.slice(-50)));
  } catch {
    // sessionStorage can throw in private mode — Google still de-dupes by transaction_id.
  }
}

/** Fire once per order on the checkout confirmation screen. */
export function trackGoogleAdsPurchase(value: number, transactionId: string): void {
  if (typeof window === 'undefined' || !transactionId) return;
  if (alreadyTracked(transactionId)) return;

  const base = {
    value: Number(value.toFixed(2)),
    currency: 'AUD',
    transaction_id: transactionId,
  };

  markTracked(transactionId);

  for (const send_to of GOOGLE_ADS_PURCHASE_SEND_TO) {
    const payload = { send_to, ...base };
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', payload);
    } else {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'conversion',
        ...payload,
      });
    }
  }
}
