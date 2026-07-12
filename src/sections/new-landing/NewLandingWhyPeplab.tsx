import { Link } from 'react-router-dom';
import { CreditCard, Shield, Truck } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/auspost';

const STATS = [
  { value: '≥99%', label: 'Average purity' },
  { value: 'HPLC', label: 'Testing method' },
  { value: 'CoA', label: 'Per batch' },
] as const;

export default function NewLandingWhyPeplab() {
  return (
    <section className="nl-section overflow-hidden" aria-labelledby="nl-why-heading">
      <div className="nl-featured-container relative z-10">
        <header className="nl-section-header">
          <p className="nl-eyebrow">Why PEPLAB</p>
          <h2 id="nl-why-heading" className="nl-heading">
            Setting the standard for research materials
          </h2>
        </header>

        <div className="nl-why-grid-wrap">
          <div className="nl-why-grid">
            <article className="nl-why-feature">
              <div className="nl-why-feature-glow" aria-hidden />
              <div className="relative z-10 flex flex-col h-full">
                <div className="nl-why-icon-box nl-why-icon-box--feature">
                  <Shield className="w-5 h-5 text-[#2ED1B4]" strokeWidth={1.75} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#F4F6FA] mt-5 leading-tight">
                  Uncompromising quality
                </h3>
                <p className="text-sm sm:text-[0.9375rem] text-[#A9B3C7] mt-4 leading-relaxed max-w-md">
                  Every batch is independently tested for identity and purity. We release nothing
                  below our research-grade standard — with documentation you can verify before you
                  order.
                </p>
                <dl className="nl-why-stats mt-auto pt-8 sm:pt-10">
                  {STATS.map((stat) => (
                    <div key={stat.label} className="nl-why-stat">
                      <dt className="text-2xl sm:text-[1.75rem] font-bold text-[#F4F6FA] leading-none">
                        {stat.value}
                      </dt>
                      <dd className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.14em] text-[#6B7280] mt-2">
                        {stat.label}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>

            <div className="nl-why-side">
              <article className="nl-why-card">
                <div className="nl-why-icon-box">
                  <Truck className="w-5 h-5 text-[#2ED1B4]" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-bold text-[#F4F6FA] mt-4 leading-snug">Express shipping</h3>
                <p className="text-sm text-[#A9B3C7] mt-2 leading-relaxed">
                  Same-day dispatch Monday to Friday via Australia Post Express with full tracking.
                  Free express over ${FREE_SHIPPING_THRESHOLD}.
                </p>
                <Link to="/shipping" className="nl-why-card-link">
                  Shipping details
                </Link>
              </article>

              <article className="nl-why-card">
                <div className="nl-why-icon-box">
                  <CreditCard className="w-5 h-5 text-[#2ED1B4]" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-bold text-[#F4F6FA] mt-4 leading-snug">Secure payments</h3>
                <p className="text-sm text-[#A9B3C7] mt-2 leading-relaxed">
                  Credit card, Apple Pay, Google Pay, or cryptocurrency — all encrypted with SSL. No
                  auto-billing; crypto checkout saves 10%.
                </p>
                <Link to="/checkout" className="nl-why-card-link">
                  Checkout options
                </Link>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
