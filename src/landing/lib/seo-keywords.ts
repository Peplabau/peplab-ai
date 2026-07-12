/** Target search phrases — new landing + BPC-157 / peptide Australia cluster. */
export const PEPTIDE_AUSTRALIA_SEO_KEYWORDS = [
  'peptides australia',
  'bpc 157 australia',
  'bpc 157',
  'bpc 157 peptide',
  'buy bpc 157',
  'buy peptides australia',
  'buy peptides',
  'bpc 157 pure',
  'peptide 157',
  'semaglutide peptide buy',
  'bpc peptide',
  'bpc 157 tb 500',
  'best place to buy peptides australia',
  'bpc 157 near me',
  'order bpc 157',
  'bpc 157 10mg',
  'bpc 157 purchase',
  'ghk peptide',
  'tb 500 and bpc 157',
  'bpc 157 5mg',
  'bpc 157 reviews',
  'bpc 157 peptide australia',
  'bpc 157 injections',
  'tb 500 bpc 157',
  'purchase bpc 157',
  'BPC-157 Australia',
  'BPC-157 peptide',
  'TB-500 Australia',
  'research peptides Australia',
  'HPLC verified peptides',
] as const;

export const CORE_SITE_SEO_KEYWORDS = [
  'buy peptides Australia',
  'GHK-Cu Australia',
  'Retatrutide Australia',
  'Semaglutide peptide Australia',
  'Tirzepatide Australia',
  'peptide supplier Sydney',
  'lab grade peptides online',
  'domestic peptide shipping Australia',
] as const;

export function mergeSeoKeywords(...groups: ReadonlyArray<readonly string[]>): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const kw of group) {
      const trimmed = kw.trim();
      const key = trimmed.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(trimmed);
    }
  }
  return out.join(', ');
}

export const SITE_SEO_KEYWORDS = mergeSeoKeywords(
  PEPTIDE_AUSTRALIA_SEO_KEYWORDS,
  CORE_SITE_SEO_KEYWORDS,
);

const COA_LANDING_SEO_KEYWORDS = [
  'COA peptides Australia',
  'HPLC purity test COA',
  'LC-MS identity test peptide',
  'peptide content assay',
  'certificate of analysis peptides',
  'Ozcanium Analytics COA',
] as const;

export const RESEARCH_GATEWAY_SEO = {
  title: 'PEPLAB COA Proof | HPLC, LC-MS & Content Assay — Published Every Batch',
  description:
    'See the lab proof before you order. Every PEPLAB batch published with HPLC purity, LC-MS identity, and peptide content assay on an independent Ozcanium Analytics COA. Research use only.',
  keywords: mergeSeoKeywords(PEPTIDE_AUSTRALIA_SEO_KEYWORDS, CORE_SITE_SEO_KEYWORDS, COA_LANDING_SEO_KEYWORDS),
} as const;

export const NEW_LANDING_SEO = {
  title:
    "Australia's independent research peptide supplier. Every batch HPLC tested with published COAs. Express same-day dispatch Mon–Fri. Research use only.",
  description:
    "Australia's independent research peptide supplier. Every batch HPLC tested with published COAs. Express same-day dispatch Mon–Fri. Research use only.",
  keywords: SITE_SEO_KEYWORDS,
} as const;
