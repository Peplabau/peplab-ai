/**
 * Marketing landing at /landing — Research Gateway page.
 */
import '@/landing/index.css';
import BrandSplash from '@/landing/components/BrandSplash';
import ResearchGateway from '@/landing/pages/ResearchGateway';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';

export default function PeplabLandingRoute() {
  return (
    <>
      <BrandSplash />
      <Navigation />
      <CartDrawer />
      <ResearchGateway />
    </>
  );
}
