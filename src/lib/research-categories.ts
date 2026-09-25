/**
 * Research-domain categories for catalog filtering (client list Sep 2026).
 * Products are matched by name (flexible), not DB category fields.
 */

export type ResearchCategory = {
  id: string;
  label: string;
  emoji: string;
  /** Display names from the client list — used for matching product names. */
  peptides: string[];
};

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  {
    id: 'metabolic',
    label: 'Metabolic Research',
    emoji: '🟢',
    peptides: [
      'Retatrutide',
      'Semaglutide',
      'Tirzepatide',
      'Cagrilintide',
      'AOD-9604',
      '5-Amino-1MQ',
      'MOTS-C',
      'SLU-PP-332',
    ],
  },
  {
    id: 'growth',
    label: 'Growth Research',
    emoji: '🔵',
    peptides: [
      'HGH 191AA',
      'IGF-1 LR3',
      'IGF-1 DES',
      'CJC-1295 No DAC',
      'CJC-1295 No DAC + Ipamorelin',
      'CJC-1295 DAC',
      'Ipamorelin',
      'GHRP-6',
      'GHRP-2',
      'Sermorelin',
      'Tesamorelin',
    ],
  },
  {
    id: 'skin-aging',
    label: 'Skin & Aging Research',
    emoji: '🟣',
    peptides: [
      'GHK-Cu',
      'AHK-Cu',
      'Glow',
      'Klow',
      'Snap-8',
      'Glutathione',
      'NAD+',
      'FOX04-DRI',
      'TA-10',
      'ET-10',
      'CARTALAX',
    ],
  },
  {
    id: 'recovery',
    label: 'Recovery Research',
    emoji: '💊',
    peptides: [
      'BPC-157',
      'BPC-157 + TB-500',
      'TB-500',
      'KPV',
      'ARA-290',
      'LL-37',
      'Thymalin',
      'VIP',
      'CARTALAX',
    ],
  },
  {
    id: 'brain',
    label: 'Brain Research',
    emoji: '🧠',
    peptides: [
      'Semax',
      'Selank',
      'Semax + Selank',
      'Adamax',
      'P21',
      'Cerebrolysin',
      'PE-22-28',
      'Dihexa',
      'ARA-290',
    ],
  },
  {
    id: 'sleep',
    label: 'Sleep Research',
    emoji: '😴',
    peptides: ['DSIP', 'Selank', 'Semax + Selank', 'Melatonin'],
  },
  {
    id: 'energy',
    label: 'Energy Research',
    emoji: '⚡',
    peptides: ['NAD+', 'MOTS-C', 'SS-31', '5-Amino-1MQ', 'SLU-PP-332', 'ET-10'],
  },
  {
    id: 'longevity',
    label: 'Longevity Research',
    emoji: '🧬',
    peptides: [
      'GHK-Cu',
      'AHK-Cu',
      'NAD+',
      'MOTS-C',
      'SS-31',
      'FOX04-DRI',
      '5-Amino-1MQ',
      'SLU-PP-332',
      'Thymalin',
      'P21',
      'TA-10',
      'ET-10',
      'CARTALAX',
    ],
  },
  {
    id: 'reproductive',
    label: 'Reproductive Research',
    emoji: '🔥',
    peptides: ['PT-141', 'Kisspeptin-10', 'HCG'],
  },
  {
    id: 'pigmentation',
    label: 'Pigmentation Research',
    emoji: '🌞',
    peptides: ['MT-1', 'MT-2'],
  },
  {
    id: 'immune',
    label: 'Immune Research',
    emoji: '🛡️',
    peptides: ['KPV', 'LL-37', 'Thymalin', 'VIP', 'ARA-290', 'BPC-157', 'TB-500'],
  },
  {
    id: 'oncology',
    label: 'Oncology Research',
    emoji: '🧪',
    peptides: ['PNC-27', 'PN10'],
  },
];

/** Normalize for fuzzy name matching (case, punctuation, common aliases). */
function normalizeName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/melanotan\s*(ii|2)\b/g, 'mt2')
    .replace(/melanotan\s*(i|1)\b/g, 'mt1')
    .replace(/\bmt[\s-]*2\b/g, 'mt2')
    .replace(/\bmt[\s-]*1\b/g, 'mt1')
    .replace(/\(somatropin\)/g, '')
    .replace(/mots[\s-]*c\b/g, 'motsc')
    .replace(/pnc[\s-]*27/g, 'pnc27')
    .replace(/\bpn[\s-]*10\b/g, 'pn10')
    .replace(/5[\s-]*amino[\s-]*1?\s*mq/g, '5amino1mq')
    .replace(/foxo?\s*4[\s-]*dri/g, 'fox04dri')
    .replace(/[^a-z0-9]+/g, '');
}

function peptideMatchesProduct(peptide: string, productName: string): boolean {
  const p = normalizeName(peptide);
  const n = normalizeName(productName);
  if (!p || !n) return false;
  // Product is the peptide, or a combo that includes it, or peptide lists a combo matching the product.
  return n.includes(p) || p.includes(n);
}

export function productMatchesCategory(
  productName: string,
  category: ResearchCategory,
): boolean {
  return category.peptides.some((peptide) => peptideMatchesProduct(peptide, productName));
}

export function getResearchCategoryById(id: string): ResearchCategory | undefined {
  return RESEARCH_CATEGORIES.find((c) => c.id === id);
}
