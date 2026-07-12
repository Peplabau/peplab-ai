import type { ReactNode } from 'react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/sections/Footer';

export default function StorefrontLayout({
  children,
  surface = 'default',
}: {
  children: ReactNode;
  surface?: 'default' | 'clean';
}) {
  return (
    <>
      {surface !== 'clean' && <div className="noise-overlay" />}
      <Navigation />
      <CartDrawer />
      {children}
      <Footer />
    </>
  );
}
