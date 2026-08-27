/** Target search phrases — BPC-157 / peptide Australia cluster. */
export const PEPTIDE_AUSTRALIA_SEO_KEYWORDS = [
  'peptides australia',
  'bpc 157 australia',
  'bpc 157',
  'bpc 157 peptide',
  'buy bpc 157',
  'buy peptides australia',
  'buy peptides',
  'research peptides Australia',
  'HPLC verified peptides',
] as const;

export const CORE_SITE_SEO_KEYWORDS = [
  'buy peptides Australia',
  'GHK-Cu Australia',
  'Retatrutide Australia',
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
  title: 'PEPLAB Australia | Research Peptides & COA Results',
  description:
    'PEPLAB Australia supplies research peptides with independent HPLC testing and published COA results. Browse certificates, quality standards, and lab documentation. Research use only.',
  keywords: mergeSeoKeywords(
    PEPTIDE_AUSTRALIA_SEO_KEYWORDS,
    CORE_SITE_SEO_KEYWORDS,
    COA_LANDING_SEO_KEYWORDS,
  ),
} as const;

export const NEW_LANDING_SEO = {
  title: RESEARCH_GATEWAY_SEO.title,
  description: RESEARCH_GATEWAY_SEO.description,
  keywords: SITE_SEO_KEYWORDS,
} as const;
