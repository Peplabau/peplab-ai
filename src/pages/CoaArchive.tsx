import { useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/sections/Footer';
import CoaArchiveHero from '@/components/CoaArchiveHero';
import CoaArchiveTable from '@/components/CoaArchiveTable';
import CoaBatchLanes from '@/components/CoaBatchLanes';
import CoaDialog from '@/components/CoaDialog';
import { SEO } from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import {
  getCoaDisplayData,
  isCoaArchiveProduct,
  productHasCoaPdf,
  type CoaDisplayData,
} from '@/lib/coa-utils';
import type { Product } from '@/products';

export default function CoaArchive() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [coaOpen, setCoaOpen] = useState(false);
  const [activeCoa, setActiveCoa] = useState<CoaDisplayData | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    loadProductsFromSupabase()
      .then((data) => {
        if (!cancelled) {
          setProducts(
            data
              .filter(isCoaArchiveProduct)
              .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })),
          );
        }
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load COA archive.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const publishedCount = useMemo(
    () => products.filter(productHasCoaPdf).length,
    [products],
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const coa = getCoaDisplayData(p);
      return (
        p.name.toLowerCase().includes(q) ||
        coa.batch.toLowerCase().includes(q) ||
        coa.method.toLowerCase().includes(q) ||
        coa.labName.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery]);

  const openCoa = (data: CoaDisplayData) => {
    setActiveCoa(data);
    setCoaOpen(true);
  };

  return (
    <div className="relative min-h-screen page-grid-bg">
      <SEO
        title="COA Archive | PEPLAB — Published Certificates of Analysis"
        description="Browse every published Certificate of Analysis for PEPLAB research peptides. HPLC-verified batch documentation, independent Ozcanium Analytics testing."
        keywords={[
          'COA peptides Australia',
          'certificate of analysis',
          'HPLC COA',
          'Ozcanium Analytics',
          'PEPLAB COA archive',
          'research peptide COA',
        ]}
      />

      <Navigation />
      <CartDrawer />

      <main className="relative z-10 pt-24 sm:pt-28 pb-16 lg:pb-24">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CoaArchiveHero
            certificateCount={publishedCount}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <CoaBatchLanes
            activeCount={publishedCount}
            loading={loading}
            className="mb-6 lg:mb-8"
          />

          {loading && (
            <div className="rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.55)] overflow-hidden p-4 space-y-3">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16">
              <p className="text-[#EF4444] mb-2">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="text-[#2ED1B4] hover:underline"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.5)]">
              <FileText className="w-10 h-10 mx-auto mb-4 text-[#6B7280]" />
              <p className="text-[#A9B3C7] text-lg">No products in the archive yet.</p>
              <p className="text-sm text-[#6B7280] mt-2">
                Check back soon — new batch certificates are added regularly.
              </p>
            </div>
          )}

          {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#A9B3C7] text-lg">No certificates match your search.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 text-[#2ED1B4] hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <p className="text-xs text-[#6B7280] mb-3">
                Showing {filteredProducts.length} of {products.length} peptides · {publishedCount}{' '}
                certificates published
              </p>
              <CoaArchiveTable products={filteredProducts} onView={openCoa} />
            </>
          )}
        </div>
      </main>

      <CoaDialog open={coaOpen} onOpenChange={setCoaOpen} data={activeCoa} />
      <Footer />
    </div>
  );
}
