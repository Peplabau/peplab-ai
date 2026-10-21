import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';

type ContentPageHeaderProps = {
  /** Destination for the back control. Defaults to home. Pass `null` to hide. */
  backTo?: string | null;
  /** Label for the back control. Defaults to "Back to Home". */
  backLabel?: string;
};

/**
 * Site header for content / policy / research pages.
 * Full storefront Navigation + optional back link (same as before header unification).
 */
export default function ContentPageHeader({
  backTo = '/',
  backLabel = 'Back to Home',
}: ContentPageHeaderProps = {}) {
  return (
    <>
      <Navigation />
      <CartDrawer />
      {/* Spacer matching fixed Navigation bar height */}
      <div className="h-16 sm:h-20 lg:h-24" aria-hidden />
      {backTo ? (
        <div className="relative z-40 px-4 sm:px-6 lg:px-12 py-3 border-b border-[rgba(244,246,250,0.06)]">
          <div className="mx-auto max-w-7xl">
            <Link
              to={backTo}
              className="inline-flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
