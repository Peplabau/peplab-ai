import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SEO } from '@/landing/components/SEO';
import { NEW_LANDING_SEO } from '@/landing/lib/seo-keywords';
import LandingNavigation from '@/landing/components/LandingNavigation';
import LandingFooter from '@/landing/components/LandingFooter';
import NewLandingAnnounce from '@/landing/sections/new-landing/NewLandingAnnounce';
import NewLandingHero from '@/landing/sections/new-landing/NewLandingHero';
import NewLandingCatalogStrip from '@/landing/sections/new-landing/NewLandingCatalogStrip';
import NewLandingFeaturedCatalog from '@/landing/sections/new-landing/NewLandingFeaturedCatalog';
import NewLandingCatalogue from '@/landing/sections/new-landing/NewLandingCatalogue';
import NewLandingTransparency from '@/landing/sections/new-landing/NewLandingTransparency';
import NewLandingShipping from '@/landing/sections/new-landing/NewLandingShipping';
import NewLandingHowItWorks from '@/landing/sections/new-landing/NewLandingHowItWorks';
import NewLandingWhyPeplab from '@/landing/sections/new-landing/NewLandingWhyPeplab';
import NewLandingFAQ from '@/landing/sections/new-landing/NewLandingFAQ';
import NewLandingClosing from '@/landing/sections/new-landing/NewLandingClosing';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const timeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);
    return () => {
      clearTimeout(timeout);
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="nl-new-landing">
      <SEO
        title={NEW_LANDING_SEO.title}
        description={NEW_LANDING_SEO.description}
        keywords={NEW_LANDING_SEO.keywords}
      />
      <div className="grid-overlay opacity-60" />
      <header className="nl-site-header">
        <NewLandingAnnounce />
        <LandingNavigation embedded />
      </header>
      <div className="nl-site-header-spacer" aria-hidden />

      <main className="relative">
        <NewLandingHero />
        <NewLandingCatalogStrip />
        <NewLandingFeaturedCatalog />
        <NewLandingCatalogue />
        <NewLandingTransparency />
        <NewLandingShipping />
        <NewLandingHowItWorks />
        <NewLandingWhyPeplab />
        <NewLandingFAQ />
        <NewLandingClosing />
        <LandingFooter />
      </main>
    </div>
  );
}
