/**
 * Strips legacy "PEP" / "PEP-" prefixes from stored order numbers for display,
 * emails, and UI copy. Database queries must still use the raw `order_number` value.
 */
export function formatOrderNumberDisplay(raw: string | null | undefined): string {
  if (raw == null || raw === '') return '';
  return raw.replace(/^PEP-?/i, '');
}

/** Same format as checkout: 8 alphanumeric characters, no prefix. */
export function generateLocalOrderNumber(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}
