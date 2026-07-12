import type { TechnicalSpecs } from '@/products';

export interface ProductKeyFeature {
  title: string;
  description: string;
}

export interface PeptidexProductDetail {
  peptidexSlug: string;
  longDescription: string;
  labPreparation: string;
  technicalSpecs: TechnicalSpecs;
  source: string;
  overviewSubtitle?: string;
  overviewTitle?: string;
  keyFeaturesTitle?: string;
  keyFeatures?: ProductKeyFeature[];
  researchNotice?: string;
  researchNoticeTitle?: string;
  labPreparationTitle?: string;
  technicalProperties?: Array<{ label: string; value: string }>;
}

/** Imported from PeptideX public product API (peptidexresearch.com). */
export const PEPTIDEX_PRODUCT_DETAILS = (
{
  "retatrutide": {
    "peptidexSlug": "retatrutide",
    "longDescription": "Retatrutide (10mg) is a synthetic peptide analogue referenced in laboratory research examining metabolic signaling pathways and peptide–receptor interaction models. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.79%",
      "appearance": "White Lyophilized Powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "2381089-83-2",
      "molecularFormula": "C₂₃₂H₃₆₆N₅₄O₆₇S",
      "molecularWeight": "~5103.7 g/mol",
      "batchLot": "CS-RE10-0322"
    },
    "source": "https://peptidexresearch.com/product/retatrutide"
  },
  "semaglutide": {
    "peptidexSlug": "semaglutide",
    "longDescription": "Semaglutide (5mg) is a synthetic peptide referenced in laboratory research examining peptide signaling pathways and molecular interaction models. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.09%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "910463-68-2",
      "molecularFormula": "C₁₈₇H₂₉₁N₄₅O₅₉S",
      "molecularWeight": "~4113.6 g/mol",
      "batchLot": "OZ5-1126"
    },
    "source": "https://peptidexresearch.com/product/semaglutide"
  },
  "tirzepatide": {
    "peptidexSlug": "tirzepatide",
    "longDescription": "Tirzepatide (10mg) is a synthetic peptide analogue referenced in laboratory research examining metabolic signaling pathways and peptide–receptor interaction models. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.82%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "2023788-19-2",
      "molecularFormula": "C₂₂₅H₃₄₈N₄₈O₆₈S",
      "molecularWeight": "~4813.5 g/mol",
      "batchLot": "ZE10-0301"
    },
    "source": "https://peptidexresearch.com/product/tirzepatide"
  },
  "nad": {
    "peptidexSlug": "nad",
    "longDescription": "NAD⁺ (500mg) is a coenzyme widely utilized in laboratory research examining cellular coenzyme redox signaling, redox reactions, and metabolic pathway analysis. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.00%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "53-84-9",
      "molecularFormula": "C₂₁H₂₇N₇O₁₄P₂",
      "molecularWeight": "663.43 g/mol",
      "batchLot": "NA500-0316"
    },
    "source": "https://peptidexresearch.com/product/nad"
  },
  "glow": {
    "peptidexSlug": "glow",
    "overviewTitle": "Product Overview",
    "longDescription": "An advanced multi-component analytical reference material (70mg total mass) developed strictly for laboratory research, chemical characterization, and molecular interaction studies. This product is supplied as a high-purity, uniform lyophilized matrix intended solely for in vitro scientific investigation by qualified personnel.",
    "keyFeatures": [
      {
        "title": "Total Content",
        "description": "70mg mass per research vial"
      },
      {
        "title": "Purity Profile",
        "description": "Verified at 99.00% via independent laboratory HPLC analysis"
      },
      {
        "title": "Presentation",
        "description": "Uniform lyophilized powder, sealed under inert nitrogen in a tamper-evident glass vial"
      },
      {
        "title": "Solubility",
        "description": "Fully soluble in standard laboratory aqueous solutions and specialized diluents"
      }
    ],
    "researchNoticeTitle": "Mandatory Laboratory Notice",
    "researchNotice": "This material is supplied strictly for laboratory research and analytical testing purposes. It is not a medicine, therapeutic good, drug, dietary supplement, or cosmetic substance. Strictly not for human consumption, veterinary administration, or any form of in vivo application.",
    "labPreparationTitle": "Laboratory Handling and Preparation",
    "labPreparation": "## Preparation Summary\n\nFor analytical evaluation, introducing 3 ml of an appropriate acidified aqueous diluent to the 70 mg vial yields a standardized laboratory working concentration of 23.3 mg/ml. Qualified researchers should consult established peer-reviewed literature to determine exact aliquot volumes required for specific testing protocols.\n\n## Handling & Stability Notes\n\nDissolution: This material utilizes an acidified diluent for optimal matrix dissolution. The specialized pH level maintains chemical stability and prevents mineral complex precipitation.\n\nSolution Appearance: Upon proper reconstitution, the fluid naturally exhibits a characteristic light blue or teal coloration due to the inherent mineral matrix properties.\n\nEnvironmental Sensitivity: This compound is sensitive to direct light. Maintain all prepared laboratory solutions in a shaded or light-protected environment.\n\n## Storage Framework\n\nUnopened Vials: Store in a cool, dry environment protected from light at room temperature or refrigerated (2 to 8 degrees Celsius). For long-term shelf life, maintain at -20 degrees Celsius.\n\nPrepared Solutions: Store reconstituted laboratory matrices under strict refrigeration at 2 to 8 degrees Celsius. For optimal analytical integrity, utilize within 28 days of preparation.",
    "technicalSpecs": {
      "productType": "Laboratory Chemical / Reagent Matrix",
      "purity": "99.00%",
      "appearance": "Lyophilized white powder",
      "solubility": "Fully soluble in standard laboratory aqueous solutions and specialized diluents",
      "qualityVerification": "Verified at 99.00% via independent laboratory HPLC analysis",
      "testingMethod": "HPLC · Independent Lab",
      "storageConditions": "Store sealed at -20 degrees Celsius for long-term analytical stability",
      "molecularFormula": "Proprietary Analytical Blend",
      "molecularWeight": "Variable / Multi-component",
      "vialSize": "70 mg",
      "batchLot": "GLO70-0315"
    },
    "technicalProperties": [
      { "label": "Product Type", "value": "Laboratory Chemical / Reagent Matrix" },
      { "label": "Chemical Formula", "value": "Proprietary Analytical Blend" },
      { "label": "Molecular Weight", "value": "Variable / Multi-component" },
      { "label": "Physical Form", "value": "Lyophilized white powder" },
      {
        "label": "Primary Storage Requirements",
        "value": "Store sealed at -20 degrees Celsius for long-term analytical stability"
      }
    ],
    "source": "https://peptidexresearch.com/product/glow"
  },
  "klow": {
    "peptidexSlug": "klow",
    "longDescription": "KLOW (80mg) BPC-157 10MG + TB500 10MG + GHK-CU 50MG + KPV 10MG is a blended peptide formulation referenced in laboratory research examining analytical peptide characterization, molecular interaction studies, and blended signaling behavior. Supplied as a single lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute using GAC Water (acidified diluent) or bacteriostatic water suitable for copper-peptide complexes.\n\n## Handling Notes\n\nCopper peptides may require slightly acidic diluent to maintain peptide–copper coordination. The acidic pH of GAC Water prevents copper ion precipitation that occurs above pH 7.5. Solution may appear slightly blue or teal — this is normal and indicates an intact copper-peptide complex.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.00%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "molecularFormula": "Proprietary Blend",
      "molecularWeight": "Variable",
      "batchLot": "KLO80-0412"
    },
    "source": "https://peptidexresearch.com/product/klow"
  },
  "ghk-cu": {
    "peptidexSlug": "ghk-cu",
    "overviewTitle": "Endogenous Copper Tripeptide Research Compound",
    "longDescription": "GHK-Cu (50mg) is supplied in Australia by PEPLAB with fast domestic shipping to all states and territories.\n\nGHK-Cu is a naturally occurring copper tripeptide whose endogenous concentration declines with age — from approximately 200 ng/mL in plasma at age 20 to ~80 ng/mL at 60. This decline is studied in the context of reduced skin thickness, elasticity, and tissue repair capacity. GHK-Cu has one of the broadest activity profiles in the dermal-research literature: collagen synthesis, wound healing, inflammatory signalling, and gene-expression modulation in ageing tissue.\n\nIt is the same compound used in cosmetic serums at low topical concentrations. Research-grade lyophilized peptide is supplied for protocols requiring controlled, higher-concentration study.\n\nSupplied as lyophilized powder at ≥98% purity, verified by HPLC and mass spectrometry. 50mg per vial. Fast domestic shipping across Australia, with batch-specific CoA information available in our CoA Library.",
    "keyFeaturesTitle": "Key Research Areas",
    "keyFeatures": [
      {
        "title": "Collagen & Elastin Synthesis",
        "description": "Studied for stimulating structural protein production in dermal fibroblasts"
      },
      {
        "title": "Wound Healing",
        "description": "Studied across multiple wound healing models for accelerated epidermal repair"
      },
      {
        "title": "Dermal Gene Expression",
        "description": "Studied for influence on >4,000 human genes, including repair, renewal, and inflammation pathways"
      },
      {
        "title": "Inflammation Modulation",
        "description": "Studied for reducing chronic low-grade dermal inflammation"
      }
    ],
    "researchNoticeTitle": "Research use only",
    "researchNotice": "For in-vitro research and laboratory use only. Not for human consumption.",
    "labPreparationTitle": "Laboratory Handling and Preparation",
    "labPreparation": "## Preparation Summary\n\n50 mg vial\nReconstitute with bacteriostatic water (recommended)\n\n## Handling Notes\n\nCopper tripeptide complex — reconstituted solution may appear blue or teal. Protect from light and moisture during handling. Gently swirl to dissolve; do not shake.\n\n## Storage\n\nLyophilised\n-20 °C — protect from light & moisture\nReconstituted\n2–8 °C — use within 28 days",
    "technicalSpecs": {
      "purity": "99.715% (CoA Reported)",
      "appearance": "Lyophilised powder",
      "solubility": "Bacteriostatic water (recommended)",
      "qualityVerification": "Verified by HPLC and mass spectrometry",
      "testingMethod": "HPLC · Mass spectrometry",
      "storageConditions": "-20 °C — protect from light & moisture",
      "casNumber": "49557-75-7",
      "productType": "Skin & Cellular Research",
      "vialSize": "50 mg",
      "batchLot": "HK50-0411"
    },
    "technicalProperties": [
      { "label": "Compound", "value": "GHK-Cu (50mg)" },
      { "label": "CAS Number", "value": "49557-75-7" },
      { "label": "Category", "value": "Skin & Cellular Research" },
      { "label": "Purity", "value": "99.715% (CoA Reported)" },
      { "label": "Form", "value": "Lyophilised Powder" },
      { "label": "Storage (Lyophilised)", "value": "-20 °C — protect from light & moisture" },
      { "label": "Storage (Reconstituted)", "value": "2–8 °C — use within 28 days" },
      { "label": "Reconstitution", "value": "Bacteriostatic water (recommended)" }
    ],
    "source": "https://peptidexresearch.com/product/ghk-cu"
  },
  "semax": {
    "peptidexSlug": "semax",
    "longDescription": "Semax (10mg) is a synthetic neuropeptide referenced in laboratory research examining neurochemical signaling pathways and molecular communication systems. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "98.91%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "80714-61-0",
      "molecularFormula": "C₃₇H₅₁N₉O₁₀S",
      "molecularWeight": "813.93 g/mol",
      "batchLot": "SX10-0311"
    },
    "source": "https://peptidexresearch.com/product/semax"
  },
  "selank": {
    "peptidexSlug": "selank",
    "longDescription": "Selank (10mg) is a synthetic neuropeptide referenced in laboratory research examining neurochemical signaling pathways and molecular communication systems. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.89%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "129954-34-3",
      "molecularFormula": "C₃₃H₅₇N₁₁O₉",
      "molecularWeight": "751.88 g/mol",
      "batchLot": "SK10-0316"
    },
    "source": "https://peptidexresearch.com/product/selank"
  },
  "mt-2": {
    "peptidexSlug": "melanotan-ii",
    "longDescription": "Melanotan II (10mg) is a synthetic peptide referenced in laboratory research examining peptide signaling pathways and molecular interaction behavior. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.51%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "121062-08-6",
      "molecularFormula": "C₅₀H₆₉N₁₅O₉",
      "molecularWeight": "1024.18 g/mol",
      "batchLot": "CS-MN210-0201"
    },
    "source": "https://peptidexresearch.com/product/melanotan-ii"
  },
  "cagrilintide": {
    "peptidexSlug": "cagrilintide",
    "longDescription": "Cagrilintide (10mg) is a synthetic acylated peptide analogue referenced in laboratory research examining amylin receptor signaling and metabolic peptide characterisation. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C, desiccated",
    "technicalSpecs": {
      "purity": "99.94%",
      "appearance": "White to off-white lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C, desiccated",
      "casNumber": "1415456-99-3",
      "molecularFormula": "C₁₉₄H₃₁₂N₅₄O₅₉S",
      "molecularWeight": "~4409.0 g/mol",
      "batchLot": "CAG10-0122"
    },
    "source": "https://peptidexresearch.com/product/cagrilintide"
  },
  "bac-water": {
    "peptidexSlug": "bacteriostatic-water",
    "longDescription": "Bacteriostatic Water (3ml) is sterile water containing 0.9% benzyl alcohol, supplied for laboratory environments requiring controlled laboratory preparation of lyophilized research materials.",
    "labPreparation": "## Preparation Summary\n\nSupplied as a ready-to-use sterile research diluent. No reconstitution required.\n\n## Handling Notes\n\nUse sterile technique when drawing diluent. Inspect for clarity before use. Do not use if seal is compromised.\n\n## Storage\n\nStore at room temperature (15-30°C)",
    "technicalSpecs": {
      "purity": "99.99%",
      "appearance": "Clear, colorless liquid",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at room temperature (15-30°C)",
      "molecularFormula": "H₂O + 0.9% Benzyl Alcohol",
      "molecularWeight": "18.015 g/mol (water)",
      "batchLot": "BAC3",
      "composition": "Water [CAS 7732-18-5]; Benzyl Alcohol [CAS 100-51-6]"
    },
    "source": "https://peptidexresearch.com/product/bacteriostatic-water"
  },
  "bpc-157": {
    "peptidexSlug": "bpc-157",
    "longDescription": "BPC-157 (10mg) is a synthetic fragment peptide derived from a larger protein sequence and frequently cited in research literature examining peptide stability, molecular structure, and intracellular signaling behavior. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.67%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "137525-51-0",
      "molecularFormula": "C₆₂H₉₈N₁₆O₂₂",
      "molecularWeight": "1419.55 g/mol",
      "batchLot": "BP10-0420"
    },
    "source": "https://peptidexresearch.com/product/bpc-157"
  },
  "tb-500": {
    "peptidexSlug": "tb500",
    "longDescription": "TB-500 (10mg) is a synthetic peptide referenced in laboratory research examining peptide structure, molecular stability, and intracellular signaling mechanisms. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.77%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "77591-33-4",
      "molecularFormula": "C₂₁₂H₃₅₀N₅₆O₇₈",
      "molecularWeight": "~4963.4 g/mol",
      "batchLot": "TB410-0404"
    },
    "source": "https://peptidexresearch.com/product/tb500"
  },
  "hgh-191aa": {
    "peptidexSlug": "hgh",
    "longDescription": "HGH (10 IU) is a peptide hormone referenced in laboratory research examining peptide structure, molecular stability, and biochemical signaling processes. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "98.03%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "12629-01-5",
      "molecularFormula": "C₉₉₀H₁₅₂₈N₂₆₂O₃₀₀S₇",
      "molecularWeight": "22124 g/mol",
      "batchLot": "H10-0328"
    },
    "source": "https://peptidexresearch.com/product/hgh"
  },
  "tesamorelin": {
    "peptidexSlug": "tesamorelin",
    "longDescription": "Tesamorelin (10mg) is a synthetic peptide referenced in laboratory research examining endocrine signaling pathways and molecular interaction behavior. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.68%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "218949-48-5",
      "molecularFormula": "C₂₂₁H₃₄₂N₆₀O₆₇S",
      "molecularWeight": "~5135.8 g/mol",
      "batchLot": "TE10-0403"
    },
    "source": "https://peptidexresearch.com/product/tesamorelin"
  },
  "bpc-tb-combo": {
    "peptidexSlug": "bpc-157-tb500",
    "longDescription": "BPC-157 + TB-500 (10mg | 5mg/5mg) is a combined peptide formulation referenced in laboratory research examining dual-peptide signaling behavior, molecular interaction dynamics, and analytical peptide characterization. Supplied as a single lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute the lyophilized blend with bacteriostatic water according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.00%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "molecularFormula": "BPC-157 + TB500 Blend",
      "molecularWeight": "Variable",
      "batchLot": "T/B55-0331",
      "composition": "BPC-157 [CAS 137525-51-0]; TB-500 [CAS 77591-33-4]"
    },
    "source": "https://peptidexresearch.com/product/bpc-157-tb500"
  },
  "igf-1-lr3": {
    "peptidexSlug": "igf-1-lr3",
    "longDescription": "IGF-1 LR3 (1mg) is a modified peptide analogue referenced in laboratory research examining peptide–receptor interaction models, molecular signaling behavior, and structural conformation analysis. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "98.02%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "946870-92-4",
      "molecularFormula": "C₄₀₀H₆₂₅N₁₁₁O₁₁₅S₉",
      "molecularWeight": "~9117.5 g/mol",
      "batchLot": "IG1-0408"
    },
    "source": "https://peptidexresearch.com/product/igf-1-lr3"
  },
  "ipamorelin": {
    "peptidexSlug": "ipamorelin",
    "longDescription": "Ipamorelin (10mg) is a synthetic peptide referenced in laboratory research examining peptide–receptor interaction models and endocrine signaling pathways. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.92%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "170851-70-4",
      "molecularFormula": "C₃₈H₄₉N₉O₅",
      "molecularWeight": "711.85 g/mol",
      "batchLot": "IP10-0325"
    },
    "source": "https://peptidexresearch.com/product/ipamorelin"
  },
  "epithalon": {
    "peptidexSlug": "epitalon",
    "longDescription": "Epitalon (10mg) is a synthetic tetrapeptide referenced in laboratory research examining cellular signaling architecture, peptide stability, and molecular interaction behavior. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.46%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "307297-39-8",
      "molecularFormula": "C₁₄H₂₂N₄O₉",
      "molecularWeight": "390.35 g/mol",
      "batchLot": "EP10-0324"
    },
    "source": "https://peptidexresearch.com/product/epitalon"
  },
  "cjc-1295-no-dac": {
    "peptidexSlug": "cjc-1295-no-dac",
    "longDescription": "CJC-1295 No DAC (10mg) is a synthetic peptide analogue referenced in laboratory research examining endocrine signaling dynamics, peptide stability, and temporal signaling models. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.75%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "863288-34-0",
      "molecularFormula": "C₆₅H₁₀₆N₁₈O₁₉",
      "molecularWeight": "~1321.5 g/mol",
      "batchLot": "CJND10-0113"
    },
    "source": "https://peptidexresearch.com/product/cjc-1295-no-dac"
  },
  "pt-141": {
    "peptidexSlug": "pt-141",
    "longDescription": "PT-141 (10mg) is a synthetic peptide referenced in laboratory research examining peptide signaling pathways and molecular interaction models. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.70%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "189691-06-3",
      "molecularFormula": "C₅₀H₆₈N₁₄O₁₀",
      "molecularWeight": "1025.16 g/mol",
      "batchLot": "PT10-0313"
    },
    "source": "https://peptidexresearch.com/product/pt-141"
  },
  "mots-c": {
    "peptidexSlug": "mots-c",
    "overviewTitle": "Overview · 10 mg",
    "longDescription": "MOTS-C (10mg) is a mitochondria-derived peptide referenced in laboratory research examining mitochondrial communication, cellular signaling pathways, and metabolic interaction networks. Supplied as a lyophilized research material. For laboratory and research use only. Not for human or animal consumption. This product is not a therapeutic good, drug, supplement, food product, or cosmetic.",
    "keyFeaturesTitle": "Key features",
    "keyFeatures": [
      {
        "title": "Verification",
        "description": "Independently assayed at 99.00% HPLC purity."
      },
      {
        "title": "Presentation",
        "description": "Lyophilized white powder, sealed under nitrogen in a tamper-evident 10 mg vial."
      },
      {
        "title": "Reconstitution",
        "description": "Readily soluble in bacteriostatic or sterile water."
      },
      {
        "title": "Dispatch",
        "description": "Same-day Monday to Friday · Express Australia-wide."
      },
      {
        "title": "Research use only",
        "description": "For laboratory and analytical research use only. NOT for human consumption, NOT for veterinary use, NOT a prescription medicine, and NOT intended for application in or on the body. By purchasing, you confirm laboratory-use intent."
      }
    ],
    "researchNoticeTitle": "Research use only",
    "researchNotice": "For laboratory and analytical research use only. NOT for human consumption, NOT for veterinary use, NOT a prescription medicine, and NOT intended for application in or on the body. By purchasing, you confirm laboratory-use intent.",
    "labPreparationTitle": "Laboratory Handling and Preparation",
    "labPreparation": "## Preparation Summary\n\n10 mg vial\nAdd 2 ml BAC Water\n5 mg/ml\nUse the Peptide Calculator to determine specific aliquot volumes for your research procedure.\n\n## Handling Notes\n\nStandard preparation with BAC Water. Gently swirl to dissolve — do not shake. Direct water down the inside wall of the vial, not directly onto the powder. Allow the vial to reach room temperature before preparation.\n\n## Storage\n\nBefore preparation\nRoom temperature or refrigerated (2–8°C), cool dry place protected from light.\nAfter preparation\nRefrigerate at 2–8°C. Use within 28 days.\n\n## Step-by-step\n\n01\nEnsure both the compound vial and solvent vial are at room temperature before preparation. If refrigerated, allow 10-15 minutes to warm up.\n02\nClean the rubber stopper of both the compound vial and solvent vial with an alcohol swab.\n03\nDraw the calculated volume of solvent.\n04\nDirect solvent slowly down the inside wall of the vial — never directly onto the powder.\n05\nGently swirl or roll the vial between your palms until fully dissolved — never shake.\n06\nSolution should be clear and colourless (copper peptides may appear slightly blue).\n07\nLabel the vial with date prepared, compound name, and concentration.\n08\nRefrigerate immediately at 2–8°C.",
    "technicalSpecs": {
      "purity": "99.00%",
      "appearance": "White lyophilized powder",
      "solubility": "Readily soluble in bacteriostatic or sterile water",
      "qualityVerification": "Independently assayed at 99.00% HPLC purity",
      "testingMethod": "HPLC · Independent Lab",
      "storageConditions": "Store at -20°C",
      "casNumber": "1627580-64-6",
      "molecularFormula": "C₁₀₁H₁₅₂N₂₈O₂₂",
      "molecularWeight": "~2174.7 g/mol",
      "vialSize": "10 mg",
      "batchLot": "MO10-0419"
    },
    "technicalProperties": [
      { "label": "Compound name", "value": "MOTS-C" },
      { "label": "CAS number", "value": "1627580-64-6" },
      { "label": "Molecular formula", "value": "C₁₀₁H₁₅₂N₂₈O₂₂" },
      { "label": "Molecular weight", "value": "~2174.7 g/mol" },
      { "label": "Form", "value": "White lyophilized powder" },
      { "label": "Vial size", "value": "10 mg" },
      { "label": "Testing method", "value": "HPLC · Independent Lab" },
      { "label": "Storage", "value": "Store at -20°C" },
      { "label": "Batch · Lot", "value": "MO10-0419" }
    ],
    "source": "https://peptidexresearch.com/product/mots-c"
  },
  "glutathione": {
    "peptidexSlug": "gsh-glutathione",
    "longDescription": "GSH Glutathione (600mg) is the reduced form of glutathione, a naturally occurring tripeptide extensively referenced in cellular redox balance, redox homeostasis signaling pathways, and intracellular signaling research. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.07%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "70-18-8",
      "molecularFormula": "C10H17N3O6S",
      "molecularWeight": "307.32 g/mol",
      "batchLot": "GLU600-FUAN"
    },
    "source": "https://peptidexresearch.com/product/gsh-glutathione"
  },
  "ss-31": {
    "peptidexSlug": "ss-31",
    "longDescription": "SS-31 (10mg), also known as Elamipretide, is a mitochondria-targeted tetrapeptide widely referenced in cellular bioenergetics and mitochondrial membrane interaction research. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.60%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "736992-21-5",
      "molecularFormula": "C32H49N9O5",
      "molecularWeight": "639.78 g/mol",
      "batchLot": "CS-S3101103"
    },
    "source": "https://peptidexresearch.com/product/ss-31"
  },
  "snap-8": {
    "peptidexSlug": "snap-8",
    "longDescription": "SNAP-8 (10mg) is a synthetic octapeptide referenced in neurochemical and synaptic signaling research examining peptide-mediated signal modulation and neuronal communication pathways. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "94.30%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "868844-74-0",
      "molecularFormula": "C41H70N16O16",
      "molecularWeight": "1075.21 g/mol",
      "batchLot": "SN10-0226"
    },
    "source": "https://peptidexresearch.com/product/snap-8"
  },
  "dsip": {
    "peptidexSlug": "dsip",
    "longDescription": "DSIP (5mg) is an endogenous nonapeptide studied in neurochemical and circadian rhythm research, with frequent reference in experimental models examining peptide signaling and hypothalamic regulatory pathways. Supplied as a lyophilized research material.",
    "labPreparation": "## Preparation Summary\n\nReconstitute lyophilized material with bacteriostatic water or sterile water for injection according to your laboratory protocol.\n\n## Handling Notes\n\nAllow the vial to reach room temperature before opening. Inject diluent slowly along the vial wall and swirl gently — do not shake vigorously. Use sterile technique throughout.\n\n## Storage\n\nStore at -20°C",
    "technicalSpecs": {
      "purity": "99.73%",
      "appearance": "White lyophilized powder",
      "solubility": "Soluble in sterile water or appropriate aqueous buffers",
      "qualityVerification": "Identity and purity confirmed by HPLC",
      "testingMethod": "HPLC",
      "storageConditions": "Store at -20°C",
      "casNumber": "62568-57-4",
      "molecularFormula": "C35H48N10O15",
      "molecularWeight": "848.81 g/mol",
      "batchLot": "DS5-1211"
    },
    "source": "https://peptidexresearch.com/product/dsip"
  }
  }
) as Record<string, PeptidexProductDetail>;

export function getPeptidexProductDetail(peplabSlug: string): PeptidexProductDetail | undefined {
  return PEPTIDEX_PRODUCT_DETAILS[peplabSlug];
}
