import { Link } from 'react-router-dom';

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
  return (
    <section className="nl-section overflow-hidden" aria-labelledby="nl-shipping-heading">
      <div className="nl-shipping-glow pointer-events-none" aria-hidden />

      <div className="nl-featured-container relative z-10">
        <header className="nl-section-header">
          <p className="nl-eyebrow">Australia-wide</p>
          <h2 id="nl-shipping-heading" className="nl-heading">
            From our lab to every state.
          </h2>
          <p className="nl-lead">
            Same-day dispatch Monday to Friday from our Australian facility, then carried by AusPost
            Express across every state and territory. Fully tracked.
          </p>
        </header>

        <div className="nl-shipping-grid-wrap">
          <div className="nl-shipping-grid">
            {STATES.map((state) => (
              <article
                key={state.code}
                className={`nl-shipping-state ${state.code === 'VIC' ? 'nl-shipping-state--highlight' : ''}`}
              >
                <p className="nl-shipping-code font-mono font-bold uppercase tracking-wide">
                  {state.code}
                </p>
                <p className="text-sm text-[#F4F6FA] mt-2 leading-snug">{state.name}</p>
                <p className="nl-shipping-days mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[#A9B3C7]">
                  <span className="nl-shipping-dot" aria-hidden />
                  {state.days}
                </p>
              </article>
            ))}
          </div>
        </div>

        <ul className="nl-shipping-footer mt-10 sm:mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {FOOTER_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-2 text-xs sm:text-sm text-[#A9B3C7]">
              <span className="nl-shipping-dot" aria-hidden />
              {point}
            </li>
          ))}
        </ul>

        <p className="text-center mt-8">
          <Link
            to="/shipping"
            className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[#2ED1B4] hover:text-[#F4F6FA] transition-colors"
          >
            Full shipping policy →
          </Link>
        </p>
      </div>
    </section>
  );
}
