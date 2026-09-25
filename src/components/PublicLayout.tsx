import { Outlet, useLocation } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import ShopAnnounceBar from '@/components/ShopAnnounceBar';
import { ThemePreviewSync, useLightShopPreview } from '@/context/ThemeContext';
import { HOME_PATH, SHOP_PATH } from '@/lib/routes';

/** Shared shop header + cart for every non-admin, non-auth page. */
export default function PublicLayout() {
  const lightShop = useLightShopPreview();
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';
  const showAnnounce = lightShop && (path === HOME_PATH || path === SHOP_PATH);

  return (
    <>
      <ThemePreviewSync />
      {showAnnounce ? <ShopAnnounceBar /> : null}
      <Navigation />
      <CartDrawer />
      <Outlet />
    </>
  );
}
