import BrandSplash from '@/components/BrandSplash';
import LandingNavigation from '@/components/LandingNavigation';
import ResearchGateway from '@/pages/ResearchGateway';
import '@/index.css';
import '@/research-atelier.css';

export default function App() {
  return (
    <>
      <BrandSplash />
      <LandingNavigation />
      <ResearchGateway />
    </>
  );
}
