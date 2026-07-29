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
    <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.55)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[640px]">
          <thead>
            <tr className="border-b border-[rgba(244,246,250,0.08)] text-[10px] uppercase tracking-wide text-[#6B7280]">
              <th className="px-3 sm:px-4 py-3 font-semibold w-10" aria-hidden />
              <th className="px-3 sm:px-4 py-3 font-semibold">Peptide</th>
              <th className="px-3 sm:px-4 py-3 font-semibold">Batch</th>
              <th className="px-3 sm:px-4 py-3 font-semibold">Method</th>
              <th className="px-3 sm:px-4 py-3 font-semibold">Purity</th>
              <th className="px-3 sm:px-4 py-3 font-semibold">COA</th>
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
                    <td className="px-3 sm:px-4 py-3">
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 text-[#6B7280] transition-transform duration-200',
                          open && 'rotate-180 text-[#2ED1B4]',
                        )}
                        aria-hidden
                      />
                    </td>
                    <td className="px-3 sm:px-4 py-3">
                      <span className="text-sm font-semibold text-[#F4F6FA]">{product.name}</span>
                      <p className="text-[10px] text-[#6B7280] mt-0.5 sm:hidden">
                        {dosages.length} size{dosages.length === 1 ? '' : 's'} · tap to expand
                      </p>
                    </td>
                    <td className="px-3 sm:px-4 py-3 font-mono text-sm text-[#A9B3C7] whitespace-nowrap">
                      {data.batch}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm text-[#A9B3C7] whitespace-nowrap">
                      {data.method}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-sm font-semibold text-[#4ADE80] whitespace-nowrap">
                      {data.purity}
                    </td>
                    <td className="px-3 sm:px-4 py-3">
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
                      <td colSpan={6} className="px-3 sm:px-6 py-0">
                        <div className="pb-4 pt-1 pl-6 sm:pl-8">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6B7280]">
                            Certificate by vial size
                          </p>
                          <ul className="divide-y divide-[rgba(244,246,250,0.06)] rounded-xl border border-[rgba(244,246,250,0.08)] bg-[#0a0e14] overflow-hidden">
                            {dosages.map((dose) => {
                              const available = dose.status === 'available';
                              return (
                                <li
                                  key={`${product.id}-${dose.label}`}
                                  className="flex items-center justify-between gap-3 px-3 sm:px-4 py-2.5"
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
    </div>
  );
}
