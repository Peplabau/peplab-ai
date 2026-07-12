import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SEO } from '@/components/SEO';
import { NEW_LANDING_SEO } from '@/lib/seo-keywords';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import NewLandingAnnounce from '@/sections/new-landing/NewLandingAnnounce';
import NewLandingHero from '@/sections/new-landing/NewLandingHero';
import NewLandingCatalogStrip from '@/sections/new-landing/NewLandingCatalogStrip';
import NewLandingFeaturedCatalog from '@/sections/new-landing/NewLandingFeaturedCatalog';
import NewLandingCatalogue from '@/sections/new-landing/NewLandingCatalogue';
import NewLandingTransparency from '@/sections/new-landing/NewLandingTransparency';
import NewLandingShipping from '@/sections/new-landing/NewLandingShipping';
import NewLandingHowItWorks from '@/sections/new-landing/NewLandingHowItWorks';
import NewLandingWhyPeplab from '@/sections/new-landing/NewLandingWhyPeplab';
import NewLandingFAQ from '@/sections/new-landing/NewLandingFAQ';
import NewLandingClosing from '@/sections/new-landing/NewLandingClosing';
import Footer from '@/sections/Footer';

gsap.registerPlugin(ScrollTrigger);

export default function NewLanding() {
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
        <Navigation embedded />
      </header>
      <div className="nl-site-header-spacer" aria-hidden />
      <CartDrawer />

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
        <Footer />
      </main>
    </div>
  );
}
