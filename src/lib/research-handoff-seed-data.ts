import type { ResearchArticleInput } from '@/lib/research-articles';

/** Seed articles parsed from DocumentContent developer handoffs (2026-10-08). */
export const RESEARCH_HANDOFF_SEED_ARTICLES: ResearchArticleInput[] = [
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
];
