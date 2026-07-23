import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Beaker,
  Calculator,
  FlaskConical,
  Search,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/sections/Footer';
import { SEO } from '@/components/SEO';
import { CALCULATOR_PATH, SHOP_PATH } from '@/lib/routes';
import {
  PROTOCOL_CHART,
  protocolStats,
  type ProtocolChartRow,
  type ProtocolType,
} from '@/lib/protocol-chart';

type TypeFilter = 'all' | ProtocolType;
type SortKey = 'name' | 'vialSize' | 'type' | 'concentration' | 'doseRange' | 'frequency';
type SortDir = 'asc' | 'desc';

const STATS = protocolStats();

function compareRows(a: ProtocolChartRow, b: ProtocolChartRow, key: SortKey): number {
  return String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true, sensitivity: 'base' });
}

export default function Protocols() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = PROTOCOL_CHART.filter((row) => {
      if (typeFilter !== 'all' && row.type !== typeFilter) return false;
      if (!q) return true;
      return (
        row.name.toLowerCase().includes(q) ||
        row.vialSize.toLowerCase().includes(q) ||
        row.doseRange.toLowerCase().includes(q) ||
        row.frequency.toLowerCase().includes(q) ||
        row.productSlug.toLowerCase().includes(q)
      );
    });

    rows = [...rows].sort((a, b) => {
      const cmp = compareRows(a, b, sortKey);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [query, typeFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#2ED1B4]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#2ED1B4]" />
    );
  };

  return (
    <div className="relative min-h-screen page-grid-bg">
      <SEO
        title="Peptide Dosage Chart & Protocols | PEPLAB"
        description="Searchable PEPLAB research peptide dosage chart — typical concentrations, dose ranges, and frequencies for catalog peptides. Educational use only."
        keywords={[
          'peptide dosage chart',
          'peptide protocols',
          'research peptide dosing',
          'reconstitution',
          'PEPLAB',
        ]}
      />

      <Navigation />
      <CartDrawer />

      <main className="relative z-10 pt-24 sm:pt-28 pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <header className="mb-8 sm:mb-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[rgba(46,209,180,0.12)] text-[#2ED1B4] border border-[rgba(46,209,180,0.25)]">
                <FlaskConical className="w-3.5 h-3.5" />
                Research reference
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F6FA] mb-3">
              Peptide <span className="gradient-text">Dosage Chart</span>
            </h1>
            <p className="text-sm sm:text-base text-[#A9B3C7] max-w-3xl leading-relaxed">
              A searchable chart of typical research starting doses, reconstitution concentrations, and
              frequencies for peptides in the PEPLAB catalogue. Use this as a quick protocol reference,
              then open any peptide for product details — or use the calculator for exact syringe units.
            </p>
          </header>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: 'Rows charted', value: STATS.rows },
              { label: 'Peptides', value: STATS.peptides },
              { label: 'Singles', value: STATS.singles },
              { label: 'Blends', value: STATS.blends },
            ].map((s) => (
              <div
                key={s.label}
                className="p-4 rounded-2xl bg-[rgba(17,24,39,0.65)] border border-[rgba(244,246,250,0.08)]"
              >
                <p className="text-2xl font-bold text-[#F4F6FA]">{s.value}</p>
                <p className="text-[11px] text-[#6B7280] uppercase tracking-wide mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tools */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Link
              to={CALCULATOR_PATH}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2ED1B4] text-[#070A12] text-sm font-semibold hover:bg-[#25b89d] transition-colors"
            >
              <Calculator className="w-4 h-4" />
              Reconstitution calculator
            </Link>
            <Link
              to={SHOP_PATH}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(244,246,250,0.12)] text-[#A9B3C7] text-sm font-medium hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.05)] transition-colors"
            >
              <Beaker className="w-4 h-4" />
              Browse catalogue
            </Link>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search peptide, vial, dose, frequency…"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[rgba(17,24,39,0.7)] border border-[rgba(244,246,250,0.1)] text-sm text-[#F4F6FA] placeholder:text-[#5A667E] focus:outline-none focus:border-[#2ED1B4]"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['all', 'All'],
                  ['single', 'Singles'],
                  ['blend', 'Blends'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTypeFilter(key)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    typeFilter === key
                      ? 'bg-[#2ED1B4] text-[#070A12]'
                      : 'bg-[rgba(244,246,250,0.06)] text-[#A9B3C7] hover:bg-[rgba(244,246,250,0.1)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#6B7280] mb-3">
            Showing {filtered.length} of {PROTOCOL_CHART.length} rows
          </p>

          {/* Table */}
          <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.55)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[720px]">
                <thead>
                  <tr className="border-b border-[rgba(244,246,250,0.08)] text-[10px] uppercase tracking-wide text-[#6B7280]">
                    {(
                      [
                        ['name', 'Peptide'],
                        ['vialSize', 'Vial size'],
                        ['type', 'Type'],
                        ['concentration', 'Typical concentration'],
                        ['doseRange', 'Typical dose range'],
                        ['frequency', 'Frequency'],
                      ] as const
                    ).map(([key, label]) => (
                      <th key={key} className="px-3 sm:px-4 py-3 font-semibold">
                        <button
                          type="button"
                          onClick={() => toggleSort(key)}
                          className="inline-flex items-center gap-1.5 hover:text-[#A9B3C7]"
                        >
                          {label}
                          <SortIcon column={key} />
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-[#5A667E]">
                        No protocols match your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[rgba(244,246,250,0.04)] hover:bg-[rgba(244,246,250,0.02)]"
                      >
                        <td className="px-3 sm:px-4 py-3">
                          <Link
                            to={`/product/${row.productSlug}`}
                            className="text-sm font-semibold text-[#F4F6FA] hover:text-[#2ED1B4] transition-colors"
                          >
                            {row.name}
                          </Link>
                          {row.notes ? (
                            <p className="text-[10px] text-[#6B7280] mt-0.5 max-w-[200px]">{row.notes}</p>
                          ) : null}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-[#A9B3C7] whitespace-nowrap">
                          {row.vialSize}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${
                              row.type === 'blend'
                                ? 'bg-[rgba(139,92,246,0.15)] text-[#A78BFA]'
                                : 'bg-[rgba(46,209,180,0.12)] text-[#2ED1B4]'
                            }`}
                          >
                            {row.type}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm font-mono text-[#A9B3C7] whitespace-nowrap">
                          {row.concentration}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-[#F4F6FA] whitespace-nowrap">
                          {row.doseRange}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-sm text-[#A9B3C7] whitespace-nowrap">
                          {row.frequency}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to read */}
          <section className="mt-10 p-5 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
            <h2 className="text-lg font-semibold text-[#F4F6FA] mb-3">How to read this chart</h2>
            <ul className="space-y-2 text-sm text-[#A9B3C7] leading-relaxed">
              <li>
                <strong className="text-[#F4F6FA]">Typical concentration</strong> is the approximate mg/mL
                after reconstituting the listed vial size with a common bacteriostatic water volume used in
                research protocols.
              </li>
              <li>
                <strong className="text-[#F4F6FA]">Typical dose range</strong> spans a common research
                starting dose through a higher maintenance range — most protocols titrate gradually.
              </li>
              <li>
                <strong className="text-[#F4F6FA]">Frequency</strong> is how often that dose is typically
                referenced in research schedules.
              </li>
              <li>
                For exact syringe units from your vial and BAC water volume, use the{' '}
                <Link to={CALCULATOR_PATH} className="text-[#2ED1B4] hover:underline">
                  reconstitution calculator
                </Link>
                .
              </li>
            </ul>
          </section>

          <p className="mt-6 text-[11px] text-[#5A667E] leading-relaxed max-w-3xl">
            Disclaimer: All PEPLAB products are sold strictly for laboratory and research purposes only.
            This dosage chart is educational and informational. It is not medical advice. These compounds
            are not intended for human consumption, and nothing here should be interpreted as a
            recommendation to use any substance in humans.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
