import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FlaskConical,
  Truck,
  FileCheck2,
  ShieldCheck,
  Package,
  ChevronDown,
  Beaker,
} from 'lucide-react';
import { COA_ARCHIVE_PATH } from '@/lib/routes';

const RANGE_ITEMS = [
  {
    name: 'BPC-157 Australia – Buy Online',
    body: 'BPC-157 is a synthetic peptide fragment that comes up often in preclinical laboratory literature. PEPLAB supplies it for in-vitro and laboratory research, with a certificate of analysis available for each batch.',
  },
  {
    name: 'TB-500 for Research Use',
    body: 'TB-500 is a synthetic peptide related to thymosin beta-4 and is commonly studied in laboratory settings. It is offered here for research use only, with the same batch testing and documentation as the rest of the range.',
  },
  {
    name: 'Semaglutide & Tirzepatide Peptides',
    body: 'Semaglutide and tirzepatide are incretin-based compounds that are the subject of extensive scientific study. PEPLAB lists them as research-grade materials for laboratory investigation. They are not supplied as therapeutic products.',
  },
  {
    name: 'Retatrutide for Sale Australia',
    body: 'Retatrutide is a newer multi-receptor compound that is still under active investigation. Research-grade material is available through PEPLAB for laboratory use only, and it is not an approved therapeutic product.',
  },
] as const;

const HPLC_POINTS = [
  {
    icon: Beaker,
    title: 'HPLC Tested with Published COAs',
    body: 'High-performance liquid chromatography (HPLC) is a standard analytical method for measuring the purity of a peptide sample. It separates a sample into its components so that any impurities show up in the results. PEPLAB treats it as one of its main analytical tools, and the resulting data is shared openly rather than kept behind the scenes.',
  },
  {
    icon: FileCheck2,
    title: 'Transparent Lab Reports (COA) for Every Batch',
    body: 'A certificate of analysis (COA) is published for each batch. It lets researchers check the tested purity of the exact material they receive. Customers can match the batch number on the vial to the report, and the reports can be viewed on the web alongside each product listing.',
  },
  {
    icon: ShieldCheck,
    title: 'Third-Party Verified Quality Standards',
    body: "Testing is supported by third-party verification, so purity claims do not rest on the supplier's word alone. Combined with internal quality controls, this gives researchers an independent reference point when judging a batch.",
  },
] as const;

const SHIPPING_POINTS = [
  {
    icon: Truck,
    title: 'Express Same-Day Dispatch Across Australia',
    body: 'Orders placed on business days are prepared quickly, and the aim is to get parcels moving the same day. Delivery times depend on the courier and destination, but domestic dispatch keeps the wait short for most of the country.',
  },
  {
    icon: Package,
    title: 'Mon–Fri Same-Day Shipping',
    body: 'Orders received on a weekday are processed for same-day dispatch, subject to the daily cut-off. Customers can create an account at checkout to follow their order and reorder more easily later.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Discreet Packaging',
    body: 'Parcels are packed to protect the contents in transit and marked plainly on the outside. Careful packaging and good security practices help make sure the product arrives in the condition it was tested in.',
  },
] as const;

const FAQ_ITEMS = [
  {
    id: 'known-for',
    question: 'What is Elite Peptides Australia known for?',
    answer:
      'PEPLAB is known for supplying HPLC-tested research peptides from Sydney, with batch-level lab reports and fast domestic dispatch.',
  },
  {
    id: 'lab-tested',
    question: 'Are your peptides lab-tested?',
    answer:
      "Yes. Every batch is tested for purity using HPLC, and the results are available in the batch's COA.",
  },
  {
    id: 'ship-au',
    question: 'Do you ship Australia-wide?',
    answer:
      'Yes. Orders are dispatched from Sydney to addresses across Australia, with same-day dispatch Monday to Friday.',
  },
  {
    id: 'human-use',
    question: 'Are these peptides approved for human use?',
    answer:
      'No. All products are sold for laboratory research purposes only. They are not approved therapeutic goods and are not intended for human or veterinary use.',
  },
  {
    id: 'purity',
    question: 'How do I know the peptides are pure and authentic?',
    answer:
      'Each batch comes with a published COA showing its tested purity. Customers can match the batch number on the vial to the report and review the results themselves.',
  },
  {
    id: 'offer',
    question: 'What peptides do you currently offer?',
    answer:
      'The range includes BPC-157, TB-500, semaglutide, tirzepatide and retatrutide, all as research materials. Check the product pages for current availability.',
  },
  {
    id: 'storage',
    question: 'How should peptides be stored?',
    answer:
      'Lyophilised (freeze-dried) peptides are generally kept in a cool, dry place away from light, and many labs store them refrigerated or frozen. Always follow the storage guidance on the product page and within your own lab protocols.',
  },
  {
    id: 'order',
    question: 'How can I place an order?',
    answer:
      'Browse the catalogue, add your items to the cart and complete checkout. Creating an account lets you track your parcel and reorder quickly.',
  },
] as const;

export default function HomeSeoContent() {
  const [openFaqId, setOpenFaqId] = useState<string | null>(FAQ_ITEMS[0].id);

  return (
    <section id="elite-peptides" className="relative z-20 py-16 sm:py-20 lg:py-28" aria-label="Elite Peptides Australia">
      <div className="relative z-10 mx-auto max-w-6xl space-y-16 sm:space-y-20 px-4 sm:px-6 lg:px-12">
        {/* Intro */}
        <header className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4 block">ELITE PEPTIDES AUSTRALIA</p>
          <h2 className="mb-5 text-3xl font-bold text-[#F4F6FA] sm:text-4xl md:text-5xl">
            Australia&apos;s Most Trusted{' '}
            <span className="gradient-text">Research Supplier</span>
          </h2>
          <div className="space-y-4 text-base leading-relaxed text-[#A9B3C7] sm:text-lg">
            <p>
              Researchers across the country often say the hardest part of sourcing compounds is
              knowing what is actually in the vial. PEPLAB was built around that concern. It is an
              Australian supplier of laboratory research peptides that puts purity testing, clear
              documentation and reliable local dispatch first. For anyone hunting for a peptide
              paradise of well-documented research materials, the idea is simple: know exactly what
              you are buying.
            </p>
            <p className="rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)] px-4 py-3 text-sm text-[#F4A4A4] sm:text-base">
              Every product is sold strictly for laboratory and research purposes. Nothing on this
              page is medical advice, and none of the compounds are intended for human consumption.
            </p>
          </div>
        </header>

        {/* Range */}
        <div>
          <div className="mb-8 text-center sm:mb-10">
            <p className="eyebrow mb-3 block">RESEARCH CATALOGUE</p>
            <h3 className="text-2xl font-bold text-[#F4F6FA] sm:text-3xl md:text-4xl">
              Our Elite Peptide Range –{' '}
              <span className="gradient-text">BPC-157, TB-500, Semaglutide &amp; More</span>
            </h3>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-[#A9B3C7] sm:text-base">
              The PEPLAB catalogue covers several of the most widely studied research peptides. All
              are supplied as research materials only. Researchers who ask about peptide tablets can
              check each product page for format details, and everything listed is for laboratory
              use.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {RANGE_ITEMS.map((item) => (
              <article
                key={item.name}
                className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.72)] p-5 sm:p-6"
              >
                <h4 className="mb-2 text-base font-semibold text-[#F4F6FA] sm:text-lg">{item.name}</h4>
                <p className="text-sm leading-relaxed text-[#A9B3C7]">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex justify-center">
            <a
              href="#catalog"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#2ED1B4] to-[#1FA896] px-7 py-3 text-sm font-semibold text-[#070A12] transition-transform hover:-translate-y-0.5"
            >
              Browse the catalogue
            </a>
          </div>
        </div>

        {/* HPLC / COA */}
        <div className="rounded-3xl border border-[rgba(244,246,250,0.08)] bg-gradient-to-br from-[#0b1e22] via-[#111827] to-[#1a1024] p-6 sm:p-8 lg:p-10">
          <div className="mb-8 max-w-3xl">
            <p className="eyebrow mb-3 block">VERIFIED PURITY</p>
            <h3 className="text-2xl font-bold text-[#F4F6FA] sm:text-3xl">
              HPLC Tested with Published COAs
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {HPLC_POINTS.map((point) => (
              <article key={point.title}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(46,209,180,0.12)]">
                  <point.icon className="h-5 w-5 text-[#2ED1B4]" strokeWidth={2} />
                </div>
                <h4 className="mb-2 text-base font-semibold text-[#F4F6FA]">{point.title}</h4>
                <p className="text-sm leading-relaxed text-[#A9B3C7]">{point.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to={COA_ARCHIVE_PATH}
              className="inline-flex text-sm font-semibold text-[#2ED1B4] hover:underline"
            >
              View published COA archive →
            </Link>
          </div>
        </div>

        {/* Shipping */}
        <div>
          <div className="mb-8 text-center sm:mb-10">
            <p className="eyebrow mb-3 block">DOMESTIC DISPATCH</p>
            <h3 className="text-2xl font-bold text-[#F4F6FA] sm:text-3xl md:text-4xl">
              Express Same-Day Dispatch Across <span className="gradient-text">Australia</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {SHIPPING_POINTS.map((point) => (
              <article
                key={point.title}
                className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[#111827] p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(139,92,246,0.12)]">
                  <point.icon className="h-5 w-5 text-[#A78BFA]" strokeWidth={2} />
                </div>
                <h4 className="mb-3 text-lg font-semibold text-[#F4F6FA]">{point.title}</h4>
                <p className="text-sm leading-relaxed text-[#A9B3C7]">{point.body}</p>
              </article>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="mb-8 text-center sm:mb-10">
            <p className="eyebrow mb-3 block">FAQ</p>
            <h3 className="text-2xl font-bold text-[#F4F6FA] sm:text-3xl md:text-4xl">
              Frequently Asked Questions
            </h3>
          </div>
          <div className="mx-auto max-w-3xl divide-y divide-[rgba(244,246,250,0.08)] overflow-hidden rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[#111827]">
            {FAQ_ITEMS.map((item) => {
              const open = openFaqId === item.id;
              const panelId = `home-faq-panel-${item.id}`;
              const buttonId = `home-faq-btn-${item.id}`;
              return (
                <article key={item.id}>
                  <h4 className="m-0">
                    <button
                      type="button"
                      id={buttonId}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#F4F6FA] transition-colors hover:bg-[rgba(244,246,250,0.03)] sm:px-6 sm:text-base"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenFaqId(open ? null : item.id)}
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#A9B3C7] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                        aria-hidden
                      />
                    </button>
                  </h4>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    hidden={!open}
                    className="px-5 pb-5 sm:px-6"
                  >
                    <p className="text-sm leading-relaxed text-[#A9B3C7]">{item.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <p className="mt-6 text-center text-sm text-[#A9B3C7]">
            Need more detail?{' '}
            <Link to="/faq" className="font-semibold text-[#2ED1B4] hover:underline">
              View full FAQ
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
