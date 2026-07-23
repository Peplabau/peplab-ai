/**
 * PEPLAB research protocol / dosage chart reference.
 * Educational summary only — not medical advice. Values are typical research
 * starting→maintenance ranges used with common BAC-water reconstitutions.
 * Exact draw volumes: use /calculator.
 */

export type ProtocolType = 'single' | 'blend';

export interface ProtocolChartRow {
  id: string;
  name: string;
  /** Live storefront slug for /product/:slug */
  productSlug: string;
  vialSize: string;
  type: ProtocolType;
  /** Typical concentration after common reconstitution */
  concentration: string;
  doseRange: string;
  frequency: string;
  notes?: string;
}

/** Essentials / consumables excluded from the dosing chart. */
const EXCLUDED_SLUGS = new Set([
  'bac-water',
  'acetic-water',
  '1ml-31g-6mm-syringes',
  'sharps-container',
  'nasal-spray-10ml',
]);

/**
 * Master chart for peptides PEPLAB stocks.
 * Keep productSlug in sync with live Supabase slugs / sitemap.
 */
export const PROTOCOL_CHART: ProtocolChartRow[] = [
  // Metabolic
  { id: 'reta-5', name: 'Retatrutide', productSlug: 'reta', vialSize: '5 mg Vial', type: 'single', concentration: '5.0 mg/mL', doseRange: '2 mg–8 mg', frequency: 'Weekly' },
  { id: 'reta-10', name: 'Retatrutide', productSlug: 'reta', vialSize: '10 mg Vial', type: 'single', concentration: '10.0 mg/mL', doseRange: '2 mg–8 mg', frequency: 'Weekly' },
  { id: 'reta-20', name: 'Retatrutide', productSlug: 'reta', vialSize: '20 mg Vial', type: 'single', concentration: '10.0 mg/mL', doseRange: '2 mg–8 mg', frequency: 'Weekly' },
  { id: 'reta-30', name: 'Retatrutide', productSlug: 'reta', vialSize: '30 mg Vial', type: 'single', concentration: '10.0 mg/mL', doseRange: '2 mg–8 mg', frequency: 'Weekly' },

  { id: 'sema-5', name: 'Semaglutide', productSlug: 'Semaglutide', vialSize: '5 mg Vial', type: 'single', concentration: '2.5 mg/mL', doseRange: '250 mcg–2.4 mg', frequency: 'Weekly' },
  { id: 'sema-10', name: 'Semaglutide', productSlug: 'Semaglutide', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '250 mcg–2.4 mg', frequency: 'Weekly' },
  { id: 'sema-20', name: 'Semaglutide', productSlug: 'Semaglutide', vialSize: '20 mg Vial', type: 'single', concentration: '6.67 mg/mL', doseRange: '250 mcg–2.4 mg', frequency: 'Weekly' },

  { id: 'tirz-5', name: 'Tirzepatide', productSlug: 'tirzepatide', vialSize: '5 mg Vial', type: 'single', concentration: '2.5 mg/mL', doseRange: '2.5 mg–10 mg', frequency: 'Weekly' },
  { id: 'tirz-10', name: 'Tirzepatide', productSlug: 'tirzepatide', vialSize: '10 mg Vial', type: 'single', concentration: '5.0 mg/mL', doseRange: '2.5 mg–10 mg', frequency: 'Weekly' },
  { id: 'tirz-15', name: 'Tirzepatide', productSlug: 'tirzepatide', vialSize: '15 mg Vial', type: 'single', concentration: '7.5 mg/mL', doseRange: '2.5 mg–10 mg', frequency: 'Weekly' },
  { id: 'tirz-30', name: 'Tirzepatide', productSlug: 'tirzepatide', vialSize: '30 mg Vial', type: 'single', concentration: '10.0 mg/mL', doseRange: '2.5 mg–10 mg', frequency: 'Weekly' },

  { id: 'cagri-5', name: 'Cagrilintide', productSlug: 'cagrilintide', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '600 mcg–4.5 mg', frequency: 'Weekly' },
  { id: 'cagri-10', name: 'Cagrilintide', productSlug: 'cagrilintide', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '600 mcg–4.5 mg', frequency: 'Weekly' },

  // Healing / tissue
  { id: 'bpc-5', name: 'BPC-157', productSlug: 'bpc-157', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '200 mcg–600 mcg', frequency: 'Daily' },
  { id: 'bpc-10', name: 'BPC-157', productSlug: 'bpc-157', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '200 mcg–600 mcg', frequency: 'Daily' },

  { id: 'tb-5', name: 'TB-500', productSlug: 'tb-500', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '500 mcg–1 mg', frequency: 'Daily' },
  { id: 'tb-10', name: 'TB-500', productSlug: 'tb-500', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '500 mcg–1 mg', frequency: 'Daily' },

  { id: 'bpc-tb', name: 'BPC-157 + TB-500', productSlug: 'bpc-5mg-tb-5mg', vialSize: '10 mg Blend', type: 'blend', concentration: '3.33 mg/mL', doseRange: '250 mcg–800 mcg', frequency: 'Daily' },

  { id: 'glow', name: 'GLOW', productSlug: 'glow', vialSize: '70 mg Blend', type: 'blend', concentration: '23.3 mg/mL', doseRange: '2.33 mg', frequency: 'Daily', notes: 'Blend protocol — confirm ratio on product page' },
  { id: 'klow', name: 'KLOW', productSlug: 'klow', vialSize: '80 mg Blend', type: 'blend', concentration: '26.7 mg/mL', doseRange: '250 mcg–750 mcg', frequency: 'Daily' },

  { id: 'ghk-50', name: 'GHK-Cu', productSlug: 'ghk-cu', vialSize: '50 mg Vial', type: 'single', concentration: '16.67 mg/mL', doseRange: '1 mg–2 mg', frequency: '5 days/week' },
  { id: 'ghk-100', name: 'GHK-Cu', productSlug: 'ghk-cu', vialSize: '100 mg Vial', type: 'single', concentration: '33.3 mg/mL', doseRange: '1 mg–2 mg', frequency: 'Daily' },
  { id: 'ahk-cu', name: 'AHK-Cu', productSlug: 'ahk-cu', vialSize: '50 mg Vial', type: 'single', concentration: '16.67 mg/mL', doseRange: '1 mg–2 mg', frequency: 'Daily' },

  { id: 'kpv', name: 'KPV', productSlug: 'kpv', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '200 mcg–500 mcg', frequency: 'Daily' },

  // GH / secretagogues
  { id: 'ipa-5', name: 'Ipamorelin', productSlug: 'ipamorelin', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '100 mcg–250 mcg', frequency: 'Daily' },
  { id: 'ipa-10', name: 'Ipamorelin', productSlug: 'ipamorelin', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '100 mcg–250 mcg', frequency: 'Daily' },

  { id: 'cjc-nd-5', name: 'CJC-1295 NO DAC', productSlug: 'cjc-1295-no-dac', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '100 mcg–300 mcg', frequency: 'Daily' },
  { id: 'cjc-nd-10', name: 'CJC-1295 NO DAC', productSlug: 'cjc-1295-no-dac', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '100 mcg–300 mcg', frequency: 'Daily' },

  { id: 'cjc-ipa', name: 'CJC-1295 NO DAC + Ipamorelin', productSlug: 'cjc-1295-no-dac-ipa-5mg', vialSize: '10 mg Blend', type: 'blend', concentration: '3.33 mg/mL', doseRange: '100 mcg–300 mcg', frequency: 'Daily' },

  { id: 'cjc-dac-2', name: 'CJC-1295 DAC', productSlug: 'cjc-1295-dac', vialSize: '2 mg Vial', type: 'single', concentration: '2.0 mg/mL', doseRange: '300 mcg–2 mg', frequency: 'Weekly' },
  { id: 'cjc-dac-5', name: 'CJC-1295 DAC', productSlug: 'cjc-1295-dac', vialSize: '5 mg Vial', type: 'single', concentration: '2.5 mg/mL', doseRange: '300 mcg–2 mg', frequency: 'Weekly' },

  { id: 'tesa-5', name: 'Tesamorelin', productSlug: 'tesamorelin', vialSize: '5 mg Vial', type: 'single', concentration: '2.0 mg/mL', doseRange: '1 mg–2 mg', frequency: 'Daily' },
  { id: 'tesa-10', name: 'Tesamorelin', productSlug: 'tesamorelin', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '1 mg–2 mg', frequency: 'Daily' },
  { id: 'tesa-20', name: 'Tesamorelin', productSlug: 'tesamorelin', vialSize: '20 mg Vial', type: 'single', concentration: '6.67 mg/mL', doseRange: '1 mg–2 mg', frequency: 'Daily' },

  { id: 'sermotelin', name: 'Sermorelin / Sermotelin', productSlug: 'sermotelin', vialSize: '5–10 mg Vial', type: 'single', concentration: '1.67–3.33 mg/mL', doseRange: '200 mcg–500 mcg', frequency: 'Daily' },

  { id: 'ghrp6', name: 'GHRP-6', productSlug: 'ghrp-6', vialSize: '5–10 mg Vial', type: 'single', concentration: '1.67–3.33 mg/mL', doseRange: '100 mcg–300 mcg', frequency: 'Daily' },

  { id: 'hgh', name: 'HGH 191AA (Somatropin)', productSlug: 'hgh-191aa', vialSize: '10 IU Vial', type: 'single', concentration: '1.11 mg/mL', doseRange: '200 mcg–900 mcg', frequency: 'Daily' },

  { id: 'igf', name: 'IGF-1 LR3', productSlug: 'igf-1-lr3', vialSize: '1 mg Vial', type: 'single', concentration: '0.333 mg/mL', doseRange: '20 mcg–50 mcg', frequency: 'Daily' },

  // Cellular / longevity
  { id: 'nad-500', name: 'NAD+', productSlug: 'nad', vialSize: '500 mg Vial', type: 'single', concentration: '166.7 mg/mL', doseRange: '50 mg–100 mg', frequency: 'Daily' },
  { id: 'nad-1000', name: 'NAD+', productSlug: 'nad', vialSize: '1000 mg Vial', type: 'single', concentration: '333.3 mg/mL', doseRange: '50 mg–100 mg', frequency: 'Daily' },

  { id: 'mots-5', name: 'MOTS-c', productSlug: 'mots-c', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '200 mcg–2 mg', frequency: 'Daily' },
  { id: 'mots-10', name: 'MOTS-c', productSlug: 'mots-c', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '200 mcg–1 mg', frequency: 'Daily' },
  { id: 'mots-20', name: 'MOTS-c', productSlug: 'mots-c', vialSize: '20 mg Vial', type: 'single', concentration: '6.67 mg/mL', doseRange: '200 mcg–1 mg', frequency: 'Daily' },
  { id: 'mots-40', name: 'MOTS-c', productSlug: 'mots-c', vialSize: '40 mg Vial', type: 'single', concentration: '13.33 mg/mL', doseRange: '200 mcg–1 mg', frequency: 'Daily' },

  { id: 'ss31-10', name: 'SS-31', productSlug: 'ss-31', vialSize: '10 mg Vial', type: 'single', concentration: '10 mg/mL', doseRange: '5 mg–10 mg', frequency: 'Daily' },
  { id: 'ss31-30', name: 'SS-31', productSlug: 'ss-31', vialSize: '30 mg Vial', type: 'single', concentration: '10 mg/mL', doseRange: '5 mg–10 mg', frequency: 'Daily' },
  { id: 'ss31-50', name: 'SS-31', productSlug: 'ss-31', vialSize: '50 mg Vial', type: 'single', concentration: '16.67 mg/mL', doseRange: '5 mg–10 mg', frequency: 'Daily' },

  { id: 'epitalon', name: 'Epitalon', productSlug: 'epitalon', vialSize: '10 mg Vial', type: 'single', concentration: '5 mg/mL', doseRange: '5 mg', frequency: 'Daily' },
  { id: 'foxo', name: 'FOXO4-DRI', productSlug: 'fox04-dri', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '250 mcg–500 mcg', frequency: 'Daily' },
  { id: 'aod', name: 'AOD-9604', productSlug: 'aod-9604', vialSize: '2–5 mg Vial', type: 'single', concentration: '0.67–1.67 mg/mL', doseRange: '300 mcg–500 mcg', frequency: 'Daily' },
  { id: 'amino1mq', name: '5-Amino-1MQ', productSlug: '5-amino-1mq', vialSize: '10–50 mg Vial', type: 'single', concentration: '5–12.5 mg/mL', doseRange: '2.5 mg–5 mg', frequency: 'Daily' },
  { id: 'slu', name: 'SLU-PP-332', productSlug: 'slu-pp-332', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '1.25 mg–2.5 mg', frequency: 'Daily' },

  // Cognitive / neuropeptides
  { id: 'semax-5', name: 'Semax', productSlug: 'semax', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '200 mcg–500 mcg', frequency: 'Daily' },
  { id: 'semax-10', name: 'Semax', productSlug: 'semax', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '300 mcg–800 mcg', frequency: 'Daily' },

  { id: 'selank-5', name: 'Selank', productSlug: 'selank', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '300 mcg–500 mcg', frequency: 'Daily' },
  { id: 'selank-10', name: 'Selank', productSlug: 'selank', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '300 mcg–500 mcg', frequency: 'Daily' },

  { id: 'semax-selank', name: 'Semax + Selank', productSlug: 'semax--selank', vialSize: 'Blend', type: 'blend', concentration: 'See product', doseRange: '300 mcg–500 mcg', frequency: 'Daily' },

  { id: 'dsip-5', name: 'DSIP', productSlug: 'dsip', vialSize: '5 mg Vial', type: 'single', concentration: '1.67 mg/mL', doseRange: '100 mcg–300 mcg', frequency: 'Daily' },
  { id: 'dsip-10', name: 'DSIP', productSlug: 'dsip', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '100 mcg–300 mcg', frequency: 'Daily' },

  { id: 'adamax', name: 'Adamax', productSlug: 'adamax', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '300 mcg–1 mg', frequency: 'Daily' },
  { id: 'dihexa', name: 'Dihexa', productSlug: 'dihexa', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '10 mcg–40 mcg', frequency: 'Daily' },
  { id: 'vip', name: 'VIP', productSlug: 'vip', vialSize: '5–10 mg Vial', type: 'single', concentration: 'See product', doseRange: '50 mcg–200 mcg', frequency: 'Daily' },

  // Other research
  { id: 'mt1', name: 'Melanotan I', productSlug: 'mt-1', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '250 mcg–1 mg', frequency: 'Daily' },
  { id: 'mt2', name: 'Melanotan II', productSlug: 'mt-2', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '250 mcg–1 mg', frequency: 'Daily' },
  { id: 'pt141', name: 'PT-141', productSlug: 'pt-141', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '500 mcg–1.5 mg', frequency: 'As needed' },

  { id: 'ta1', name: 'Thymosin Alpha-1', productSlug: 'thymosin-aplha-1', vialSize: '5–10 mg Vial', type: 'single', concentration: '1.67–3.33 mg/mL', doseRange: '300 mcg–500 mcg', frequency: 'Daily' },
  { id: 'hcg', name: 'HCG', productSlug: 'hcg', vialSize: '5000 IU Vial', type: 'single', concentration: '—', doseRange: '500 IU', frequency: 'Weekly' },
  { id: 'kiss', name: 'Kisspeptin-10', productSlug: 'kisspeptin-10', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '100 mcg–200 mcg', frequency: 'Daily' },
  { id: 'pnc27', name: 'PNC-27', productSlug: 'pnc-27', vialSize: '30 mg Vial', type: 'single', concentration: '10 mg/mL', doseRange: '100 mcg–500 mcg', frequency: 'Daily' },
  { id: 'glut', name: 'Glutathione', productSlug: 'glutathione', vialSize: '600 mg Vial', type: 'single', concentration: '300 mg/mL', doseRange: '100 mg–200 mg', frequency: 'Daily' },
  { id: 'snap8', name: 'SNAP-8', productSlug: 'snap-8', vialSize: '10 mg Vial', type: 'single', concentration: '3.33 mg/mL', doseRange: '330 mcg–1 mg', frequency: 'Daily' },
];

export function isProtocolExcludedSlug(slug: string): boolean {
  return EXCLUDED_SLUGS.has(slug);
}

export function protocolStats(rows: ProtocolChartRow[] = PROTOCOL_CHART) {
  const peptides = new Set(rows.map((r) => r.name));
  const singles = rows.filter((r) => r.type === 'single');
  const blends = rows.filter((r) => r.type === 'blend');
  return {
    rows: rows.length,
    peptides: peptides.size,
    singles: new Set(singles.map((r) => r.name)).size,
    blends: new Set(blends.map((r) => r.name)).size,
  };
}
