import { useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/sections/Footer';
import CoaArchiveCard from '@/components/CoaArchiveCard';
import CoaArchiveHero from '@/components/CoaArchiveHero';
import CoaDialog from '@/components/CoaDialog';
import { SEO } from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { loadProductsFromSupabase } from '@/lib/supabase-db';
import { getCoaDisplayData, productHasCoaPdf, type CoaDisplayData } from '@/lib/coa-utils';
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
        if (!cancelled) setProducts(data.filter(productHasCoaPdf));
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
        <div className="relative z-10 px-4 sm:px-6 lg:px-12">
          <CoaArchiveHero
            certificateCount={products.length}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {loading && (
            <div className="coa-archive-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-5">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl sm:rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[#111827] overflow-hidden"
                >
                  <Skeleton className="h-10 sm:h-12 w-full rounded-none" />
                  <Skeleton className="w-full aspect-[5/6] sm:aspect-[3/4] rounded-none" />
                  <Skeleton className="h-14 sm:h-16 w-full rounded-none" />
                  <Skeleton className="hidden sm:block h-12 m-3 rounded-xl" />
                </div>
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
              <p className="text-[#A9B3C7] text-lg">No published COAs yet.</p>
              <p className="text-sm text-[#6B7280] mt-2">Check back soon — new batch certificates are added regularly.</p>
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
            <div className="coa-archive-grid grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-5">
              {filteredProducts.map((product) => (
                <CoaArchiveCard key={product.id} product={product} onView={openCoa} />
              ))}
            </div>
          )}
        </div>
      </main>

      <CoaDialog open={coaOpen} onOpenChange={setCoaOpen} data={activeCoa} />
      <Footer />
    </div>
  );
}
