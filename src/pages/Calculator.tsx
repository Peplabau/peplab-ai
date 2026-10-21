import ContentPageHeader from '@/components/ContentPageHeader';
import ReconstitutionCalculator from '@/components/ReconstitutionCalculator';
import Footer from '@/sections/Footer';
import { SEO } from '@/components/SEO';

export default function Calculator() {
  return (
    <div className="relative min-h-screen page-grid-bg">
      <SEO
        title="Peptide Calculator | PEPLAB"
        description="Calculate reconstitution volumes, syringe units, and dose counts for research peptides with the PEPLAB calculator."
        keywords={['peptide calculator', 'reconstitution calculator', 'BAC water', 'research peptides', 'PEPLAB']}
      />

      <ContentPageHeader />

      <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <ReconstitutionCalculator />
        </div>
      </main>

      <Footer />
    </div>
  );
}
