import { useRef } from 'react';
import RevealHeading from '@/landing/components/new-landing/RevealHeading';
import { useNewLandingReveal } from '@/landing/hooks/useNewLandingReveal';
import { shopUrl } from '@/landing/lib/site';

const STATES = [
  { code: 'NSW', name: 'New South Wales', days: '1–2 days' },
  { code: 'VIC', name: 'Victoria', days: '1–2 days' },
  { code: 'QLD', name: 'Queensland', days: '1–2 days' },
  { code: 'WA', name: 'Western Australia', days: '2–3 days' },
  { code: 'SA', name: 'South Australia', days: '2–3 days' },
  { code: 'ACT', name: 'Australian Capital Territory', days: '1–2 days' },
  { code: 'TAS', name: 'Tasmania', days: '2–3 days' },
  { code: 'NT', name: 'Northern Territory', days: '3–4 days' },
] as const;

const FOOTER_POINTS = [
  'AusPost Express',
  'Full tracking',
  'Secure packaging',
  'Same-day dispatch (Mon–Fri)',
] as const;

export default function NewLandingShipping() {
  const sectionRef = useRef<HTMLElement>(null);
  useNewLandingReveal(sectionRef, { itemStagger: 0.06 });

  return (
    <section ref={sectionRef} className="nl-section overflow-hidden" aria-labelledby="nl-shipping-heading">
      <div className="nl-shipping-glow pointer-events-none" aria-hidden />

      <div className="nl-featured-container relative z-10">
        <header className="nl-section-header">
          <p className="nl-reveal-eyebrow nl-eyebrow">Australia-wide</p>
          <RevealHeading as="h2" id="nl-shipping-heading" className="nl-heading">
            From our lab to every state.
          </RevealHeading>
          <p className="nl-reveal-lead nl-lead">
            Same-day dispatch Monday to Friday from our Australian facility, then carried by AusPost
            Express across every state and territory. Fully tracked.
          </p>
        </header>

        <div className="nl-shipping-grid-wrap">
          <div className="nl-shipping-grid">
            {STATES.map((state) => (
              <article
                key={state.code}
                className={`nl-shipping-state nl-reveal-item ${state.code === 'VIC' ? 'nl-shipping-state--highlight' : ''}`}
              >
                <p className="nl-shipping-code font-mono font-extrabold uppercase tracking-wide">
                  {state.code}
                </p>
                <p className="text-sm sm:text-base font-semibold text-[#F4F6FA] mt-2 leading-snug">{state.name}</p>
                <p className="nl-shipping-days mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#A9B3C7] font-semibold">
                  <span className="nl-shipping-dot" aria-hidden />
                  {state.days}
                </p>
              </article>
            ))}
          </div>
        </div>

        <ul className="nl-shipping-footer mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {FOOTER_POINTS.map((point) => (
            <li key={point} className="nl-reveal-text flex items-center gap-2 text-xs sm:text-sm text-[#A9B3C7] font-semibold">
              <span className="nl-shipping-dot" aria-hidden />
              {point}
            </li>
          ))}
        </ul>

        <p className="text-center mt-8">
          <a
            href={shopUrl('/shipping')}
            className="nl-reveal-item text-xs sm:text-sm font-mono uppercase tracking-wider text-[#2ED1B4] hover:text-[#F4F6FA] transition-colors font-bold"
          >
            Full shipping policy →
          </a>
        </p>
      </div>
    </section>
  );
}
