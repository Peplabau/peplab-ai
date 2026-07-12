import { Link } from 'react-router-dom';
import { CreditCard, FlaskConical, Package } from 'lucide-react';
import { SHOP_PATH } from '@/lib/routes';

const STEPS = [
  {
    number: '01',
    icon: FlaskConical,
    title: 'Browse & select',
    description:
      'Explore our research catalogue of peptides and compounds with full analytical documentation.',
    href: SHOP_PATH,
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Secure checkout',
    description:
      'Cards, mobile wallets, or cryptocurrency — all encrypted, no auto-billing, crypto orders save 10%.',
    href: '/checkout',
  },
  {
    number: '03',
    icon: Package,
    title: 'Fast delivery',
    description:
      'Same-day dispatch Monday to Friday via Australia Post Express with full tracking.',
    href: '/shipping',
  },
] as const;

export default function NewLandingHowItWorks() {
  return (
    <section className="nl-section nl-section--alt" aria-labelledby="nl-howitworks-heading">
      <div className="nl-featured-container">
        <header className="nl-section-header">
          <p className="nl-eyebrow">How it works</p>
          <h2 id="nl-howitworks-heading" className="nl-heading">
            Three simple steps
          </h2>
        </header>

        <div className="nl-howitworks-steps-wrap">
          <div className="nl-howitworks-line" aria-hidden />
          <div className="nl-howitworks-steps">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const inner = (
                <>
                  <div className="nl-howitworks-icon">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-[#F4F6FA]" strokeWidth={1.5} />
                  </div>
                  <p className="nl-howitworks-num font-mono text-sm font-semibold mt-6">{step.number}</p>
                  <h3 className="text-lg sm:text-xl font-bold text-[#F4F6FA] mt-2">{step.title}</h3>
                  <p className="text-sm text-[#A9B3C7] mt-3 leading-relaxed max-w-[17rem] mx-auto">
                    {step.description}
                  </p>
                </>
              );

              return (
                <article key={step.number} className="nl-howitworks-step">
                  <Link to={step.href} className="nl-howitworks-step-link">
                    {inner}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
