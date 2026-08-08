import type { Dosage, Product } from '@/products';
import { formatDosageLabel, getDefaultStorefrontDosage } from '@/products';

/** Live + upcoming lab batch lanes shown on the COA archive. */
export type CoaBatchLaneStatus = 'active' | 'soon';

export interface CoaBatchLane {
  id: string;
  status: CoaBatchLaneStatus;
}

/** Current publishing lanes — BN88LAB is live; additional labs come online soon. */
export const COA_BATCH_LANES: readonly CoaBatchLane[] = [
  { id: 'BN88LAB', status: 'active' },
  { id: 'BB77LAB', status: 'soon' },
  { id: 'BB66LAB', status: 'soon' },
] as const;

export const ACTIVE_COA_BATCH = COA_BATCH_LANES.find((b) => b.status === 'active')?.id ?? 'BN88LAB';

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

/** Consumables / solvents that are not HPLC-tested peptides — hide from COA archive. */
const COA_ARCHIVE_EXCLUDED_IDS = new Set([
  'bac-water',
  'acetic-water',
  'bacteriostatic-water',
  'syringes-1ml-31g',
  '1ml-31g-6mm-syringes',
  'sharps-container',
  'nasal-spray-10ml',
]);

/**
 * True for peptides that belong on the COA archive.
 * Excludes syringes, BAC/acetic water, sharps, and Essentials-category consumables.
 */
export function isCoaArchiveProduct(
  product: Pick<Product, 'id' | 'name' | 'category' | 'type'>,
): boolean {
  const id = product.id.toLowerCase();
  const name = product.name.toLowerCase();

  if (product.category === 'essentials' || product.type === 'essentials') return false;
  if (COA_ARCHIVE_EXCLUDED_IDS.has(id)) return false;

  if (id.includes('syringe') || name.includes('syringe')) return false;
  if (id.includes('sharps') || name.includes('sharps')) return false;
  if (id.includes('bac-water') || id.includes('bacwater') || name.includes('bac water')) return false;
  if (name.includes('bacteriostatic')) return false;
  if (id.includes('acetic') || name.includes('acetic')) return false;
  if (id.includes('nasal-spray') || name.includes('nasal spray')) return false;

  return true;
}

/**
 * Client-requested COA archive pin order (top of list).
 * Prefer exact product ids; fall back to name matching for admin-created SKUs.
 */
function coaArchivePinIndex(product: Pick<Product, 'id' | 'name'>): number {
  const id = product.id.toLowerCase().trim();
  const name = product.name.toLowerCase().trim();
  const hay = `${id} ${name}`;

  // 0 — Tesamorelin
  if (id === 'tesamorelin' || /^tesamorelin\b/.test(name)) return 0;

  // 1 — CJC-1295 + Ipamorelin (combo only)
  if (
    (hay.includes('cjc') && hay.includes('ipamorelin')) ||
    (id.includes('cjc') && id.includes('ipa'))
  ) {
    return 1;
  }

  // 2 — KPV
  if (id === 'kpv' || name === 'kpv' || /^kpv\b/.test(name)) return 2;

  // 3 — BPC-157 solo (not the TB combo)
  if (
    (id === 'bpc-157' || name === 'bpc-157' || /^bpc-?157\b/.test(name)) &&
    !hay.includes('tb') &&
    !name.includes('+')
  ) {
    return 3;
  }

  // 4 — BPC-157 + TB-500
  if (
    id === 'bpc-tb-combo' ||
    (id.includes('bpc') && (id.includes('tb') || name.includes('tb'))) ||
    (hay.includes('bpc') &&
      (hay.includes('tb-500') || hay.includes('tb500') || hay.includes('tb 500')))
  ) {
    return 4;
  }

  return Number.POSITIVE_INFINITY;
}

/** Sort COA archive: pinned products first (client order), then A–Z. */
export function sortCoaArchiveProducts<T extends Pick<Product, 'id' | 'name'>>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const pa = coaArchivePinIndex(a);
    const pb = coaArchivePinIndex(b);
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

export type CoaMgStatus = 'available' | 'pending';

export interface CoaDosageStatus {
  label: string;
  status: CoaMgStatus;
}

/** Per-vial COA availability. Product-level PDF currently covers all listed sizes. */
export function getCoaDosageStatuses(
  product: Pick<Product, 'coaUrl' | 'dosages'>,
): CoaDosageStatus[] {
  const hasPdf = productHasCoaPdf(product);
  const dosages = [...(product.dosages ?? [])].sort((a, b) => dosageSortKey(a) - dosageSortKey(b));
  if (dosages.length === 0) {
    return [{ label: '—', status: hasPdf ? 'available' : 'pending' }];
  }
  return dosages.map((d) => ({
    label: formatDosageLabel(d.mg, d.unit),
    status: hasPdf ? 'available' : 'pending',
  }));
}

function dosageSortKey(d: Dosage): number {
  const n = typeof d.mg === 'number' ? d.mg : parseFloat(String(d.mg).replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
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

  const batch = ACTIVE_COA_BATCH;
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
