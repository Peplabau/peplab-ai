import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink } from 'lucide-react';
import TrustpilotTrustBox from '@/components/TrustpilotTrustBox';
import { CONFIG } from '@/lib/config';

gsap.registerPlugin(ScrollTrigger);

/**
 * Homepage Trustpilot section — live reviews via official TrustBox widgets.
 * Requires VITE_TRUSTPILOT_BUSINESS_UNIT_ID (from Trustpilot Business → Website widgets).
 */
export default function TrustpilotReviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const configured = Boolean(CONFIG.TRUSTPILOT.BUSINESS_UNIT_ID);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="reviews" className="relative z-30 py-20 lg:py-28">
      <div className="relative z-10 px-6 lg:px-12 max-w-6xl mx-auto">
        <div ref={headerRef} className="text-center mb-10">
          <span className="eyebrow mb-4 block">TRUSTPILOT</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
            Real reviews on <span className="gradient-text">Trustpilot</span>
          </h2>
          <p className="text-sm sm:text-base text-[#A9B3C7] max-w-2xl mx-auto">
            Verified customer feedback from our Trustpilot profile — updated automatically.
          </p>
        </div>

        {configured ? (
          <div className="space-y-8">
            <div className="flex justify-center min-h-[28px]">
              <TrustpilotTrustBox
                templateId={CONFIG.TRUSTPILOT.TEMPLATES.MICRO_TRUST_SCORE}
                height="28px"
                className="max-w-md w-full"
              />
            </div>

            <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.45)] p-4 sm:p-6 overflow-hidden">
              <TrustpilotTrustBox
                templateId={CONFIG.TRUSTPILOT.TEMPLATES.REVIEW_CAROUSEL}
                height="240px"
                stars="4,5"
                token={CONFIG.TRUSTPILOT.WIDGET_TOKEN || undefined}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.45)] p-8 text-center">
            <p className="text-sm text-[#A9B3C7] mb-4 leading-relaxed">
              Trustpilot widget is not configured yet. Add your Business Unit ID from Trustpilot
              Business → Share &amp; promote → Website widgets.
            </p>
            <a
              href={CONFIG.TRUSTPILOT.PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold bg-[#2ED1B4] text-[#070A12] hover:bg-[#26b89e] transition-colors"
            >
              View PEPLAB on Trustpilot
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={CONFIG.TRUSTPILOT.PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
          >
            Read all reviews on Trustpilot
            <ExternalLink className="w-4 h-4" />
          </a>
          <span className="hidden sm:inline text-[#6B7280]">·</span>
          <a
            href={CONFIG.TRUSTPILOT.REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#2ED1B4] hover:text-[#26b89e] transition-colors"
          >
            Write a review
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
