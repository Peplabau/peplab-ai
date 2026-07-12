import type { Product, TechnicalSpecs } from '@/products';
import { products as seedProducts } from '@/products';
import { getPeptidexProductDetail } from '@/lib/peptidex-product-details';

const COPPER_SLUGS = new Set(['ghk-cu', 'glow', 'klow']);
const LIQUID_SLUGS = new Set(['l-carnitine', 'bac-water']);
const ACCESSORY_SLUGS = new Set(['sharps-container', 'syringes-1ml-31g']);

export function buildLongDescription(product: Pick<Product, 'id' | 'name' | 'description' | 'vialType'>): string {
  const peptidex = getPeptidexProductDetail(product.id);
  if (peptidex?.longDescription) return peptidex.longDescription;

  const areaMatch = product.description.match(/intended for\s+(.+?)\s+and laboratory investigation/i);
  const area = areaMatch?.[1] ?? 'laboratory research';
  const form = product.vialType === 'liquid' ? 'sterile solution' : 'lyophilized research material';

  return `${product.name} is a research-grade compound supplied for ${area}. Provided as a ${form} for in-vitro laboratory and analytical research. Not for human or animal consumption.`;
}

export function buildLabPreparation(product: Pick<Product, 'id' | 'vialType' | 'technicalSpecs'>): string {
  const peptidex = getPeptidexProductDetail(product.id);
  if (peptidex?.labPreparation) return peptidex.labPreparation;

  const storage = product.technicalSpecs?.storageConditions
    ?? 'Store dry at 2–8 °C. Protect from light.';

  if (ACCESSORY_SLUGS.has(product.id)) {
    return [
      '## Preparation Summary',
      '',
      'No reconstitution required. Store sealed until use in the laboratory.',
      '',
      '## Handling Notes',
      '',
      'Inspect packaging on receipt. Use according to standard laboratory safety procedures for research consumables.',
      '',
      '## Storage',
      '',
      storage,
    ].join('\n');
  }

  if (product.id === 'bac-water') {
    return [
      '## Preparation Summary',
      '',
      'Ready-to-use bacteriostatic water for peptide reconstitution in laboratory settings.',
      '',
      '## Handling Notes',
      '',
      'Use sterile technique when drawing diluent. Do not use if seal is compromised.',
      '',
      '## Storage',
      '',
      storage,
    ].join('\n');
  }

  if (COPPER_SLUGS.has(product.id)) {
    return [
      '## Preparation Summary',
      '',
      'Reconstitute using bacteriostatic water (0.9% benzyl alcohol) or an appropriate acidified diluent suitable for copper-peptide complexes.',
      '',
      '## Handling Notes',
      '',
      'Copper peptides may require slightly acidic diluent to maintain peptide–copper coordination. Solution may appear blue or teal — this is normal and indicates an intact copper-peptide complex. Avoid alkaline buffers above pH 7.5 to prevent copper precipitation.',
      '',
      '## Storage',
      '',
      storage,
    ].join('\n');
  }

  if (LIQUID_SLUGS.has(product.id) || product.vialType === 'liquid') {
    return [
      '## Preparation Summary',
      '',
      'Supplied as a sterile research solution. No reconstitution required.',
      '',
      '## Handling Notes',
      '',
      'Mix gently if required for homogeneity before aliquoting. Use sterile technique throughout.',
      '',
      '## Storage',
      '',
      storage,
    ].join('\n');
  }

  return [
    '## Preparation Summary',
    '',
    'Reconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.',
    '',
    '## Handling Notes',
    '',
    'Allow vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.',
    '',
    '## Storage',
    '',
    storage,
  ].join('\n');
}

export function getSeedProductBySlug(slug: string): Product | undefined {
  return seedProducts.find((p) => p.id === slug);
}

export function enrichProductDetails(product: Product): Product {
  const seed = getSeedProductBySlug(product.id);
  const peptidex = getPeptidexProductDetail(product.id);
  const technicalSpecs: TechnicalSpecs = {
    ...(seed?.technicalSpecs ?? {}),
    ...(product.technicalSpecs ?? {}),
    ...(peptidex?.technicalSpecs ?? {}),
  };

  return {
    ...product,
    technicalSpecs,
    longDescription:
      peptidex?.longDescription
      || product.longDescription?.trim()
      || buildLongDescription(product),
    labPreparation:
      peptidex?.labPreparation
      || product.labPreparation?.trim()
      || buildLabPreparation({ ...product, technicalSpecs }),
  };
}

export function getTechnicalPropertyRows(product: Product): Array<{ label: string; value: string }> {
  const specs = product.technicalSpecs ?? {};
  const rows: Array<{ label: string; value?: string }> = [
    { label: 'Compound Name', value: product.name },
    { label: 'Product Type', value: specs.productType },
    { label: 'Synonyms', value: specs.synonyms },
    { label: 'CAS Number', value: specs.casNumber },
    { label: 'Molecular Formula', value: specs.molecularFormula },
    { label: 'Molecular Weight', value: specs.molecularWeight },
    { label: 'Peptide Length', value: specs.peptideLength },
    { label: 'Purity', value: specs.purity },
    { label: 'Batch / Lot', value: specs.batchLot },
    { label: 'Form', value: specs.appearance },
    { label: 'Vial Size', value: specs.vialSize },
    { label: 'Solubility', value: specs.solubility },
    { label: 'Testing Method', value: specs.testingMethod ?? specs.qualityVerification },
    { label: 'Quality Verification', value: specs.qualityVerification },
    { label: 'Storage', value: specs.storageConditions },
  ];

  if (specs.composition) {
    rows.splice(1, 0, { label: 'Composition', value: specs.composition });
  }

  return rows.filter((row): row is { label: string; value: string } => Boolean(row.value?.trim()));
}

/** Markdown-ish sections rendered on the product detail page. */
export function parseLabPreparationSections(text: string): Array<{ title: string; body: string }> {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const chunks = normalized.split(/^##\s+/m).filter(Boolean);
  if (chunks.length === 0) return [{ title: 'Preparation', body: normalized }];

  return chunks.map((chunk) => {
    const [titleLine, ...rest] = chunk.split('\n');
    return {
      title: titleLine.trim(),
      body: rest.join('\n').trim(),
    };
  });
}

export interface LabPreparationStep {
  number: string;
  text: string;
}

export function isStepByStepSection(title: string): boolean {
  return /step-by-step/i.test(title);
}

/** Parses bodies like "01\\nText..." or "01 Text..." into numbered steps. */
export function parseLabPreparationSteps(body: string): LabPreparationStep[] {
  const lines = body.replace(/\r\n/g, '\n').trim().split('\n');
  const steps: LabPreparationStep[] = [];
  let current: LabPreparationStep | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const standaloneNumber = line.match(/^(\d{2})$/);
    if (standaloneNumber) {
      if (current?.text) steps.push(current);
      current = { number: standaloneNumber[1], text: '' };
      continue;
    }

    const inlineStep = line.match(/^(\d{2})\s+(.+)$/);
    if (inlineStep) {
      if (current?.text) steps.push(current);
      current = { number: inlineStep[1], text: inlineStep[2].trim() };
      continue;
    }

    if (current) {
      current.text = current.text ? `${current.text} ${line}` : line;
    }
  }

  if (current?.text) steps.push(current);
  return steps;
}

export function buildProductDetailSeedPayload(slug: string) {
  const seed = getSeedProductBySlug(slug);
  const peptidex = getPeptidexProductDetail(slug);
  if (!seed && !peptidex) return null;

  const base = seed ?? ({ id: slug, name: slug, description: '', vialType: 'white' as const, technicalSpecs: {} as TechnicalSpecs });
  const enriched = enrichProductDetails({
    ...base,
    id: slug,
    category: base.category ?? 'popular',
    type: base.type ?? 'metabolic',
    dosages: base.dosages ?? [],
    image: base.image ?? '',
    reviewCount: base.reviewCount ?? 0,
    technicalSpecs: base.technicalSpecs ?? ({} as TechnicalSpecs),
  });

  return {
    slug,
    long_description: enriched.longDescription ?? '',
    lab_preparation: enriched.labPreparation ?? '',
    technical_specs: enriched.technicalSpecs,
  };
}

export function buildAllProductDetailSeedPayloads() {
  return seedProducts
    .map((p) => buildProductDetailSeedPayload(p.id))
    .filter(Boolean) as Array<{
      slug: string;
      long_description: string;
      lab_preparation: string;
      technical_specs: TechnicalSpecs;
    }>;
}
