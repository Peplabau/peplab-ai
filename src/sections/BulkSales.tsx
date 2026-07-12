import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Building2, FlaskConical, Handshake, PackageCheck, MessageCircle, ArrowRight } from 'lucide-react';
import { CONFIG } from '@/lib/config';

gsap.registerPlugin(ScrollTrigger);

const bulkHighlights = [
  {
    icon: FlaskConical,
    title: 'HPLC-verified quality',
    description: 'Consistent batches with clear testing standards for repeat procurement.',
  },
  {
    icon: PackageCheck,
    title: 'Priority fulfilment',
    description: 'Structured dispatch planning for larger-volume and recurring orders.',
  },
  {
    icon: Handshake,
    title: 'Dedicated support',
    description: 'Direct coordination for quote, stock planning, and delivery windows.',
  },
];

type BulkSalesProps = {
  /** Tighter layout for /landing — less padding, no scroll-scrub fade */
  compact?: boolean;
};

export default function BulkSales({ compact = false }: BulkSalesProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compact) return;

    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        [headerRef.current, cardsRef.current, ctaRef.current],
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'top 50%',
            scrub: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, [compact]);

  return (
    <section
      ref={sectionRef}
      id="bulk-sales"
      className={`relative z-30 ${compact ? 'py-12 sm:py-14 lg:py-16' : 'py-20 lg:py-28'}`}
    >
      <div className="relative z-10 px-6 lg:px-12 max-w-6xl mx-auto">
        <div ref={headerRef} className="text-center mb-10">
          <span className="text-eyebrow mb-4 block">BULK SALES</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
            Scale with <span className="gradient-text">Wholesale Supply</span>
          </h2>
          <p className="text-base sm:text-lg text-[#A9B3C7] max-w-3xl mx-auto">
            Built for labs, clinics, and resellers that need larger quantities, stable quality, and responsive support.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {bulkHighlights.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[#111827] p-6 hover:border-[rgba(46,209,180,0.28)] transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-[rgba(46,209,180,0.12)] flex items-center justify-center mb-4">
                <item.icon className="w-5 h-5 text-[#2ED1B4]" />
              </div>
              <h3 className="text-lg font-semibold text-[#F4F6FA] mb-2">{item.title}</h3>
              <p className="text-sm text-[#A9B3C7] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div
          ref={ctaRef}
          className="rounded-2xl border border-[rgba(139,92,246,0.25)] bg-[#111827] p-6 sm:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#C4B5FD]" />
                <p className="text-xs uppercase tracking-[0.14em] text-[#C4B5FD]">Bulk Enquiries</p>
              </div>
              <p className="text-[#F4F6FA] text-lg sm:text-xl font-semibold mb-2">
                Request custom quote for higher-volume orders
              </p>
              <p className="text-sm text-[#A9B3C7] max-w-2xl">
                Share your product list, quantities, destination and timeline. Our team will reply with MOQ, volume pricing, and fulfilment details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a href="/contact-info" className="btn-primary inline-flex items-center gap-2">
                Request Bulk Quote
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={CONFIG.SOCIAL.TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Talk on Telegram
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
