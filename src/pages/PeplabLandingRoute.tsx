/**
 * Marketing landing at peplab.ai/landing — Research Gateway.
 * Shop CTAs stay on peplab.ai (see landing/lib/site.ts).
 */
import '@/landing/index.css';
import '@/landing/research-atelier.css';
import BrandSplash from '@/landing/components/BrandSplash';
import ResearchGateway from '@/landing/pages/ResearchGateway';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';

export default function PeplabLandingRoute() {
  return (
    <>
      <BrandSplash />
      <Navigation logoHref="/landing" />
      <CartDrawer />
      <ResearchGateway />
    </>
  );
}
