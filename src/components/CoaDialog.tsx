import { useLayoutEffect, useRef, type ComponentProps } from 'react';
import { Check, FileText, Shield, X } from 'lucide-react';
import { gsap } from 'gsap';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import CountUp from '@/components/CountUp';
import CoaHplcChart from '@/components/CoaHplcChart';
import OzcaniumAnalyticsName, { OZCANIUM_ANALYTICS_LAB_NAME } from '@/components/OzcaniumAnalyticsName';
import type { CoaDisplayData } from '@/lib/coa-utils';
import { CONFIG } from '@/lib/config';
import { cn } from '@/lib/utils';

const BATCH_NO = 'BN88LAB';

interface CoaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CoaDisplayData | null;
}

export default function CoaDialog({ open, onOpenChange, data }: CoaDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const purityValue = data ? parseFloat(data.purity.replace('%', '')) || 99 : 99;
  const purityDecimals = data?.purity.includes('.') ? 2 : 0;
  const coaPdfBlurred = CONFIG.COA_PDF_BLURRED;

  useLayoutEffect(() => {
    if (!open || !data) return;

    const root = contentRef.current;
    if (!root) return;

    const paths = root.querySelectorAll<SVGPathElement>('[data-coa-chart-path]');
    const progressBars = root.querySelectorAll<HTMLDivElement>('[data-coa-progress]');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetWidth = `${Math.min(purityValue, 100)}%`;

    if (reduced) {
      paths.forEach((path) => gsap.set(path, { strokeDashoffset: 0 }));
      progressBars.forEach((bar) => gsap.set(bar, { width: targetWidth }));
      return;
    }

    paths.forEach((path) => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 2,
        delay: 0.45,
        ease: 'power2.inOut',
      });
    });

    progressBars.forEach((bar) => {
      gsap.set(bar, { width: '0%' });
      gsap.to(bar, {
        width: targetWidth,
        duration: 1.4,
        delay: 1.1,
        ease: 'power2.out',
      });
    });
  }, [open, purityValue, data]);

  if (!data) return null;

  const pdfPreviewUrl = data.hasCoaPdf
    ? `${data.coaUrl}#toolbar=0&navpanes=0&view=FitH`
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={contentRef}
        showCloseButton={false}
        className={cn(
          'coa-rg-dialog flex flex-col gap-0 overflow-hidden p-0 text-[#F4F6FA] shadow-2xl outline-none',
          'fixed !left-[50%] !top-[50%] h-[min(94vh,680px)] max-h-[min(94vh,680px)] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] !translate-x-[-50%] !translate-y-[-50%] rounded-2xl',
          'sm:h-[min(92vh,720px)] sm:max-h-[min(92vh,720px)] sm:w-[calc(100vw-2rem)] sm:max-w-[min(920px,calc(100vw-2rem))]',
        )}
      >
        <DialogTitle className="sr-only">Certificate of Analysis — {data.productName}</DialogTitle>
        <DialogDescription className="sr-only">
          {OZCANIUM_ANALYTICS_LAB_NAME} HPLC certificate of analysis for {data.productName}
        </DialogDescription>

        <div className="coa-rg-dialog-glow pointer-events-none absolute inset-0" aria-hidden />

        <DialogClose
          className="absolute right-2 top-2 z-[70] flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(239,68,68,0.45)] bg-[#111827] text-[#EF4444] shadow-sm transition-all hover:border-[rgba(239,68,68,0.7)] hover:bg-[rgba(239,68,68,0.12)] hover:text-[#F87171] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          aria-label="Close dialog"
        >
          <X size={18} strokeWidth={2.25} className="sm:hidden" />
          <X size={16} strokeWidth={2.25} className="hidden sm:block" />
        </DialogClose>

        <CoaHeader productName={data.productName} />

        {/* Mobile — stacked full-width */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden sm:hidden">
          <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3 pb-2 pt-2">
            <CoaAnalyticsPanel
              data={data}
              purityValue={purityValue}
              purityDecimals={purityDecimals}
              animate={open}
              compact
              className="shrink-0"
            />
            <div className="flex min-h-0 flex-1 flex-col">
              <CoaPreviewLabel />
              {data.hasCoaPdf ? (
                <CoaPdfPreview
                  title={`COA preview — ${data.productName}`}
                  src={pdfPreviewUrl}
                  blurred={coaPdfBlurred}
                  fill
                />
              ) : (
                <CoaPdfPending fill />
              )}
            </div>
          </div>
          <CoaFooter compact />
        </div>

        {/* Desktop */}
        <div className="relative hidden min-h-0 flex-1 flex-col overflow-hidden sm:flex">
          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="flex min-h-0 flex-col border-b border-[rgba(244,246,250,0.06)] p-4 lg:border-b-0 lg:border-r lg:border-[rgba(139,92,246,0.12)]">
              <CoaPreviewLabel desktop />
              {data.hasCoaPdf ? (
                <CoaPdfPreview
                  title={`COA preview — ${data.productName}`}
                  src={pdfPreviewUrl}
                  blurred={coaPdfBlurred}
                  fill
                />
              ) : (
                <CoaPdfPending fill />
              )}
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden p-4">
              <CoaPreviewLabel desktop className="invisible" aria-hidden />
              <CoaAnalyticsPanel
                data={data}
                purityValue={purityValue}
                purityDecimals={purityDecimals}
                animate={open}
                fill
                className="min-h-0 flex-1"
              />
            </section>
          </div>
          <CoaFooter />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CoaHeader({ productName }: { productName: string }) {
  return (
    <header className="relative shrink-0 border-b border-[rgba(139,92,246,0.15)] bg-[rgba(16,18,32,0.85)] px-3 pb-2 pt-2.5 sm:px-4 sm:pb-3 sm:pt-3.5">
      <div className="flex items-start gap-2 pr-11 sm:pr-10">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(139,92,246,0.14)] text-[#36ea51] sm:h-9 sm:w-9">
          <Shield size={15} strokeWidth={2.2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#a9b3c7] sm:text-[10px] sm:tracking-[0.14em]">
            Verified · Tested by <OzcaniumAnalyticsName />
          </p>
          <h2 className="mt-0.5 text-[15px] font-bold leading-tight text-[#F4F6FA] sm:text-lg">
            Certificate of Analysis
          </h2>
          <p className="mt-0.5 truncate text-xs font-medium text-[#a9b3c7]">{productName}</p>
        </div>
      </div>
    </header>
  );
}

function CoaFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={cn(
        'shrink-0 border-t border-[rgba(139,92,246,0.12)] bg-[#0a0a0f]',
        compact ? 'px-3.5 py-2' : 'px-4 py-2.5 sm:px-5',
      )}
    >
      <a
        href="/standards"
        className={cn(
          'coa-rg-btn-secondary flex w-full items-center justify-center rounded-lg border border-[rgba(244,246,250,0.12)] bg-[rgba(17,24,39,0.65)] font-bold uppercase tracking-[0.08em] text-[#F4F6FA] transition-colors hover:bg-[rgba(139,92,246,0.08)] active:scale-[0.99] sm:rounded-xl',
          compact ? 'min-h-[44px] px-3 py-2.5 text-[11px]' : 'min-h-[40px] px-4 py-2.5 text-[11px]',
        )}
      >
        Full Lab Archive
      </a>
      <p
        className={cn(
          'mt-2 flex items-center justify-center gap-1.5 text-center font-semibold uppercase leading-snug tracking-[0.06em] text-[#6B7280]',
          compact ? 'px-1 text-[8px]' : 'text-[9px]',
        )}
      >
        <Check size={compact ? 9 : 10} className="shrink-0 text-[#36ea51]" strokeWidth={3} />
        <span>Tested by <OzcaniumAnalyticsName /> · Every Batch Certified Before Sale</span>
      </p>
    </footer>
  );
}

function CoaPreviewLabel({
  desktop = false,
  className,
  ...props
}: {
  desktop?: boolean;
  className?: string;
} & ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'mb-1 inline-flex shrink-0 items-center gap-1 font-bold uppercase tracking-[0.08em] text-[#8b93a8]',
        desktop ? 'mb-2 gap-1.5 text-[10px]' : 'text-[9px]',
        className,
      )}
      {...props}
    >
      <FileText size={desktop ? 11 : 10} />
      COA Preview
    </p>
  );
}

function CoaAnalyticsPanel({
  data,
  purityValue,
  purityDecimals,
  animate,
  compact = false,
  fill = false,
  className,
}: {
  data: CoaDisplayData;
  purityValue: number;
  purityDecimals: number;
  animate: boolean;
  compact?: boolean;
  fill?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'coa-rg-panel relative overflow-hidden rounded-xl border',
        fill ? 'flex h-full min-h-0 flex-col justify-between' : 'flex min-h-0 flex-col',
        compact ? 'p-2.5' : 'p-3',
        className,
      )}
    >
      <div className="coa-rg-panel-glow pointer-events-none absolute inset-0 rounded-xl" aria-hidden />

      <div className="relative shrink-0">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#F4F6FA] sm:text-[10px]">
            Tested by <OzcaniumAnalyticsName />
          </span>
          <span className="coa-rg-badge shrink-0 rounded-full px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.08em] sm:text-[8px]">
            Independent
          </span>
        </div>

        <div
          className={cn(
            'relative mb-2 grid shrink-0 gap-x-2 gap-y-1.5 border-b border-[rgba(244,246,250,0.06)] pb-2',
            compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4 sm:gap-2',
          )}
        >
          <MetaItem label="Batch no" value={BATCH_NO} highlight compact={compact} />
          <MetaItem label="Method" value={data.method} compact={compact} />
          <MetaItem label="Tested" value={data.testedDate} compact={compact} />
          <MetaItem label="Dose" value={data.dose} compact={compact} />
        </div>

        <CoaHplcChart purityLabel={data.purity} compact={compact} />
      </div>

      <div className={cn('relative flex shrink-0 flex-col', compact ? 'gap-1.5' : 'gap-2')}>
        <div className="flex items-end justify-between gap-1.5">
          <div className="min-w-0 pb-0.5">
            <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#8b93a8] sm:text-[9px]">
              HPLC purity
            </p>
            <p
              className={cn(
                'coa-rg-purity-accent mt-0.5 font-extrabold tabular-nums',
                compact ? 'text-2xl leading-tight' : 'text-3xl leading-[1.1] sm:text-[2rem]',
              )}
            >
              <CountUp
                end={purityValue}
                decimals={purityDecimals}
                suffix="%"
                delay={0.9}
                duration={1.2}
                active={animate}
              />
            </p>
            {!compact && (
              <p className="mt-0.5 text-[9px] text-[#6B7280] sm:text-[10px]">
                Primary COA result · ≥99% threshold
              </p>
            )}
          </div>
          <span className="coa-rg-verified inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em]">
            <Check size={compact ? 9 : 11} strokeWidth={3} className="text-[#36ea51]" />
            Verified
          </span>
        </div>

        <div className="coa-rg-progress-track h-1 shrink-0 overflow-hidden rounded-full">
          <div data-coa-progress className="coa-rg-progress-bar h-full rounded-full" style={{ width: '0%' }} />
        </div>
      </div>
    </div>
  );
}

function CoaPdfPending({ fill = false, className }: { fill?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-lg border border-[rgba(139,92,246,0.15)] bg-[#08080B] px-4',
        fill && 'min-h-0 flex-1',
        className,
      )}
    >
      <div className="text-center">
        <FileText className="mx-auto mb-2 h-8 w-8 text-[#6B7280]" strokeWidth={1.75} />
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#a9b3c7]">
          COA pending
        </p>
        <p className="mt-1 max-w-[14rem] text-[10px] leading-relaxed text-[#6B7280]">
          Certificate of Analysis for this batch is being finalised and will be published soon.
        </p>
      </div>
    </div>
  );
}

function CoaPdfPreview({
  title,
  src,
  blurred,
  className,
  fill = false,
}: {
  title: string;
  src: string;
  blurred: boolean;
  className?: string;
  fill?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-[rgba(139,92,246,0.15)] bg-[#08080B] touch-none',
        fill && 'min-h-0 flex-1',
        className,
      )}
    >
      <iframe
        title={title}
        src={src}
        scrolling="no"
        tabIndex={-1}
        className={cn(
          'w-full bg-[#111827] transition-[filter] duration-300 pointer-events-none select-none overflow-hidden',
          fill ? 'h-full min-h-0' : 'h-full',
          blurred && 'blur-[12px]',
        )}
      />
      {blurred && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/55 backdrop-blur-[2px]">
          <p className="max-w-[12rem] rounded-lg border border-[rgba(139,92,246,0.2)] bg-[rgba(16,18,32,0.95)] px-2.5 py-1.5 text-center text-[9px] font-semibold uppercase tracking-[0.08em] text-[#a9b3c7] shadow-sm sm:max-w-xs sm:text-[10px]">
            Certificate preview updating
          </p>
        </div>
      )}
    </div>
  );
}

function MetaItem({
  label,
  value,
  highlight = false,
  compact = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="min-w-0">
      <span
        className={cn(
          'mb-0.5 block font-semibold uppercase tracking-[0.1em] text-[#8b93a8]',
          compact ? 'text-[8px]' : 'text-[8px]',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'block truncate font-mono font-semibold tracking-[0.04em] text-[#F4F6FA]',
          highlight ? 'text-sm font-bold' : compact ? 'text-[11px]' : 'text-[11px]',
        )}
      >
        {value}
      </span>
    </div>
  );
}
