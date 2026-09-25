import { useEffect } from 'react';
import { ChevronRight, FlaskConical, Package, Shield, Truck } from 'lucide-react';

const SCROLLED_CLASS = 'pl-announce-scrolled';

/** Narrow utility bar for the light shop homepage — hides on scroll, not sticky. */
export default function ShopAnnounceBar() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      root.classList.toggle(SCROLLED_CLASS, window.scrollY > 4);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      root.classList.remove(SCROLLED_CLASS);
    };
  }, []);

  return (
    <div className="pl-announce" role="note">
      <div className="pl-wrap pl-announce-inner">
        <p className="pl-announce-item pl-announce-ship">
          <Truck size={15} strokeWidth={2.15} />
          <span>Free Shipping on orders over $250</span>
        </p>
        <div className="pl-announce-trust">
          <p className="pl-announce-item">
            <Shield size={15} strokeWidth={2.15} />
            <span>Lab Verified Products</span>
          </p>
          <span className="pl-announce-sep" aria-hidden>
            |
          </span>
          <p className="pl-announce-item">
            <FlaskConical size={15} strokeWidth={2.15} />
            <span>HPLC Tested</span>
          </p>
          <span className="pl-announce-sep" aria-hidden>
            |
          </span>
          <p className="pl-announce-item">
            <Package size={15} strokeWidth={2.15} />
            <span>Discreet Packaging</span>
          </p>
        </div>
        <p className="pl-announce-item pl-announce-promo">
          <span aria-hidden>🎃</span>
          <span>HALLOWEEN TREAT: FREE BAC WATER ON ALL ORDERS</span>
          <ChevronRight size={14} strokeWidth={2.4} className="pl-announce-promo-chevron" />
        </p>
      </div>
    </div>
  );
}
