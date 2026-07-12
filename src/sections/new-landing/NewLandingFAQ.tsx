import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/auspost';

const FAQ_ITEMS = [
  {
    id: 'products-for',
    question: 'What are these products for?',
    answer:
      'All PEPLAB products are sold strictly for in-vitro laboratory research purposes. They are not intended for human or animal consumption, medical use, or any clinical application. By purchasing, you confirm your use complies with applicable Australian law.',
  },
  {
    id: 'shipping-au',
    question: 'Do you ship Australia-wide?',
    answer:
      'Yes. We dispatch from our Australian facility to every state and territory via Australia Post Express. Same-day dispatch applies Monday to Friday when orders are placed before our daily cut-off.',
  },
  {
    id: 'coa',
    question: 'Are certificates of analysis available?',
    answer:
      'Yes. Every batch receives independent HPLC testing, and Certificates of Analysis are published with batch-level results. You can review standards and batch documentation before you order.',
  },
  {
    id: 'payments',
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit and debit cards, Apple Pay, Google Pay, and cryptocurrency. All card and wallet payments are encrypted with SSL. There is no auto-billing, and crypto checkout receives a 10% discount.',
  },
  {
    id: 'shipping-time',
    question: 'How long does shipping take?',
    answer: `Orders placed Monday to Friday are dispatched the same day. Express delivery is typically 1–2 business days for metro east-coast states and 2–4 days for regional and remote areas. Free express shipping applies on orders over $${FREE_SHIPPING_THRESHOLD}.`,
  },
  {
    id: 'tracking',
    question: 'Can I track my order?',
    answer:
      'Yes. Every express shipment includes full Australia Post tracking. You will receive tracking details by email once your order has been dispatched.',
  },
] as const;

export default function NewLandingFAQ() {
  const [openId, setOpenId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section className="nl-section nl-section--alt nl-section--compact" aria-labelledby="nl-faq-heading">
      <div className="nl-featured-container">
        <header className="nl-section-header">
          <p className="nl-eyebrow">FAQ</p>
          <h2 id="nl-faq-heading" className="nl-heading">
            Common questions answered
          </h2>
        </header>

        <div className="nl-faq-list-wrap">
          <div className="nl-faq-list">
            {FAQ_ITEMS.map((item) => {
              const isOpen = openId === item.id;
              const panelId = `nl-faq-panel-${item.id}`;
              const buttonId = `nl-faq-button-${item.id}`;

              return (
                <article key={item.id} className={`nl-faq-item${isOpen ? ' nl-faq-item--open' : ''}`}>
                  <h3 className="m-0">
                    <button
                      type="button"
                      id={buttonId}
                      className="nl-faq-trigger"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => toggle(item.id)}
                    >
                      <span className="nl-faq-question">{item.question}</span>
                      <ChevronDown
                        className="nl-faq-chevron"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="nl-faq-panel"
                    hidden={!isOpen}
                  >
                    <p className="nl-faq-answer">{item.answer}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="text-center text-sm text-[var(--nl-text-muted)] mt-8 sm:mt-10">
            Need more detail?{' '}
            <Link to="/faq" className="text-[var(--nl-accent)] font-semibold hover:opacity-90 transition-opacity">
              View full FAQ
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
