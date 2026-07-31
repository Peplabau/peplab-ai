import { Fragment, useState } from 'react';
import { ChevronDown, FileText } from 'lucide-react';
import {
  getCoaDisplayData,
  getCoaDosageStatuses,
  productHasCoaPdf,
  type CoaDisplayData,
} from '@/lib/coa-utils';
import { cn } from '@/lib/utils';
import type { Product } from '@/products';

type CoaArchiveTableProps = {
  products: Product[];
  onView: (data: CoaDisplayData) => void;
};

export default function CoaArchiveTable({ products, onView }: CoaArchiveTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-xl sm:rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.55)] overflow-hidden">
      {/* Desktop / tablet table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[rgba(244,246,250,0.08)] text-[10px] uppercase tracking-wide text-[#6B7280]">
              <th className="px-4 py-3 font-semibold w-10" aria-hidden />
              <th className="px-4 py-3 font-semibold">Peptide</th>
              <th className="px-4 py-3 font-semibold">Method</th>
              <th className="px-4 py-3 font-semibold">COA</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const data = getCoaDisplayData(product);
              const hasPdf = productHasCoaPdf(product);
              const open = expandedId === product.id;
              const dosages = getCoaDosageStatuses(product);

              return (
                <Fragment key={product.id}>
                  <tr
                    className={cn(
                      'border-b border-[rgba(244,246,250,0.04)] hover:bg-[rgba(244,246,250,0.02)] cursor-pointer',
                      open && 'bg-[rgba(244,246,250,0.03)]',
                    )}
                    onClick={() => toggle(product.id)}
                    aria-expanded={open}
                  >
                    <td className="px-4 py-3">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-[#6B7280] transition-transform duration-200',
                          open && 'rotate-180 text-[#2ED1B4]',
                        )}
                        aria-hidden
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-semibold text-[#F4F6FA]">{product.name}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#A9B3C7] whitespace-nowrap">
                      {data.method}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide',
                          hasPdf
                            ? 'bg-[rgba(34,197,94,0.12)] text-[#4ADE80]'
                            : 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]',
                        )}
                      >
                        {hasPdf ? 'Available' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                  {open ? (
                    <tr className="border-b border-[rgba(244,246,250,0.06)]">
                      <td colSpan={4} className="px-6 py-0">
                        <div className="pb-4 pt-1 pl-8">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                            Certificate by vial size
                          </p>
                          <ul className="divide-y divide-[rgba(244,246,250,0.06)] rounded-xl border border-[rgba(244,246,250,0.08)] bg-[#0a0e14] overflow-hidden">
                            {dosages.map((dose) => {
                              const available = dose.status === 'available';
                              return (
                                <li
                                  key={`${product.id}-${dose.label}`}
                                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                                >
                                  <span className="font-mono text-sm font-semibold text-[#F4F6FA]">
                                    {dose.label}
                                  </span>
                                  {available ? (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onView(getCoaDisplayData(product, dose.label));
                                      }}
                                      className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.1)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#4ADE80] hover:bg-[rgba(34,197,94,0.18)] transition-colors"
                                    >
                                      <FileText className="h-3 w-3" aria-hidden />
                                      Available
                                    </button>
                                  ) : (
                                    <span className="inline-flex rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F59E0B]">
                                      Pending
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — no horizontal scroll */}
      <ul className="sm:hidden divide-y divide-[rgba(244,246,250,0.06)]">
        {products.map((product) => {
          const data = getCoaDisplayData(product);
          const hasPdf = productHasCoaPdf(product);
          const open = expandedId === product.id;
          const dosages = getCoaDosageStatuses(product);

          return (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => toggle(product.id)}
                aria-expanded={open}
                className={cn(
                  'flex w-full items-center gap-3 px-3.5 py-3.5 text-left active:bg-[rgba(244,246,250,0.04)] transition-colors',
                  open && 'bg-[rgba(244,246,250,0.03)]',
                )}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-[#6B7280] transition-transform duration-200',
                    open && 'rotate-180 text-[#2ED1B4]',
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#F4F6FA] leading-snug truncate">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6B7280] truncate">
                    {data.method}
                    <span className="mx-1.5 text-[rgba(244,246,250,0.2)]">·</span>
                    {dosages.length} size{dosages.length === 1 ? '' : 's'}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 inline-flex px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wide',
                    hasPdf
                      ? 'bg-[rgba(34,197,94,0.12)] text-[#4ADE80]'
                      : 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]',
                  )}
                >
                  {hasPdf ? 'Ready' : 'Pending'}
                </span>
              </button>

              {open ? (
                <div className="px-3.5 pb-3.5 pt-0">
                  <p className="mb-2 pl-7 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                    Certificate by vial size
                  </p>
                  <ul className="ml-7 divide-y divide-[rgba(244,246,250,0.06)] rounded-xl border border-[rgba(244,246,250,0.08)] bg-[#0a0e14] overflow-hidden">
                    {dosages.map((dose) => {
                      const available = dose.status === 'available';
                      return (
                        <li
                          key={`${product.id}-${dose.label}`}
                          className="flex items-center justify-between gap-3 px-3 py-3 min-h-[48px]"
                        >
                          <span className="font-mono text-[13px] font-semibold text-[#F4F6FA]">
                            {dose.label}
                          </span>
                          {available ? (
                            <button
                              type="button"
                              onClick={() => onView(getCoaDisplayData(product, dose.label))}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[rgba(34,197,94,0.35)] bg-[rgba(34,197,94,0.1)] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#4ADE80] active:bg-[rgba(34,197,94,0.2)] transition-colors"
                            >
                              <FileText className="h-3.5 w-3.5" aria-hidden />
                              View
                            </button>
                          ) : (
                            <span className="inline-flex rounded-lg border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.08)] px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#F59E0B]">
                              Pending
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
