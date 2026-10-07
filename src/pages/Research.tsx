import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  BookOpen,
  Microscope,
  FileSearch,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  Library,
  Search,
  ArrowDown,
  ArrowRight,
  List,
  Shield,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import ContentPageHeader from '@/components/ContentPageHeader';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';
import {
  COA_ARCHIVE_PATH,
  RESEARCH_PATH,
  RESEARCH_COMPOUNDS_PATH,
} from '@/lib/routes';
import Footer from '@/sections/Footer';
import { ResearchSectionNav } from '@/components/ResearchSectionNav';

const RESEARCH_HERO_BG = '/research-hero-vials.png';

const sectionClass =
  'p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]';
const bodyClass = 'text-[#A9B3C7] leading-relaxed';
const listClass = 'space-y-2 text-[#A9B3C7] mt-3';
const linkClass = 'text-[#A78BFA] hover:underline';
const h2Class = 'text-xl font-bold text-[#F4F6FA]';
const h3Class = 'text-lg font-semibold text-[#F4F6FA] mb-2';

const RESEARCH_AREAS = [
  {
    area: 'Molecular structure',
    question:
      'How do amino acid sequence and chemical modifications affect a peptide’s properties?',
  },
  {
    area: 'Receptor interactions',
    question:
      'Does a peptide interact with a particular target, and how selective is that interaction?',
  },
  {
    area: 'Cellular signalling',
    question:
      'How does a peptide influence measurable responses in an experimental system?',
  },
  {
    area: 'Stability',
    question:
      'How does a peptide change under defined storage or experimental conditions?',
  },
  {
    area: 'Analytical testing',
    question: 'How can identity, purity and peptide content be measured reliably?',
  },
] as const;

const PAPER_CHECKS = [
  'What material was studied? Check the exact compound, sequence or formulation.',
  'What kind of study was conducted? Distinguish laboratory, animal and human research.',
  'Was there an appropriate comparison? Controls help researchers interpret an observed effect.',
  'What was measured? A change in a laboratory marker is different from a demonstrated clinical outcome.',
  'How strong is the evidence? Consider sample size, uncertainty, limitations and independent replication.',
  'Were conflicts of interest disclosed? Funding and commercial relationships provide relevant context.',
] as const;

const COA_CHECKS = [
  {
    title: 'Sample identification',
    text: 'Does the report identify the expected compound?',
  },
  {
    title: 'Batch information',
    text: 'Is there a batch or lot reference connecting the report to the material?',
  },
  {
    title: 'Laboratory and date',
    text: 'Who performed the analysis, and when?',
  },
  {
    title: 'Methods',
    text: 'Which properties were actually measured?',
  },
  {
    title: 'Results and units',
    text: 'Are purity, mass and content clearly distinguished?',
  },
  {
    title: 'Scope and limitations',
    text: 'What conclusions does the report support?',
  },
] as const;

const FAQS = [
  {
    q: 'What is peptide research?',
    a: 'Peptide research is the scientific investigation of peptide molecules, including their structure, biological interactions and analytical properties. It can involve laboratory experiments, preclinical studies and, for certain candidates, human clinical research.',
  },
  {
    q: 'Are all research compounds peptides?',
    a: 'No. “Research compound” is a broader term that can include peptides and other types of molecules. Each compound should be identified and assessed according to its own chemistry and evidence.',
  },
  {
    q: 'Does high purity mean a peptide is safe?',
    a: 'No. Purity is an analytical measurement, not a clinical safety assessment. A high HPLC purity result does not establish sterility, correct vial content or suitability for human use.',
  },
  {
    q: 'Is peptide purity the same as peptide quantity?',
    a: 'No. Chromatographic purity describes the relative composition detected under a test method. Peptide quantity describes how much peptide is present. These require distinct measurements.',
  },
  {
    q: 'Can research findings about one peptide be applied to another?',
    a: 'Not automatically. Related peptides can differ in structure, selectivity, stability and biological activity. Conclusions should remain tied to the compound and experimental conditions studied.',
  },
] as const;

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <ExternalLink className="inline w-3 h-3 ml-1 align-text-top opacity-70" />
    </a>
  );
}

export default function Research() {
  return (
    <>
      <SEO title={PAGE_SEO.research.title} description={PAGE_SEO.research.description} />
      <JsonLd
        id="research-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Research', path: RESEARCH_PATH },
          { name: 'Overview', path: RESEARCH_PATH },
        ])}
      />

      <div className="min-h-screen" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />

        <ContentPageHeader />

        <main className="relative z-10">
          {/* Lazarus-style research hero — PEPLAB theme */}
          <section className="relative overflow-hidden border-b border-[rgba(244,246,250,0.06)]">
            <div
              className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${RESEARCH_HERO_BG})` }}
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(7,10,18,0.92) 0%, rgba(7,10,18,0.78) 45%, rgba(7,10,18,0.55) 100%), linear-gradient(180deg, rgba(7,10,18,0.55) 0%, rgba(7,10,18,0.85) 100%)',
              }}
              aria-hidden
            />
            <div className="relative mx-auto max-w-6xl px-6 lg:px-12 py-12 lg:py-16">
              <div className="mb-10 flex justify-center lg:justify-start">
                <ResearchSectionNav active="overview" />
              </div>

              <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
                <div>
                  <p className="mb-4 flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.35em] text-[#A78BFA]">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#A78BFA]" />
                    PEPLAB Research
                  </p>
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight leading-[1.05] text-[#F4F6FA] mb-5">
                    Research{' '}
                    <span className="text-[#A78BFA]">Overviews</span>
                  </h1>
                  <p className="text-[#A9B3C7] text-base sm:text-lg leading-relaxed max-w-xl mb-7">
                    Explore scientific classifications, studied mechanisms and primary sources.
                    Plain-English, citation-backed overviews for laboratory and educational research.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {[
                      { icon: List, label: 'Primary Sources' },
                      { icon: BookOpen, label: 'Plain English' },
                      { icon: Shield, label: 'Research Use Only · 18+' },
                    ].map(({ icon: Icon, label }) => (
                      <span
                        key={label}
                        className="inline-flex items-center gap-2 rounded-full border border-[rgba(244,246,250,0.14)] bg-[rgba(17,24,39,0.7)] px-3.5 py-2 text-xs sm:text-sm text-[#F4F6FA]"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#A78BFA]" />
                        {label}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={RESEARCH_COMPOUNDS_PATH}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_0_28px_rgba(236,72,153,0.35)] hover:from-[#7C4FED] hover:to-[#DB2777] transition-colors"
                  >
                    Find Your Compound
                    <ArrowDown className="w-4 h-4" />
                  </Link>
                </div>

                <aside className="rounded-2xl border border-[rgba(167,139,250,0.35)] bg-[rgba(17,24,39,0.75)] p-6 sm:p-7 shadow-[0_0_40px_rgba(167,139,250,0.08)]">
                  <p className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#A78BFA] mb-2">
                    Inside each overview
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-[#F4F6FA] mb-6">
                    Follow the <span className="text-[#A78BFA]">Evidence.</span>
                  </h2>

                  <ol className="relative space-y-5 pl-1">
                    {[
                      {
                        n: '01',
                        title: 'Classification',
                        body: 'What the compound is and how it is described.',
                      },
                      {
                        n: '02',
                        title: 'Mechanisms',
                        body: 'The receptors and pathways studied in research.',
                      },
                      {
                        n: '03',
                        title: 'Primary sources',
                        body: 'References to the published scientific record.',
                      },
                    ].map((step, i, arr) => (
                      <li key={step.n} className="relative flex gap-4">
                        {i < arr.length - 1 && (
                          <span
                            className="absolute left-[17px] top-10 bottom-[-20px] w-px bg-[rgba(167,139,250,0.25)]"
                            aria-hidden
                          />
                        )}
                        <span className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(167,139,250,0.45)] bg-[rgba(7,10,18,0.8)] text-xs font-bold text-[#A78BFA]">
                          {step.n}
                        </span>
                        <div className="pt-1">
                          <p className="font-semibold text-[#F4F6FA] mb-0.5">{step.title}</p>
                          <p className="text-sm text-[#A9B3C7] leading-relaxed">{step.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <a
                    href="#how-we-prepare"
                    className="mt-7 flex items-center justify-between border-t border-[rgba(244,246,250,0.08)] pt-4 text-sm font-medium text-[#A78BFA] hover:underline"
                  >
                    How we prepare the overviews
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </aside>
              </div>
            </div>
          </section>

          <div className="px-6 lg:px-12 py-12 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6" id="how-we-prepare">
              <section className={sectionClass}>
                <p className={`${bodyClass} mb-4`}>
                  Peptide research investigates how chains of amino acids interact with biological
                  systems. It includes studies of molecular structure, cell signalling, receptor
                  activity and the analytical methods used to characterise research materials.
                </p>
                <p className={`${bodyClass} mb-4`}>
                  PEPLAB Australia supplies research peptides and provides access to published
                  testing information. Our Research Overview introduces the science behind peptide
                  research, explains how to assess evidence and helps you understand what laboratory
                  reports can—and cannot—tell you.
                </p>
                <p className={bodyClass}>
                  For information about an individual peptide or research compound, use{' '}
                  <Link to={RESEARCH_COMPOUNDS_PATH} className={linkClass}>
                    Find Your Compound
                  </Link>{' '}
                  in our Research section.
                </p>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-[#A78BFA]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>What Are Peptides?</h2>
                </div>
                <div className="space-y-4">
                  <p className={bodyClass}>
                    Peptides are molecules made from amino acids joined by peptide bonds. Their amino
                    acid sequence and chemical structure influence their properties and interactions.
                  </p>
                  <p className={bodyClass}>
                    Scientists study both naturally occurring and synthetic peptides. Some
                    investigations examine biological mechanisms; others focus on developing
                    analytical methods or evaluating potential therapeutic candidates.
                  </p>
                  <p className={bodyClass}>
                    Peptides are not interchangeable. A change in sequence, structure or chemical
                    modification can alter a molecule’s behaviour. Research findings therefore need
                    to be matched to the specific compound studied.
                  </p>
                  <p className={bodyClass}>
                    For a scientific introduction, see the{' '}
                    <ExtLink href="https://www.genome.gov/genetics-glossary/Peptide">
                      National Human Genome Research Institute’s definition of peptides
                    </ExtLink>
                    .
                  </p>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>What Are Research Peptides?</h2>
                <div className="space-y-4">
                  <p className={bodyClass}>
                    Research peptides are peptide materials intended for scientific investigation.
                    Depending on their specifications, they may be used in laboratory experiments,
                    analytical testing or studies of molecular interactions.
                  </p>
                  <p className={bodyClass}>
                    “Research use only” describes an intended use. It does not establish clinical
                    safety, pharmaceutical quality or approval for human use.
                  </p>
                  <p className={bodyClass}>
                    It is also important to distinguish a research material from an approved
                    medicine. A published study involving a particular peptide does not establish
                    that every product carrying the same name has equivalent quality, formulation or
                    effects.
                  </p>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center flex-shrink-0">
                    <Microscope className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>What Does Peptide Research Study?</h2>
                </div>
                <p className={`${bodyClass} mb-4`}>
                  Peptide research spans several areas of biology and analytical science. Common
                  research questions include:
                </p>

                <div className="overflow-x-auto rounded-xl border border-[rgba(244,246,250,0.08)]">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(244,246,250,0.08)] bg-[rgba(7,10,18,0.5)]">
                        <th className="px-4 py-3 font-semibold text-[#F4F6FA] whitespace-nowrap">
                          Research area
                        </th>
                        <th className="px-4 py-3 font-semibold text-[#F4F6FA]">
                          Questions researchers investigate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {RESEARCH_AREAS.map((row) => (
                        <tr
                          key={row.area}
                          className="border-b border-[rgba(244,246,250,0.06)] last:border-0"
                        >
                          <td className="px-4 py-3 text-[#F4F6FA] font-medium align-top whitespace-nowrap">
                            {row.area}
                          </td>
                          <td className="px-4 py-3 text-[#A9B3C7]">{row.question}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <p className={`${bodyClass} mt-4`}>
                  The relevance of each area depends on the individual compound. A proposed mechanism
                  is a starting point for investigation, not proof of a practical benefit.
                </p>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>How to Understand Peptide Research Evidence</h2>
                <p className={`${bodyClass} mb-6`}>
                  The meaning of a research finding depends on how the study was conducted.
                  Laboratory results, animal findings and human clinical outcomes answer different
                  questions.
                </p>

                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>Laboratory and Cell Studies</h3>
                    <p className={`${bodyClass} mb-2`}>
                      Laboratory studies may use isolated molecules, cells or tissues to investigate
                      interactions and biological responses.
                    </p>
                    <p className={bodyClass}>
                      These studies can help explain a mechanism, but their results depend on the
                      experimental conditions. An effect observed in a cell culture does not
                      establish that the same effect occurs in people.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Animal Studies</h3>
                    <p className={`${bodyClass} mb-2`}>
                      Animal studies investigate responses within a living system. They may help
                      researchers explore biological activity and identify potential safety concerns.
                    </p>
                    <p className={bodyClass}>
                      Differences between species limit how directly these findings can be applied to
                      humans.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Human Clinical Studies</h3>
                    <p className={`${bodyClass} mb-2`}>
                      Clinical trials investigate defined interventions in human participants. Their
                      findings must be interpreted in the context of the study population,
                      formulation, comparison group, duration and measured outcomes.
                    </p>
                    <p className={`${bodyClass} mb-2`}>
                      A trial involving a pharmaceutical preparation does not validate a separately
                      supplied research product.
                    </p>
                    <p className={bodyClass}>
                      The{' '}
                      <ExtLink href="https://www.nih.gov/health-information/nih-clinical-research-trials-you">
                        National Institutes of Health’s guide to clinical research
                      </ExtLink>{' '}
                      explains clinical trials and how they contribute to scientific evidence.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>What Makes a Research Paper Useful?</h2>
                <p className={`${bodyClass} mb-3`}>
                  A useful paper provides enough detail to understand what was tested, how it was
                  measured and what remains uncertain.
                </p>
                <p className={`${bodyClass} mb-3`}>When reviewing peptide research, ask:</p>
                <ul className={listClass}>
                  {PAPER_CHECKS.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-[#A78BFA] mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className={`${bodyClass} mt-4`}>
                  Read beyond the headline or abstract where possible. A statistically significant
                  finding may still have limited practical relevance.
                </p>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center flex-shrink-0">
                    <FileSearch className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>How Are Research Peptides Tested?</h2>
                </div>
                <p className={`${bodyClass} mb-6`}>
                  Peptide characterisation usually requires more than one analytical method.
                  Identity, chromatographic purity and peptide content describe different properties.
                </p>

                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>HPLC: Assessing Chromatographic Purity</h3>
                    <p className={`${bodyClass} mb-2`}>
                      High-performance liquid chromatography, or HPLC, separates components within a
                      sample.
                    </p>
                    <p className={bodyClass}>
                      An HPLC purity percentage commonly describes the target peak’s area relative to
                      the total integrated peak area detected under the method’s conditions. It is
                      not automatically the percentage of the sample’s total mass that consists of
                      the target peptide.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Mass Spectrometry: Supporting Identity Assessment</h3>
                    <p className={`${bodyClass} mb-2`}>
                      Mass spectrometry measures mass-to-charge ratios. Results can help assess
                      whether a sample is consistent with the expected peptide.
                    </p>
                    <p className={bodyClass}>
                      A matching molecular mass alone does not resolve every structural question.
                      Additional analysis, such as tandem mass spectrometry, may be needed.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>Quantitative Analysis: Measuring Peptide Content</h3>
                    <p className={`${bodyClass} mb-2`}>
                      Content testing determines how much peptide is present using an appropriate
                      quantitative method and reference standard.
                    </p>
                    <p className={bodyClass}>
                      A vial’s total powder weight and its peptide content are not necessarily the
                      same. Water, counterions and other components may contribute to the material’s
                      mass.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>What These Tests Do Not Establish</h3>
                    <p className={`${bodyClass} mb-2`}>
                      Purity, identity and content results do not, by themselves, establish
                      sterility, absence of endotoxins or safety for human use. Those are separate
                      questions requiring appropriate evidence.
                    </p>
                    <p className={bodyClass}>
                      For further reading, see{' '}
                      <ExtLink href="https://www.usp.org/sites/default/files/usp/document/our-work/biologics/reference_standards_to_support_quality_of_synthetic_peptide_therapeutics.pdf">
                        Reference Standards to Support Quality of Synthetic Peptide Therapeutics
                      </ExtLink>
                      , which describes analytical approaches used to characterise peptide reference
                      materials.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <h2 className={`${h2Class} mb-4`}>How to Read a Certificate of Analysis</h2>
                <p className={`${bodyClass} mb-3`}>
                  A Certificate of Analysis, or COA, reports analytical results for a submitted
                  sample. Its value depends on the information provided and its connection to the
                  material being assessed.
                </p>
                <p className={`${bodyClass} mb-3`}>Check the following:</p>
                <ul className={listClass}>
                  {COA_CHECKS.map((item) => (
                    <li key={item.title} className="flex items-start gap-2">
                      <span className="text-[#A78BFA] mt-1">•</span>
                      <span>
                        <strong className="text-[#F4F6FA]">{item.title}:</strong> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className={`${bodyClass} mt-4 mb-4`}>
                  A COA for one sample should not automatically be treated as evidence for every
                  batch or product with the same name.
                </p>
                <p className={bodyClass}>
                  Explore PEPLAB’s{' '}
                  <Link to={COA_ARCHIVE_PATH} className={linkClass}>
                    COA Results
                  </Link>{' '}
                  and{' '}
                  <Link to="/standards" className={linkClass}>
                    Quality &amp; Testing
                  </Link>{' '}
                  information to review available documentation.
                </p>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(236,72,153,0.1)] flex items-center justify-center flex-shrink-0">
                    <Library className="w-6 h-6 text-[#EC4899]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>Where to Find Published Peptide Research</h2>
                </div>
                <p className={`${bodyClass} mb-6`}>
                  Use established scientific resources to investigate individual compounds and trace
                  claims back to their original evidence.
                </p>

                <div className="space-y-5">
                  <div>
                    <h3 className={h3Class}>PubMed</h3>
                    <p className={`${bodyClass} mb-2`}>
                      <ExtLink href="https://pubmed.ncbi.nlm.nih.gov/">PubMed</ExtLink> is a
                      biomedical literature database maintained by the US National Library of
                      Medicine. Search using a compound’s scientific name, recognised synonyms and
                      the research topic.
                    </p>
                    <p className={bodyClass}>
                      Check the publication type: an original experiment, review article and
                      commentary serve different purposes.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>PubMed Central</h3>
                    <p className={bodyClass}>
                      <ExtLink href="https://www.ncbi.nlm.nih.gov/pmc/">PubMed Central</ExtLink>{' '}
                      provides access to full-text biomedical and life sciences articles. Full papers
                      let you examine methods, results and limitations in more detail than an
                      abstract.
                    </p>
                  </div>
                  <div>
                    <h3 className={h3Class}>ClinicalTrials.gov</h3>
                    <p className={`${bodyClass} mb-2`}>
                      <ExtLink href="https://clinicaltrials.gov/">ClinicalTrials.gov</ExtLink>{' '}
                      provides study records, including research objectives, eligibility criteria,
                      study status and results where submitted.
                    </p>
                    <p className={bodyClass}>
                      A registered study is not the same as a completed study with positive results.
                      Registration alone does not establish safety or effectiveness.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(236,72,153,0.1)] flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-6 h-6 text-[#EC4899]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>Frequently Asked Questions</h2>
                </div>
                <div className="space-y-5">
                  {FAQS.map((faq) => (
                    <div key={faq.q}>
                      <h3 className={h3Class}>{faq.q}</h3>
                      <p className={bodyClass}>{faq.a}</p>
                    </div>
                  ))}
                  <div>
                    <h3 className={h3Class}>Where can I find research about a specific compound?</h3>
                    <p className={bodyClass}>
                      Use{' '}
                      <Link to={RESEARCH_COMPOUNDS_PATH} className={linkClass}>
                        Find Your Compound
                      </Link>{' '}
                      in the PEPLAB Research section to navigate to the relevant research overview.
                      For independent literature searches, use{' '}
                      <ExtLink href="https://pubmed.ncbi.nlm.nih.gov/">PubMed</ExtLink> and check{' '}
                      <ExtLink href="https://clinicaltrials.gov/">ClinicalTrials.gov</ExtLink> for
                      registered human studies.
                    </p>
                  </div>
                </div>
              </section>

              <section className={sectionClass}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center flex-shrink-0">
                    <Search className="w-6 h-6 text-[#A78BFA]" />
                  </div>
                  <h2 className={`${h2Class} pt-2`}>Explore PEPLAB Research</h2>
                </div>
                <p className={`${bodyClass} mb-6`}>
                  Choose Find Your Compound to explore individual peptide and compound research
                  pages, or visit our COA Results to review available analytical reports.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={RESEARCH_COMPOUNDS_PATH}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] px-5 py-3 text-sm font-semibold text-white hover:from-[#7C4FED] hover:to-[#DB2777] transition-colors"
                  >
                    Find Your Compound
                  </Link>
                  <Link
                    to={COA_ARCHIVE_PATH}
                    className="inline-flex items-center justify-center rounded-xl border border-[rgba(244,246,250,0.15)] px-5 py-3 text-sm font-semibold text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.05)] transition-colors"
                  >
                    COA Results
                  </Link>
                </div>
              </section>

              <section className="p-6 sm:p-8 rounded-2xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)]">
                <div className="flex items-start gap-4 mb-3">
                  <AlertTriangle className="w-6 h-6 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <h2 className={h2Class}>Research use only</h2>
                </div>
                <p className={bodyClass}>
                  PEPLAB research products are intended for laboratory research, not human or
                  veterinary use. This information is educational and does not provide medical
                  advice, dosing instructions or treatment recommendations. External references are
                  provided for further reading and do not imply endorsement of PEPLAB.
                </p>
              </section>
            </div>
          </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
