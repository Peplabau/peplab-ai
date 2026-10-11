/**
 * Marketing landing at /landing — Research Gateway (atelier).
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
      <Navigation linkOrigin="https://peplab.com.au" logoHref="/landing" />
      <CartDrawer checkoutHref="https://peplab.com.au/checkout" />
      <ResearchGateway />
    </>
  );
}
