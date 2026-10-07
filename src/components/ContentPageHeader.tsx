import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

type ContentPageHeaderProps = {
  /** Destination for the back control. Defaults to home. */
  backTo?: string;
  /** Label for the back control. Defaults to "Back to Home". */
  backLabel?: string;
};

/**
 * Shared top bar for content / policy / research pages.
 * Keeps PEPLAB branding + back navigation consistent site-wide.
 */
export default function ContentPageHeader({
  backTo = '/',
  backLabel = 'Back to Home',
}: ContentPageHeaderProps) {
  return (
    <nav className="relative z-50 px-4 sm:px-6 lg:px-12 py-4 sm:py-6 border-b border-[rgba(244,246,250,0.08)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex flex-col items-start min-w-0">
          <span className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
            PEPLAB
          </span>
          <span className="text-[10px] sm:text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">
            PEPTIDES AUSTRALIA
          </span>
        </Link>
        <Link
          to={backTo}
          className="flex shrink-0 items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      </div>
    </nav>
  );
}
