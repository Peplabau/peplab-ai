import { Droplets, RotateCw, Syringe } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import ReconstitutionCalculator from '@/components/ReconstitutionCalculator';
import Footer from '@/sections/Footer';
import { SEO } from '@/components/SEO';
import { JsonLd } from '@/components/JsonLd';
import { PAGE_SEO } from '@/lib/seo-constants';
import { buildBreadcrumbJsonLd } from '@/lib/seo-breadcrumbs';

const STEPS = [
  {
    icon: Droplets,
    title: 'Swab the vial',
    description: 'Wipe the stopper with alcohol.',
  },
  {
    icon: Syringe,
    title: 'Draw BAC water',
    description: 'Pull 1–2 mL slowly.',
  },
  {
    icon: RotateCw,
    title: 'Inject & swirl',
    description: 'Add to peptide; do not shake.',
  },
] as const;

export default function Calculator() {
  return (
    <div className="relative min-h-screen page-grid-bg">
      <SEO
        title={PAGE_SEO.calculator.title}
        description={PAGE_SEO.calculator.description}
        keywords={['peptide calculator', 'reconstitution calculator', 'BAC water', 'research peptides', 'PEPLAB Australia']}
      />
      <JsonLd
        id="calculator-breadcrumbs"
        data={buildBreadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Peptide Calculator', path: '/calculator' },
        ])}
      />

      <Navigation />
      <CartDrawer />

      <main className="relative z-10 pt-24 sm:pt-28 pb-16 lg:pb-24">
        <ReconstitutionCalculator />
      </main>

      <Footer />
    </div>
  );
}
