import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';

/** Shared shop header + cart for every non-admin, non-auth page. */
export default function PublicLayout() {
  return (
    <>
      <Navigation />
      <CartDrawer />
      <Outlet />
    </>
  );
}
