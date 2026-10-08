import type { ResearchArticleInput } from '@/lib/research-articles';

/** Seed articles parsed from DocumentContent developer handoffs (2026-10-08). */
export const RESEARCH_HANDOFF_SEED_ARTICLES: ResearchArticleInput[] = [
  {
    slug: "5-amino-1mq",
    name: "5-Amino-1MQ",
    category: "Small Molecules / Metabolic Research",
    product_slug: "5-amino-1mq",
    card_title: "What Is 5-Amino-1MQ?",
    card_description: "5-Amino-1MQ is a small-molecule inhibitor of nicotinamide N-methyltransferase, or NNMT.",
    seo_title: "5-Amino-1MQ Research Overview | PEPLAB",
    seo_description: "Explore 5-Amino-1MQ research on NNMT inhibition, adipose tissue and metabolic outcomes in mice, with evidence limits, FAQs and testing guidance.",
    eyebrow: "Small Molecules / Metabolic Research",
    h1: "5-Amino-1MQ Research Overview",
    subtitle: "NNMT Inhibition and Metabolic Research",
    intro: `5-Amino-1MQ is a small-molecule inhibitor of nicotinamide N-methyltransferase, or NNMT. It is studied in cellular and animal models of metabolism and obesity. Despite sometimes appearing in peptide catalogues, it is not a peptide, and the cited mouse findings do not establish human weight-loss efficacy.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is 5-Amino-1MQ?",
    what_is_body: "The name refers to 5-amino-1-methylquinolinium. Publications also use abbreviations such as 5A1MQ. Because a supplied material can include a counterion, the chemical specification and reporting basis matter when interpreting molecular mass and quantity.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "5-Amino-1MQ",
      },
      {
        feature: "Chemical name",
        details: "5-amino-1-methylquinolinium",
      },
      {
        feature: "Compound type",
        details: "Small molecule, not a peptide",
      },
      {
        feature: "Research target",
        details: "Nicotinamide N-methyltransferase",
      },
      {
        feature: "Evidence discussed",
        details: "Biochemical, cellular and mouse experiments",
      },
    ],
    mechanism_heading: "How Does 5-Amino-1MQ Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "NNMT Activity",
        body: "NNMT participates in nicotinamide methylation. Inhibiting the enzyme can affect connected metabolic pathways, but a biochemical target effect is not equivalent to a clinical benefit.",
      },
      {
        title: "Adipose Tissue Research",
        body: "Experiments examine fat-cell metabolism, adiposity and metabolic measurements in diet-induced obesity. Outcomes depend on the animal model, diet and treatment conditions.",
      },
      {
        title: "Nicotinamide and NAD Pathways",
        body: "NNMT research intersects with nicotinamide metabolism. That relationship does not make 5-Amino-1MQ identical to NAD+, a NAD precursor or a proven way to increase energy in people.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "5-Amino-1MQ Research Findings",
    findings_sections: [
      {
        title: "Early Inhibitor Study",
        body: "A 2017 publication characterised selective NNMT inhibitors and tested 5-amino-1MQ in diet-induced obese mice. The study reported changes in weight and fat-related measures. These are preclinical findings and do not provide a human weight-loss percentage.",
        link_label: "Read the inhibitor study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/29155147/",
      },
      {
        title: "Diet and Metabolic Context",
        body: "A 2021 mouse study investigated NNMT inhibition alongside a reduced-calorie diet. It assessed body composition, liver physiology and adipose-tissue metabolites. Dietary changes and drug effects must be interpreted within the experimental design.",
        link_label: "Read the diet-combination study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/33707534/",
      },
      {
        title: "Later Preclinical Research",
        body: "A 2024 study further examined body composition, metabolic variables, liver pathology, pharmacokinetics and tissue distribution in obese mice. It adds preclinical characterisation rather than a clinical test of effectiveness or safety in humans.",
        link_label: "Read the later study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/39161060/",
      },
    ],
    glance_rows: [
      {
        area: "Enzyme inhibition",
        investigated: "NNMT activity in assays",
        distinction: "Target engagement is not clinical efficacy",
      },
      {
        area: "Mouse obesity",
        investigated: "Body composition and metabolism",
        distinction: "Species and diet limit translation",
      },
      {
        area: "Drug exposure",
        investigated: "Pharmacokinetics and distribution",
        distinction: "Mouse data do not define a human regimen",
      },
    ],
    safety_body: `The cited studies do not establish human clinical effectiveness, long-term safety or a safe personal-use regimen. Mouse experiments cannot reliably predict uncommon human adverse effects, drug interactions or the consequences of sustained NNMT inhibition.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding 5-Amino-1MQ Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Use methods appropriate for a small molecule. Confirm the chemical identity, counterion and quantitative reporting basis. A stated amount may refer to the complete salt or the active molecular component; the report should make this explicit. Peptide-specific assumptions should not replace a validated assay.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "Is 5-Amino-1MQ a peptide?",
        a: "No. It is a small molecule.",
      },
      {
        q: "What does NNMT stand for?",
        a: "Nicotinamide N-methyltransferase, the enzyme targeted in this research.",
      },
      {
        q: "Are the weight findings from human trials?",
        a: "The studies summarised here concern laboratory systems and mice.",
      },
      {
        q: "Is it the same as NAD+?",
        a: "No. They are different molecules with different roles.",
      },
      {
        q: "Does this research prove a noticeable energy boost?",
        a: "No. The cited studies do not establish that subjective outcome in people.",
      },
      {
        q: "Why does the salt form matter?",
        a: "The counterion affects total molecular mass and how quantitative content should be reported.",
      },
      {
        q: "Where can I find 5-Amino-1MQ research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "aod-9604",
    name: "AOD-9604",
    category: "Metabolic Peptides / Lipid Research",
    product_slug: "aod-9604",
    card_title: "What Is AOD-9604?",
    card_description: "AOD-9604 is a synthetic peptide developed from a modified region of human growth hormone and studied for fat metabolism.",
    seo_title: "AOD-9604 Research Overview | PEPLAB",
    seo_description: "Explore AOD-9604 research on fat metabolism, animal studies and human trial findings, with evidence limitations, FAQs and compound testing guidance.",
    eyebrow: "Metabolic Peptides / Lipid Research",
    h1: "AOD-9604 Research Overview",
    subtitle: "Growth Hormone Fragment and Fat Metabolism Research",
    intro: `AOD-9604 is a synthetic peptide developed from a modified region of human growth hormone and studied for fat metabolism. Early animal findings led to human obesity trials. The larger clinical programme did not establish the weight-loss benefit suggested by the preclinical rationale.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is AOD-9604?",
    what_is_body: "AOD-9604 is a 16-amino-acid peptide based on the C-terminal region of human growth hormone. It is not intact HGH and should not be treated as interchangeable with every product described as an HGH fragment. Exact sequence and structure determine the identity.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "AOD-9604",
      },
      {
        feature: "Compound type",
        details: "Synthetic growth-hormone-fragment analogue",
      },
      {
        feature: "Peptide length",
        details: "16 amino acids",
      },
      {
        feature: "Research areas",
        details: "Lipid metabolism and body weight",
      },
      {
        feature: "Evidence base",
        details: "Animal studies and historical human clinical trials",
      },
    ],
    mechanism_heading: "How Does AOD-9604 Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Lipid Metabolism",
        body: "Preclinical work examined fat breakdown and related metabolic responses. Increased lipolysis in an experimental system is not itself proof of sustained weight loss in people.",
      },
      {
        title: "Relationship to Growth Hormone",
        body: "The fragment was developed to explore selected metabolic actions separately from the full hormone. Its identity and evidence should be kept distinct from HGH replacement or growth-promoting claims.",
      },
      {
        title: "Translation to Clinical Benefit",
        body: "Body weight reflects multiple processes. Researchers need controlled human outcomes to determine whether an experimental metabolic effect produces a useful net change.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "AOD-9604 Research Findings",
    findings_sections: [
      {
        title: "Animal Metabolic Findings",
        body: "A study in obese Zucker rats examined AOD9604 and reported changes in weight gain and fat-related metabolism. These results provided a preclinical rationale; they were not measurements of human fat loss.",
        link_label: "Read the rat study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/11146367/",
      },
      {
        title: "Larger Obesity Trial Result",
        body: "In its February 2007 results announcement, the developer reported that the Phase 2B weight-loss differences versus placebo were too small to reach statistical significance. This sponsor report is a primary record of the programme outcome, rather than a peer-reviewed efficacy paper.",
        link_label: "Read the developer’s trial announcement",
        link_url: "https://announcements.asx.com.au/asxpdf/20070221/pdf/3111t0ww55jr72.pdf",
      },
      {
        title: "Human Safety Publication",
        body: "A 2013 paper summarised safety and tolerability across six clinical studies. The authors reported broadly similar tolerability to placebo under the tested conditions. Sponsor relationships were disclosed, and a safety assessment does not establish successful weight-loss treatment.",
        link_label: "Read the safety publication",
        link_url: "https://www.jofem.org/index.php/jofem/article/view/157/194",
      },
    ],
    glance_rows: [
      {
        area: "Animal metabolism",
        investigated: "Weight gain and lipid measures",
        distinction: "Not direct human weight-loss evidence",
      },
      {
        area: "Human efficacy",
        investigated: "Placebo-controlled obesity programme",
        distinction: "Larger trial did not establish benefit",
      },
      {
        area: "Human tolerability",
        investigated: "Study-specific safety assessments",
        distinction: "Does not validate every route or preparation",
      },
    ],
    safety_body: `The safety publication concerns particular formulations, routes and study durations. It cannot establish that all research preparations or personal-use practices have the same profile. Limited or negative efficacy findings remain relevant even when a study reports favourable tolerability.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding AOD-9604 Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Confirm the precise sequence, terminal chemistry and disulfide structure where specified. Distinguish AOD-9604 from other growth hormone fragments. Identity, purity, content and biological activity require their own measurements; none proves weight-loss effectiveness.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "Is AOD-9604 HGH?",
        a: "No. It is a short modified fragment analogue, not the full growth hormone protein.",
      },
      {
        q: "Has it been studied in people?",
        a: "Yes. Historical clinical research includes obesity and tolerability studies.",
      },
      {
        q: "Did the larger trial prove weight loss?",
        a: "The developer reported that differences from placebo did not reach statistical significance.",
      },
      {
        q: "Do animal fat-metabolism results predict human fat loss?",
        a: "No. Human clinical outcomes must be measured directly.",
      },
      {
        q: "Does a favourable safety report prove efficacy?",
        a: "No. Safety and efficacy are separate questions.",
      },
      {
        q: "Can findings for oral preparations validate another route?",
        a: "No. Changing route or formulation requires separate evidence on exposure and safety.",
      },
      {
        q: "Where can I find AOD-9604 research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "ara-290",
    name: "ARA-290",
    category: "Tissue Response / Neuropathy Research",
    product_slug: "ara-290",
    card_title: "What Is ARA-290?",
    card_description: "ARA-290, also known as cibinetide, is an erythropoietin-derived peptide investigated in tissue-protection and small fibre neuropathy research.",
    seo_title: "ARA-290 Research Overview | PEPLAB",
    seo_description: "Explore ARA-290 research on innate repair signalling and small fibre neuropathy, with pilot clinical findings, limitations, FAQs and COA guidance.",
    eyebrow: "Tissue Response / Neuropathy Research",
    h1: "ARA-290 Research Overview",
    subtitle: "Innate Repair Signalling and Small Fibre Research",
    intro: `ARA-290, also known as cibinetide, is an erythropoietin-derived peptide investigated in tissue-protection and small fibre neuropathy research. Early human studies have examined symptoms and nerve-fibre measurements in selected conditions. Those findings do not establish a general pain-relief or injury-healing treatment.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is ARA-290?",
    what_is_body: "ARA-290 is a short synthetic peptide designed around tissue-protective activity associated with erythropoietin, while separating it from stimulation of red blood cell production. Researchers study a proposed innate repair receptor pathway. It is distinct from erythropoietin and from BPC-157 or TB-500.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "ARA-290",
      },
      {
        feature: "Other name",
        details: "Cibinetide",
      },
      {
        feature: "Compound type",
        details: "Erythropoietin-derived peptide",
      },
      {
        feature: "Research pathway",
        details: "Innate repair receptor signalling",
      },
      {
        feature: "Clinical research area",
        details: "Small fibre neuropathy, including sarcoidosis-associated disease",
      },
    ],
    mechanism_heading: "How Does ARA-290 Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Tissue Response Signalling",
        body: "The proposed pathway involves tissue protection and inflammatory responses. A mechanistic rationale is a starting point for testing, not proof that all injured tissues respond similarly.",
      },
      {
        title: "Small Nerve Fibres",
        body: "Small sensory and autonomic nerve fibres are involved in pain, sensation and autonomic functions. Research can measure both symptoms and structural markers such as corneal nerve-fibre density.",
      },
      {
        title: "Different Kinds of Evidence",
        body: "Changes in a symptom score and changes in an imaging measurement describe different outcomes. Neither alone establishes durable restoration of nerve function across diseases.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "ARA-290 Research Findings",
    findings_sections: [
      {
        title: "Randomised Pilot Study",
        body: "A 2012 double-blind pilot study examined ARA-290 in sarcoidosis patients with small fibre neuropathy symptoms. It reported a signal of symptom improvement and short-term tolerability that supported further study. The small pilot design limits broad conclusions.",
        link_label: "Read the pilot trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/23168581/",
      },
      {
        title: "Nerve Fibre Measurements",
        body: "A later placebo-controlled study reported changes in symptoms and corneal nerve-fibre density in sarcoidosis-associated small nerve-fibre loss. Corneal imaging is a particular measurement; it is not proof of regeneration throughout the nervous system.",
        link_label: "Read the clinical study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/24136731/",
      },
      {
        title: "Interpreting the Research Population",
        body: `These studies concern a defined sarcoidosis-associated condition. Their results cannot automatically be extended to sports injuries, back pain, fibromyalgia or every cause of neuropathy. Each condition needs evidence matching the population and outcome.

Review the study population.`,
      },
    ],
    glance_rows: [
      {
        area: "Symptoms",
        investigated: "Neuropathy-related questionnaires",
        distinction: "Small condition-specific studies",
      },
      {
        area: "Nerve structure",
        investigated: "Corneal nerve-fibre density",
        distinction: "Not proof of whole-body regeneration",
      },
      {
        area: "Mechanism",
        investigated: "Tissue-protective signalling",
        distinction: "Not interchangeable with erythropoietin",
      },
    ],
    safety_body: `Early trials provide limited short-term safety information. They cannot exclude uncommon effects or establish long-term safety across other populations. Absence of a major problem in a small trial should not be presented as evidence that ARA-290 is risk-free or suitable for unsupervised use.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding ARA-290 Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Confirm the ARA-290 sequence and distinguish it from erythropoietin or other tissue-protective peptides. Mass and purity results alone do not establish activity at the proposed receptor or reproduce the clinical trial preparation.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "What is cibinetide?",
        a: "Cibinetide is another name for ARA-290.",
      },
      {
        q: "Is ARA-290 the same as erythropoietin?",
        a: "No. It is a distinct peptide designed around a tissue-protective research rationale.",
      },
      {
        q: "Has it been studied in humans?",
        a: "Yes. Early studies include patients with sarcoidosis-associated small fibre neuropathy.",
      },
      {
        q: "Does corneal nerve density prove all nerves regenerate?",
        a: "No. It is a specific structural measurement.",
      },
      {
        q: "Is ARA-290 proven for every type of pain?",
        a: "No. Condition-specific findings do not establish a general pain treatment.",
      },
      {
        q: "Is it equivalent to BPC-157 or TB-500?",
        a: "No. These are different molecules with different research programmes.",
      },
      {
        q: "Where can I find ARA-290 research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "bpc-157",
    name: "BPC-157",
    category: "Tissue Repair / Experimental Peptides",
    product_slug: "bpc-157",
    card_title: "What Is BPC-157?",
    card_description: "BPC-157 is an experimental 15-amino-acid peptide studied in tissue-injury models and cellular responses associated with repair.",
    seo_title: "BPC-157 Research: Tissue Repair & Evidence | PEPLAB",
    seo_description: "Explore BPC-157 research on tendon cells, vascular signalling and tissue injury, with original studies, human-evidence limitations and COA guidance.",
    eyebrow: "Tissue Repair / Experimental Peptides",
    h1: "BPC-157 Research Overview",
    subtitle: "Tendon, Vascular and Tissue-Response Research",
    intro: `BPC-157 is an experimental 15-amino-acid peptide studied in tissue-injury models and cellular responses associated with repair. Much of the published mechanistic evidence comes from laboratory and animal work. This page reviews selected studies and explains why these findings should not be presented as proof of reliable injury healing in people.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is BPC-157?",
    what_is_body: "BPC-157 is a synthetic pentadecapeptide discussed in literature on a body-protection compound associated with gastric biology. The abbreviation is an identifier, not a demonstrated clinical outcome. Researchers have explored tendon-cell behaviour, blood-vessel signalling and tissue responses using several experimental models.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "BPC-157",
      },
      {
        feature: "Alternative notation",
        details: "BPC 157",
      },
      {
        feature: "Compound type",
        details: "Synthetic peptide",
      },
      {
        feature: "Peptide length",
        details: "15 amino acids",
      },
      {
        feature: "Research areas",
        details: "Tendon biology, vascular signalling and tissue injury",
      },
      {
        feature: "Evidence base",
        details: "Predominantly preclinical; small uncontrolled human reports",
      },
    ],
    mechanism_heading: "How Does BPC-157 Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Tendon-Cell Behaviour",
        body: "Researchers have studied how tendon fibroblasts move and respond to stress. These measurements can help generate hypotheses about tissue repair.",
      },
      {
        title: "Vascular Signalling",
        body: "Experiments have examined VEGFR2-related pathways and blood-vessel responses. Angiogenesis means formation of blood vessels; it is not itself proof of safe or effective treatment.",
      },
      {
        title: "From Mechanism to Outcome",
        body: "A biological pathway can respond without producing a meaningful clinical benefit. Imaging, function, symptoms and adverse events require separate assessment in controlled human studies.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "BPC-157 Research Findings",
    findings_sections: [
      {
        title: "Tendon Explants and Fibroblasts",
        body: "A 2011 study reported BPC-157-related changes in rat tendon explants and fibroblasts, including migration and stress survival. These experimental results did not demonstrate repair of a human tendon tear.",
        link_label: "Read the tendon-cell study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/21030672/",
      },
      {
        title: "Vascular Injury Models",
        body: "A 2017 publication investigated BPC-157 in experimental vascular models and reported VEGFR2-related effects. Cell and animal results support further investigation, but they do not establish how a human injury will respond or whether long-term exposure is safe.",
        link_label: "Read the vascular-signalling study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/27847966/",
      },
      {
        title: "Human Knee-Pain Observations",
        body: "A 2021 retrospective report described patient-reported outcomes after BPC-157, with some patients receiving a combination with TB4. Its small size, lack of randomisation and absence of a control group limit causal conclusions. Reduced reported pain is not direct evidence of new cartilage or structural tendon repair.",
        link_label: "Read the knee-pain report",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/34324435/",
      },
    ],
    glance_rows: [
      {
        area: "Tendon biology",
        investigated: "Cell migration and stress responses",
        distinction: "Laboratory findings are not human healing outcomes",
      },
      {
        area: "Vascular research",
        investigated: "VEGFR2-related experimental effects",
        distinction: "Mechanism does not establish clinical benefit",
      },
      {
        area: "Human observations",
        investigated: "Retrospective pain reports",
        distinction: "No controlled proof of structural repair",
      },
    ],
    safety_body: `The available studies do not establish comprehensive long-term human safety or a validated regimen for self-treatment. A high-purity laboratory result does not resolve uncertainties about clinical effectiveness, adverse effects or long-term human safety.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding BPC-157 Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified analyte or each blend component.

Check the sample or batch identifier, laboratory, testing date, methods and assay basis. Only describe a property as verified when the report includes a suitable measurement.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "What is BPC-157 being researched for?",
        a: "Research includes tendon-cell behaviour, vascular responses and experimental tissue injury. The strength of evidence differs across models and outcomes.",
      },
      {
        q: "Has BPC-157 been studied in humans?",
        a: "Small human reports exist, including a retrospective knee-pain series. They are not equivalent to large, well-controlled clinical trials.",
      },
      {
        q: "Does BPC-157 regrow cartilage?",
        a: "The cited studies do not establish cartilage regeneration in humans. Patient-reported pain improvement does not demonstrate structural regrowth.",
      },
      {
        q: "Is BPC-157 a growth hormone peptide?",
        a: "It is not growth hormone and is not established here as a GHRH or ghrelin-receptor agonist. Its research concerns other experimental pathways.",
      },
      {
        q: "Is BPC-157 the same as TB-500?",
        a: "No. They are different peptide materials. Their names, identity and evidence should be evaluated separately.",
      },
      {
        q: "Is a blend automatically better than BPC-157 alone?",
        a: "No. More ingredients do not establish improved effectiveness. A combination needs evidence for its exact composition and use.",
      },
      {
        q: "Where can I find BPC-157 research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "BPC-157 + TB-500 Blend",
        slug: "bpc-157-tb-500",
        kind: "research",
      },
      {
        label: "GLOW Blend",
        slug: "glow",
        kind: "research",
      },
      {
        label: "KLOW Blend",
        slug: "klow",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "cjc-1295-dac",
    name: "CJC-1295 DAC",
    category: "Ghrh Analogues / Endocrine Research",
    product_slug: "cjc-1295-dac",
    card_title: "What Is CJC-1295 DAC?",
    card_description: "CJC-1295 DAC is a long-acting growth hormone-releasing hormone analogue studied for its effects on growth hormone and insulin-like growth factor-1.",
    seo_title: "CJC-1295 DAC Research Overview | PEPLAB",
    seo_description: "Explore CJC-1295 DAC research on albumin binding, growth hormone and IGF-1, with human study findings, evidence limits, FAQs and COA guidance.",
    eyebrow: "Ghrh Analogues / Endocrine Research",
    h1: "CJC-1295 DAC Research Overview",
    subtitle: "Albumin Binding and Growth Hormone Research",
    intro: `CJC-1295 DAC is a long-acting growth hormone-releasing hormone analogue studied for its effects on growth hormone and insulin-like growth factor-1. Its albumin-binding modification distinguishes it from materials described as CJC-1295 No DAC. Published hormone responses are evidence of biological activity, rather than proof of better sleep, recovery or muscle growth.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is CJC-1295 DAC?",
    what_is_body: "CJC-1295 was developed by modifying a growth hormone-releasing factor peptide and adding a reactive group that enables binding to albumin in the bloodstream. DAC refers to this drug-affinity modification. The long-acting molecule in the cited human trials should be distinguished from the non-DAC analogue.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "CJC-1295 DAC",
      },
      {
        feature: "Compound type",
        details: "Modified GHRH analogue peptide",
      },
      {
        feature: "Defining feature",
        details: "Albumin-binding modification",
      },
      {
        feature: "Research targets",
        details: "GHRH receptor and the GH–IGF-1 axis",
      },
      {
        feature: "Evidence discussed",
        details: "Preclinical development and short human trials",
      },
    ],
    mechanism_heading: "How Does CJC-1295 DAC Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Pituitary Signalling",
        body: "GHRH receptor activation stimulates growth hormone release from the pituitary. This differs from administering growth hormone itself.",
      },
      {
        title: "Albumin Binding",
        body: "Binding to albumin extends exposure. Pharmacokinetics depend on the exact structure and preparation, so removing the DAC group changes the interpretation of duration data.",
      },
      {
        title: "Downstream Hormone Responses",
        body: "Growth hormone can increase circulating IGF-1. Researchers measure these hormones as biomarkers; changes in symptoms, body composition and function require separate outcome studies.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "CJC-1295 DAC Research Findings",
    findings_sections: [
      {
        title: "Preclinical Development",
        body: "A 2005 study investigated albumin-conjugating GRF analogues in rats and identified CJC-1295 as a long-acting candidate. This work supports the structural rationale, but animal activity alone does not establish a human clinical benefit.",
        link_label: "Read the development study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/15817669/",
      },
      {
        title: "Human Hormone Study",
        body: "Two randomised, placebo-controlled trials published in 2006 lasted 28 and 49 days. In healthy adults, the long-acting analogue produced sustained increases in GH and IGF-1. The estimated half-life was 5.8–8.1 days under the study conditions. These findings apply to the tested DAC-containing preparation.",
        link_label: "Read the human study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
      },
      {
        title: "Hormone Pulsatility",
        body: "A separate 2006 study used repeated overnight blood sampling in healthy men. GH secretion remained pulsatile during sustained stimulation by CJC-1295. Pulsatility is a physiological observation and does not establish better sleep or recovery.",
        link_label: "Read the pulsatility study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/17018654/",
      },
    ],
    glance_rows: [
      {
        area: "Drug exposure",
        investigated: "Duration of the DAC-containing analogue",
        distinction: "Not transferable to No DAC",
      },
      {
        area: "Hormones",
        investigated: "GH and IGF-1 concentrations",
        distinction: "Biomarkers are not functional benefits",
      },
      {
        area: "Secretion patterns",
        investigated: "GH pulses during sustained exposure",
        distinction: "Does not establish sleep improvement",
      },
    ],
    safety_body: `The early human trials reported no serious adverse reactions, but their short duration and selected participants limit conclusions about uncommon or long-term risks. Sustained endocrine effects require assessment beyond a single hormone measurement. The studies do not establish a safe personal-use regimen or equivalence with separately supplied research materials.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding CJC-1295 DAC Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Confirm the full peptide structure, DAC modification and expected molecular mass. An identity method must distinguish the albumin-binding analogue from modified GRF without DAC. Purity alone does not establish albumin-binding performance, biological activity or the amount present.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "What does DAC mean?",
        a: "It denotes the drug-affinity modification used to enable albumin binding and extend exposure.",
      },
      {
        q: "Is CJC-1295 DAC growth hormone?",
        a: "No. It is a GHRH analogue studied for stimulation of the body’s growth hormone release.",
      },
      {
        q: "Is it the same as CJC-1295 No DAC?",
        a: "No. The DAC modification changes the molecule and its exposure profile.",
      },
      {
        q: "Has it been studied in humans?",
        a: "Yes. Short controlled studies have measured hormone responses in healthy adults.",
      },
      {
        q: "Does a rise in IGF-1 prove muscle growth?",
        a: "No. Muscle size, strength and function are separate outcomes.",
      },
      {
        q: "Can the trial half-life be used for No DAC?",
        a: "No. The reported value concerns the long-acting DAC-containing study preparation.",
      },
      {
        q: "Where can I find CJC-1295 DAC research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "cjc-1295-no-dac",
    name: "CJC-1295 No DAC",
    category: "Ghrh Analogues / Endocrine Research",
    product_slug: "cjc-1295-no-dac",
    card_title: "What Is CJC-1295 No DAC?",
    card_description: "CJC-1295 No DAC is a research-market name commonly used for modified GRF (1–29), a growth hormone-releasing hormone analogue without the albumin-binding DAC group.",
    seo_title: "CJC-1295 No DAC Research Overview | PEPLAB",
    seo_description: "Explore CJC-1295 No DAC and modified GRF research, how it differs from DAC, GHRH signalling, evidence limitations and peptide identity testing.",
    eyebrow: "Ghrh Analogues / Endocrine Research",
    h1: "CJC-1295 No DAC Research Overview",
    subtitle: "Modified GRF and Growth Hormone Signalling Research",
    intro: `CJC-1295 No DAC is a research-market name commonly used for modified GRF (1–29), a growth hormone-releasing hormone analogue without the albumin-binding DAC group. Exact chemical identity matters because widely cited long-acting CJC-1295 human trials concern a different preparation.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is CJC-1295 No DAC?",
    what_is_body: "Modified GRF (1–29) is a 29-residue GHRH-related peptide with amino-acid substitutions intended to alter stability and activity. No DAC indicates the absence of the albumin-binding modification. A supplier name alone should not substitute for a documented sequence and terminal chemistry.",
    feature_rows: [
      {
        feature: "Research name",
        details: "CJC-1295 No DAC",
      },
      {
        feature: "Common associated name",
        details: "Modified GRF (1–29)",
      },
      {
        feature: "Compound type",
        details: "GHRH analogue peptide",
      },
      {
        feature: "Key distinction",
        details: "No albumin-binding DAC group",
      },
      {
        feature: "Research areas",
        details: "Receptor signalling and peptide stability",
      },
      {
        feature: "Evidence limitation",
        details: "DAC human trial results do not establish No DAC outcomes",
      },
    ],
    mechanism_heading: "How Does CJC-1295 No DAC Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "GHRH Receptor Activity",
        body: "The research rationale is stimulation of pituitary growth hormone release through the GHRH receptor. This is a different receptor pathway from ghrelin-receptor agonists such as ipamorelin.",
      },
      {
        title: "Sequence and Stability",
        body: "Changes to amino-acid sequence can affect degradation and receptor activity. The degree of change depends on the exact analogue and experimental system.",
      },
      {
        title: "Exposure and Outcome",
        body: "Removing an exposure-extending group changes the molecule. A shorter exposure profile does not automatically establish better physiological effects or fewer adverse events.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "CJC-1295 No DAC Research Findings",
    findings_sections: [
      {
        title: "Analogue Design Research",
        body: "A 2002 study examined modified GHRH peptides with increased resistance to enzymatic degradation and tested GH release in rats. It provides related analogue-design evidence, not a human trial validating every product labelled CJC-1295 No DAC.",
        link_label: "Read the analogue study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/12148777/",
      },
      {
        title: "Why the DAC Distinction Matters",
        body: "The 2005 CJC-1295 development paper examined albumin bioconjugates and receptor activity in rats. It explains the rationale for adding an exposure-extending modification and why the final molecule must be identified precisely.",
        link_label: "Read the development paper",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/15817669/",
      },
      {
        title: "Interpreting Human CJC-1295 Papers",
        body: "The 2006 controlled human publication investigated the long-acting CJC-1295 analogue. Its multi-day exposure and sustained hormone responses should not be presented as direct clinical evidence for modified GRF without DAC.",
        link_label: "Read the long-acting comparator study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/16352683/",
      },
    ],
    glance_rows: [
      {
        area: "Analogue design",
        investigated: "Stability and GH release",
        distinction: "Exact sequence and species matter",
      },
      {
        area: "DAC comparison",
        investigated: "Albumin-binding modification",
        distinction: "Different pharmacokinetic identity",
      },
      {
        area: "Human outcomes",
        investigated: "Often cited long-acting trials",
        distinction: "Not direct proof for No DAC",
      },
    ],
    safety_body: `The sources cited here do not establish comprehensive human safety or reliable sleep, recovery or body-composition benefits for the exact No DAC material. Related-peptide evidence cannot determine its rate of adverse events. Adding ipamorelin creates a separate combination question, including interactions and formulation stability.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding CJC-1295 No DAC Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Require a documented sequence, terminal chemistry and confirmation that the DAC modification is absent. Distinguish modified GRF from sermorelin, DAC-containing CJC-1295 and any blended preparation. Identity, quantitative content and functional activity are separate measurements.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "Is No DAC the same as modified GRF?",
        a: "The names are commonly associated, but the actual sequence and analytical specification should confirm the identity.",
      },
      {
        q: "Does No DAC contain the albumin-binding group?",
        a: "No. That absence is the distinction conveyed by the name.",
      },
      {
        q: "Is it identical to sermorelin?",
        a: "No. Modified GRF contains sequence changes relative to the unmodified GHRH fragment.",
      },
      {
        q: "Do CJC-1295 human trials automatically apply?",
        a: "No. Check whether the publication studied the long-acting DAC-containing analogue.",
      },
      {
        q: "Is a precise human half-life established here?",
        a: "No. The sources selected here do not establish a validated human half-life for the exact No DAC research material.",
      },
      {
        q: "Does this page validate a blend with ipamorelin?",
        a: "No. Evidence for the exact combination, ratio and preparation is needed separately.",
      },
      {
        q: "Where can I find CJC-1295 No DAC research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "cagrilintide",
    name: "Cagrilintide",
    category: "Amylin Analogues / Metabolic Research",
    product_slug: "cagrilintide",
    card_title: "What Is Cagrilintide?",
    card_description: "Cagrilintide is a long-acting amylin analogue studied for body-weight management.",
    seo_title: "Cagrilintide Research Overview | PEPLAB",
    seo_description: "Explore cagrilintide research on amylin signalling and body weight, including clinical findings, CagriSema distinctions, FAQs and testing guidance.",
    eyebrow: "Amylin Analogues / Metabolic Research",
    h1: "Cagrilintide Research Overview",
    subtitle: "Amylin Signalling and Body Weight Research",
    intro: `Cagrilintide is a long-acting amylin analogue studied for body-weight management. Human research includes cagrilintide alone and coadministration with semaglutide, a combination often called CagriSema. The single-agent and combination findings answer different questions.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is Cagrilintide?",
    what_is_body: "Amylin is a pancreatic hormone involved in satiety. Cagrilintide is a modified peptide developed to provide prolonged activity at amylin-related receptor systems. It is chemically and pharmacologically distinct from semaglutide, which is a GLP-1 receptor agonist.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Cagrilintide",
      },
      {
        feature: "Research code",
        details: "AM833",
      },
      {
        feature: "Compound type",
        details: "Long-acting amylin analogue peptide",
      },
      {
        feature: "Research areas",
        details: "Satiety, body weight and metabolic outcomes",
      },
      {
        feature: "Clinical context",
        details: "Single-agent and semaglutide combination trials",
      },
    ],
    mechanism_heading: "How Does Cagrilintide Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Amylin Pathways",
        body: "Cagrilintide was developed to engage amylin receptors. The discovery programme also characterised calcitonin-receptor activity; receptor profiles should be described using the exact experimental evidence.",
      },
      {
        title: "Satiety Research",
        body: "Amylin-related signalling participates in fullness and food-intake regulation. Clinical trials measure whether this rationale translates into changes in body weight and tolerability.",
      },
      {
        title: "Combination Research",
        body: "Cagrilintide and semaglutide act through different hormone systems. Combination efficacy needs direct testing and cannot be inferred simply by adding the effects of each agent.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "Cagrilintide Research Findings",
    findings_sections: [
      {
        title: "Discovery and Development",
        body: "A 2021 publication described the design and preclinical characterisation of long-acting cagrilintide. It explains the molecular development programme rather than predicting an individual weight-loss outcome.",
        link_label: "Read the discovery paper",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/34288673/",
      },
      {
        title: "Phase 2 Single-Agent Findings",
        body: "A 2021 trial randomised 706 adults with overweight or obesity without diabetes. At 26 weeks, the highest-dose cagrilintide group had a mean weight reduction of 10.8%, versus 3.0% with placebo, using the trial-product analysis that assumed treatment adherence. These are group averages under a defined protocol.",
        link_label: "Read the Phase 2 study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/34798060/",
      },
      {
        title: "Phase 3 Combination Research",
        body: "The 2025 REDEFINE 1 publication studied cagrilintide–semaglutide and included single-agent comparison groups. The headline combination-versus-placebo findings concern CagriSema; they must not be relabelled as results for cagrilintide alone. Study population, duration and analysis method matter when comparing trials.",
        link_label: "Read the REDEFINE 1 publication",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/40544433/",
      },
    ],
    glance_rows: [
      {
        area: "Single agent",
        investigated: "Weight change over 26 weeks",
        distinction: "Trial analysis and population matter",
      },
      {
        area: "Combination",
        investigated: "Cagrilintide with semaglutide",
        distinction: "Not the same as cagrilintide alone",
      },
      {
        area: "Mechanism",
        investigated: "Amylin-related receptor activity",
        distinction: "Not GLP-1 receptor agonism",
      },
    ],
    safety_body: `Common adverse events in the Phase 2 study included nausea, constipation, diarrhoea and administration-site reactions. Some participants stopped treatment because of adverse events. Trial findings relate to the study preparation and selected participants; they do not establish equivalent safety or performance for other materials.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding Cagrilintide Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Confirm the modified peptide structure and expected mass rather than treating native amylin as an interchangeable reference. Content testing should measure cagrilintide specifically. For a combination, each ingredient needs separate identification and quantification.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "Is cagrilintide a GLP-1 agonist?",
        a: "No. It is an amylin analogue; semaglutide is a GLP-1 receptor agonist.",
      },
      {
        q: "What is CagriSema?",
        a: "It is the name used for the cagrilintide–semaglutide combination studied in clinical trials.",
      },
      {
        q: "Has cagrilintide been studied alone?",
        a: "Yes. The cited Phase 2 trial evaluated cagrilintide alone alongside comparator groups.",
      },
      {
        q: "What does the 10.8% result mean?",
        a: "It is the mean reduction at 26 weeks in the highest-dose Phase 2 group under the trial-product analysis, not a guaranteed outcome.",
      },
      {
        q: "Can combination results be assigned to cagrilintide alone?",
        a: "No. The combination and individual agents require separate interpretation.",
      },
      {
        q: "Are results directly comparable with retatrutide trials?",
        a: "Separate trials differ in population, duration and analysis. A direct comparison requires an appropriate head-to-head design.",
      },
      {
        q: "Where can I find Cagrilintide research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "epitalon",
    name: "Epitalon",
    category: "Cellular Ageing / Telomere Research",
    product_slug: "epitalon",
    card_title: "What Is Epitalon?",
    card_description: "Epitalon, also written Epithalon, is a synthetic tetrapeptide studied in cellular ageing and telomere research.",
    seo_title: "Epitalon Research Overview | PEPLAB",
    seo_description: "Explore Epitalon research on telomerase, telomeres and cellular ageing, with laboratory evidence, key distinctions, FAQs and analytical testing guidance.",
    eyebrow: "Cellular Ageing / Telomere Research",
    h1: "Epitalon Research Overview",
    subtitle: "Tetrapeptide and Telomerase Research",
    intro: `Epitalon, also written Epithalon, is a synthetic tetrapeptide studied in cellular ageing and telomere research. Published experiments include human cells grown in culture. These laboratory findings are distinct from evidence that a compound extends human lifespan or reverses ageing.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is Epitalon?",
    what_is_body: "Epitalon has the four-amino-acid sequence Ala–Glu–Asp–Gly. It should be distinguished from Epithalamin, a pineal-derived preparation discussed in related literature. Similar names do not establish identical composition or allow findings to be transferred between the preparations.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Epitalon",
      },
      {
        feature: "Alternative spelling",
        details: "Epithalon",
      },
      {
        feature: "Compound type",
        details: "Synthetic tetrapeptide",
      },
      {
        feature: "Sequence",
        details: "Ala–Glu–Asp–Gly",
      },
      {
        feature: "Research areas",
        details: "Telomerase, telomeres and cell proliferation",
      },
      {
        feature: "Key distinction",
        details: "Cellular findings versus human lifespan outcomes",
      },
    ],
    mechanism_heading: "How Does Epitalon Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Telomerase Research",
        body: "Telomerase can maintain telomeric DNA at chromosome ends. Experiments investigate whether Epitalon changes components or activity of this system in particular cells.",
      },
      {
        title: "Cellular Proliferation",
        body: "Researchers also measure how many times a cell population divides. Extended proliferation in culture is not the same outcome as healthier ageing in an organism.",
      },
      {
        title: "Context Matters",
        body: "Telomere regulation has different implications in normal and abnormal cells. A longer telomere measurement alone does not establish a favourable net effect on human health.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "Epitalon Research Findings",
    findings_sections: [
      {
        title: "Early Human Cell Experiment",
        body: "A 2003 study reported telomerase activation and telomere elongation in cultured human fetal fibroblasts after Epithalon exposure. The experiment involved cells, not people receiving a longevity treatment.",
        link_label: "Read the telomerase study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/12937682/",
      },
      {
        title: "Cell Division Research",
        body: "A 2004 study investigated proliferative capacity in human fetal fibroblasts after Epithalon exposure. It extended the laboratory research question, but did not measure lifespan, disease prevention or functional ageing in humans.",
        link_label: "Read the cell-division study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/15455129/",
      },
      {
        title: "How to Interpret Longevity Claims",
        body: `The distinction between a cellular endpoint and a clinical outcome is essential. Demonstrating a change in telomerase or division capacity cannot, by itself, establish longer life, improved sleep or reversal of biological age.

Review the original experimental setting.`,
      },
    ],
    glance_rows: [
      {
        area: "Telomeres",
        investigated: "Length and telomerase activity",
        distinction: "Cultured human cells are not a human trial",
      },
      {
        area: "Proliferation",
        investigated: "Cell division capacity",
        distinction: "Does not establish healthier ageing",
      },
      {
        area: "Longevity claims",
        investigated: "Translation to clinical outcomes",
        distinction: "Requires direct human outcome evidence",
      },
    ],
    safety_body: `The cited cell experiments do not establish comprehensive human safety or a validated longevity benefit. Effects on cell proliferation and telomere maintenance require careful interpretation, including possible consequences in different cell types. A high-purity result cannot resolve these biological uncertainties.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding Epitalon Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Confirm the four-residue sequence and distinguish Epitalon from an extract or differently modified analogue. Verify terminal chemistry, identity and quantitative peptide content. Biological activity cannot be inferred solely from chromatographic purity.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "Is Epitalon a peptide?",
        a: "Yes. It is a tetrapeptide with four amino-acid residues.",
      },
      {
        q: "Are Epitalon and Epithalon different names?",
        a: "They are alternative spellings used for this peptide in research literature.",
      },
      {
        q: "Is Epithalamin identical to Epitalon?",
        a: "No. A pineal-derived preparation and a defined synthetic tetrapeptide are different materials.",
      },
      {
        q: "Do human cell studies count as human treatment trials?",
        a: "No. Experiments on cultured human cells are laboratory studies.",
      },
      {
        q: "Does telomere elongation prove longer life?",
        a: "No. Human lifespan and health outcomes need direct evidence.",
      },
      {
        q: "Does this evidence establish improved sleep?",
        a: "The telomerase and cell-division experiments summarised here do not establish a sleep benefit.",
      },
      {
        q: "Where can I find Epitalon research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "glow",
    name: "GLOW Blend",
    category: "Peptide Blends / Skin & Tissue Research",
    product_slug: "glow",
    card_title: "What Is GLOW Blend?",
    card_description: "GLOW is PEPLAB’s 70 mg blend containing GHK-Cu 50 mg, BPC-157 10 mg and TB-500 10 mg.",
    seo_title: "GLOW Blend Research: Formula & Component Evidence | PEPLAB",
    seo_description: "Explore the GLOW 70 mg blend of GHK-Cu, BPC-157 and TB-500, with component research, formula details, evidence limitations and COA guidance.",
    eyebrow: "Peptide Blends / Skin & Tissue Research",
    h1: "GLOW Blend Research Overview",
    subtitle: "Three-Component Formula and Connective-Tissue Research",
    intro: `GLOW is PEPLAB’s 70 mg blend containing GHK-Cu 50 mg, BPC-157 10 mg and TB-500 10 mg. The ingredients appear in research discussions about connective tissue and responses to injury. This overview explains the formula and the evidence for its components while distinguishing that literature from research on the finished blend.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is GLOW Blend?",
    what_is_body: "GLOW is a product name for a mixture rather than a single peptide. The name does not establish cosmetic effectiveness. Its components differ in molecular structure and evidence base, and the TB-500 material needs sequence-level identification to determine which thymosin-related studies are relevant.",
    feature_rows: [
      {
        feature: "Blend name",
        details: "GLOW",
      },
      {
        feature: "GHK-Cu",
        details: "50 mg",
      },
      {
        feature: "BPC-157",
        details: "10 mg",
      },
      {
        feature: "TB-500",
        details: "10 mg; confirm exact molecular identity",
      },
      {
        feature: "Total stated content",
        details: "70 mg",
      },
      {
        feature: "Compound type",
        details: "Three-component mixture",
      },
      {
        feature: "Evidence base",
        details: "Individual-component literature; no controlled study of this exact blend identified in the reviewed sources",
      },
    ],
    mechanism_heading: "How Does GLOW Blend Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "GHK-Cu and Matrix Biology",
        body: "GHK-Cu is a copper-peptide complex investigated in collagen and extracellular matrix research. These areas concern tissue structure and remodelling.",
      },
      {
        title: "BPC-157 and Cellular Responses",
        body: "BPC-157 has been examined in injury-related laboratory models. Those experiments do not establish skin rejuvenation from the GLOW formula.",
      },
      {
        title: "Thymosin-Related Identity",
        body: "Full-length thymosin beta-4 differs from the shorter fragment identified in some TB-500 material. The actual molecule determines which mechanisms can reasonably be discussed.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "GLOW Blend Research Findings",
    findings_sections: [
      {
        title: "Collagen Research",
        body: "A 1988 fibroblast study reported a collagen-synthesis response to GHK-Cu. It tested a component in a laboratory system, not the GLOW mixture or visible cosmetic results in people.",
        link_label: "Read the GHK-Cu collagen study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/3169264/",
      },
      {
        title: "Human Skin Evidence for a Component",
        body: "A small 2006 post-laser trial of GHK-Cu-containing skin-care products found no objective between-group improvement on assessed skin outcomes, although patient satisfaction differed. It used topical products and did not study this blend.",
        link_label: "Read the topical GHK-Cu study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/16847171/",
      },
      {
        title: "Tissue Research and Identity",
        body: "BPC-157 has preclinical tissue-response literature, while analytical work on TB-500 illustrates why the supplied sequence matters. Neither line of evidence validates the three-component GLOW formula. A study of the finished mixture would need a documented ratio, suitable control and endpoints relevant to the proposed claim.",
        link_label: "Read the BPC-157 vascular study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/27847966/",
      },
    ],
    glance_rows: [
      {
        area: "Collagen",
        investigated: "GHK-Cu in cell cultures",
        distinction: "Not proof of visible skin changes from GLOW",
      },
      {
        area: "Human skin",
        investigated: "Specific topical GHK-Cu preparations",
        distinction: "Route and formulation differ from a research blend",
      },
      {
        area: "Combined formula",
        investigated: "Three declared ingredients",
        distinction: "Synergy and finished-product effects need direct study",
      },
    ],
    safety_body: `The name GLOW does not establish an anti-ageing or cosmetic outcome. Evidence from topical GHK-Cu cannot establish safety or effectiveness of an injectable mixture, and tissue-repair hypotheses cannot establish scar removal or skin tightening. The exact blend requires its own analytical and stability assessment. A greater total powder amount is not evidence of a greater clinical effect.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding GLOW Blend Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified analyte or each blend component.

The declared mass ratio is 5:1:1 for GHK-Cu:BPC-157:TB-500. Verify the identity and amount of each component in the finished mixture, not only in the raw materials. Suitable testing should account for the copper complex and identify the precise TB-500 sequence. A single chromatographic peak or summed purity number cannot prove all three contents.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "What is in GLOW?",
        a: "PEPLAB’s stated formula is GHK-Cu 50 mg, BPC-157 10 mg and TB-500 10 mg, totalling 70 mg.",
      },
      {
        q: "Does GLOW contain KPV?",
        a: "This 70 mg GLOW formula does not list KPV. PEPLAB’s 80 mg KLOW formula adds 10 mg of KPV to the same three stated amounts.",
      },
      {
        q: "Is GLOW proven to improve skin?",
        a: "The component references do not establish the effectiveness of this exact blend for skin appearance. A product name is not clinical evidence.",
      },
      {
        q: "Is GLOW the same as GHK-Cu?",
        a: "No. GLOW includes GHK-Cu plus two additional peptide materials. A GHK-Cu study is not a study of GLOW.",
      },
      {
        q: "Does the 70 mg total show the ingredient ratio?",
        a: "The declared amounts give a 5:1:1 mass ratio. Actual batch content still requires suitable quantitative testing.",
      },
      {
        q: "Can the components’ benefits simply be added together?",
        a: "No. Combined biological effects, compatibility and adverse effects require direct study. Separate positive findings do not establish additive benefit.",
      },
      {
        q: "Where can I find GLOW Blend research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "KLOW Blend",
        slug: "klow",
        kind: "research",
      },
      {
        label: "GHK-Cu",
        slug: "ghk-cu",
        kind: "research",
      },
      {
        label: "BPC-157",
        slug: "bpc-157",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "hcg",
    name: "HCG",
    category: "Gonadotropins / Reproductive Endocrinology",
    product_slug: "hcg",
    card_title: "What Is HCG?",
    card_description: "Human chorionic gonadotropin, commonly written HCG or hCG, is a glycoprotein hormone involved in reproductive biology.",
    seo_title: "HCG Research: Hormone Signalling & Fertility | PEPLAB",
    seo_description: "Explore HCG research on reproductive hormone signalling, intratesticular testosterone and fertility, with human studies, evidence limits and potency testing.",
    eyebrow: "Gonadotropins / Reproductive Endocrinology",
    h1: "HCG Research Overview",
    subtitle: "Human Chorionic Gonadotropin and Reproductive Research",
    intro: `Human chorionic gonadotropin, commonly written HCG or hCG, is a glycoprotein hormone involved in reproductive biology. Research examines its effects on testicular hormone production, ovarian responses and fertility-related outcomes. It is distinct from human growth hormone, or HGH.

This page reviews selected human studies and explains why hormone measurements, fertility outcomes and product potency are separate questions. Visit PEPLAB’s Research Overview for guidance on evaluating scientific evidence.`,
    what_is_heading: "What Is HCG?",
    what_is_body: `HCG contains alpha and beta protein subunits with attached carbohydrate groups. Its activity resembles that of luteinising hormone, or LH. HCG preparations can differ in source, manufacturing process and formulation; urinary-derived and recombinant products should be identified accurately.

Scientific background: HCG medicinal pharmacology.`,
    feature_rows: [
      {
        feature: "Compound name",
        details: "Human chorionic gonadotropin",
      },
      {
        feature: "Common abbreviations",
        details: "HCG; hCG",
      },
      {
        feature: "Compound type",
        details: "Glycoprotein hormone",
      },
      {
        feature: "Main receptor system",
        details: "Luteinising hormone / chorionic gonadotropin receptor",
      },
      {
        feature: "Research areas",
        details: "Gonadal hormone production, ovarian maturation and fertility",
      },
      {
        feature: "Common potency expression",
        details: "International units, or IU",
      },
      {
        feature: "Evidence base",
        details: "Human endocrine studies and reproductive-medicine trials",
      },
    ],
    mechanism_heading: "How Does HCG Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "LH-Like Signalling",
        body: "HCG activates the LH/CG receptor system. Its effects depend on the responding tissue and hormonal setting. It is not equivalent to supplying testosterone directly.",
      },
      {
        title: "Testicular Hormone Production",
        body: "Researchers measure intratesticular testosterone to investigate testicular responses to HCG. This is testosterone within the testes, a different measurement from circulating testosterone in blood. A change in either measurement does not by itself establish fertility or symptom improvement.",
      },
      {
        title: "Ovarian Responses",
        body: "Reproductive-medicine studies investigate HCG as part of protocols for final follicular maturation. Those protocols involve other interventions and monitoring, so a result cannot be attributed to HCG alone or generalised to every fertility problem.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "HCG Research Findings",
    findings_sections: [
      {
        title: "Intratesticular Testosterone Research",
        body: `A 2005 study in The Journal of Clinical Endocrinology & Metabolism investigated HCG during testosterone-induced suppression of gonadotropins in men. It reported preservation of intratesticular testosterone under specific experimental conditions.

This study helps explain endocrine physiology. It does not establish guaranteed preservation of fertility or validate a self-directed hormone regimen.`,
        link_label: "Read the intratesticular testosterone study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/15713727/",
      },
      {
        title: "Experimental Gonadotropin Deficiency",
        body: `A 2010 randomised study enrolled 37 healthy men with experimentally induced gonadotropin deficiency. Investigators measured hormones in testicular fluid and blood over ten days and found a dose-related intratesticular testosterone response to HCG.

The short study examined hormonal regulation. It was not designed to demonstrate pregnancy rates, long-term safety or improved wellbeing.`,
        link_label: "Read the 2010 hormone-response study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/20484472/",
      },
      {
        title: "Assisted Reproduction and Formulation Comparisons",
        body: `A 2001 clinical trial in Fertility and Sterility compared recombinant and urinary-derived HCG preparations for final follicular maturation during IVF treatment. Mean numbers of retrieved oocytes were similar across the studied groups.

This is evidence from specific preparations within a controlled reproductive-treatment programme. Oocyte retrieval is one endpoint; pregnancy and live birth are different outcomes. The study does not establish equivalence for untested HCG materials.`,
        link_label: "Read the formulation-comparison trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/11438321/",
      },
    ],
    glance_rows: [
      {
        area: "Testicular physiology",
        investigated: "Intratesticular testosterone responses",
        distinction: "Hormone concentrations do not establish fertility",
      },
      {
        area: "Experimental suppression",
        investigated: "Responses in a short human study",
        distinction: "Not evidence for long-term self-treatment",
      },
      {
        area: "Assisted reproduction",
        investigated: "Follicular maturation and oocyte retrieval",
        distinction: "Protocol and preparation affect interpretation",
      },
      {
        area: "Analytical quality",
        investigated: "Identity, purity and biological potency",
        distinction: "Protein mass alone does not establish IU activity",
      },
    ],
    safety_body: `HCG has clinically significant endocrine effects. Medicinal safety information describes risks including ovarian hyperstimulation syndrome, multiple pregnancy and thromboembolic complications in relevant reproductive-treatment settings. Other reported effects include fluid retention, gynaecomastia, injection-site reactions and hypersensitivity.

Risk depends on the population, hormonal context, formulation and accompanying treatment. Clinical findings do not establish that every material labelled HCG has the same potency or safety profile. Read the medicinal safety information.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding HCG Testing and COAs",
    coa_body: `A Certificate of Analysis should identify the submitted material and distinguish different measurements:

• **Identity:** Suitable protein-characterisation methods assess whether the sample is consistent with the specified HCG preparation.

• Purity and integrity: Appropriate separation methods assess related proteins, aggregates or degradation products under stated conditions.

• Content and potency: Quantitative content and biological activity are distinct. A claim expressed in IU needs an appropriate potency assessment linked to a recognised reference standard.

HCG is a complex glycoprotein. A generic peptide HPLC percentage does not establish its biological activity. Check the source or preparation type, batch identifier, laboratory, methods, dates and assay basis. Do not treat a milligram amount or an immunoreactivity result as proof of the labelled IU potency.

Purity, sterility, endotoxin status and biological potency require their own evidence. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "What does HCG stand for?",
        a: "HCG stands for human chorionic gonadotropin. Scientific publications also use the notation hCG.",
      },
      {
        q: "Is HCG the same as HGH?",
        a: "No. HCG is a gonadotropin involved in reproductive signalling. HGH is human growth hormone, a different hormone acting through a different receptor system.",
      },
      {
        q: "Is HCG testosterone?",
        a: "No. HCG can stimulate testicular testosterone production, but it is chemically and pharmacologically different from testosterone.",
      },
      {
        q: "Has HCG been studied in humans?",
        a: "Yes. Human studies include endocrine-response experiments and clinical trials in assisted reproduction. Results must be interpreted within each study’s population and protocol.",
      },
      {
        q: "Does a testosterone increase prove improved fertility?",
        a: "No. Hormone concentrations, sperm production, pregnancy and live birth are different outcomes. Fertility cannot be inferred from a single hormone measurement.",
      },
      {
        q: "Why is HCG measured in IU?",
        a: "International units express biological activity against a reference standard. They are not the same as milligrams of powder, and there is no universal conversion that applies across unrelated hormones or uncharacterised preparations.",
      },
      {
        q: "Are urinary-derived and recombinant HCG identical products?",
        a: "No. They differ in how they are produced and may differ in formulation and analytical characteristics. Evidence from a named medicinal product should not automatically be transferred to another preparation.",
      },
      {
        q: "Where can I find HCG research papers?",
        a: "Use the original-study links above. Search human chorionic gonadotropin or hCG on PubMed, and check the preparation, population and outcomes before applying a finding elsewhere.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    category: "Growth Hormone / Secretagogues",
    product_slug: "ipamorelin",
    card_title: "What Is Ipamorelin?",
    card_description: "Ipamorelin is a synthetic pentapeptide investigated as a growth hormone secretagogue and ghrelin-receptor agonist.",
    seo_title: "Ipamorelin Research: GH Signalling & Human Studies | PEPLAB",
    seo_description: "Explore ipamorelin research on ghrelin-receptor activity, growth hormone release and gastrointestinal studies, with evidence limits and COA guidance.",
    eyebrow: "Growth Hormone / Secretagogues",
    h1: "Ipamorelin Research Overview",
    subtitle: "Ghrelin-Receptor Activity and Growth Hormone Research",
    intro: `Ipamorelin is a synthetic pentapeptide investigated as a growth hormone secretagogue and ghrelin-receptor agonist. Research includes laboratory pharmacology, human hormonal-response studies and a trial in postoperative gastrointestinal recovery. This page distinguishes those findings from unsupported claims about routine muscle growth, sleep improvement or anti-ageing effects.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is Ipamorelin?",
    what_is_body: "A secretagogue is a substance that stimulates the release of another substance. Ipamorelin stimulates growth hormone release through the growth hormone secretagogue receptor system. It is neither growth hormone itself nor the same molecule as a GHRH analogue such as tesamorelin.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Ipamorelin",
      },
      {
        feature: "Compound type",
        details: "Synthetic peptide",
      },
      {
        feature: "Peptide length",
        details: "Five amino acids",
      },
      {
        feature: "Primary target",
        details: "Growth hormone secretagogue / ghrelin receptor",
      },
      {
        feature: "Research areas",
        details: "GH release, pharmacokinetics and gastrointestinal motility",
      },
      {
        feature: "Evidence base",
        details: "Preclinical pharmacology and limited human trials",
      },
    ],
    mechanism_heading: "How Does Ipamorelin Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Receptor Activation",
        body: "Ipamorelin acts through the ghrelin-receptor system, a pathway investigated for both endocrine and gastrointestinal effects.",
      },
      {
        title: "Growth Hormone Release",
        body: "Human pharmacology studies have measured GH changes after administration. A transient hormonal response is not the same as demonstrated long-term improvement in muscle, sleep or recovery.",
      },
      {
        title: "Selectivity in Context",
        body: "Early experiments described relatively selective GH-releasing activity in the models tested. Selectivity does not mean absence of side effects or a complete human safety profile.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "Ipamorelin Research Findings",
    findings_sections: [
      {
        title: "Early Pharmacology",
        body: "A 1998 paper described ipamorelin’s activity in cell and animal experiments. The researchers compared hormonal responses with other secretagogues. Its selectivity findings should be interpreted within those models rather than expanded into a universal claim of no cortisol effects.",
        link_label: "Read the original pharmacology paper",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/9849822/",
      },
      {
        title: "Human Hormonal Responses",
        body: "A 1999 study examined 40 healthy male volunteers across five intravenous exposure groups. Researchers measured the time course of ipamorelin and GH. This was a pharmacokinetic and pharmacodynamic investigation, not a trial of bodybuilding, insomnia treatment or a combined CJC-1295 product.",
        link_label: "Read the human volunteer study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/10496658/",
      },
      {
        title: "Postoperative Gastrointestinal Research",
        body: "A randomised Phase 2 trial published in 2014 studied ipamorelin following bowel surgery. The analysis included 114 patients. The key outcome concerning tolerance of a solid meal did not differ significantly from placebo, and the publication reported no significant key or secondary efficacy differences.",
        link_label: "Read the postoperative trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/25331030/",
      },
    ],
    glance_rows: [
      {
        area: "Endocrine pharmacology",
        investigated: "GH responses in experimental systems",
        distinction: "Selectivity is model-specific",
      },
      {
        area: "Human pharmacokinetics",
        investigated: "Time course after IV administration",
        distinction: "Other routes and combinations need separate evidence",
      },
      {
        area: "Gastrointestinal recovery",
        investigated: "Controlled postoperative trial",
        distinction: "The trial did not demonstrate the key efficacy benefit",
      },
    ],
    safety_body: `Limited human trials do not establish long-term safety for general wellness use or every administration route. Endocrine selectivity in an experimental model does not establish freedom from adverse effects. The presence of human studies should not be represented as broad clinical validation.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding Ipamorelin Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified compound.

Ipamorelin contains non-standard amino-acid features, so the laboratory method must be appropriate to its stated identity. Confirm chemical form, peptide content and relevant impurities rather than relying on a generic peptide-purity claim.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "Is ipamorelin HGH?",
        a: "No. Ipamorelin stimulates growth hormone release; HGH is growth hormone itself.",
      },
      {
        q: "How is ipamorelin different from tesamorelin?",
        a: "They act through different receptor systems. Ipamorelin is a ghrelin-receptor agonist, while tesamorelin is a GHRH analogue.",
      },
      {
        q: "Has ipamorelin been studied in humans?",
        a: "Yes. Studies include intravenous pharmacology in volunteers and a postoperative gastrointestinal trial. Their specific settings limit generalisation.",
      },
      {
        q: "Does ipamorelin improve sleep?",
        a: "The studies discussed here do not establish it as a treatment for insomnia or a reliable sleep enhancer.",
      },
      {
        q: "Does selective mean side-effect-free?",
        a: "No. Selective activity in an experiment does not establish freedom from adverse effects in people.",
      },
      {
        q: "Does ipamorelin research validate a CJC blend?",
        a: "No. An individual-component study cannot establish the safety or effectiveness of the combined formulation.",
      },
      {
        q: "Where can I find Ipamorelin research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "CJC-1295 No DAC + Ipamorelin Blend",
        slug: "cjc-1295-no-dac-ipamorelin",
        kind: "research",
      },
      {
        label: "Tesamorelin",
        slug: "tesamorelin",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "klow",
    name: "KLOW Blend",
    category: "Peptide Blends / Skin & Tissue Research",
    product_slug: "klow",
    card_title: "What Is KLOW Blend?",
    card_description: "KLOW is PEPLAB’s 80 mg blend of GHK-Cu 50 mg, BPC-157 10 mg, TB-500 10 mg and KPV 10 mg.",
    seo_title: "KLOW Blend Research: Formula & Component Evidence | PEPLAB",
    seo_description: "Explore the KLOW 80 mg blend: GHK-Cu, BPC-157, TB-500 and KPV. Review the formula, component research, evidence limitations and blend-testing guidance.",
    eyebrow: "Peptide Blends / Skin & Tissue Research",
    h1: "KLOW Blend Research Overview",
    subtitle: "Four-Component Formula and Research Evidence",
    intro: `KLOW is PEPLAB’s 80 mg blend of GHK-Cu 50 mg, BPC-157 10 mg, TB-500 10 mg and KPV 10 mg. Its ingredients are associated with research into connective tissue, cellular responses to injury and inflammatory signalling. This page explains the formula and component literature without treating separate studies as proof of the combined preparation.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is KLOW Blend?",
    what_is_body: "KLOW is a blend name, not the scientific name of a single molecule. Its total stated content is the sum of four components. Adding KPV distinguishes this formula from PEPLAB’s 70 mg GLOW blend, but the additional ingredient does not by itself establish a stronger or broader clinical effect.",
    feature_rows: [
      {
        feature: "Blend name",
        details: "KLOW",
      },
      {
        feature: "GHK-Cu",
        details: "50 mg",
      },
      {
        feature: "BPC-157",
        details: "10 mg",
      },
      {
        feature: "TB-500",
        details: "10 mg; molecular identity must be documented",
      },
      {
        feature: "KPV",
        details: "10 mg",
      },
      {
        feature: "Total stated content",
        details: "80 mg",
      },
      {
        feature: "Evidence base",
        details: "Component literature; no controlled trial of this exact formula identified in the reviewed sources",
      },
    ],
    mechanism_heading: "How Does KLOW Blend Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Copper-Peptide Research",
        body: "GHK-Cu is studied in extracellular matrix biology. Its copper-bound identity and concentration matter when interpreting laboratory findings.",
      },
      {
        title: "Tissue-Response Research",
        body: "BPC-157 and thymosin-related materials are discussed in tissue-repair research. TB-500 identity must be established before assigning findings from full-length thymosin beta-4.",
      },
      {
        title: "KPV and Inflammatory Signalling",
        body: "KPV is a short peptide investigated in inflammatory models. Its inclusion adds a separate research pathway, not proven protection against adverse effects from other ingredients.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "KLOW Blend Research Findings",
    findings_sections: [
      {
        title: "GHK-Cu Component Evidence",
        body: "A rat wound study investigated extracellular matrix accumulation after GHK-Cu exposure. It offers preclinical context for a component of KLOW, not evidence that the four-component blend repairs human tissues.",
        link_label: "Read the GHK-Cu animal study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/8227353/",
      },
      {
        title: "BPC-157 and Vascular Models",
        body: "A BPC-157 study investigated vascular responses and VEGFR2-related signalling in experimental models. Its results do not establish an outcome for a combination containing copper peptide, TB-500 and KPV.",
        link_label: "Read the BPC-157 vascular study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/27847966/",
      },
      {
        title: "KPV Component Evidence",
        body: "A 2008 Gastroenterology paper studied KPV uptake through PepT1 and inflammatory responses in cells and mouse colitis models. These experiments did not evaluate KLOW or demonstrate treatment effectiveness in human inflammatory bowel disease.",
        link_label: "Read the KPV study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/18061177/",
      },
      {
        title: "TB-500 and Blend Identity",
        body: "A published analytical investigation found the fragment Ac-LKKTETQ in a TB-500-labelled product. That finding makes sequence confirmation important. Neither the name KLOW nor its total milligram amount identifies the thymosin-related molecule or verifies compatibility of the four ingredients.",
        link_label: "Read the TB-500 identity study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/22962027/",
      },
    ],
    glance_rows: [
      {
        area: "GHK-Cu",
        investigated: "Connective-tissue experiments",
        distinction: "Ingredient evidence only",
      },
      {
        area: "BPC-157",
        investigated: "Vascular and tissue-response models",
        distinction: "Does not establish combined effects",
      },
      {
        area: "KPV",
        investigated: "Cellular and mouse inflammatory models",
        distinction: "Not a human trial of KLOW",
      },
      {
        area: "Finished blend",
        investigated: "Defined four-component composition",
        distinction: "Ratio, stability and clinical effects need separate assessment",
      },
    ],
    safety_body: `The component studies do not establish safety, synergy or effectiveness of KLOW as a finished blend. Four ingredients create additional questions about interactions and stability. A total of 80 mg is a composition statement, not a recommended dose or measure of clinical potency. No claim of guaranteed skin improvement, injury recovery or inflammation control follows from the formula alone.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding KLOW Blend Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified analyte or each blend component.

The declared mass ratio is 5:1:1:1 for GHK-Cu:BPC-157:TB-500:KPV. This is a mass ratio, not a molar ratio. A suitable report should resolve and identify all four components and quantify their individual contents; peak areas alone do not verify these milligram amounts. Copper characterisation and the exact TB-500 sequence require appropriate methods.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "What is in KLOW?",
        a: "The stated PEPLAB formula is GHK-Cu 50 mg, BPC-157 10 mg, TB-500 10 mg and KPV 10 mg, totalling 80 mg.",
      },
      {
        q: "What is the difference between KLOW and GLOW?",
        a: "PEPLAB’s KLOW formula contains the same stated GHK-Cu, BPC-157 and TB-500 amounts as GLOW, with an additional 10 mg of KPV.",
      },
      {
        q: "Is KLOW a single peptide?",
        a: "No. It is a four-component mixture. Its ingredients must be identified and quantified separately.",
      },
      {
        q: "Does adding KPV make KLOW better?",
        a: "Not necessarily. Superiority would require a direct comparison of the characterised formulas. An additional ingredient does not demonstrate an improved outcome.",
      },
      {
        q: "Has this 80 mg blend been clinically validated?",
        a: "No controlled study of this exact formula was identified in the sources reviewed. The references concern ingredients and related experimental models.",
      },
      {
        q: "Does 80 mg mean every component is verified?",
        a: "No. The amount is the stated total. A batch-matched quantitative report is needed to verify each ingredient and the finished blend.",
      },
      {
        q: "Where can I find KLOW Blend research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "GLOW Blend",
        slug: "glow",
        kind: "research",
      },
      {
        label: "GHK-Cu",
        slug: "ghk-cu",
        kind: "research",
      },
      {
        label: "BPC-157",
        slug: "bpc-157",
        kind: "research",
      },
      {
        label: "KPV",
        slug: "kpv",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "kpv",
    name: "KPV",
    category: "Tripeptides / Inflammation Research",
    product_slug: "kpv",
    card_title: "What Is KPV?",
    card_description: "KPV is a three-amino-acid peptide studied in experimental inflammatory models, particularly intestinal cell systems and mouse colitis.",
    seo_title: "KPV Research: Inflammatory Signalling & Gut Models | PEPLAB",
    seo_description: "Explore KPV tripeptide research on PepT1 transport, inflammatory signalling and intestinal models, with original papers, evidence limits and COA guidance.",
    eyebrow: "Tripeptides / Inflammation Research",
    h1: "KPV Research Overview",
    subtitle: "Lysine–Proline–Valine and Cellular Inflammation Models",
    intro: `KPV is a three-amino-acid peptide studied in experimental inflammatory models, particularly intestinal cell systems and mouse colitis. The sequence is lysine–proline–valine. This page explains its relationship to melanocortin biology, selected primary research and the limits of using preclinical findings to make claims about human gut or skin conditions.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is KPV?",
    what_is_body: "KPV corresponds to the C-terminal three-amino-acid sequence of alpha-melanocyte-stimulating hormone, or alpha-MSH. A short fragment can have different properties from the full hormone. KPV should not be assumed to reproduce every melanocortin effect, and its research identity must include the sequence and any terminal modifications.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "KPV",
      },
      {
        feature: "Sequence",
        details: "Lys–Pro–Val",
      },
      {
        feature: "Compound type",
        details: "Tripeptide",
      },
      {
        feature: "Peptide length",
        details: "Three amino acids",
      },
      {
        feature: "Research areas",
        details: "Inflammatory signalling, epithelial biology and intestinal models",
      },
      {
        feature: "Evidence base",
        details: "Predominantly cellular and animal studies",
      },
    ],
    mechanism_heading: "How Does KPV Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Peptide Transport",
        body: "PepT1 transports certain short peptides into cells. Research has examined its role in KPV uptake in intestinal epithelial and immune-cell systems.",
      },
      {
        title: "Inflammatory Pathways",
        body: "Experimental work has assessed NF-κB and MAP kinase activity after inflammatory stimulation. Changes in these pathways help investigate possible mechanisms.",
      },
      {
        title: "Model-Specific Effects",
        body: "Mouse colitis and cultured-cell responses provide hypotheses for further testing. They are not the same as diagnosed human inflammatory bowel disease or skin disease.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "KPV Research Findings",
    findings_sections: [
      {
        title: "Cellular Uptake and Signalling",
        body: "A 2008 Gastroenterology paper examined PepT1-mediated KPV transport alongside inflammatory pathway changes in cell models. It linked uptake with reduced inflammatory signalling under the experimental conditions.",
        link_label: "Read the PepT1 study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/18061177/",
      },
      {
        title: "Mouse Colitis Research",
        body: "A separate 2008 paper investigated KPV in murine inflammatory bowel disease models. It adds preclinical evidence about inflammatory responses, but an induced mouse condition differs from the complex causes and course of Crohn’s disease or ulcerative colitis in people.",
        link_label: "Read the murine inflammatory study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/18092346/",
      },
      {
        title: "What Human Evidence Would Need to Show",
        body: `The cited primary studies do not establish KPV as a treatment for a human gut or skin disorder. Controlled clinical research would need to assess symptoms, disease activity, adverse events and formulation-specific exposure. A laboratory decrease in an inflammatory marker is not a substitute for those outcomes.

Review the experimental scope of the PepT1 study.`,
      },
    ],
    glance_rows: [
      {
        area: "Transport",
        investigated: "KPV uptake through PepT1 in cell systems",
        distinction: "Delivery findings depend on the model",
      },
      {
        area: "Inflammation",
        investigated: "Pathway and cytokine responses",
        distinction: "Biomarkers do not establish symptom relief",
      },
      {
        area: "Intestinal disease models",
        investigated: "Experimental mouse colitis",
        distinction: "Not proof of human IBD treatment",
      },
    ],
    safety_body: `The cited cellular and animal studies do not establish long-term human safety or effectiveness. A short amino-acid sequence or relationship to a natural hormone does not establish freedom from adverse effects. Formulation, route and exposure need their own human assessment.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding KPV Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified compound.

A KPV report should specify the amino-acid sequence, terminal chemistry and quantitative content. Closely named or chemically modified preparations should not be assumed equivalent. Purity and content are separate measurements even for a short peptide.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "What does KPV stand for?",
        a: "K, P and V are the one-letter amino-acid codes for lysine, proline and valine.",
      },
      {
        q: "Is KPV a peptide?",
        a: "Yes. It is a tripeptide, meaning it contains three amino acids.",
      },
      {
        q: "Is KPV the same as alpha-MSH?",
        a: "No. KPV corresponds to a short terminal sequence of alpha-MSH. A fragment is not equivalent to the full hormone.",
      },
      {
        q: "Has KPV been proven to treat gut disease?",
        a: "The cited studies concern cells and mice. They do not establish effectiveness for Crohn’s disease, ulcerative colitis or other human gut disorders.",
      },
      {
        q: "Does KPV have proven skin benefits?",
        a: "The intestinal studies described here do not establish a clinical skin benefit. Each condition and formulation needs relevant evidence.",
      },
      {
        q: "Does KPV make KLOW clinically better than GLOW?",
        a: "No such conclusion follows from component research. It would require a direct study of the characterised blends.",
      },
      {
        q: "Where can I find KPV research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "KLOW Blend",
        slug: "klow",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "melanotan-2",
    name: "Melanotan II",
    category: "Melanocortin / Pigmentation Research",
    product_slug: "mt-2",
    card_title: "What Is Melanotan II",
    card_description: "Melanotan II, also called Melanotan 2 or MT-II, is a synthetic cyclic peptide related to alpha-melanocyte-stimulating hormone, or alpha-MSH.",
    seo_title: "Melanotan 2 Research Overview & Safety | PEPLAB",
    seo_description: "Explore Melanotan II (MT-2) research, melanocortin activity, early human studies, safety limitations, evidence limitations and analytical testing.",
    eyebrow: "Melanocortin / Pigmentation Research",
    h1: "Melanotan II Research Overview",
    subtitle: "Melanocortin Activity and Pigmentation Research",
    intro: `Melanotan II, also called Melanotan 2 or MT-II, is a synthetic cyclic peptide related to alpha-melanocyte-stimulating hormone, or alpha-MSH. Researchers have investigated its effects on pigmentation and sexual responses through melanocortin signalling.

This page brings together receptor research, early human findings and analytical testing guidance. Small experimental studies do not establish long-term safety or validate separately supplied materials.

For an introduction to interpreting scientific evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is Melanotan II",
    what_is_body: `Melanotan II is a cyclic heptapeptide, meaning it contains seven amino-acid residues and has a ring-like structural linkage. It was developed as an analogue of alpha-MSH and has been investigated in laboratory experiments and small human trials.

Scientific reference: Dorr and colleagues, Life Sciences, 1996.`,
    feature_rows: [
      {
        feature: "Compound name",
        details: "Melanotan II",
      },
      {
        feature: "Common names",
        details: "Melanotan 2, Melanotan-II, MT-II, MT-2",
      },
      {
        feature: "Compound type",
        details: "Synthetic cyclic heptapeptide",
      },
      {
        feature: "Mechanism",
        details: "Melanocortin receptor agonism",
      },
      {
        feature: "Research areas",
        details: "Pigmentation, receptor pharmacology and sexual responses",
      },
      {
        feature: "Human evidence",
        details: "Early, small clinical studies",
      },
    ],
    mechanism_heading: "How Does Melanotan II Work",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Melanocortin Receptor Activity",
        body: `An agonist activates a receptor and produces a biological response. Melanotan II interacts with multiple melanocortin receptor subtypes. A receptor-binding study tested MT-II and related analogues in cells expressing human MC1, MC3, MC4 and MC5 receptors, illustrating why its pharmacology extends beyond a single target.

Read the receptor selectivity study.`,
      },
      {
        title: "Pigmentation Research",
        body: "Melanocortin signalling participates in melanin production, the process responsible for skin pigmentation. Early human experiments measured changes in skin colour after Melanotan II exposure. A change in pigmentation does not establish protection from ultraviolet radiation or prevention of skin cancer.",
      },
      {
        title: "Sexual Response Research",
        body: "Researchers also investigated erectile responses in men. These findings concern specific physiological measurements in small study populations. They do not establish a general benefit for libido, sexual wellbeing or all forms of sexual dysfunction.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "Melanotan II Research Findings",
    findings_sections: [
      {
        title: "Early Human Pigmentation Study",
        body: `A 1996 pilot Phase 1 study published in Life Sciences included three healthy male volunteers. Two showed increased pigmentation after the study exposures. Researchers also reported nausea, stretching, yawning and spontaneous erections; somnolence and fatigue occurred in one participant at a higher study exposure.

The study provides early evidence of biological activity. Its very small sample and short observation period cannot establish long-term safety or predict individual results.`,
        link_label: "Read the original Phase 1 study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/8637402/",
      },
      {
        title: "Erectile Response Study",
        body: `A 1998 double-blind, placebo-controlled crossover study in The Journal of Urology enrolled ten men with psychogenic erectile dysfunction. Clinically apparent erections developed in eight participants after Melanotan II. Nausea, yawning, stretching and reduced appetite were reported more frequently with Melanotan II than placebo.

These observations support research into melanocortin-mediated erectile responses. They do not establish an approved treatment or prove that marketed preparations reproduce the trial results.`,
        link_label: "Read the original crossover study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/9679884/",
      },
      {
        title: "Serious Adverse Event Reporting",
        body: `A 2021 case report in Sexual Medicine described acute ischaemic priapism after Melanotan II injection, requiring surgical management. Priapism is a prolonged erection that can damage tissue.

Case reports identify possible safety signals but cannot determine how frequently an event occurs. They should be considered alongside controlled studies and regulatory safety information.`,
        link_label: "Read the published case report",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/33460908/",
      },
    ],
    glance_rows: [
      {
        area: "Receptor pharmacology",
        investigated: "Experiments in receptor-expressing cells",
        distinction: "Binding does not establish clinical benefit",
      },
      {
        area: "Pigmentation",
        investigated: "Three-person pilot study",
        distinction: "Short-term findings cannot establish long-term safety",
      },
      {
        area: "Erectile responses",
        investigated: "Ten-person crossover study",
        distinction: "Results apply to a specific study population",
      },
      {
        area: "Adverse events",
        investigated: "Trial observations and case reports",
        distinction: "Reports cannot establish event frequency",
      },
    ],
    safety_body: `Human studies reported nausea, yawning and other systemic effects. Published reports also describe serious events, including priapism. Small trials are poorly suited to detecting uncommon harms or assessing repeated, long-term exposure.

The pigmentation pilot study did not establish protection from ultraviolet radiation or prevention of skin cancer. Increased pigmentation should not be interpreted as evidence that additional UV exposure is safe. Published clinical findings relate to the study preparation and do not establish equivalence with separately supplied materials.`,
    coa_heading: "Understanding Melanotan II Testing and COAs",
    coa_body: `A Certificate of Analysis describes testing of a submitted sample. Different methods address different properties:

• Chromatographic purity: HPLC assesses the relative proportions of detected components under the specified conditions. Purity alone does not verify the amount present.

• Identity assessment: Mass spectrometry and suitable complementary methods provide evidence that a sample is consistent with the expected molecule.

• Peptide content: A validated quantitative assay measures the amount of the specified peptide in the sample.

Check the compound name, sample or batch identifier, laboratory, testing date, methods and actual results. Only describe a property as tested when the relevant measurement appears on the report. Identity, purity, content, sterility and endotoxin status are separate questions; a COA does not establish clinical safety.

Explore PEPLAB’s [Quality & Testing](/standards) information and [COA Results](/coa). Check whether any available report actually covers the material and batch being assessed.`,
    faqs: [
      {
        q: "Are Melanotan 2 and Melanotan II the same name",
        a: "Yes. Melanotan 2, Melanotan II and MT-II commonly refer to the same research compound. Naming alone does not verify a sample’s identity.",
      },
      {
        q: "Is Melanotan II a peptide",
        a: "Yes. It is a synthetic cyclic peptide containing seven amino-acid residues, developed as an analogue of alpha-MSH.",
      },
      {
        q: "Has Melanotan II been studied in humans",
        a: "Yes. Published research includes a three-person pigmentation pilot study and a ten-person erectile-response trial. These small studies do not establish long-term safety.",
      },
      {
        q: "Does increased pigmentation mean protection from the sun",
        a: "No. Melanotan-induced pigmentation is not a substitute for sunscreen or other sun protection, and should not be interpreted as permission for greater UV exposure.",
      },
      {
        q: "Are nasal sprays established as safer than injections",
        a: "The studies discussed here do not establish the safety of nasal sprays or provide a direct comparison showing they are safer than injections. Findings from one formulation or route cannot automatically be applied to another.",
      },
      {
        q: "Does a high purity result prove a product is safe",
        a: "No. A chromatographic purity result does not establish content, sterility, absence of endotoxins, clinical safety.",
      },
      {
        q: "Where can I find Melanotan II research papers",
        a: "Use the original publication links on this page. Search Melanotan II or MT-II on PubMed, checking the exact compound, study population and outcome before drawing conclusions.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "nad-plus",
    name: "NAD+",
    category: "Coenzymes / Cellular Metabolism",
    product_slug: "nad",
    card_title: "What Is NAD+?",
    card_description: "NAD+ is the oxidised form of nicotinamide adenine dinucleotide, a coenzyme involved in cellular metabolism and enzyme reactions.",
    seo_title: "NAD+ Research: Cellular Energy & Metabolism | PEPLAB",
    seo_description: "Explore NAD+ research on cellular metabolism, redox reactions and human infusion studies, with clear distinctions from NR and NMN precursor research.",
    eyebrow: "Coenzymes / Cellular Metabolism",
    h1: "NAD+ Research Overview",
    subtitle: "Nicotinamide Adenine Dinucleotide and Energy Research",
    intro: `NAD+ is the oxidised form of nicotinamide adenine dinucleotide, a coenzyme involved in cellular metabolism and enzyme reactions. It is not a peptide. Research examines NAD+ biology, ways of changing NAD-related metabolites and the effects of specific preparations. Its essential role in cells does not establish that administering extra NAD+ improves energy, cognition or lifespan.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is NAD+?",
    what_is_body: "NAD+ participates in the transfer of electrons during metabolic reactions and is converted to NADH in its reduced state. It is also consumed by several enzyme systems. Research on NAD+ itself must be distinguished from work on nicotinamide riboside, or NR, and nicotinamide mononucleotide, or NMN, which are different molecules used in NAD biosynthesis.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Nicotinamide adenine dinucleotide",
      },
      {
        feature: "Common abbreviation",
        details: "NAD+",
      },
      {
        feature: "Compound type",
        details: "Dinucleotide coenzyme; not a peptide",
      },
      {
        feature: "Redox partner",
        details: "NADH",
      },
      {
        feature: "Research areas",
        details: "Metabolism, NAD turnover and ageing-related biology",
      },
      {
        feature: "Evidence base",
        details: "Extensive biological research; preparation-specific human studies and a separate precursor literature",
      },
    ],
    mechanism_heading: "How Does NAD+ Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Redox Reactions",
        body: "The NAD+/NADH pair participates in electron transfer that supports cellular metabolism. This biochemical role should not be confused with a measured increase in a person’s energy or endurance.",
      },
      {
        title: "Enzyme Substrate",
        body: "NAD+ is used by enzymes involved in cellular signalling and maintenance, including sirtuins and PARPs. Demonstrating this role does not show that more NAD+ always improves function.",
      },
      {
        title: "Turnover and Delivery",
        body: "Researchers track how supplied NAD+ is metabolised and cleared. Route, formulation and the chemical species measured influence how study results should be interpreted.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "NAD+ Research Findings",
    findings_sections: [
      {
        title: "Human NAD+ Infusion Research",
        body: "A 2019 pilot study measured NAD+ and related metabolites during a six-hour intravenous infusion. It included eight participants receiving NAD+ and three controls. The study described metabolic handling of the infusion; it was not a trial demonstrating improved fatigue, cognition, addiction recovery or lifespan.",
        link_label: "Read the NAD+ metabolome pilot study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/31572171/",
      },
      {
        title: "Related NR Research",
        body: "A 2018 randomised crossover study investigated nicotinamide riboside in middle-aged and older adults and reported increased NAD-related availability. It tested NR, not direct NAD+ administration. It is useful background on the pathway but cannot validate a NAD+ vial or another delivery route.",
        link_label: "Read the NR study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/29599478/",
      },
      {
        title: "Biomarkers Versus Clinical Outcomes",
        body: "Another 2018 NR trial in men with obesity did not show improved insulin sensitivity under the studied regimen. This illustrates why a precursor’s biochemical rationale should not be converted into a general clinical claim, and why different NAD-related preparations require their own evidence.",
        link_label: "Read the metabolic NR trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/29992272/",
      },
    ],
    glance_rows: [
      {
        area: "Direct NAD+ administration",
        investigated: "Metabolite handling in a small infusion study",
        distinction: "Not proof of broad wellness benefits",
      },
      {
        area: "NR and NMN",
        investigated: "Related precursor research",
        distinction: "Different molecules from NAD+",
      },
      {
        area: "Ageing biology",
        investigated: "Cellular pathways associated with NAD",
        distinction: "Does not establish human lifespan extension",
      },
    ],
    safety_body: `The small direct-infusion pilot cannot establish long-term safety or effectiveness for broad wellness claims. Evidence for one delivery route cannot be transferred to another, and precursor trials cannot be treated as trials of direct NAD+. A material’s role in normal metabolism does not establish that a separately prepared product is suitable for personal administration.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding NAD+ Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified analyte or each blend component.

For NAD+, confirm the oxidised chemical form, any salt form, assay basis and stability-related impurities. An assay should distinguish NAD+ from NADH and relevant breakdown products where required by the study. Report content as NAD+ on a clearly stated basis rather than treating every powder mass as active coenzyme.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "Is NAD+ a peptide?",
        a: "No. It is a dinucleotide coenzyme. It should be categorised separately from peptide compounds.",
      },
      {
        q: "What is the difference between NAD+ and NADH?",
        a: "NAD+ is the oxidised form and NADH is the reduced form. They participate in related electron-transfer reactions but are different chemical states.",
      },
      {
        q: "Is NAD+ the same as NMN or NR?",
        a: "No. NMN and NR are distinct precursor molecules involved in pathways that can produce NAD+. Their studies do not directly validate NAD+ preparations.",
      },
      {
        q: "Does NAD+ give an immediate energy boost?",
        a: "The pilot study discussed here measured metabolites, not a reliable immediate energy benefit. Biochemical participation in metabolism is not the same as proven symptom improvement.",
      },
      {
        q: "Does NAD+ research show anti-ageing benefits?",
        a: "Ageing-related biology is a research area, but the cited direct NAD+ study did not demonstrate longer lifespan or reversal of ageing in humans.",
      },
      {
        q: "What should a NAD+ COA report?",
        a: "The report should identify the chemical form, quantitative content and relevant impurities or degradation products using suitable methods. Purity alone does not establish clinical suitability.",
      },
      {
        q: "Where can I find NAD+ research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "MOTS-C",
        slug: "mots-c",
        kind: "research",
      },
      {
        label: "SS-31",
        slug: "ss-31",
        kind: "research",
      },
      {
        label: "Glutathione",
        slug: "glutathione",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "pt-141",
    name: "PT-141",
    category: "Melanocortin / Sexual-Function Research",
    product_slug: "pt-141",
    card_title: "What Is PT-141?",
    card_description: "PT-141, also known as bremelanotide, is a synthetic peptide that activates melanocortin receptors.",
    seo_title: "PT-141 Research: Bremelanotide & Melanocortins | PEPLAB",
    seo_description: "Explore PT-141 (bremelanotide) research on melanocortin receptors and sexual desire, with clinical findings, safety context and evidence limitations.",
    eyebrow: "Melanocortin / Sexual-Function Research",
    h1: "PT-141 Research Overview",
    subtitle: "Bremelanotide and Melanocortin Receptor Activity",
    intro: `PT-141, also known as bremelanotide, is a synthetic peptide that activates melanocortin receptors. Human research includes studies of sexual desire and related distress in premenopausal women with hypoactive sexual desire disorder. This overview explains the clinical evidence, its population limits and the distinction between a medicinal formulation and other research materials.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is PT-141?",
    what_is_body: "Bremelanotide is a melanocortin receptor agonist. Melanocortin receptors participate in several biological processes, including central nervous system signalling and pigmentation. PT-141 is not testosterone and should not be described as a hormone-replacement product or as an equivalent of a PDE5 inhibitor.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Bremelanotide",
      },
      {
        feature: "Common research name",
        details: "PT-141",
      },
      {
        feature: "Compound type",
        details: "Synthetic cyclic peptide",
      },
      {
        feature: "Mechanism",
        details: "Agonism at melanocortin receptors",
      },
      {
        feature: "Key clinical research",
        details: "Sexual desire and associated distress in defined populations",
      },
      {
        feature: "Evidence base",
        details: "Randomised human studies; US medicinal approval for a specific indication",
      },
    ],
    mechanism_heading: "How Does PT-141 Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Melanocortin Receptors",
        body: "Bremelanotide activates several melanocortin receptor subtypes. Its medicinal label identifies MC1R and MC4R binding as relevant at therapeutic exposure.",
      },
      {
        title: "Central Signalling",
        body: "MC4R-expressing neurons are present in the central nervous system. The precise mechanism responsible for improvement in hypoactive sexual desire disorder is not fully established in the label.",
      },
      {
        title: "Multiple Biological Effects",
        body: "Receptor activity is not limited to sexual desire. Pigmentation and cardiovascular effects also matter when assessing the pharmacology of this compound.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "PT-141 Research Findings",
    findings_sections: [
      {
        title: "RECONNECT Phase 3 Trials",
        body: "Two randomised, placebo-controlled trials evaluated bremelanotide over 24 weeks in premenopausal women with hypoactive sexual desire disorder. The 2019 publication reported improvements in measures of desire and distress related to low desire. These endpoints are distinct from a guarantee of sexual performance or an increase in every measure of sexual activity.",
        link_label: "Read the RECONNECT trials",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/31599840/",
      },
      {
        title: "Longer Follow-Up",
        body: "A 52-week open-label extension examined longer-term outcomes among eligible participants who continued after the controlled trials. An extension can add information, but lack of blinding, participant selection and discontinuation affect interpretation.",
        link_label: "Read the extension study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/31599847/",
      },
      {
        title: "Medicinal Indication and Product Identity",
        body: "The US VYLEESI label concerns a particular bremelanotide formulation for acquired, generalised hypoactive sexual desire disorder in premenopausal women. It does not establish an indication for every person with low libido or validate separately supplied PT-141 materials.",
        link_label: "Read the VYLEESI prescribing information",
        link_url: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=f1d0c1b5-2f39-4bad-a6a4-0066e3ad5dcf",
      },
    ],
    glance_rows: [
      {
        area: "Sexual desire",
        investigated: "Validated desire scores in a defined population",
        distinction: "Not a universal libido or performance guarantee",
      },
      {
        area: "Related distress",
        investigated: "Patient-reported distress about low desire",
        distinction: "Different from erectile-function outcomes",
      },
      {
        area: "Longer-term use",
        investigated: "Open-label extension observations",
        distinction: "Less controlled than the randomised phase",
      },
    ],
    safety_body: `Nausea, flushing and headache were reported in the controlled trials. The medicinal label also warns about transient blood-pressure increases and focal hyperpigmentation; VYLEESI is contraindicated in uncontrolled hypertension or known cardiovascular disease. These are material limitations, not an exhaustive safety list. Clinical findings concern the studied formulation and population. Source: prescribing information.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding PT-141 Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified compound.

Identity assessment should account for bremelanotide’s cyclic structure and the specified chemical form. Quantitative content and relevant related substances require their own methods; an assay result should state whether it refers to peptide content or a salt-based amount.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "Is PT-141 the same as bremelanotide?",
        a: "Yes. PT-141 is a research name used for bremelanotide. Formulations and product quality can still differ.",
      },
      {
        q: "Is PT-141 testosterone?",
        a: "No. It acts at melanocortin receptors and is chemically distinct from testosterone.",
      },
      {
        q: "Is PT-141 the same as Viagra?",
        a: "No. Bremelanotide is a melanocortin receptor agonist; sildenafil is a PDE5 inhibitor. The mechanisms and approved indications differ.",
      },
      {
        q: "What did the Phase 3 trials measure?",
        a: "They assessed sexual desire and distress associated with low desire in premenopausal women with hypoactive sexual desire disorder.",
      },
      {
        q: "Do those studies establish effects in men?",
        a: "Not by themselves. Findings in the RECONNECT population cannot be treated as evidence for a different population or indication.",
      },
      {
        q: "Does US approval cover every PT-141 vial?",
        a: "No. Medicinal approval applies to the specified product and indication, not every material sharing the compound name.",
      },
      {
        q: "Where can I find PT-141 research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "slu-pp-332",
    name: "SLU-PP-332",
    category: "Small Molecules / Metabolic Research",
    product_slug: "slu-pp-332",
    card_title: "What Is SLU-PP-332?",
    card_description: "SLU-PP-332 is a synthetic small molecule investigated as an agonist of estrogen-related receptors, or ERRs.",
    seo_title: "SLU-PP-332 Research: ERR & Metabolic Activity | PEPLAB",
    seo_description: "Explore SLU-PP-332 research on estrogen-related receptors, mitochondrial activity and mouse exercise models, with evidence limits and testing guidance.",
    eyebrow: "Small Molecules / Metabolic Research",
    h1: "SLU-PP-332 Research Overview",
    subtitle: "Estrogen-Related Receptor Activity and Exercise Models",
    intro: `SLU-PP-332 is a synthetic small molecule investigated as an agonist of estrogen-related receptors, or ERRs. It is not a peptide. Published studies examine cellular metabolism, exercise-related gene activity and metabolic outcomes in mice. Those findings do not establish that the compound can safely replace exercise or produce predictable fat loss in humans.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is SLU-PP-332?",
    what_is_body: "SLU-PP-332 activates ERRα, ERRβ and ERRγ in experimental systems. These nuclear receptors help regulate gene expression related to metabolism. Despite their name, estrogen-related receptors are distinct from the classical estrogen receptors; the compound should not be described simply as estrogen or a conventional stimulant.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "SLU-PP-332",
      },
      {
        feature: "Compound type",
        details: "Synthetic small molecule; not a peptide",
      },
      {
        feature: "Primary targets",
        details: "ERRα, ERRβ and ERRγ",
      },
      {
        feature: "Research areas",
        details: "Oxidative metabolism, muscle function and metabolic disease models",
      },
      {
        feature: "Evidence base",
        details: "Cellular and animal studies in the cited literature",
      },
      {
        feature: "Key limitation",
        details: "Human effectiveness and comprehensive safety are not established by these studies",
      },
    ],
    mechanism_heading: "How Does SLU-PP-332 Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Nuclear-Receptor Activity",
        body: "ERRs act as transcriptional regulators. SLU-PP-332 is used to investigate how activating these receptors changes metabolic gene programmes.",
      },
      {
        title: "Oxidative Metabolism",
        body: "Experiments assess cellular respiration and mitochondrial-related responses. These measures concern energy processing, not a proven subjective feeling of stimulation.",
      },
      {
        title: "Exercise-Mimetic Research",
        body: "The term exercise mimetic describes overlap with selected exercise-associated pathways. It does not mean a compound reproduces all muscular, cardiovascular and psychological effects of physical activity.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "SLU-PP-332 Research Findings",
    findings_sections: [
      {
        title: "Cellular and Exercise Research",
        body: "A 2023 ACS Chemical Biology study identified SLU-PP-332 as an ERR pan-agonist. Experiments reported altered respiration in muscle cells and enhanced endurance in mice. Human gene-expression comparisons in the paper did not constitute a human SLU-PP-332 treatment trial.",
        link_label: "Read the original ERR study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/36988910/",
      },
      {
        title: "Metabolic Syndrome Models",
        body: "A subsequent study investigated the compound in diet-induced obese and genetically obese mice. It reported changes in metabolic outcomes, including fat-mass-related effects. Mouse results do not establish human weight loss, a safe exposure level or long-term outcomes.",
        link_label: "Read the metabolic syndrome study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/37739806/",
      },
      {
        title: "Related Compounds and Delivery",
        body: "Later work on an orally active ERR agonist, SLU-PP-915, distinguishes that compound from SLU-PP-332. Delivery findings for another molecule should not be copied into SLU-PP-332 specifications. The exact chemical entity and formulation remain central to any comparison.",
        link_label: "Read the related ERR-agonist study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/41421047/",
      },
    ],
    glance_rows: [
      {
        area: "Cellular metabolism",
        investigated: "Respiration and metabolic gene expression",
        distinction: "Not a measured human energy boost",
      },
      {
        area: "Exercise",
        investigated: "Endurance in mice",
        distinction: "Not evidence that humans can replace exercise",
      },
      {
        area: "Obesity models",
        investigated: "Metabolic outcomes in mice",
        distinction: "Not a clinical weight-loss result",
      },
      {
        area: "Delivery",
        investigated: "Research on related ERR agonists",
        distinction: "Different compounds are not interchangeable",
      },
    ],
    safety_body: `The cited studies do not establish human safety, effectiveness or an appropriate personal-use regimen. Animal exposures cannot be converted into validated human guidance. Calling a material an exercise mimetic does not establish that it is equivalent to physical activity, and chemical purity does not resolve toxicology or long-term safety questions.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding SLU-PP-332 Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified compound.

Use analytical methods appropriate for a small molecule. Identity may require mass spectrometry and complementary structural methods; an assay should quantify the stated compound and distinguish relevant impurities. A generic peptide test description is not sufficient.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "Is SLU-PP-332 a peptide?",
        a: "No. It is a synthetic small molecule and should be categorised separately from peptide compounds.",
      },
      {
        q: "Is SLU-PP-332 a stimulant?",
        a: "Its research target is the ERR family of nuclear receptors. The cited studies do not establish a conventional stimulant-like effect in humans.",
      },
      {
        q: "Is it the same as MOTS-C?",
        a: "No. MOTS-C is a mitochondrial-derived peptide. SLU-PP-332 is a different type of molecule acting through a different research pathway.",
      },
      {
        q: "Does exercise mimetic mean it replaces exercise?",
        a: "No. The term concerns selected molecular or physiological features, not the full benefits of exercise.",
      },
      {
        q: "Has it been shown to cause human fat loss?",
        a: "The cited metabolic studies used mice. They do not establish a predictable fat-loss effect in humans.",
      },
      {
        q: "Are SLU-PP-332 and SLU-PP-915 interchangeable?",
        a: "No. They are different compounds. Results concerning one molecule’s delivery or pharmacology cannot automatically be assigned to the other.",
      },
      {
        q: "Where can I find SLU-PP-332 research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "MOTS-C",
        slug: "mots-c",
        kind: "research",
      },
      {
        label: "NAD+",
        slug: "nad-plus",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "ss-31",
    name: "SS-31",
    category: "Mitochondrial / Tetrapeptides",
    product_slug: "ss-31",
    card_title: "What Is SS-31?",
    card_description: "SS-31, also known as elamipretide, is a synthetic tetrapeptide investigated for its effects on mitochondrial function.",
    seo_title: "SS-31 Research: Elamipretide & Mitochondria | PEPLAB",
    seo_description: "Explore SS-31 (elamipretide) research on mitochondrial function, clinical trial findings and the specific US Barth syndrome approval, with COA guidance.",
    eyebrow: "Mitochondrial / Tetrapeptides",
    h1: "SS-31 Research Overview",
    subtitle: "Elamipretide and Mitochondrial Membrane Research",
    intro: `SS-31, also known as elamipretide, is a synthetic tetrapeptide investigated for its effects on mitochondrial function. Its research includes human trials in mitochondrial disease and a specific US medicinal approval for Barth syndrome. These findings do not establish general anti-ageing benefits or equivalence between an authorised medicine and other SS-31 materials.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is SS-31?",
    what_is_body: "Elamipretide is a mitochondria-targeting peptide associated with cardiolipin, a lipid in the inner mitochondrial membrane. That membrane supports processes involved in cellular energy production. Clinical research asks whether effects on mitochondrial biology translate into meaningful benefits in particular diseases, rather than assuming that a mitochondrial target guarantees an energy benefit.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Elamipretide",
      },
      {
        feature: "Research names",
        details: "SS-31; MTP-131",
      },
      {
        feature: "Compound type",
        details: "Synthetic tetrapeptide",
      },
      {
        feature: "Peptide length",
        details: "Four amino acids",
      },
      {
        feature: "Research focus",
        details: "Inner mitochondrial membrane and cardiolipin-associated function",
      },
      {
        feature: "Evidence base",
        details: "Preclinical studies, randomised human trials and a specific US medicinal approval",
      },
    ],
    mechanism_heading: "How Does SS-31 Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Mitochondrial Membrane Association",
        body: "Elamipretide is studied for interactions with cardiolipin and effects on the inner mitochondrial membrane. This is different from supplying ATP directly.",
      },
      {
        title: "Bioenergetic Function",
        body: "Research investigates whether changes in membrane function influence mitochondrial performance. Molecular effects and patient-reported fatigue are separate endpoints.",
      },
      {
        title: "Disease-Specific Outcomes",
        body: "Mitochondrial disorders have different causes. An outcome in Barth syndrome cannot automatically predict an outcome in another mitochondrial disease or in a healthy person.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "SS-31 Research Findings",
    findings_sections: [
      {
        title: "Primary Mitochondrial Myopathy",
        body: "MMPOWER-3 was a Phase 3 randomised trial involving 218 participants with primary mitochondrial myopathy. The 2023 publication reported that elamipretide did not meet its primary endpoints for the six-minute walk test and fatigue after 24 weeks. This negative result is essential context for broad energy or endurance claims.",
        link_label: "Read the MMPOWER-3 trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/37268435/",
      },
      {
        title: "Barth Syndrome Research",
        body: "A smaller randomised crossover study with an open-label extension investigated elamipretide in Barth syndrome. The controlled phase did not meet its primary endpoints; improvements were reported during the longer open-label phase. The different study phases have different strengths and limitations.",
        link_label: "Read the Barth syndrome study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/33077895/",
      },
      {
        title: "US Medicinal Approval",
        body: "In September 2025, the FDA granted accelerated approval to Forzinity, an elamipretide injection, for patients with Barth syndrome weighing at least 30 kg. Accelerated approval was based on knee-extensor muscle strength, with a confirmatory trial required to establish patient benefit. The approval is product- and indication-specific. It should not be presented as approval of all SS-31 preparations or evidence for general longevity use.",
        link_label: "Read the FDA announcement",
        link_url: "https://www.fda.gov/news-events/press-announcements/fda-grants-accelerated-approval-first-treatment-barth-syndrome",
      },
    ],
    glance_rows: [
      {
        area: "Mitochondrial myopathy",
        investigated: "Walking capacity and fatigue in a Phase 3 trial",
        distinction: "Primary endpoints were not met",
      },
      {
        area: "Barth syndrome",
        investigated: "Controlled and open-label clinical findings",
        distinction: "Study phase and disease context matter",
      },
      {
        area: "Regulatory status",
        investigated: "Specific US accelerated approval",
        distinction: "Does not cover every preparation, country or use",
      },
    ],
    safety_body: `Clinical studies do not establish that SS-31 broadly improves fatigue, exercise performance or ageing in otherwise healthy people. Injection-site reactions have been relevant in the clinical programme. Safety interpretation must consider disease, formulation, route and duration. A research material is not demonstrated equivalent to the authorised medicinal product simply because it shares an active-compound name.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding SS-31 Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified compound.

For SS-31, confirm the precise peptide identity, stereochemistry, chemical form and quantitative assay basis. A matching name or general HPLC purity percentage cannot demonstrate equivalence with a clinical formulation.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "Is SS-31 the same as elamipretide?",
        a: "SS-31 is a research name for elamipretide. Product formulation, identity and quality still need separate assessment.",
      },
      {
        q: "Is SS-31 a peptide?",
        a: "Yes. It is a synthetic tetrapeptide, meaning it contains four amino-acid residues.",
      },
      {
        q: "Did the mitochondrial myopathy trial show improved fatigue?",
        a: "MMPOWER-3 did not meet its primary fatigue or six-minute walk endpoints in the overall trial population.",
      },
      {
        q: "Is elamipretide an approved medicine?",
        a: "A specific elamipretide product received US accelerated approval for Barth syndrome in patients weighing at least 30 kg. That is not a blanket approval of SS-31 materials. FDA source.",
      },
      {
        q: "Does SS-31 reverse ageing?",
        a: "The cited trials do not demonstrate reversal of ageing or longer lifespan in humans.",
      },
      {
        q: "Is SS-31 interchangeable with MOTS-C?",
        a: "No. They are different peptides with different mechanisms, study programmes and evidence.",
      },
      {
        q: "Where can I find SS-31 research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "MOTS-C",
        slug: "mots-c",
        kind: "research",
      },
      {
        label: "NAD+",
        slug: "nad-plus",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "semax",
    name: "Semax",
    category: "Neuropeptides / Neural Signalling",
    product_slug: "semax",
    card_title: "What Is Semax?",
    card_description: "Semax is a synthetic heptapeptide investigated in neural signalling, neurotrophin regulation and cerebral ischaemia research.",
    seo_title: "Semax Research: Neurotrophins & Brain Signalling | PEPLAB",
    seo_description: "Explore Semax research on neurotrophins, cerebral ischaemia and neural signalling, with original studies, human-evidence limits and COA guidance.",
    eyebrow: "Neuropeptides / Neural Signalling",
    h1: "Semax Research Overview",
    subtitle: "Neurotrophin and Cerebral Ischaemia Research",
    intro: `Semax is a synthetic heptapeptide investigated in neural signalling, neurotrophin regulation and cerebral ischaemia research. Its evidence includes animal experiments and published human reports in specific clinical settings. This page distinguishes those studies from claims of reliably improving attention, memory or productivity in healthy people.

For guidance on study design and analytical evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is Semax?",
    what_is_body: "Semax is an analogue derived from an adrenocorticotropic hormone fragment with a Pro–Gly–Pro extension. It is a seven-amino-acid peptide, not the full ACTH hormone. Its relationship to a hormone fragment does not establish that it reproduces all actions of that hormone or that every modified Semax product is equivalent.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Semax",
      },
      {
        feature: "Compound type",
        details: "Synthetic heptapeptide",
      },
      {
        feature: "Peptide length",
        details: "Seven amino acids",
      },
      {
        feature: "Research origin",
        details: "ACTH-fragment analogue with a Pro–Gly–Pro extension",
      },
      {
        feature: "Research areas",
        details: "Neurotrophins, ischaemia-related responses and neural signalling",
      },
      {
        feature: "Evidence base",
        details: "Preclinical mechanisms and limited setting-specific human publications",
      },
    ],
    mechanism_heading: "How Does Semax Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Neurotrophin Research",
        body: "Studies have examined brain-derived neurotrophic factor, or BDNF, and related signalling. BDNF participates in neural biology, but a change in its expression does not prove better memory or attention.",
      },
      {
        title: "Ischaemia-Related Responses",
        body: "Cerebral ischaemia involves reduced blood supply to the brain. Experimental work examines inflammatory and neural gene responses in this context.",
      },
      {
        title: "Formulation and Analogue Differences",
        body: "Semax, acetylated derivatives and other modified peptides should not be treated as one substance. Delivery route and the exact material affect interpretation of the evidence.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "Semax Research Findings",
    findings_sections: [
      {
        title: "BDNF in Animal Models",
        body: "A 2006 study investigated Semax and BDNF protein in rat basal forebrain. It provides mechanistic evidence in an animal model, not a clinical demonstration of improved cognition in healthy adults.",
        link_label: "Read the rat BDNF study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/16635254/",
      },
      {
        title: "Gene Expression After Experimental Ischaemia",
        body: "A 2022 paper compared Semax-related effects with other glyproline peptides in a rat model of cerebral ischaemia-reperfusion. Researchers assessed inflammatory and neurotransmission-related gene expression. These molecular endpoints cannot establish recovery or prevention of human stroke.",
        link_label: "Read the ischaemia-reperfusion study",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/36553646/",
      },
      {
        title: "Human Stroke-Rehabilitation Report",
        body: "A 2018 publication evaluated Semax in patients at different stages of ischaemic stroke and reported BDNF-related and rehabilitation findings. Its clinical setting differs from healthy-person cognitive enhancement. Study design, background care and independent replication must be considered before broader conclusions are drawn.",
        link_label: "Read the human rehabilitation report",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/29798983/",
      },
    ],
    glance_rows: [
      {
        area: "Neurotrophins",
        investigated: "BDNF-related responses in animal experiments",
        distinction: "A biomarker is not a direct cognitive outcome",
      },
      {
        area: "Ischaemia models",
        investigated: "Inflammatory and neural gene expression",
        distinction: "Animal injury models do not prove human treatment benefit",
      },
      {
        area: "Human reports",
        investigated: "Specific stroke-rehabilitation settings",
        distinction: "Not proof of general nootropic effectiveness",
      },
    ],
    safety_body: `The selected literature does not establish comprehensive long-term safety or predictable cognitive benefits in healthy users. Findings from one route, clinical setting or peptide variant should not be extrapolated to another. Small or setting-specific reports cannot exclude uncommon adverse effects. A research sample’s analytical identity also does not establish its suitability for personal administration.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding Semax Testing and COAs",
    coa_body: `Analytical methods answer different questions. A Certificate of Analysis should identify the submitted sample and report the actual measurements performed.

• **Purity:** Chromatographic testing measures detected components under specified conditions; a percentage alone does not establish vial content.

• **Identity:** Appropriate methods, such as mass spectrometry with complementary analysis where needed, assess consistency with the stated material.

• **Content:** A validated quantitative assay measures the amount of the specified compound.

Verify native Semax identity and terminal chemistry. Do not substitute data for acetylated, amidated or otherwise modified analogues without documenting the distinction. Each formulation requires its own content and stability assessment.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa), checking whether a report covers the material and batch being assessed.`,
    faqs: [
      {
        q: "What is Semax?",
        a: "Semax is a synthetic seven-amino-acid peptide investigated in neurotrophin, neural-signalling and cerebral ischaemia research.",
      },
      {
        q: "Does Semax raise BDNF?",
        a: "Some studies report BDNF-related changes in specific experimental or clinical settings. That does not establish a reliable cognitive benefit for every person.",
      },
      {
        q: "Is Semax proven to improve focus?",
        a: "The studies discussed here do not establish consistent focus enhancement in healthy adults through large, well-controlled trials.",
      },
      {
        q: "Is Semax the same as Selank?",
        a: "No. They are distinct peptides with different origins and research histories. A shared interest in neural signalling does not make them interchangeable.",
      },
      {
        q: "Are modified Semax versions equivalent?",
        a: "Not automatically. Acetylation or other changes create different materials, and evidence should match the exact peptide studied.",
      },
      {
        q: "Does research on Semax support a Semax + Selank blend?",
        a: "Individual-compound research does not establish the interaction, stability or effectiveness of a combined formulation.",
      },
      {
        q: "Where can I find Semax research papers?",
        a: "Start with the original-study links above. Check the molecule, formulation, study population and measured outcomes before applying a finding to another preparation.",
      },
    ],
    related: [
      {
        label: "Semax + Selank Blend",
        slug: "semax-selank",
        kind: "research",
      },
    ],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
  {
    slug: "thymosin-alpha-1",
    name: "Thymosin Alpha-1",
    category: "Immune Signalling / Clinical Research",
    product_slug: "thymosin-aplha-1",
    card_title: "What Is Thymosin Alpha-1?",
    card_description: "Thymosin alpha-1 is a peptide studied for modulation of immune responses.",
    seo_title: "Thymosin Alpha-1 Research Overview | PEPLAB",
    seo_description: "Explore thymosin alpha-1 research on immune modulation, sepsis and clinical outcomes, including trial limitations, FAQs and peptide testing guidance.",
    eyebrow: "Immune Signalling / Clinical Research",
    h1: "Thymosin Alpha-1 Research Overview",
    subtitle: "Immune Modulation and Clinical Outcome Research",
    intro: `Thymosin alpha-1 is a peptide studied for modulation of immune responses. Human research spans several disease settings, but findings depend on the population and clinical outcome. A change in an immune marker does not necessarily produce fewer infections or improved survival.

For guidance on evaluating evidence, visit PEPLAB’s Research Overview.`,
    what_is_heading: "What Is Thymosin Alpha-1?",
    what_is_body: "Thymosin alpha-1 is a 28-amino-acid peptide associated with thymic biology. The synthetic form is also known as thymalfasin. It is distinct from thymosin beta-4, TB-500 and mixed thymic extracts. The correct spelling is thymosin alpha-1.",
    feature_rows: [
      {
        feature: "Compound name",
        details: "Thymosin alpha-1",
      },
      {
        feature: "Other names",
        details: "Tα1; thymalfasin for the synthetic form",
      },
      {
        feature: "Compound type",
        details: "28-amino-acid peptide",
      },
      {
        feature: "Research area",
        details: "Immune modulation",
      },
      {
        feature: "Evidence discussed",
        details: "Condition-specific randomised clinical trials",
      },
    ],
    mechanism_heading: "How Does Thymosin Alpha-1 Work?",
    mechanism_intro: "",
    mechanism_sections: [
      {
        title: "Immune Cell Responses",
        body: "Research examines effects on immune signalling and cellular responses. Immune systems are regulated networks, so greater activity in one measurement should not be described as universally stronger immunity.",
      },
      {
        title: "Disease Context",
        body: "The balance between inflammation and impaired immune function differs between conditions and patients. A finding in intensive care cannot be assumed to apply to healthy people.",
      },
      {
        title: "Clinical Outcomes",
        body: "Trials measure outcomes such as infected complications and mortality. These endpoints provide a different level of evidence from laboratory immune markers.",
      },
    ],
    mechanism_footer: "",
    findings_heading: "Thymosin Alpha-1 Research Findings",
    findings_sections: [
      {
        title: "Earlier Sepsis Research",
        body: "The 2013 ETASS study was a multicentre, single-blind randomised trial in severe sepsis. It contributed early clinical evidence and the rationale for larger, more rigorously blinded studies. Its design and findings should be read alongside subsequent trials.",
        link_label: "Read the ETASS trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/23327199/",
      },
      {
        title: "Larger Phase 3 Sepsis Trial",
        body: "The 2025 TESTS trial enrolled 1,106 adults and found no clear evidence that thymosin alpha-1 reduced 28-day all-cause mortality. A subsequent correction updated some data; the paper should be read with that correction. The overall result does not support a broad survival claim.",
        link_label: "Read the TESTS trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/39814420/",
      },
      {
        title: "Acute Pancreatitis Trial",
        body: "A 2022 randomised, double-blind trial involving 508 patients with predicted severe acute necrotising pancreatitis did not find a reduction in infected pancreatic necrosis during the index admission. This illustrates why immune-related mechanisms do not guarantee better clinical outcomes.",
        link_label: "Read the pancreatitis trial",
        link_url: "https://pubmed.ncbi.nlm.nih.gov/35713670/",
      },
    ],
    glance_rows: [
      {
        area: "Immune biology",
        investigated: "Cell responses and signalling",
        distinction: "Not a universal immunity score",
      },
      {
        area: "Sepsis",
        investigated: "Mortality in selected patients",
        distinction: "Larger trial did not establish benefit",
      },
      {
        area: "Pancreatitis",
        investigated: "Infected pancreatic necrosis",
        distinction: "No reduction in the cited trial",
      },
    ],
    safety_body: `Safety and effectiveness must be assessed for the exact population, formulation and accompanying care. Clinical studies in serious illness do not establish long-term preventive use in healthy people. An absence of a clear efficacy benefit should be reported alongside tolerability, rather than replaced by a general immune-boosting claim.

This page summarises scientific evidence and does not provide instructions for personal use.`,
    coa_heading: "Understanding Thymosin Alpha-1 Testing and COAs",
    coa_body: `Analytical methods answer different questions. Review the compound name, sample or batch identifier, laboratory, testing date, methods and reported results.

• **Purity:** Chromatography measures the relative proportions of detected components under specified conditions.

• **Identity:** Mass spectrometry and complementary methods assess whether a sample is consistent with the stated molecule.

• **Content:** A validated quantitative assay measures the amount of the specified material.

Confirm the 28-residue sequence and specified N-terminal acetylation. Distinguish thymosin alpha-1 from thymosin beta peptides and thymic extracts. A purity chromatogram does not establish clinical immune effects or equivalence with a medicinal study preparation.

Purity does not establish sterility, endotoxin status or clinical effectiveness. Explore PEPLAB’s [Quality & Testing](/standards) information and available [COA Results](/coa). Only treat a property as tested when the relevant measurement is reported.`,
    faqs: [
      {
        q: "Is thymalfasin related to thymosin alpha-1?",
        a: "Thymalfasin is the name used for the synthetic form of thymosin alpha-1.",
      },
      {
        q: "Is it the same as TB-500?",
        a: "No. Thymosin alpha-1 and thymosin beta-related peptides are different molecules.",
      },
      {
        q: "Has it been studied in humans?",
        a: "Yes. Research includes randomised trials in specific disease settings.",
      },
      {
        q: "Did the largest sepsis trial establish a mortality benefit?",
        a: "The cited TESTS trial found no clear evidence of a reduction in 28-day mortality.",
      },
      {
        q: "Does immune modulation mean stronger immunity for everyone?",
        a: "No. Effects depend on the disease context and the outcome measured.",
      },
      {
        q: "Do intensive-care studies prove everyday infection prevention?",
        a: "No. That is a different clinical question requiring its own evidence.",
      },
      {
        q: "Where can I find Thymosin Alpha-1 research papers?",
        a: "Follow the original-source links above and search the compound name on PubMed. Check the exact molecule, population and outcome in each publication.",
      },
    ],
    related: [],
    status: "published",
    author_name: null,
    published_at: "2026-10-08T00:00:00.000Z",
  },
];
