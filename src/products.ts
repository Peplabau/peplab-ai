/**
 * Bundle tiers use stacked pricing (see `@/utils/pricing`): Buy 1 % off list, then Buy 2 / Buy 3+
 * apply an extra % off the subtotal priced at Buy 1.
 */
import {
  calculatePrice,
  getEffectiveListDiscountPercent,
  type BundleDiscountConfig,
} from '@/utils/pricing';
import { DEFAULT_DISCOUNT_SETTINGS } from '@/lib/settings';

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Per-unit price for `qty` at list price `basePrice`, using default site stack rules. */
export const getDiscountedUnitPrice = (
  basePrice: number,
  qty: number,
  config: Partial<BundleDiscountConfig> = DEFAULT_DISCOUNT_SETTINGS,
): number => calculatePrice(basePrice, qty, config);

/** Effective whole-number % saved vs list price (for badges). */
export const getDiscountPercent = (
  listPrice: number,
  qty: number,
  config: Partial<BundleDiscountConfig> = DEFAULT_DISCOUNT_SETTINGS,
): number => getEffectiveListDiscountPercent(listPrice, qty, config);

export type ProductCategory = 'best-seller' | 'high-popularity' | 'popular' | 'essentials';
export type ProductType = 'metabolic' | 'growth' | 'recovery' | 'cognitive' | 'support' | 'essentials';

export type DosageUnit = 'MG' | 'ML' | 'IU' | 'L' | 'PCS';

export interface Dosage {
  mg: number | string;
  /**
   * Dosage unit for display (MG/ML/IU/L/PCS).
   * - After migration, `mg` is numeric and `unit` is stored separately.
   * - For legacy data, `mg` may already include unit text in the string.
   */
  unit?: DosageUnit;
  /** Base (original/undiscounted) price. Discounted prices are calculated via src/utils/pricing.ts. */
  originalPrice: number;
  inStock: boolean;
  /** Optional variant-specific image URL for this dosage/tier. */
  imageUrl?: string | null;
  /**
   * Legacy/derived fields used by older parts of the codebase.
   * Storefront should persist only `originalPrice` and compute discounts at runtime.
   */
  basePrice?: number;
  price?: number;
  price2?: number;
  price3?: number;
  price5?: number;
  price10?: number;
}

/** Build a full Dosage from a base price. */
export const makeDosage = (mg: number | string, originalPrice: number, inStock: boolean, unit?: DosageUnit): Dosage => ({
  mg,
  unit,
  originalPrice,
  inStock,
});

const trimTrailingZeros = (n: number): string => {
  const s = n.toString();
  if (!s.includes('.')) return s;
  return s.replace(/\.?0+$/u, '');
};

/**
 * Format dosage for UI and cart/order storage (e.g. "1.4 L", "20 pcs", "10 mL").
 * If `unit` is not provided, falls back to legacy "mg" string that already includes units.
 */
export const formatDosageLabel = (value: number | string, unit?: string): string => {
  const vStr = String(value ?? '').trim();
  if (!vStr) return '';

  // Legacy fallback: value may already include unit text like "1.4L" or "Box 20 pcs".
  if (!unit) return vStr;

  const unitNorm = String(unit).toUpperCase();
  const parsed = typeof value === 'number'
    ? value
    : parseFloat(vStr.replace(/[^\d.]/g, ''));
  const displayVal = Number.isFinite(parsed) ? trimTrailingZeros(parsed) : vStr;

  switch (unitNorm) {
    case 'ML':
      return `${displayVal} mL`;
    case 'IU':
      return `${displayVal} IU`;
    case 'L':
      return `${displayVal} L`;
    case 'PCS':
      return `${displayVal} pcs`;
    case 'MG':
    default:
      return `${displayVal} mg`;
  }
};

export interface BundlePricing {
  quantity: number;
  label: string;
}

export interface TechnicalSpecs {
  synonyms?: string;
  casNumber?: string;
  molecularFormula?: string;
  molecularWeight?: string;
  peptideLength?: string;
  purity: string;
  appearance: string;
  solubility: string;
  qualityVerification: string;
  testingMethod?: string;
  batchLot?: string;
  storageConditions: string;
  composition?: string;
  vialSize?: string;
  productType?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  /**
   * Admin-editable storefront modal content.
   * Stored in Supabase `products.more_info` and shown in ProductCard "More Info" modal.
   */
  moreInfo?: string | null;
  /**
   * Admin-uploaded COA PDF public URL (Supabase Storage `coa_files`).
   * Stored in Supabase `products.coa_url`.
   */
  coaUrl?: string | null;
  category: ProductCategory;
  type: ProductType;
  dosages: Dosage[];
  image: string;
  badge?: string;
  vialType: 'white' | 'deep-blue' | 'light-blue' | 'liquid';
  bundlePricing?: BundlePricing[];
  reviewCount: number;
  technicalSpecs: TechnicalSpecs;
  /** Extended description for the product detail page (`products.long_description`). */
  longDescription?: string | null;
  /** Lab preparation guide (`products.lab_preparation`). */
  labPreparation?: string | null;
  prescriptionRequired?: boolean;
  hidden?: boolean;
}

/**
 * Default variant shown on product cards.
 *
 * Selection priority (UI default only — no functional side-effects):
 *   1. 5mg if it exists and is in stock (the most common entry-level size)
 *   2. Otherwise the smallest in-stock dosage
 *   3. Otherwise the smallest dosage overall (fallback when everything is OOS)
 *
 * Keeps cart "suggested" rows aligned with the catalog price/stock for that default.
 */
export const getDefaultStorefrontDosage = (product: Pick<Product, 'dosages'>): Dosage | undefined => {
  const dosages = product.dosages ?? [];
  if (dosages.length === 0) return undefined;

  const toNum = (d: Dosage): number => {
    const n = typeof d.mg === 'number' ? d.mg : parseFloat(String(d.mg));
    return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
  };
  const isMgUnit = (d: Dosage): boolean => (d.unit ?? 'MG') === 'MG';

  const fiveMg = dosages.find((d) => d.inStock && isMgUnit(d) && toNum(d) === 5);
  if (fiveMg) return fiveMg;

  const inStockSorted = dosages.filter((d) => d.inStock).sort((a, b) => toNum(a) - toNum(b));
  if (inStockSorted.length > 0) return inStockSorted[0];

  return [...dosages].sort((a, b) => toNum(a) - toNum(b))[0];
};

// Helper for research-only descriptions
const researchDesc = (compound: string, area: string) =>
  `${compound} is a research compound intended for ${area} and laboratory investigation purposes only.`;

// Standard bundle pricing for all products (Buy 1 through Buy 10)
const standardBundlePricing: BundlePricing[] = [
  { quantity: 1, label: 'Buy 1' },
  { quantity: 2, label: 'Buy 2' },
  { quantity: 3, label: 'Buy 3' },
  { quantity: 5, label: 'Buy 5' },
  { quantity: 10, label: 'Buy 10' },
];

// Individual product images with product names
const vialImages: Record<string, string> = {
  'retatrutide': '/retatrutide.png',
  'semaglutide': '/semaglutide.png',
  'tirzepatide': '/tirzepatide.png',
  'nad': '/nad.png',
  'glow': '/glow.png',
  'klow': '/klow.png',
  'ghk-cu': '/ghk-cu.png',
  'bac-water': '/bac-water.png',
  'semax': '/semax.png',
  'selank': '/selank.png',
  'mt-2': '/mt-2.png',
  'cagrilintide': '/cagrilintide.png',
  'cagrilintide-semaglutide': '/cagrilintide-semaglutide.png',
  'bpc-157': '/bpc-157.png',
  'tb-500': '/tb-500.png',
  'bpc-tb-combo': '/bpc-tb-combo.png',
  'hgh-191aa': '/hgh-191aa.png',
  'tesamorelin': '/tesamorelin.png',
  'l-carnitine': '/l-carnitine.png',
  'igf-1-lr3': '/igf-1-lr3.png',
  'ipamorelin': '/ipamorelin.png',
  'epithalon': '/epithalon.png',
  'cjc-1295-no-dac': '/cjc-1295-no-dac.png',
  'cjc-1295-dac': '/cjc-1295-dac.png',
  'pt-141': '/pt-141.png',
  'mots-c': '/mots-c.png',
  'glutathione': '/glutathione.png',
  'ss-31': '/ss-31.png',
  'snap-8': '/snap-8.png',
  'dsip': '/dsip.png',
  'sharps-container': '/sharps-container.png',
  'syringes-1ml-31g': '/syringes-1ml-31g.png',
  'white': '/vial_white.png',
};

export const products: Product[] = [
  // 🔥 BEST SELLERS
  {
    id: 'retatrutide',
    name: 'Retatrutide',
    description: researchDesc('Retatrutide', 'triple hormone receptor and metabolic research'),
    category: 'best-seller',
    type: 'metabolic',
    badge: '🔥 BEST SELLER',
    vialType: 'white',
    image: vialImages['retatrutide'],
    dosages: [
      { mg: 5, originalPrice: 110, inStock: true },
      { mg: 10, originalPrice: 172.5, inStock: true },
      { mg: 20, originalPrice: 272.5, inStock: true },
      { mg: 30, originalPrice: 378.75, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 60,
    technicalSpecs: {
      synonyms: 'LY3437943',
      casNumber: '2381089-83-2',
      molecularWeight: '~5.5 kDa',
      peptideLength: '39 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 6 weeks',
    },
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    description: researchDesc('Semaglutide', 'metabolic and biochemical research'),
    category: 'popular',
    type: 'metabolic',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['semaglutide'],
    dosages: [
      { mg: 5, originalPrice: 68.75, inStock: true },
      { mg: 10, originalPrice: 93.75, inStock: true },
      { mg: 20, originalPrice: 429, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 57,
    prescriptionRequired: true,
    technicalSpecs: {
      synonyms: 'NN9535, Ozempic, Wegovy',
      casNumber: '910463-68-2',
      molecularWeight: '~4.1 kDa',
      peptideLength: '31 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    description: researchDesc('Tirzepatide', 'metabolic pathway and glucose metabolism research'),
    category: 'popular',
    type: 'metabolic',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['tirzepatide'],
    dosages: [
      { mg: 5, originalPrice: 75, inStock: true },
      { mg: 10, originalPrice: 100, inStock: true },
      { mg: 20, originalPrice: 150, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 54,
    technicalSpecs: {
      synonyms: 'LY3298176, Mounjaro, Zepbound',
      casNumber: '2023788-19-2',
      molecularWeight: '~4.8 kDa',
      peptideLength: '39 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'nad',
    name: 'NAD+',
    description: researchDesc('NAD+', 'cellular energy and mitochondrial function research'),
    category: 'best-seller',
    type: 'cognitive',
    badge: '🔥 BEST SELLER',
    vialType: 'deep-blue',
    image: vialImages['nad'],
    dosages: [
      { mg: 100, originalPrice: 65, inStock: true },
      { mg: 500, originalPrice: 147.5, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 51,
    technicalSpecs: {
      synonyms: 'Nicotinamide Adenine Dinucleotide',
      casNumber: '53-84-9',
      molecularWeight: '~663 Da',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 2 weeks',
    },
  },
  {
    id: 'glow',
    name: 'GLOW',
    description: researchDesc('GLOW', 'skin health and collagen synthesis research'),
    category: 'best-seller',
    type: 'recovery',
    badge: '🔥 BEST SELLER',
    vialType: 'light-blue',
    image: vialImages['glow'],
    dosages: [
      { mg: 70, originalPrice: 178.75, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 48,
    technicalSpecs: {
      purity: '99.00%',
      appearance: 'Lyophilized white powder',
      solubility: 'Fully soluble in standard laboratory aqueous solutions and specialized diluents',
      qualityVerification: 'Verified at 99.00% via independent laboratory HPLC analysis',
      storageConditions: 'Store sealed at -20 degrees Celsius for long-term analytical stability',
      productType: 'Laboratory Chemical / Reagent Matrix',
      molecularFormula: 'Proprietary Analytical Blend',
      molecularWeight: 'Variable / Multi-component',
      vialSize: '70 mg',
    },
  },
  {
    id: 'klow',
    name: 'KLOW',
    description: researchDesc('KLOW', 'anti-inflammatory and tissue repair research'),
    category: 'best-seller',
    type: 'recovery',
    badge: '🔥 BEST SELLER',
    vialType: 'light-blue',
    image: vialImages['klow'],
    dosages: [
      { mg: 80, originalPrice: 206.25, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 45,
    technicalSpecs: {
      synonyms: 'KLOW Peptide Complex',
      casNumber: 'N/A',
      molecularWeight: '~2.3 kDa',
      purity: '≥98.5% (verified by Certificate of Analysis)',
      appearance: 'Blue lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
      composition: '50mg GHK-Cu + 10mg TB-500 + 10mg BPC-157 + 10mg KPV = 80mg',
    },
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    description: researchDesc('GHK-Cu', 'tissue repair and cellular regeneration research'),
    category: 'best-seller',
    type: 'recovery',
    badge: '🔥 BEST SELLER',
    vialType: 'deep-blue',
    image: vialImages['ghk-cu'],
    dosages: [
      { mg: 50, originalPrice: 87.5, inStock: true },
      { mg: 100, originalPrice: 110, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 42,
    technicalSpecs: {
      purity: '99.715% (CoA Reported)',
      appearance: 'Lyophilised powder',
      solubility: 'Bacteriostatic water (recommended)',
      qualityVerification: 'Verified by HPLC and mass spectrometry',
      testingMethod: 'HPLC · Mass spectrometry',
      storageConditions: '-20 °C — protect from light & moisture',
      casNumber: '49557-75-7',
      productType: 'Skin & Cellular Research',
      vialSize: '50 mg',
      batchLot: 'HK50-0411',
    },
  },
  {
    id: 'semax',
    name: 'Semax',
    description: researchDesc('Semax', 'cognitive function and neuroprotective research'),
    category: 'best-seller',
    type: 'cognitive',
    badge: '🔥 BEST SELLER',
    vialType: 'deep-blue',
    image: vialImages['semax'],
    dosages: [
      { mg: 10, originalPrice: 93.75, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 39,
    technicalSpecs: {
      synonyms: 'ACTH (4-7) Pro-Gly-Pro',
      casNumber: '80714-61-0',
      molecularWeight: '~813 Da',
      peptideLength: '7 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'selank',
    name: 'Selank',
    description: researchDesc('Selank', 'anxiolytic and stress response research'),
    category: 'best-seller',
    type: 'cognitive',
    badge: '🔥 BEST SELLER',
    vialType: 'deep-blue',
    image: vialImages['selank'],
    dosages: [
      { mg: 10, originalPrice: 110, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 36,
    technicalSpecs: {
      synonyms: 'TP-7, Selanc',
      casNumber: '129954-34-3',
      molecularWeight: '~751 Da',
      peptideLength: '7 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'mt-2',
    name: 'Melanotan II',
    description: researchDesc('Melanotan II', 'melanocortin receptor and pigmentation research'),
    category: 'best-seller',
    type: 'support',
    badge: '🔥 BEST SELLER',
    vialType: 'white',
    image: vialImages['mt-2'],
    dosages: [
      { mg: 10, originalPrice: 99, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 33,
    technicalSpecs: {
      synonyms: 'MT-II',
      casNumber: '121062-08-6',
      molecularWeight: '~1.0 kDa',
      peptideLength: '7 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'cagrilintide',
    name: 'Cagrilintide',
    description: researchDesc('Cagrilintide', 'amylin analog and appetite regulation research'),
    category: 'popular',
    type: 'metabolic',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['cagrilintide'],
    dosages: [
      { mg: 5, originalPrice: 349, inStock: true },
      { mg: 10, originalPrice: 272.5, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 30,
    prescriptionRequired: true,
    technicalSpecs: {
      synonyms: 'AMG 133, CagriSema',
      casNumber: '1415456-99-3',
      molecularWeight: '~4.6 kDa',
      peptideLength: '37 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },

  // ⭐ HIGH POPULARITY
  {
    id: 'bac-water',
    name: 'BAC Water',
    description: 'Bacteriostatic water for peptide reconstitution and laboratory use.',
    category: 'high-popularity',
    type: 'support',
    badge: '⭐ HIGH DEMAND',
    vialType: 'liquid',
    image: vialImages['bac-water'],
    dosages: [
      { mg: '3 mL', originalPrice: 12.5, inStock: true },
      { mg: '10 mL', originalPrice: 25, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 50,
    technicalSpecs: {
      synonyms: 'Bacteriostatic Water',
      casNumber: '7732-18-5',
      molecularWeight: '~18 Da',
      purity: 'Sterile, USP Grade',
      appearance: 'Clear liquid',
      solubility: 'N/A - Ready to use',
      qualityVerification: 'Sterility tested, endotoxin free',
      storageConditions: 'Store at room temperature (15-30°C). Use within 28 days of first opening',
    },
  },

  // POPULAR (Now all in stock)
  {
    id: 'bpc-157',
    name: 'BPC-157',
    description: researchDesc('BPC-157', 'tissue regeneration and wound healing research'),
    category: 'best-seller',
    type: 'recovery',
    badge: '🔥 BEST SELLER',
    vialType: 'white',
    image: vialImages['bpc-157'],
    dosages: [
      { mg: 5, originalPrice: 75, inStock: true },
      { mg: 10, originalPrice: 112.5, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 28,
    technicalSpecs: {
      synonyms: 'Body Protection Compound-157',
      casNumber: '137525-51-0',
      molecularWeight: '~990 Da',
      peptideLength: '15 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 2 weeks',
    },
  },
  {
    id: 'tb-500',
    name: 'TB-500',
    description: researchDesc('TB-500', 'actin regulation and tissue repair research'),
    category: 'best-seller',
    type: 'recovery',
    badge: '🔥 BEST SELLER',
    vialType: 'white',
    image: vialImages['tb-500'],
    dosages: [
      { mg: 5, originalPrice: 75, inStock: true },
      { mg: 10, originalPrice: 141.25, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 26,
    technicalSpecs: {
      synonyms: 'Thymosin Beta-4',
      casNumber: '77591-33-4',
      molecularWeight: '~4.9 kDa',
      peptideLength: '43 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 2 weeks',
    },
  },
  // HGH 191AA
  {
    id: 'hgh-191aa',
    name: 'HGH 191AA (Somatropin)',
    description: researchDesc('HGH 191AA', 'growth hormone and IGF-1 pathway research'),
    category: 'popular',
    type: 'growth',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['hgh-191aa'],
    dosages: [
      { mg: '10 IU', originalPrice: 110, inStock: true },
      { mg: '15 IU', originalPrice: 147.5, inStock: true },
      { mg: '24 IU', originalPrice: 247.5, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 22,
    hidden: true,
    technicalSpecs: {
      synonyms: 'Somatropin, rHGH',
      casNumber: '12629-01-5',
      molecularWeight: '~22.1 kDa',
      peptideLength: '191 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 2 weeks',
    },
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    description: researchDesc('Tesamorelin', 'GHRH analog and growth hormone release research'),
    category: 'best-seller',
    type: 'growth',
    badge: '🔥 BEST SELLER',
    vialType: 'white',
    image: vialImages['tesamorelin'],
    dosages: [
      { mg: 5, originalPrice: 81.25, inStock: true },
      { mg: 10, originalPrice: 160, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 24,
    technicalSpecs: {
      synonyms: 'TH9507, Egrifta',
      casNumber: '218949-48-5',
      molecularWeight: '~3.9 kDa',
      peptideLength: '44 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'l-carnitine',
    name: 'L-Carnitine',
    description: researchDesc('L-Carnitine', 'fatty acid metabolism and energy production research'),
    category: 'popular',
    type: 'metabolic',
    badge: 'POPULAR',
    vialType: 'liquid',
    image: vialImages['l-carnitine'],
    dosages: [
      { mg: '10 mL', originalPrice: 149, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 18,
    technicalSpecs: {
      synonyms: 'Levocarnitine',
      casNumber: '541-15-1',
      molecularWeight: '~161 Da',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'Clear liquid',
      solubility: 'N/A - Ready to use',
      qualityVerification: 'Identity and purity confirmed by HPLC',
      storageConditions: 'Store at room temperature (15-30°C). Use within 6 months of opening',
    },
  },
  {
    id: 'bpc-tb-combo',
    name: 'BPC-157 + TB-500',
    description: researchDesc('BPC-157 + TB-500 combo', 'synergistic tissue repair research'),
    category: 'best-seller',
    type: 'recovery',
    badge: '🔥 BEST SELLER',
    vialType: 'white',
    image: vialImages['bpc-tb-combo'],
    dosages: [
      { mg: '20 mg (10+10)', originalPrice: 193.75, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 20,
    technicalSpecs: {
      synonyms: 'BPC-157 + TB-500 Combo',
      casNumber: 'N/A',
      molecularWeight: '~5.9 kDa combined',
      purity: '≥99.0% each (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 2 weeks',
    },
  },
  {
    id: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    description: researchDesc('IGF-1 LR3', 'insulin-like growth factor and anabolic research'),
    category: 'popular',
    type: 'growth',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['igf-1-lr3'],
    dosages: [
      { mg: 1, originalPrice: 187.5, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 19,
    technicalSpecs: {
      synonyms: 'Long R3-IGF-1',
      casNumber: '143045-27-6',
      molecularWeight: '~9.1 kDa',
      peptideLength: '83 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 2 weeks',
    },
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    description: researchDesc('Ipamorelin', 'selective growth hormone secretagogue research'),
    category: 'popular',
    type: 'growth',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['ipamorelin'],
    dosages: [
      { mg: 5, originalPrice: 68.75, inStock: true },
      { mg: 10, originalPrice: 100, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 21,
    technicalSpecs: {
      synonyms: 'NNC 26-0161',
      casNumber: '170851-70-4',
      molecularWeight: '~712 Da',
      peptideLength: '5 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'epithalon',
    name: 'Epithalon',
    description: researchDesc('Epithalon', 'telomerase activation and cellular aging research'),
    category: 'popular',
    type: 'growth',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['epithalon'],
    dosages: [
      { mg: 10, originalPrice: 149, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 17,
    technicalSpecs: {
      synonyms: 'Ala-Glu-Asp-Gly, Epithalamin',
      casNumber: '307297-39-8',
      molecularWeight: '~391 Da',
      peptideLength: '4 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'cjc-1295-no-dac',
    name: 'CJC-1295 NO DAC',
    description: researchDesc('CJC-1295 (NO DAC)', 'growth hormone releasing hormone analog research'),
    category: 'popular',
    type: 'growth',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['cjc-1295-dac'],
    dosages: [
      { mg: 5, originalPrice: 75, inStock: true },
      { mg: 10, originalPrice: 147.5, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 18,
    technicalSpecs: {
      synonyms: 'Mod GRF 1-29',
      casNumber: '86168-78-7',
      molecularWeight: '~3.4 kDa',
      peptideLength: '29 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'pt-141',
    name: 'PT-141',
    description: researchDesc('PT-141', 'melanocortin receptor agonist and libido research'),
    category: 'best-seller',
    type: 'support',
    badge: '🔥 BEST SELLER',
    vialType: 'white',
    image: vialImages['pt-141'],
    dosages: [
      { mg: 10, originalPrice: 110, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 20,
    technicalSpecs: {
      synonyms: 'Bremelanotide',
      casNumber: '189691-06-3',
      molecularWeight: '~1.0 kDa',
      peptideLength: '7 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'cagrilintide-semaglutide',
    name: 'Cagrilintide + Semaglutide',
    description: researchDesc('Cagrilintide + Semaglutide combo', 'dual-action metabolic pathway research'),
    category: 'popular',
    type: 'metabolic',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['cagrilintide-semaglutide'],
    dosages: [
      { mg: 5, originalPrice: 199, inStock: true },
      { mg: 10, originalPrice: 299, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 15,
    prescriptionRequired: true,
    technicalSpecs: {
      synonyms: 'CagriSema, Cagrilintide + Semaglutide',
      casNumber: 'N/A',
      molecularWeight: '~9.4 kDa combined',
      purity: '≥99.0% each (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'mots-c',
    name: 'MOTS-c',
    description: researchDesc('MOTS-c', 'mitochondrial-derived peptide and metabolic research'),
    category: 'popular',
    type: 'metabolic',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['mots-c'],
    dosages: [
      { mg: 10, originalPrice: 110, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 16,
    technicalSpecs: {
      purity: '99.00%',
      appearance: 'White lyophilized powder',
      solubility: 'Readily soluble in bacteriostatic or sterile water',
      qualityVerification: 'Independently assayed at 99.00% HPLC purity',
      testingMethod: 'HPLC · Independent Lab',
      storageConditions: 'Store at -20°C',
      casNumber: '1627580-64-6',
      molecularFormula: 'C₁₀₁H₁₅₂N₂₈O₂₂',
      molecularWeight: '~2174.7 g/mol',
      vialSize: '10 mg',
      batchLot: 'MO10-0419',
    },
  },
  {
    id: 'glutathione',
    name: 'Glutathione',
    description: researchDesc('Glutathione', 'antioxidant and cellular detoxification research'),
    category: 'popular',
    type: 'recovery',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['glutathione'],
    dosages: [
      { mg: 1500, originalPrice: 172.5, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 18,
    technicalSpecs: {
      synonyms: 'L-Glutathione, GSH',
      casNumber: '70-18-8',
      molecularWeight: '~307 Da',
      peptideLength: '3 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 2 weeks',
    },
  },
  {
    id: 'ss-31',
    name: 'SS-31',
    description: researchDesc('SS-31', 'mitochondrial protection and cardiolipin research'),
    category: 'popular',
    type: 'recovery',
    badge: 'POPULAR',
    vialType: 'deep-blue',
    image: vialImages['ss-31'],
    dosages: [
      { mg: 10, originalPrice: 168.75, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 14,
    technicalSpecs: {
      synonyms: 'Elamipretide, Bendavia',
      casNumber: '736992-21-5',
      molecularWeight: '~1.6 kDa',
      peptideLength: '4 amino acids (D-arginine)',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'snap-8',
    name: 'Snap-8',
    description: researchDesc('Snap-8', 'octapeptide and neuromuscular signal research'),
    category: 'popular',
    type: 'support',
    badge: 'POPULAR',
    vialType: 'white',
    image: vialImages['snap-8'],
    dosages: [
      { mg: 10, originalPrice: 68.75, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 15,
    technicalSpecs: {
      synonyms: 'Acetyl Glutamyl Heptapeptide-3',
      casNumber: '868844-74-0',
      molecularWeight: '~1.1 kDa',
      peptideLength: '8 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },
  {
    id: 'dsip',
    name: 'DSIP',
    description: researchDesc('DSIP', 'delta sleep-inducing peptide and sleep research'),
    category: 'popular',
    type: 'cognitive',
    badge: 'POPULAR',
    vialType: 'deep-blue',
    image: vialImages['dsip'],
    dosages: [
      { mg: 5, originalPrice: 109, inStock: true },
      { mg: 15, originalPrice: 199, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 17,
    technicalSpecs: {
      synonyms: 'Delta Sleep-Inducing Peptide',
      casNumber: '62568-57-4',
      molecularWeight: '~850 Da',
      peptideLength: '9 amino acids',
      purity: '≥99.0% (verified by Certificate of Analysis)',
      appearance: 'White to off-white lyophilised powder',
      solubility: 'Soluble in sterile water or appropriate aqueous buffers',
      qualityVerification: 'Identity and purity confirmed by RP-HPLC',
      storageConditions: 'Store dry at 2–8 °C. Reconstituted material should be refrigerated and used within 4 weeks',
    },
  },

  // ACCESSORIES / ESSENTIALS
  {
    id: 'sharps-container',
    name: 'Sharps Container',
    description: 'Biohazard sharps bin for safe needle disposal. Essential for laboratory safety and proper waste management.',
    category: 'high-popularity',
    type: 'support',
    badge: '⭐ ESSENTIAL',
    vialType: 'liquid',
    image: '/sharps-container.png',
    dosages: [
      { mg: '1.4L', originalPrice: 25, inStock: true },
    ],
    bundlePricing: standardBundlePricing,
    reviewCount: 42,
    technicalSpecs: {
      synonyms: 'Needle Disposal Container, Biohazard Sharps Bin',
      casNumber: 'N/A',
      molecularWeight: 'N/A',
      purity: 'Medical Grade Plastic',
      appearance: 'Yellow puncture-resistant container with biohazard symbol',
      solubility: 'N/A',
      qualityVerification: 'AS/NZS 4261 compliant',
      storageConditions: 'Store in cool dry place. Seal when 3/4 full for disposal',
    },
  },
  {
    id: 'syringes-1ml-31g',
    name: 'Hidden lab consumable',
    description: 'Hidden support item retained only for historical order compatibility.',
    category: 'high-popularity',
    type: 'support',
    badge: '⭐ ESSENTIAL',
    vialType: 'liquid',
    image: '/syringes-1ml-31g.png',
    dosages: [
      { mg: 'Box 20 pcs', originalPrice: 40, inStock: true },
      { mg: 'Box 50 pcs', originalPrice: 40, inStock: true },
      { mg: 'Box 100 pcs', originalPrice: 75, inStock: true },
    ],
    bundlePricing: [],
    reviewCount: 38,
    hidden: true,
    technicalSpecs: {
      synonyms: 'Hidden support item',
      casNumber: 'N/A',
      molecularWeight: 'N/A',
      purity: 'Medical Grade, Sterile',
      appearance: 'Hidden support item',
      solubility: 'N/A - Ready to use',
      qualityVerification: 'Hidden from public storefront',
      storageConditions: 'Store in original packaging at room temperature. Do not use if packaging is damaged',
      composition: 'Hidden from public storefront',
    },
  },
];

// Normalize legacy dosage data: compute basePrice and tier prices from existing fields
products.forEach(p => {
  p.dosages = p.dosages.map(d => {
    if (typeof d.basePrice === 'number') return d;
    const base = typeof d.originalPrice === 'number' ? d.originalPrice : round2((d.price ?? 0) / 0.80);
    return {
      ...d,
      basePrice: base,
      price: d.price ?? calculatePrice(base, 1),
      price2: d.price2 ?? calculatePrice(base, 2),
      price3: d.price3 ?? calculatePrice(base, 3),
      price5: d.price5 ?? calculatePrice(base, 5),
      price10: d.price10 ?? calculatePrice(base, 10),
    };
  });
});

export const getProductsByCategory = (category: ProductCategory) => {
  return products.filter((p) => p.category === category);
};

export const getAllProducts = () => products;

export const getProductById = (id: string) => {
  return products.find((p) => p.id === id);
};

// These helpers are kept for backwards compatibility but delegate to the pricing utility.
// Import from src/utils/pricing.ts for new code.
export { calculatePrice as calculateBundlePrice, calculatePrice as getUnitPrice } from '@/utils/pricing';
