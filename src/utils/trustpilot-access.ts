/** Order statuses that mean the customer has completed a purchase (Trustpilot unlock). */
const TRUSTPILOT_UNLOCK_ORDER_STATUSES = new Set([
  'processing',
  'finalised',
  'shipped',
  'delivered',
  'payment_received',
]);

export function orderUnlocksTrustpilot(order: {
  status?: string | null;
  payment_status?: string | null;
}): boolean {
  if ((order.payment_status || '').toLowerCase() === 'confirmed') return true;
  const status = (order.status || '').toLowerCase();
  return TRUSTPILOT_UNLOCK_ORDER_STATUSES.has(status);
}
