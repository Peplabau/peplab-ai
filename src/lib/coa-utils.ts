import type { Product } from '@/products';
import { formatDosageLabel, getDefaultStorefrontDosage } from '@/products';

/** Extract a display purity percentage from technical spec text, e.g. "≥99.0%" → "99.00%". */
export function parsePurityPercent(purity?: string | null): string {
  if (!purity?.trim()) return '99.00%';
  const match = purity.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return '99.00%';
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) return '99.00%';
  return `${value.toFixed(2)}%`;
}

/** Try to derive a test date from batch lot suffixes like `-0415` (15 Apr). */
export function parseBatchTestDate(batchLot?: string | null): string | null {
  if (!batchLot?.trim()) return null;
  const match = batchLot.match(/-(\d{2})(\d{2})(?:\D|$)/);
  if (!match) return null;
  const month = parseInt(match[1], 10);
  const day = parseInt(match[2], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const year = new Date().getFullYear();
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function productHasCoaPdf(product: Pick<Product, 'coaUrl'>): boolean {
  return Boolean(product.coaUrl?.trim());
}

export interface CoaDisplayData {
  productName: string;
  /** Empty when no PDF has been uploaded yet. */
  coaUrl: string;
  hasCoaPdf: boolean;
  purity: string;
  dose: string;
  testedDate: string;
  batch: string;
  method: string;
  labName: string;
}

export function getCoaDisplayData(
  product: Pick<Product, 'id' | 'name' | 'coaUrl' | 'dosages' | 'technicalSpecs'>,
  doseOverride?: string,
): CoaDisplayData {
  const coaUrl = product.coaUrl?.trim() ?? '';

  const specs = product.technicalSpecs;
  const defaultDosage = getDefaultStorefrontDosage(product);
  const dose =
    doseOverride ??
    (defaultDosage ? formatDosageLabel(defaultDosage.mg, defaultDosage.unit) : '—');

  const batch = 'BN88LAB';
  const testedFromBatch = parseBatchTestDate(specs?.batchLot);
  const testedDate = testedFromBatch ?? 'See certificate';

  return {
    productName: product.name,
    coaUrl,
    hasCoaPdf: coaUrl.length > 0,
    purity: parsePurityPercent(specs?.purity),
    dose,
    testedDate,
    batch,
    method: specs?.testingMethod?.trim() || 'HPLC',
    labName: 'Ozcanium Analytics',
  };
}
