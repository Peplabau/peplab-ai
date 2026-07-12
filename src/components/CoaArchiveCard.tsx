import { Check, FileText, Shield } from 'lucide-react';
import OzcaniumAnalyticsName from '@/components/OzcaniumAnalyticsName';
import { CONFIG } from '@/lib/config';
import { getCoaDisplayData, type CoaDisplayData } from '@/lib/coa-utils';
import type { Product } from '@/products';

type CoaArchiveCardProps = {
  product: Product;
  onView: (data: CoaDisplayData) => void;
};

export default function CoaArchiveCard({ product, onView }: CoaArchiveCardProps) {
  const data = getCoaDisplayData(product);
  const blurred = CONFIG.COA_PDF_BLURRED;
  const pdfPreviewUrl = `${data.coaUrl}#toolbar=0&navpanes=0&view=FitH`;

  return (
    <article className="coa-archive-card group flex h-full flex-col overflow-hidden rounded-xl border border-[rgba(139,92,246,0.18)] bg-[#0a0e14] shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-all duration-300 sm:rounded-2xl hover:border-[rgba(34,197,94,0.35)] hover:shadow-[0_12px_40px_rgba(34,197,94,0.08)]">
      {/* Mobile header — compact */}
      <div className="coa-archive-card-header coa-archive-card-header--mobile flex items-start justify-between gap-1.5 border-b border-[rgba(244,246,250,0.06)] bg-[rgba(16,18,32,0.85)] px-2 py-2 sm:hidden">
        <p className="min-w-0 flex-1 text-[11px] font-semibold leading-tight text-[#F4F6FA] line-clamp-2">
          {data.productName}
        </p>
        <span
          className="inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[rgba(32,248,53,0.4)] bg-[rgba(139,92,246,0.1)] px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[0.04em] text-[#36ea51]"
          title="Verified"
        >
          <Check size={8} strokeWidth={3} className="text-[#36ea51]" aria-hidden />
          <span className="hidden min-[360px]:inline">Verified</span>
        </span>
      </div>

      {/* Desktop header — full */}
      <div className="coa-archive-card-header hidden items-center justify-between gap-2 border-b border-[rgba(244,246,250,0.06)] bg-[rgba(16,18,32,0.85)] px-4 py-3 sm:flex">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(139,92,246,0.14)] text-[#36ea51]">
            <Shield className="h-4 w-4" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-[#a9b3c7]">
              Certificate of Analysis
            </p>
            <p className="truncate text-sm font-semibold text-[#F4F6FA]">{data.productName}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[rgba(32,248,53,0.4)] bg-[rgba(139,92,246,0.1)] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#36ea51]">
          <Check size={10} strokeWidth={3} className="text-[#36ea51]" />
          Verified
        </span>
      </div>

      <button
        type="button"
        className="relative flex min-h-0 flex-1 flex-col text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-inset"
        onClick={() => onView(data)}
        aria-label={`View COA for ${data.productName}`}
      >
        <div className="relative aspect-[5/6] w-full overflow-hidden bg-[#08080B] touch-none sm:aspect-[3/4]">
          <iframe
            title={`COA — ${data.productName}`}
            src={pdfPreviewUrl}
            scrolling="no"
            tabIndex={-1}
            className={`h-full w-full bg-[#111827] pointer-events-none select-none ${blurred ? 'blur-[10px]' : ''}`}
          />
          {blurred && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/50 backdrop-blur-[1px]">
              <div className="rounded-lg border border-[rgba(139,92,246,0.25)] bg-[rgba(16,18,32,0.92)] px-2.5 py-2 text-center shadow-lg sm:rounded-xl sm:px-4 sm:py-3">
                <FileText className="mx-auto mb-1 h-4 w-4 text-[#8B5CF6] sm:mb-2 sm:h-6 sm:w-6" strokeWidth={1.75} />
                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-[#F4F6FA] sm:text-[10px] sm:tracking-[0.1em]">
                  Tap to view
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile meta — 2 columns */}
        <div className="coa-archive-card-meta coa-archive-card-meta--mobile grid grid-cols-2 gap-px border-t border-[rgba(244,246,250,0.06)] bg-[rgba(244,246,250,0.06)] sm:hidden">
          <div className="bg-[#0a0e14] px-1.5 py-2">
            <span className="mb-0.5 block text-[7px] font-semibold uppercase tracking-[0.08em] text-[#8b93a8]">
              Purity
            </span>
            <span className="block truncate text-[10px] font-bold text-[#4ADE80]">{data.purity}</span>
          </div>
          <div className="bg-[#0a0e14] px-1.5 py-2">
            <span className="mb-0.5 block text-[7px] font-semibold uppercase tracking-[0.08em] text-[#8b93a8]">
              Method
            </span>
            <span className="block truncate text-[10px] font-semibold text-[#F4F6FA]">{data.method}</span>
          </div>
          <div className="col-span-2 bg-[#0a0e14] px-1.5 py-1.5">
            <span className="mb-0.5 block text-[7px] font-semibold uppercase tracking-[0.08em] text-[#8b93a8]">
              Lab
            </span>
            <span className="block min-w-0 text-[10px] font-semibold">
              <OzcaniumAnalyticsName compact />
            </span>
          </div>
        </div>

        {/* Desktop meta — 3 columns */}
        <div className="coa-archive-card-meta hidden grid-cols-3 gap-px border-t border-[rgba(244,246,250,0.06)] bg-[rgba(244,246,250,0.06)] sm:grid">
          <div className="bg-[#0a0e14] px-3 py-2.5">
            <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8b93a8]">
              Purity
            </span>
            <span className="text-sm font-bold text-[#4ADE80]">{data.purity}</span>
          </div>
          <div className="bg-[#0a0e14] px-3 py-2.5">
            <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8b93a8]">
              Method
            </span>
            <span className="text-xs font-semibold text-[#F4F6FA]">{data.method}</span>
          </div>
          <div className="bg-[#0a0e14] px-3 py-2.5">
            <span className="mb-0.5 block text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8b93a8]">
              Lab
            </span>
            <span className="block min-w-0 text-xs font-semibold">
              <OzcaniumAnalyticsName compact />
            </span>
          </div>
        </div>

        <p className="border-t border-[rgba(244,246,250,0.06)] bg-[#0a0e14] px-2 py-1.5 text-center text-[8px] leading-snug text-[#6B7280] sm:hidden">
          COAs updating — available soon
        </p>
      </button>

      <div className="coa-archive-card-footer hidden border-t border-[rgba(244,246,250,0.06)] p-3 sm:block">
        <p className="mb-2 text-center text-[10px] leading-snug text-[#A9B3C7]">
          COAs are being updated and will be available soon.
        </p>
        <button
          type="button"
          onClick={() => onView(data)}
          className="coa-rg-btn-primary flex w-full min-h-[40px] items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.08em]"
        >
          <FileText size={12} />
          View COA
        </button>
      </div>
    </article>
  );
}
