import type { ResearchArticleInput } from '@/lib/research-articles';
import { DEFAULT_COA_BODY } from '@/lib/research-articles';
import { RESEARCH_HANDOFF_SEED_ARTICLES } from '@/lib/research-handoff-seed-data';

const RESEARCH_CORE_SEED_ARTICLES: ResearchArticleInput[] = [
  {
    slug: 'retatrutide',
    name: 'Retatrutide',
    category: 'GLP-1 / Incretin',
    product_slug: 'reta',
    card_title: 'What is Retatrutide?',
    card_description:
      'An investigational GIP / GLP-1 / glucagon triple receptor agonist (LY3437943) — classification, receptor mechanism and the research record.',
    seo_title: 'Retatrutide Research Overview | PEPLAB Australia',
    seo_description:
      'Retatrutide (LY3437943) research overview: GIP, GLP-1 and glucagon triple receptor activity, Phase 2 and Phase 3 findings, safety context and COA guidance.',
    eyebrow: 'GLP-1 / Incretin',
    h1: 'Retatrutide Research Overview',
    subtitle: 'Triple Receptor Activity and Metabolic Research',
    intro: `Retatrutide is an investigational peptide studied for its effects on body weight, glucose regulation and metabolic processes. Also known as LY3437943, it activates three hormone receptors: GIP, GLP-1 and glucagon.

This page brings together retatrutide’s mechanism of action, published research findings and scientific references to help readers explore the evidence.`,
    what_is_heading: 'What Is Retatrutide?',
    what_is_body: `Retatrutide is a peptide developed by Eli Lilly as a triple hormone receptor agonist. An agonist is a molecule that activates a receptor and produces a biological response.

Rather than targeting a single receptor, retatrutide interacts with three systems involved in metabolic regulation. Researchers are investigating how this combined activity influences body weight, blood glucose and related outcomes.`,
    feature_rows: [
      { feature: 'Compound name', details: 'Retatrutide' },
      { feature: 'Research code', details: 'LY3437943' },
      { feature: 'Compound type', details: 'Peptide' },
      { feature: 'Mechanism', details: 'GIP, GLP-1 and glucagon receptor agonism' },
      {
        feature: 'Research areas',
        details: 'Obesity, glucose regulation and metabolic liver disease',
      },
      {
        feature: 'Development stage',
        details: 'Investigational, with published human studies including Phase 3 research',
      },
    ],
    mechanism_heading: 'How Does Retatrutide Work?',
    mechanism_intro:
      'Retatrutide’s mechanism combines activity at three distinct receptor types.',
    mechanism_sections: [
      {
        title: 'GIP Receptor Activity',
        body: 'Glucose-dependent insulinotropic polypeptide, or GIP, participates in the body’s response to nutrient intake. Its receptor is involved in glucose-dependent insulin secretion and metabolic signalling.',
      },
      {
        title: 'GLP-1 Receptor Activity',
        body: 'Glucagon-like peptide-1, or GLP-1, participates in glucose regulation, appetite signalling and gastric emptying. Activating this receptor is one component of retatrutide’s metabolic activity.',
      },
      {
        title: 'Glucagon Receptor Activity',
        body: 'Glucagon receptors participate in hepatic glucose production and energy metabolism. Retatrutide incorporates glucagon receptor activity alongside its GIP and GLP-1 actions.',
      },
    ],
    mechanism_footer: `Scientists study the combined effect of these pathways. Activating three receptors does not automatically establish superiority over compounds with fewer receptor targets.

Scientific reference: [Retatrutide discovery and clinical proof-of-concept study — Cell Metabolism](https://doi.org/10.1016/j.cmet.2022.07.013).`,
    findings_heading: 'Retatrutide Research Findings',
    findings_sections: [
      {
        title: 'Body Weight and Obesity Research',
        body: `A randomised Phase 2 trial published in the *New England Journal of Medicine* in 2023 investigated retatrutide in adults with obesity or overweight and a weight-related condition.

At 48 weeks, the highest-dose study group had a mean body-weight reduction of 24.2%, compared with 2.1% in the placebo group.

These findings contributed to further clinical development. They represent averages observed under a defined trial protocol, rather than a prediction of individual outcomes.`,
        link_label: 'Read the original Phase 2 obesity study',
        link_url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972',
      },
      {
        title: 'Glucose Regulation and Type 2 Diabetes',
        body: `A Phase 2 study published in *The Lancet* in 2023 evaluated retatrutide in adults with type 2 diabetes.

The trial investigated blood glucose control, body weight and safety, using placebo and dulaglutide comparison groups. It provides evidence about retatrutide’s activity in a defined population with type 2 diabetes.

When interpreting these findings, consider the participants’ baseline characteristics, study duration and comparison treatment.`,
        link_label: 'Read the original Phase 2 diabetes study',
        link_url:
          'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01053-X/abstract',
      },
      {
        title: 'Liver Fat and Metabolic Research',
        body: `A 2024 study published in *Nature Medicine* investigated changes in liver fat among participants with metabolic dysfunction-associated steatotic liver disease, commonly abbreviated as MASLD.

Researchers used MRI measurements and reported reductions in liver fat compared with placebo.

This research contributes to the understanding of retatrutide’s metabolic effects. Liver-fat reduction is a specific outcome; effects on fibrosis and long-term liver complications require separate evidence.`,
        link_label: 'Read the original liver-fat study',
        link_url: 'https://www.nature.com/articles/s41591-024-03018-2',
      },
      {
        title: 'Phase 3 Clinical Research',
        body: `Retatrutide has progressed to Phase 3 investigation through programmes studying obesity, type 2 diabetes and associated conditions.

The 2026 TRIUMPH-2 publication reported findings in adults with obesity and type 2 diabetes. In the treatment-regimen analysis, mean body-weight change at 80 weeks was −18.8% in the highest-dose group, compared with −5.1% with placebo.

The analysis used matters: estimates can differ depending on how researchers account for treatment discontinuation and other events. Results from separate trials should not be compared as though they came from a direct head-to-head study.

[Explore retatrutide studies on ClinicalTrials.gov](https://clinicaltrials.gov/search?term=retatrutide).`,
        link_label: 'Read the Phase 3 TRIUMPH-2 publication',
        link_url:
          'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(26)01861-1/abstract',
      },
    ],
    glance_rows: [
      {
        area: 'Body weight',
        investigated: 'Changes in body weight over defined study periods',
        distinction: 'Group averages do not predict individual results',
      },
      {
        area: 'Glucose regulation',
        investigated: 'Glycaemic outcomes in adults with type 2 diabetes',
        distinction: 'Findings depend on the population and trial design',
      },
      {
        area: 'Liver fat',
        investigated: 'Changes measured using MRI',
        distinction: 'Reduced liver fat does not establish reversal of fibrosis',
      },
      {
        area: 'Safety and tolerability',
        investigated: 'Adverse events and treatment discontinuation',
        distinction: 'Longer-term and population-specific questions remain',
      },
    ],
    safety_body: `Reported adverse effects in clinical studies include nausea, diarrhoea, vomiting and constipation. The Phase 2 obesity trial also reported dose-dependent increases in heart rate. Later Phase 3 reporting includes dysesthesia, or altered skin sensations.

Some participants discontinued treatment because of adverse events. Findings should therefore be considered alongside tolerability, study duration and the characteristics of the participants.

Retatrutide remains investigational and is not approved by the TGA as of October 2026. Published clinical findings relate to the study preparation and do not establish equivalence with separately supplied research materials.

Further reading: [Phase 2 clinical findings](https://www.nejm.org/doi/full/10.1056/NEJMoa2301972) and [Lilly’s Phase 3 research update](https://investor.lilly.com/news-releases/news-release-details/lillys-triple-agonist-retatrutide-delivered-substantial-weight).`,
    coa_heading: 'Understanding Retatrutide Testing and COAs',
    coa_body: `Analytical testing helps researchers assess the characteristics of a submitted sample.

Different methods answer different questions:

• **Chromatographic purity:** HPLC measures the relative proportions of detected components under specified test conditions.
• **Identity assessment:** Mass spectrometry provides evidence about whether a sample is consistent with the expected molecule.
• **Peptide content:** Quantitative analysis measures the amount of peptide present.

When reviewing a Certificate of Analysis, check the compound name, sample or batch identifier, laboratory, testing date, methods and reported results. Only treat a property as tested when the report includes the relevant measurement.

Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa).`,
    faqs: [
      {
        q: 'Is retatrutide a peptide?',
        a: 'Yes. Retatrutide is a peptide designed to activate GIP, GLP-1 and glucagon receptors.',
      },
      {
        q: 'What is LY3437943?',
        a: 'LY3437943 is retatrutide’s development code. Both names appear in scientific publications and clinical trial records.',
      },
      {
        q: 'Why is retatrutide called a triple agonist?',
        a: 'Retatrutide activates three receptor types within a single molecule. “Triple” describes the number of receptor targets, not a guaranteed level of effectiveness.',
      },
      {
        q: 'What is retatrutide being researched for?',
        a: 'Research includes obesity, type 2 diabetes, liver fat and other metabolic outcomes. The strength and scope of the evidence vary by research question.',
      },
      {
        q: 'Has retatrutide been studied in humans?',
        a: 'Yes. Retatrutide has been investigated in human clinical trials, including Phase 2 and Phase 3 studies.',
      },
      {
        q: 'What does the 24.2% weight-loss figure refer to?',
        a: 'It is the mean body-weight reduction reported at 48 weeks in the highest-dose group of the 2023 Phase 2 obesity trial. It is a study result, not a guaranteed outcome.',
      },
      {
        q: 'Are different vial quantities different compounds?',
        a: 'No. A stated quantity, such as 10 mg or 20 mg, describes an amount rather than a different molecular identity. Identity and actual content are separate analytical questions.',
      },
      {
        q: 'Where can I find retatrutide research papers?',
        a: 'The references on this page link to original publications. Search retatrutide or LY3437943 on [PubMed](https://pubmed.ncbi.nlm.nih.gov/?term=retatrutide+OR+LY3437943) for additional literature.',
      },
    ],
    related: [
      {
        kind: 'product',
        label: 'Tirzepatide reference material',
        href: 'https://peplab.ai/',
      },
      {
        kind: 'research',
        label: 'What Is Tirzepatide?',
        slug: 'tirzepatide',
      },
    ],
    status: 'published',
    author_name: null,
    published_at: '2026-08-09T00:00:00.000Z',
  },

  {
    slug: 'ghk-cu',
    name: 'GHK-Cu',
    category: 'Copper Peptides / Skin & Tissue',
    product_slug: 'ghk-cu',
    card_title: 'What is GHK-Cu?',
    card_description:
      'A copper-binding tripeptide complex (copper tripeptide-1) studied for collagen, extracellular matrix remodelling, skin and tissue-repair research.',
    seo_title: 'GHK-Cu Research: Copper Peptide, Skin & Collagen | PEPLAB',
    seo_description:
      'Explore GHK-Cu copper peptide research on collagen, skin, tissue repair and hair, with original studies, evidence limitations and guidance on COA testing.',
    eyebrow: 'Copper Peptides / Skin & Tissue Research',
    h1: 'GHK-Cu Research Overview',
    subtitle: 'Copper Peptide Activity, Collagen and Skin Research',
    intro: `GHK-Cu is a copper-binding tripeptide complex studied for its effects on collagen production, tissue remodelling and cellular responses to injury. It combines the amino acids glycine, histidine and lysine with copper and is also commonly called copper tripeptide-1.

This page brings together GHK-Cu’s biological activity, published research findings and scientific references. Most mechanistic evidence comes from laboratory and animal studies, with smaller human studies investigating particular topical formulations.

For guidance on interpreting study findings and analytical testing, visit PEPLAB’s Research Overview.`,
    what_is_heading: 'What Is GHK-Cu?',
    what_is_body: `GHK-Cu is the copper complex of glycyl-L-histidyl-L-lysine, a three-amino-acid peptide abbreviated as GHK. The letters G, H and K represent glycine, histidine and lysine; Cu is the chemical symbol for copper.

Researchers investigate GHK-Cu in connective-tissue biology, including how cells produce and remodel the extracellular matrix. This matrix is the network of proteins and other molecules that helps support tissues.`,
    feature_rows: [
      { feature: 'Compound name', details: 'GHK-Cu' },
      { feature: 'Common name', details: 'Copper tripeptide-1' },
      {
        feature: 'Chemical description',
        details: 'Glycyl-L-histidyl-L-lysine copper complex',
      },
      { feature: 'Compound type', details: 'Copper–tripeptide complex' },
      { feature: 'Peptide sequence', details: 'Gly–His–Lys' },
      { feature: 'Peptide length', details: 'Three amino acids' },
      {
        feature: 'Research areas',
        details:
          'Collagen synthesis, extracellular matrix remodelling, skin, tissue repair and inflammatory responses',
      },
      {
        feature: 'Evidence base',
        details:
          'Laboratory and animal research, plus limited human studies of topical formulations',
      },
    ],
    mechanism_heading: 'How Does GHK-Cu Work?',
    mechanism_intro:
      'GHK-Cu research examines several biological processes rather than one established receptor mechanism.',
    mechanism_sections: [
      {
        title: 'Copper Binding',
        body: 'GHK binds copper ions to form GHK-Cu. The copper-bound complex and copper-free GHK are chemically distinct, so studies should identify which material was tested.',
      },
      {
        title: 'Collagen and Extracellular Matrix Activity',
        body: 'Fibroblasts are cells that produce components of connective tissue. Laboratory research has investigated how GHK-Cu affects collagen synthesis and other extracellular matrix components, including glycosaminoglycans.',
      },
      {
        title: 'Tissue Remodelling and Cellular Signalling',
        body: 'Tissue remodelling involves both the production and breakdown of matrix components. Researchers have studied GHK-Cu’s effects on matrix metalloproteinases, including MMP-2, as well as inflammatory signalling in experimental models.',
      },
    ],
    mechanism_footer: `These findings help explain research interest in GHK-Cu. They do not establish that every laboratory effect produces a measurable benefit in people.

Scientific references: [Collagen synthesis in fibroblasts](https://doi.org/10.1016/0014-5793(88)80509-X), [glycosaminoglycan synthesis](https://doi.org/10.1016/0024-3205(92)90504-i) and [MMP-2 expression](https://pubmed.ncbi.nlm.nih.gov/11045606/).`,
    findings_heading: 'GHK-Cu Research Findings',
    findings_sections: [
      {
        title: 'Collagen and Skin Research',
        body: `A study published in *FEBS Letters* in 1988 reported increased collagen synthesis in fibroblast cultures exposed to GHK-Cu. This finding contributed to interest in the compound’s role in connective-tissue biology.

A separate 1992 study investigated glycosaminoglycan production in cultured human fibroblasts and reported concentration-dependent effects.

Both studies examined cells under laboratory conditions. Neither directly measured visible wrinkle reduction, skin tightening or cosmetic outcomes in people.

[Read the original glycosaminoglycan study](https://doi.org/10.1016/0024-3205(92)90504-i).`,
        link_label: 'Read the original collagen study',
        link_url: 'https://doi.org/10.1016/0014-5793(88)80509-X',
      },
      {
        title: 'Tissue Repair and Wound Research',
        body: `A 1993 study published in the *Journal of Clinical Investigation* examined GHK-Cu in an experimental wound model in rats. Researchers reported increased accumulation of collagen and other extracellular matrix components in treated wound chambers.

The study supports further investigation of GHK-Cu in tissue repair. Animal wound models do not establish effectiveness for human wounds, scars, tendon injuries or recovery after surgery.`,
        link_label: 'Read the original animal wound study',
        link_url: 'https://www.jci.org/articles/view/116842',
      },
      {
        title: 'Human Skin and Topical Formulation Research',
        body: `A randomised study published in 2006 evaluated skin-care regimens with or without GHK-Cu following carbon dioxide laser resurfacing. Thirteen participants completed the study.

Researchers found no significant between-group differences in objective assessments of redness resolution, wrinkle improvement or overall skin quality. However, participants using GHK-Cu reported greater satisfaction with improvement in overall skin quality.

This small study illustrates why measured outcomes and participant impressions should be considered separately. Its findings relate to the topical products and post-laser setting studied.`,
        link_label: 'Read the original human skin study',
        link_url: 'https://pubmed.ncbi.nlm.nih.gov/16847171/',
      },
      {
        title: 'Hair and Eyebrow Research',
        body: `A small randomised, double-blind study published in 2026 in *Procedia of Multidisciplinary Research* investigated a topical GHK-Cu serum in 18 participants. Each participant’s eyebrows received different study preparations, allowing comparison within the same person.

The report described improvements in eyebrow hair count and diameter over 12 weeks compared with the vehicle preparation. Its small sample and short follow-up make this preliminary evidence, rather than confirmation of effectiveness for scalp hair loss.

Compound identity also matters. A frequently cited 2007 hair-follicle study investigated AHK-Cu, a different copper peptide, rather than GHK-Cu.

[Read the AHK-Cu hair-follicle study](https://pubmed.ncbi.nlm.nih.gov/17703734/).`,
        link_label: 'Read the preliminary eyebrow study',
        link_url:
          'https://mfuir.mfu.ac.th/jspui/bitstream/123456789/1706/1/141538-Fulltext.pdf',
      },
      {
        title: 'Inflammation and Oxidative Stress Research',
        body: `A 2016 study investigated GHK-Cu in cultured immune cells and a mouse model of acute lung injury. Researchers reported changes in inflammatory signalling, reactive oxygen species and antioxidant activity.

These are preclinical findings. They do not establish GHK-Cu as a treatment for inflammatory disorders or lung disease in humans.`,
        link_label: 'Read the original preclinical study',
        link_url: 'https://www.oncotarget.com/article/11168/',
      },
    ],
    glance_rows: [
      {
        area: 'Collagen',
        investigated: 'Collagen production in cultured fibroblasts',
        distinction: 'Cellular findings do not establish visible skin tightening',
      },
      {
        area: 'Tissue repair',
        investigated: 'Matrix accumulation in animal wound models',
        distinction: 'Animal findings do not establish human wound-healing effectiveness',
      },
      {
        area: 'Human skin',
        investigated: 'Topical products following laser resurfacing',
        distinction: 'A small trial found no objective advantage on the assessed skin outcomes',
      },
      {
        area: 'Hair and eyebrows',
        investigated: 'Eyebrow measurements in a small topical study',
        distinction: 'Eyebrow findings cannot establish effectiveness for scalp hair loss',
      },
      {
        area: 'Inflammation',
        investigated: 'Cellular signalling and responses in animal models',
        distinction: 'Preclinical findings do not demonstrate human treatment benefits',
      },
    ],
    safety_body: `GHK-Cu research spans different formulations, concentrations and experimental settings. Findings from a topical cosmetic formulation cannot be assumed to apply to injections or separately supplied research materials.

Small, short-term studies cannot reliably establish uncommon adverse effects or long-term safety. The studies discussed here do not establish a safe or effective injectable regimen for cosmetic, recovery or anti-ageing purposes.

Published findings relate to the materials actually studied. A matching compound name does not establish equivalence in identity, content, formulation or quality.

This page summarises scientific literature and does not provide instructions for personal use.`,
    coa_heading: 'Understanding GHK-Cu Testing and COAs',
    coa_body: `Analytical testing helps researchers assess a submitted sample. Different methods answer different questions:

• **Chromatographic purity:** HPLC estimates the relative proportions of detected components under the reported test conditions. A purity percentage does not, by itself, establish the amount of GHK-Cu in a vial.
• **Identity assessment:** Appropriate analytical methods, including mass spectrometry, can provide evidence about molecular identity. For a copper complex, the method and interpretation should account for the metal-bound material.
• **Peptide content:** A validated quantitative assay measures the amount of the specified analyte present.
• **Copper characterisation:** Where relevant, additional testing can assess copper content or characteristics of the complex. Peptide purity alone does not establish these properties.

Check the compound name, sample or batch identifier, laboratory, test date, methods and reported results. Only describe a property as verified when the report includes an appropriate measurement. Chromatographic purity does not establish sterility or endotoxin status.

Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Check whether a report covers the specific GHK-Cu batch being evaluated.`,
    faqs: [
      {
        q: 'What is GHK-Cu?',
        a: 'GHK-Cu is a complex of copper and the tripeptide glycine–histidine–lysine. It is studied in collagen production, tissue remodelling, skin biology and cellular responses to injury.',
      },
      {
        q: 'Is GHK-Cu the same as copper tripeptide-1?',
        a: 'Copper tripeptide-1 is a common name for GHK-Cu. Finished products containing this ingredient can differ in concentration, formulation and quality.',
      },
      {
        q: 'What is the difference between GHK and GHK-Cu?',
        a: 'GHK is the peptide glycine–histidine–lysine. GHK-Cu is its copper-bound complex. Research on one should not automatically be presented as evidence for the other.',
      },
      {
        q: 'Does GHK-Cu increase collagen?',
        a: 'Laboratory studies have reported increased collagen synthesis in fibroblasts exposed to GHK-Cu. This does not, by itself, establish wrinkle reduction or skin tightening in people.',
      },
      {
        q: 'Has GHK-Cu been studied in humans?',
        a: 'Yes. Small studies have investigated topical GHK-Cu products, including a post-laser skin study and a preliminary eyebrow study. Human evidence remains specific to the formulations and outcomes examined.',
      },
      {
        q: 'Does GHK-Cu help hair growth?',
        a: 'A small 2026 topical study reported improved eyebrow measurements. This does not establish effectiveness for scalp hair loss. Some frequently cited hair research tested AHK-Cu, a different compound.',
      },
      {
        q: 'Is GHK-Cu the same as AHK-Cu?',
        a: 'No. GHK-Cu contains glycine–histidine–lysine, while AHK-Cu contains alanine–histidine–lysine. The first amino acid differs, so they are distinct copper-peptide complexes.',
      },
      {
        q: 'Are different vial quantities different compounds?',
        a: 'No. Labels such as 50 mg and 100 mg describe stated amounts, rather than different molecular identities. Actual identity and content require appropriate analytical testing.',
      },
      {
        q: 'Does a high-purity COA prove safety or effectiveness?',
        a: 'No. A COA reports results for specified tests on a submitted sample. It does not establish clinical effectiveness, suitability for personal use or properties that were not tested.',
      },
      {
        q: 'Where can I find GHK-Cu research papers?',
        a: 'Use the original-study links on this page or search [PubMed](https://pubmed.ncbi.nlm.nih.gov/?term=GHK-Cu+OR+%22copper+tripeptide-1%22) for GHK-Cu. Check whether each paper studied GHK-Cu, copper-free GHK or another copper peptide.',
      },
    ],
    related: [],
    status: 'published',
    author_name: null,
    published_at: '2026-10-07T00:00:00.000Z',
  },

  {
    slug: 'mots-c',
    name: 'MOTS-C',
    category: 'Mitochondrial / Metabolic',
    product_slug: 'mots-c',
    card_title: 'What is MOTS-C?',
    card_description:
      'A 16-amino-acid mitochondrial-derived peptide studied in metabolic regulation, AMPK signalling, muscle biology and exercise-related research.',
    seo_title: 'MOTS-C Research: Mitochondria & Metabolism | PEPLAB',
    seo_description:
      'Explore MOTS-C research on mitochondrial signalling, AMPK, metabolic regulation and exercise, with original studies and clear human-evidence limits.',
    eyebrow: 'Mitochondrial / Metabolic Research',
    h1: 'MOTS-C Research Overview',
    subtitle: 'Mitochondrial Signalling and Metabolic Adaptation',
    intro: `MOTS-C is a mitochondrial-derived peptide studied in metabolic regulation, cellular stress responses and exercise biology. Researchers investigate both naturally occurring MOTS-C and administered experimental material. Those are different research questions: an exercise-related change in the body’s own peptide levels does not establish the effects of administering a research preparation.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: 'What Is MOTS-C?',
    what_is_body:
      'MOTS-C stands for mitochondrial open reading frame of the 12S rRNA-c. It is a 16-amino-acid peptide described in research linking mitochondrial genetic information with metabolic signalling. Mitochondria contribute to energy metabolism, but MOTS-C is a signalling peptide rather than a direct replacement for ATP or a conventional stimulant.',
    feature_rows: [
      { feature: 'Compound name', details: 'MOTS-C / MOTS-c' },
      { feature: 'Compound type', details: 'Mitochondrial-derived peptide' },
      { feature: 'Peptide length', details: '16 amino acids' },
      {
        feature: 'Research pathways',
        details: 'Metabolic regulation, AMPK and stress adaptation',
      },
      {
        feature: 'Research areas',
        details: 'Insulin sensitivity, skeletal muscle and exercise biology',
      },
      {
        feature: 'Evidence base',
        details: 'Cell and animal interventions; human observations of endogenous MOTS-C',
      },
    ],
    mechanism_heading: 'How Does MOTS-C Work?',
    mechanism_intro: '',
    mechanism_sections: [
      {
        title: 'Metabolic Signalling',
        body: 'The discovery study connected MOTS-C with folate/purine metabolism and activation of AMPK, a cellular energy-sensing pathway. These findings arose from experimental systems.',
      },
      {
        title: 'Muscle and Stress Adaptation',
        body: 'Later work examined skeletal-muscle metabolism and responses to metabolic stress. Researchers assess gene expression and physical performance as separate outcomes.',
      },
      {
        title: 'Endogenous Versus Administered Peptide',
        body: 'Measuring the body’s own MOTS-C during exercise is not equivalent to testing an administered peptide. Concentration changes alone do not establish a therapeutic effect.',
      },
    ],
    mechanism_footer: '',
    findings_heading: 'MOTS-C Research Findings',
    findings_sections: [
      {
        title: 'Metabolic Homeostasis',
        body: 'The 2015 *Cell Metabolism* discovery paper identified MOTS-C and reported metabolic effects in cells and mice, including effects on insulin resistance in experimental models. It established a basis for further research rather than a human weight-management treatment.',
        link_label: 'Read the MOTS-C discovery study',
        link_url: 'https://www.cell.com/cell-metabolism/fulltext/S1550-4131(15)00061-3',
      },
      {
        title: 'Exercise and Physical Capacity',
        body: 'A 2021 *Nature Communications* paper reported improved physical performance after MOTS-C administration in mice. The same paper examined exercise-related increases in naturally occurring MOTS-C in humans. The human component was not a trial showing that administering MOTS-C improves exercise performance.',
        link_label: 'Read the exercise and muscle study',
        link_url: 'https://www.nature.com/articles/s41467-020-20790-0',
      },
      {
        title: 'Translating the Evidence',
        body: 'The key distinction is between metabolic plausibility and demonstrated human benefit. Trials would need to characterise the administered material, compare it with a control and measure meaningful outcomes. Evidence for related analogues would also need to be separated from evidence for native MOTS-C.',
        link_label: 'Review the study designs in the original exercise paper',
        link_url: 'https://www.nature.com/articles/s41467-020-20790-0',
      },
    ],
    glance_rows: [
      {
        area: 'Metabolic regulation',
        investigated: 'Cell and mouse experiments',
        distinction: 'Not proof of human fat loss',
      },
      {
        area: 'Exercise biology',
        investigated: 'Mouse interventions and human endogenous measurements',
        distinction: 'Human measurements do not establish administered-peptide efficacy',
      },
      {
        area: 'Ageing',
        investigated: 'Physical-capacity outcomes in older mice',
        distinction: 'Not evidence of human lifespan extension',
      },
    ],
    safety_body: `The cited intervention findings are predominantly preclinical. They do not establish long-term human safety, an effective personal-use regimen or a predictable energy response. The FDA has highlighted missing human exposure information and characterisation concerns for compounded MOTS-C. [Read the FDA safety information](https://www.fda.gov/media/193347/download). Research on endogenous biology should not be used to imply that externally supplied material is inherently safe.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: 'Understanding MOTS-C Testing and COAs',
    coa_body: DEFAULT_COA_BODY,
    faqs: [
      {
        q: 'Is MOTS-C a peptide?',
        a: 'Yes. MOTS-C is a 16-amino-acid mitochondrial-derived peptide investigated in metabolic and stress-response research.',
      },
      {
        q: 'Does MOTS-C give stimulant-like energy?',
        a: 'The studies discussed here do not establish a stimulant-like subjective effect. Cellular energy regulation and feeling more alert are different outcomes.',
      },
      {
        q: 'Has MOTS-C been studied in humans?',
        a: 'Human work includes measurement of endogenous MOTS-C during exercise. This does not establish the safety or effectiveness of administering a MOTS-C preparation.',
      },
      {
        q: 'Is MOTS-C the same as SLU-PP-332?',
        a: 'No. MOTS-C is a peptide; SLU-PP-332 is a synthetic small molecule targeting estrogen-related receptors. Similar research topics do not make them interchangeable.',
      },
      {
        q: 'Does MOTS-C research prove weight loss?',
        a: 'Preclinical metabolic findings do not establish a predictable weight-loss effect in humans.',
      },
      {
        q: 'Does mitochondrial origin mean it extends lifespan?',
        a: 'No. A molecule’s origin or role in cell biology does not demonstrate that administering it extends human lifespan.',
      },
      {
        q: 'Where can I find MOTS-C research papers?',
        a: 'Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.',
      },
    ],
    related: [
      { label: 'SLU-PP-332' },
      { label: 'SS-31' },
      { label: 'NAD+' },
    ],
    status: 'published',
    author_name: null,
    published_at: '2026-10-07T00:00:00.000Z',
  },

  {
    slug: 'bpc-157-tb-500',
    name: 'BPC-157 + TB-500',
    category: 'Peptide Blends / Tissue',
    product_slug: 'bpc-5mg-tb-5mg',
    card_title: 'What is BPC-157 + TB-500 Blend?',
    card_description:
      'A combination of two tissue-repair research peptides — component evidence, TB-500 identity questions and the limits of blend claims.',
    seo_title: 'BPC-157 + TB-500 Blend Research & Evidence | PEPLAB',
    seo_description:
      'Explore BPC-157 + TB-500 blend research, component evidence, tissue-repair models, TB-500 identity and the limitations of combination claims.',
    eyebrow: 'Peptide Blends / Tissue Research',
    h1: 'BPC-157 + TB-500 Blend Research Overview',
    subtitle: 'Component Evidence and Tissue-Repair Research',
    intro: `BPC-157 + TB-500 describes a combination of two peptide materials associated with tissue-repair research. Evidence for the individual components, related thymosin peptides and the finished blend must be assessed separately. This overview explains what the cited studies investigated and why molecular identity and blend composition are essential to interpreting them.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: 'What Is BPC-157 + TB-500 Blend?',
    what_is_body:
      'BPC-157 is a 15-amino-acid experimental peptide. TB-500 is a name used for thymosin beta-4-related materials; a published analytical study identified an acetylated seven-amino-acid fragment in a product carrying that name. Full-length thymosin beta-4 and that fragment are not the same molecule. The supplied sequence must therefore be checked rather than inferred from the label.',
    feature_rows: [
      { feature: 'Material name', details: 'BPC-157 + TB-500 blend' },
      { feature: 'Compound type', details: 'Mixture, not one new peptide' },
      { feature: 'BPC-157 component', details: 'Experimental pentadecapeptide' },
      {
        feature: 'TB-500 component',
        details: 'Exact sequence and identity require documentation',
      },
      {
        feature: 'Research areas',
        details: 'Cell migration, tissue injury and repair',
      },
      {
        feature: 'Evidence base',
        details:
          'Mainly component studies; limited uncontrolled human observations involving BPC-157 and TB4',
      },
    ],
    mechanism_heading: 'How Does BPC-157 + TB-500 Blend Work?',
    mechanism_intro: '',
    mechanism_sections: [
      {
        title: 'BPC-157 Research Pathways',
        body: 'Laboratory work has examined tendon-cell migration, stress responses and vascular signalling. These are mechanistic observations, not established injury-healing outcomes in people.',
      },
      {
        title: 'Thymosin-Related Biology',
        body: 'Thymosin beta-4 research cannot automatically be assigned to every TB-500-labelled material. The tested molecule, its length and modifications determine the relevance of a reference.',
      },
      {
        title: 'Combination Questions',
        body: 'A blend introduces questions about interactions, stability and relative amounts. Activity of each ingredient alone does not demonstrate additive effects or synergy.',
      },
    ],
    mechanism_footer: '',
    findings_heading: 'BPC-157 + TB-500 Blend Research Findings',
    findings_sections: [
      {
        title: 'Tendon-Cell Research',
        body: 'A 2011 BPC-157 study used rat tendon explants and cultured fibroblasts. It reported changes in cell outgrowth, migration and survival under stress. The experiment did not test a BPC-157 + TB-500 blend or measure recovery from a human tendon injury.',
        link_label: 'Read the BPC-157 tendon study',
        link_url: 'https://pubmed.ncbi.nlm.nih.gov/21030672/',
      },
      {
        title: 'Limited Human Combination Observations',
        body: 'A 2021 retrospective knee-pain report included BPC-157 alone and BPC-157 with thymosin beta-4. Only four followed participants received the combination. There was no randomised control group, and improvement was assessed by patient reports. It does not establish blend superiority, structural repair or equivalence to a commercial TB-500 preparation.',
        link_label: 'Read the retrospective knee-pain report',
        link_url: 'https://pubmed.ncbi.nlm.nih.gov/34324435/',
      },
      {
        title: 'TB-500 Identity',
        body: 'A 2012 analytical paper identified Ac-LKKTETQ in a TB-500 product. This is an identity study, not a clinical efficacy trial. It provides a reason to check the supplier’s sequence and mass data before matching a vial to studies of full-length thymosin beta-4.',
        link_label: 'Read the TB-500 characterisation study',
        link_url: 'https://pubmed.ncbi.nlm.nih.gov/22962027/',
      },
    ],
    glance_rows: [
      {
        area: 'Tendon biology',
        investigated: 'BPC-157 experiments in cells and tissue',
        distinction: 'Not a controlled trial of this blend',
      },
      {
        area: 'Human observations',
        investigated: 'Small retrospective BPC-157/TB4 report',
        distinction: 'Cannot establish causality or synergy',
      },
      {
        area: 'Molecular identity',
        investigated: 'Analysis of a TB-500-labelled material',
        distinction: 'Full-length TB4 and a fragment are distinct',
      },
    ],
    safety_body: `Robust controlled evidence establishing the safety and effectiveness of the exact commercial blend was not identified in the sources reviewed. Reported improvement in an uncontrolled series does not establish cartilage regrowth, tendon repair or a predictable recovery time. The combined preparation also requires its own stability and analytical assessment; ingredient COAs alone do not characterise the finished mixture.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: 'Understanding BPC-157 + TB-500 Blend Testing and COAs',
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.
• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.
• **Content:** A validated quantitative assay measures the amount of the specified analyte or each blend component.

For this blend, request identity and quantitative content for both components. TB-500 documentation should state the actual peptide sequence and modifications. One combined purity figure cannot establish the amount or ratio of both peptides.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: 'Is BPC-157 + TB-500 one peptide?',
        a: 'No. It is a mixture. Each component retains its own molecular identity, and the blend ratio affects the amount of each material present.',
      },
      {
        q: 'Is TB-500 always full-length thymosin beta-4?',
        a: 'The name alone is insufficient. Published analytical work identified a shorter acetylated fragment in a TB-500 product. Check the exact sequence and laboratory report.',
      },
      {
        q: 'Has the blend been studied in humans?',
        a: 'A small retrospective report included BPC-157 with TB4, but it was not a controlled trial of a characterised PEPLAB blend. The distinction matters.',
      },
      {
        q: 'Does the blend work better than BPC-157 alone?',
        a: 'The cited evidence does not establish superiority or synergy. A suitable comparison would need to test the exact combination against its individual components.',
      },
      {
        q: 'Does a total vial amount show the ratio?',
        a: 'No. A total amount does not state how much of each peptide is present. Component amounts should be listed and quantitatively verified.',
      },
      {
        q: 'Can studies prove faster injury recovery?',
        a: 'The studies here do not establish a reliable human recovery timetable. Cellular responses and patient-reported pain are different from verified structural healing.',
      },
      {
        q: 'Where can I find BPC-157 + TB-500 Blend research papers?',
        a: 'Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.',
      },
    ],
    related: [
      { label: 'BPC-157', slug: 'bpc-157', kind: 'research' },
      { label: 'GLOW Blend', slug: 'glow', kind: 'research' },
      { label: 'KLOW Blend', slug: 'klow', kind: 'research' },
    ],
    status: 'published',
    author_name: null,
    published_at: '2026-10-07T00:00:00.000Z',
  },

  {
    slug: 'tirzepatide',
    name: 'Tirzepatide',
    category: 'GLP-1 / Incretin',
    product_slug: 'tirzepatide',
    card_title: 'What is Tirzepatide?',
    card_description:
      'A dual GIP / GLP-1 receptor agonist (LY3298176) — clinical evidence on body weight, glucose regulation and the limits of product equivalence.',
    seo_title: 'Tirzepatide Research: GIP, GLP-1 & Metabolism | PEPLAB',
    seo_description:
      'Explore tirzepatide research on GIP and GLP-1 receptor activity, body weight and glucose regulation, with clinical studies, FAQs and COA guidance.',
    eyebrow: 'GLP-1 / Incretin',
    h1: 'Tirzepatide Research Overview',
    subtitle: 'Dual Receptor Activity and Metabolic Research',
    intro: `Tirzepatide is a synthetic peptide that activates GIP and GLP-1 receptors. Research has examined its effects on blood glucose, body weight and related metabolic outcomes in large human clinical trials. This overview explains its mechanism, key findings and the distinction between evidence for studied medicines and separately supplied research materials.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: 'What Is Tirzepatide?',
    what_is_body:
      'Tirzepatide is a dual incretin receptor agonist developed by Eli Lilly. Incretins are hormones involved in the response to food intake. Tirzepatide combines activity at two receptor types within one molecule. It is the active ingredient in authorised medicines, but that status does not establish the quality or equivalence of other preparations bearing the same compound name.',
    feature_rows: [
      { feature: 'Compound name', details: 'Tirzepatide' },
      { feature: 'Development code', details: 'LY3298176' },
      { feature: 'Compound type', details: 'Synthetic peptide' },
      { feature: 'Mechanism', details: 'GIP and GLP-1 receptor agonism' },
      {
        feature: 'Research areas',
        details: 'Type 2 diabetes, obesity and metabolic outcomes',
      },
      {
        feature: 'Evidence base',
        details: 'Large randomised human trials; authorised medicinal formulations',
      },
    ],
    mechanism_heading: 'How Does Tirzepatide Work?',
    mechanism_intro: '',
    mechanism_sections: [
      {
        title: 'GIP Receptor Activity',
        body: 'The glucose-dependent insulinotropic polypeptide receptor participates in glucose-dependent insulin secretion. Tirzepatide activates this pathway as one part of its dual incretin activity.',
      },
      {
        title: 'GLP-1 Receptor Activity',
        body: 'GLP-1 receptor activation influences insulin secretion, appetite and food intake. Delayed gastric emptying is also relevant to this class of medicines.',
      },
      {
        title: 'Combined Metabolic Effects',
        body: 'Researchers measure the net effects of both pathways using clinical outcomes such as HbA1c and body-weight change. The number of receptor targets alone does not establish superiority.',
      },
    ],
    mechanism_footer: '',
    findings_heading: 'Tirzepatide Research Findings',
    findings_sections: [
      {
        title: 'Body Weight and Obesity Research',
        body: 'SURMOUNT-1, published in 2022, enrolled 2,539 adults with obesity or overweight and a weight-related complication, without diabetes. At 72 weeks, mean weight change in the highest-dose group was −20.9%, compared with −3.1% with placebo, using the treatment-regimen analysis. These are group averages under a defined trial protocol, not predicted individual results.',
        link_label: 'Read the SURMOUNT-1 trial',
        link_url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038',
      },
      {
        title: 'Glucose Regulation and Type 2 Diabetes',
        body: 'SURPASS-2 compared tirzepatide with semaglutide in adults with type 2 diabetes over 40 weeks. Tirzepatide groups had larger reductions in HbA1c and body weight under the tested regimens. The semaglutide comparator was 1 mg weekly; this study cannot answer every question about other formulations, doses or populations.',
        link_label: 'Read the SURPASS-2 trial',
        link_url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2107519',
      },
      {
        title: 'Obesity With Type 2 Diabetes',
        body: 'SURMOUNT-2 investigated weight outcomes in people who had both obesity or overweight and type 2 diabetes. Its population differs from SURMOUNT-1, illustrating why results should be read alongside baseline health, study duration and analysis methods rather than pooled into one headline claim.',
        link_label: 'Read the SURMOUNT-2 trial',
        link_url:
          'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01200-X/abstract',
      },
    ],
    glance_rows: [
      {
        area: 'Body weight',
        investigated: 'Percentage weight change over 72 weeks',
        distinction: 'Trial averages do not guarantee individual weight loss',
      },
      {
        area: 'Glucose regulation',
        investigated: 'HbA1c in type 2 diabetes',
        distinction: 'Comparator dose and background treatment matter',
      },
      {
        area: 'Comparative research',
        investigated: 'Tirzepatide versus a defined semaglutide regimen',
        distinction: 'One comparison does not cover all products or uses',
      },
    ],
    safety_body: `Gastrointestinal adverse events, including nausea, diarrhoea and vomiting, were common in clinical studies; some participants discontinued treatment. The TGA also highlights delayed gastric emptying and associated concerns during anaesthesia or deep sedation for incretin medicines. Australian approvals relate to specified medicines and indications. Published trials do not establish equivalence with a separately supplied research vial. See the [TGA information on incretin medicines](https://www.tga.gov.au/news/safety-updates/glucagon-like-peptide-1-receptor-agonists-glp-1-ras-and-dual-gipglp-1-receptor-agonists-and-risk-aspiration-under-anaesthesia).

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: 'Understanding Tirzepatide Testing and COAs',
    coa_body: DEFAULT_COA_BODY,
    faqs: [
      {
        q: 'Is tirzepatide a GLP-1 peptide?',
        a: 'Tirzepatide activates GLP-1 receptors and GIP receptors. It is therefore described more precisely as a dual GIP/GLP-1 receptor agonist.',
      },
      {
        q: 'What is LY3298176?',
        a: 'LY3298176 is the development code for tirzepatide. It appears in early scientific and clinical-development literature.',
      },
      {
        q: 'What does the 20.9% figure mean?',
        a: 'It is the mean weight reduction at 72 weeks in the highest-dose SURMOUNT-1 group under the treatment-regimen analysis. It is not a guaranteed outcome.',
      },
      {
        q: 'Is tirzepatide the same as semaglutide?',
        a: 'No. Tirzepatide activates GIP and GLP-1 receptors; semaglutide targets GLP-1 receptors. They are distinct compounds with different trial programmes.',
      },
      {
        q: 'Do vial quantities change the compound?',
        a: 'No. A stated quantity describes an amount. Molecular identity, actual content and formulation are separate questions that require suitable documentation and testing.',
      },
      {
        q: 'Is tirzepatide approved in Australia?',
        a: 'The TGA identifies Mounjaro as approved for type 2 diabetes and chronic weight management. This is a product-specific approval, not approval of every tirzepatide preparation. See the [TGA source](https://www.tga.gov.au/resources/product-information/mounjaro-tirzepatide).',
      },
      {
        q: 'Where can I find Tirzepatide research papers?',
        a: 'Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.',
      },
    ],
    related: [
      {
        kind: 'product',
        label: 'Retatrutide reference material',
        href: 'https://peplab.ai/',
      },
      {
        kind: 'research',
        label: 'What Is Retatrutide?',
        slug: 'retatrutide',
      },
    ],
    status: 'published',
    author_name: null,
    published_at: '2026-10-07T00:00:00.000Z',
  },

  {
    slug: 'tesamorelin',
    name: 'Tesamorelin',
    category: 'Growth Hormone / GHRH',
    product_slug: 'tesamorelin',
    card_title: 'What is Tesamorelin?',
    card_description:
      'A synthetic GHRH analogue studied mainly for HIV-associated visceral fat and liver-fat research — mechanism, trials and indication limits.',
    seo_title: 'Tesamorelin Research: GHRH & Visceral Fat | PEPLAB',
    seo_description:
      'Explore tesamorelin research on growth hormone signalling, visceral fat and liver fat, with human studies, evidence limitations and COA guidance.',
    eyebrow: 'Growth Hormone / GHRH',
    h1: 'Tesamorelin Research Overview',
    subtitle: 'Growth Hormone Signalling and Visceral Fat Research',
    intro: `Tesamorelin is a synthetic growth hormone-releasing hormone analogue studied mainly in adults with HIV-associated abdominal fat accumulation. It stimulates the body’s growth hormone pathway rather than supplying growth hormone directly. This page reviews visceral-fat findings, liver-fat research and the limits of applying those results to other populations.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: 'What Is Tesamorelin?',
    what_is_body:
      'Tesamorelin is an analogue of growth hormone-releasing hormone, also called growth hormone-releasing factor. It acts at the pituitary to stimulate growth hormone secretion, with downstream effects on insulin-like growth factor-1, or IGF-1. Visceral fat surrounds internal organs and is different from subcutaneous fat beneath the skin.',
    feature_rows: [
      { feature: 'Compound name', details: 'Tesamorelin' },
      { feature: 'Compound type', details: 'Synthetic GHRH analogue' },
      { feature: 'Peptide length', details: '44 amino acids' },
      {
        feature: 'Primary pathway',
        details: 'GHRH receptor → growth hormone → IGF-1',
      },
      {
        feature: 'Research areas',
        details: 'HIV-associated visceral adiposity and liver fat',
      },
      {
        feature: 'Evidence base',
        details: 'Randomised human studies; authorised US medicinal formulations',
      },
    ],
    mechanism_heading: 'How Does Tesamorelin Work?',
    mechanism_intro: '',
    mechanism_sections: [
      {
        title: 'Pituitary Signalling',
        body: 'Tesamorelin activates GHRH receptors, stimulating endogenous growth hormone release. It is a releasing-hormone analogue, not recombinant human growth hormone.',
      },
      {
        title: 'IGF-1 Response',
        body: 'Growth hormone influences IGF-1 production. IGF-1 changes are biological markers of activity, but a higher marker does not automatically mean a better clinical outcome.',
      },
      {
        title: 'Body-Fat Distribution',
        body: 'Research focuses on visceral adipose tissue. A decrease in this compartment should not be represented as an equivalent percentage loss of total body weight.',
      },
    ],
    mechanism_footer: '',
    findings_heading: 'Tesamorelin Research Findings',
    findings_sections: [
      {
        title: 'Visceral Adipose Tissue',
        body: 'A randomised study published in 2010 enrolled 404 adults with HIV and excess abdominal fat. During the initial six months, visceral adipose tissue decreased more with tesamorelin than placebo. Participants continuing treatment maintained a different trajectory from those switched to placebo; benefits diminished after withdrawal.',
        link_label: 'Read the visceral-fat trial',
        link_url: 'https://doi.org/10.1097/QAI.0b013e3181d9a330',
      },
      {
        title: 'Liver-Fat Research',
        body: 'A 2014 *JAMA* trial studied 50 adults with HIV and abdominal fat accumulation. Over six months, tesamorelin was associated with reductions in visceral fat and liver fat compared with placebo. This was a defined HIV population, and the authors called for further work on the long-term clinical importance of the findings.',
        link_label: 'Read the liver-fat study',
        link_url: 'https://jamanetwork.com/journals/jama/fullarticle/1889139',
      },
      {
        title: 'Clinical Scope and Interpretation',
        body: 'The US EGRIFTA WR prescribing information specifies reduction of excess abdominal fat in adults with HIV-associated lipodystrophy. It explicitly distinguishes this indication from weight-loss management. Approval of that medicinal formulation does not establish a general anti-ageing, bodybuilding or sleep indication.',
        link_label: 'Read the prescribing information',
        link_url:
          'https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/022505s020lbl.pdf',
      },
    ],
    glance_rows: [
      {
        area: 'Visceral fat',
        investigated: 'Changes in internal abdominal fat',
        distinction: 'Different from total weight loss or subcutaneous fat',
      },
      {
        area: 'Liver fat',
        investigated: 'Imaging-based changes in adults with HIV',
        distinction: 'Not proof of benefit for every liver condition',
      },
      {
        area: 'Hormonal response',
        investigated: 'GH and IGF-1 activity',
        distinction: 'Biomarker changes require clinical interpretation',
      },
    ],
    safety_body: `Reported risks in the medicinal label include elevated IGF-1, fluid retention, joint symptoms, glucose intolerance or diabetes, and hypersensitivity. Cancer history and pituitary conditions also matter in clinical assessment. Long-term cardiovascular safety is not established in the label. These considerations reinforce why trial findings and approved prescribing information cannot be transferred directly to uncharacterised research materials. Source: [EGRIFTA WR prescribing information](https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/022505s020lbl.pdf).

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: 'Understanding Tesamorelin Testing and COAs',
    coa_body: DEFAULT_COA_BODY,
    faqs: [
      {
        q: 'Is tesamorelin the same as HGH?',
        a: 'No. Tesamorelin stimulates growth hormone release through GHRH receptors. HGH preparations contain growth hormone itself.',
      },
      {
        q: 'Is tesamorelin a general weight-loss compound?',
        a: 'Its strongest clinical evidence concerns excess visceral fat in adults with HIV-associated lipodystrophy. That is different from demonstrating general weight-loss effectiveness.',
      },
      {
        q: 'What is visceral fat?',
        a: 'Visceral fat is fat stored around internal abdominal organs. It is distinct from subcutaneous fat located beneath the skin.',
      },
      {
        q: 'Has tesamorelin been studied for liver fat?',
        a: 'Yes. Human studies have examined liver fat in adults with HIV. The population and measured outcomes limit how widely those findings apply.',
      },
      {
        q: 'Does tesamorelin research prove better sleep?',
        a: 'The visceral-fat and liver-fat trials discussed here do not establish tesamorelin as a treatment for insomnia or a general sleep enhancer.',
      },
      {
        q: 'Are tesamorelin and ipamorelin the same?',
        a: 'No. Tesamorelin acts through GHRH receptors; ipamorelin acts through the growth hormone secretagogue receptor system. Shared hormonal effects do not make them interchangeable.',
      },
      {
        q: 'Where can I find Tesamorelin research papers?',
        a: 'Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.',
      },
    ],
    related: [
      { label: 'Ipamorelin' },
      {
        label: 'CJC-1295 No DAC + Ipamorelin Blend',
        slug: 'cjc-1295-no-dac-ipamorelin',
      },
    ],
    status: 'published',
    author_name: null,
    published_at: '2026-10-07T00:00:00.000Z',
  },

  {
    slug: 'cjc-1295-no-dac-ipamorelin',
    name: 'CJC-1295 No DAC + Ipamorelin',
    category: 'Peptide Blends / Growth Hormone',
    product_slug: 'cjc-1295-no-dac-ipa-5mg',
    card_title: 'What is CJC-1295 No DAC + Ipamorelin Blend?',
    card_description:
      'A two-pathway growth hormone blend — No DAC vs long-acting CJC-1295, ipamorelin component evidence and the limits of blend claims.',
    seo_title: 'CJC-1295 No DAC + Ipamorelin Research | PEPLAB',
    seo_description:
      'Explore CJC-1295 No DAC + ipamorelin research, growth hormone pathways, DAC differences, component studies and the limits of blend evidence.',
    eyebrow: 'Peptide Blends / Growth Hormone',
    h1: 'CJC-1295 No DAC + Ipamorelin Blend Research Overview',
    subtitle: 'GHRH and Ghrelin-Receptor Pathway Research',
    intro: `CJC-1295 No DAC + ipamorelin is a blend associated with research into growth hormone release. The components are intended to act through different receptor systems. However, studies of long-acting CJC-1295, ipamorelin alone and the exact No DAC blend represent separate evidence and should not be presented as interchangeable.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: 'What Is CJC-1295 No DAC + Ipamorelin Blend?',
    what_is_body:
      '“CJC-1295 No DAC” is a commercial name commonly used for a modified GHRH fragment without the drug-affinity complex associated with long-acting CJC-1295. The label should be checked against the actual sequence. Ipamorelin is a synthetic pentapeptide that acts through the growth hormone secretagogue receptor, also known as the ghrelin receptor.',
    feature_rows: [
      { feature: 'Material name', details: 'CJC-1295 No DAC + ipamorelin blend' },
      { feature: 'Compound type', details: 'Two-component peptide mixture' },
      {
        feature: 'GHRH-related component',
        details: 'Confirm exact No DAC sequence and modifications',
      },
      { feature: 'Second component', details: 'Ipamorelin' },
      {
        feature: 'Research pathways',
        details: 'GHRH and growth hormone secretagogue receptor systems',
      },
      {
        feature: 'Evidence base',
        details:
          'Component studies; exact-blend efficacy not established by the cited trials',
      },
    ],
    mechanism_heading: 'How Does CJC-1295 No DAC + Ipamorelin Blend Work?',
    mechanism_intro: '',
    mechanism_sections: [
      {
        title: 'GHRH Pathway',
        body: 'A correctly identified GHRH analogue is investigated for pituitary growth hormone release. Removing an albumin-binding modification changes the material and prevents direct transfer of long-acting pharmacokinetic claims.',
      },
      {
        title: 'Ghrelin-Receptor Pathway',
        body: 'Ipamorelin has demonstrated growth hormone-releasing activity through the secretagogue receptor system. Its biological target differs from the GHRH receptor.',
      },
      {
        title: 'Combination Rationale',
        body: 'Two pathways provide a research rationale for studying a combination. They do not prove that a particular mixture improves sleep, recovery, body composition or long-term outcomes.',
      },
    ],
    mechanism_footer: '',
    findings_heading: 'CJC-1295 No DAC + Ipamorelin Blend Research Findings',
    findings_sections: [
      {
        title: 'The CJC-1295 Study and DAC Distinction',
        body: 'A 2006 human study examined a long-acting CJC-1295 preparation and reported sustained GH and IGF-1 responses. Its reported multi-day half-life belongs to that tested preparation. It should not be assigned to a product labelled No DAC or used as a clinical trial of this blend.',
        link_label: 'Read the long-acting CJC-1295 study',
        link_url: 'https://doi.org/10.1210/jc.2005-1536',
      },
      {
        title: 'Ipamorelin in Human Volunteers',
        body: 'A 1999 study measured ipamorelin pharmacokinetics and growth hormone responses following intravenous administration in healthy male volunteers. It supports a specific human hormonal response, not the safety or effectiveness of a subcutaneous No DAC combination.',
        link_label: 'Read the ipamorelin volunteer study',
        link_url: 'https://doi.org/10.1023/A:1018955126402',
      },
      {
        title: 'What the Blend Evidence Can Establish',
        body: 'The primary studies linked here did not administer the exact CJC-1295 No DAC + ipamorelin mixture. To demonstrate a blend-specific benefit, a study would need verified component identity, a stated ratio, suitable controls and relevant clinical endpoints. Hormone changes alone would not establish better sleep or faster injury recovery.',
        link_label: 'Review the component pharmacology study',
        link_url: 'https://doi.org/10.1530/eje.0.1390552',
      },
    ],
    glance_rows: [
      {
        area: 'CJC-1295 pharmacology',
        investigated: 'Long-acting preparation in humans',
        distinction: 'Not equivalent to No DAC',
      },
      {
        area: 'Ipamorelin activity',
        investigated: 'Hormonal response after IV administration',
        distinction: 'Not a trial of the blend or another route',
      },
      {
        area: 'Combination claims',
        investigated: 'Mechanistic rationale',
        distinction: 'Synergy and clinical benefit remain unestablished here',
      },
    ],
    safety_body: `The cited studies do not establish long-term safety of the exact blend. Endocrine activity should not be treated as evidence of harmlessness, and a short pharmacology study cannot identify every clinically important effect. Claims of being side-effect-free, avoiding all cortisol effects or guaranteeing improved sleep are not supported by the blend evidence presented here.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: 'Understanding CJC-1295 No DAC + Ipamorelin Blend Testing and COAs',
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.
• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.
• **Content:** A validated quantitative assay measures the amount of the specified analyte or each blend component.

Confirm the exact No DAC sequence, absence of the DAC modification, ipamorelin identity and the quantitative content of each peptide. A single total blend amount or purity percentage cannot verify the component ratio.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: 'What does No DAC mean?',
        a: 'It indicates the absence of the drug-affinity complex associated with long-acting CJC-1295. Verify the actual peptide sequence rather than relying on shorthand naming.',
      },
      {
        q: 'Can I use CJC-1295 half-life figures for No DAC?',
        a: 'No. The multi-day figures in the cited human trial relate to its long-acting preparation. They do not describe this blend.',
      },
      {
        q: 'Why are these peptides combined?',
        a: 'They are associated with different growth hormone-release pathways. That offers a hypothesis to investigate, not proof of synergy or clinical benefit.',
      },
      {
        q: 'Has this exact blend been clinically proven?',
        a: 'The cited primary studies tested components or another CJC-1295 preparation. They do not validate the exact No DAC blend.',
      },
      {
        q: 'Does it contain HGH?',
        a: 'The named ingredients are growth hormone secretagogues or releasing-hormone analogues, not growth hormone itself.',
      },
      {
        q: 'Does research prove better sleep or muscle growth?',
        a: 'Hormonal responses alone do not prove either outcome. Those claims require direct studies measuring sleep or body composition with appropriate controls.',
      },
      {
        q: 'Where can I find CJC-1295 No DAC + Ipamorelin Blend research papers?',
        a: 'Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.',
      },
    ],
    related: [
      { label: 'Ipamorelin', slug: 'ipamorelin', kind: 'research' },
      { label: 'Tesamorelin', slug: 'tesamorelin', kind: 'research' },
    ],
    status: 'published',
    author_name: null,
    published_at: '2026-10-07T00:00:00.000Z',
  },
];

/** Core compound pages + DocumentContent developer handoffs. */
export const RESEARCH_SEED_ARTICLES: ResearchArticleInput[] = [
  ...RESEARCH_CORE_SEED_ARTICLES,
  ...RESEARCH_HANDOFF_SEED_ARTICLES,
];
