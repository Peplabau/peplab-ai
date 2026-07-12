import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getOptimizedProductImageUrl } from '@/lib/product-image';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
}

interface SearchBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const searchProducts = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, slug, category, image')
          .ilike('name', `%${query}%`)
          .eq('is_active', true)
          .limit(8);

        if (error) throw error;
        setResults(data || []);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Search Container */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bg-[#111827] rounded-2xl border border-[rgba(244,246,250,0.1)] shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-[rgba(244,246,250,0.08)]">
            {loading ? (
              <Loader2 className="w-5 h-5 text-[#2ED1B4] animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-[#A9B3C7]" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-[#F4F6FA] placeholder-[#A9B3C7] outline-none"
            />
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[rgba(244,246,250,0.08)]"
            >
              <X className="w-5 h-5 text-[#A9B3C7]" />
            </button>
          </div>

          {/* Results */}
          {query.length >= 2 && (
            <div className="max-h-80 overflow-y-auto">
              {results.length === 0 && !loading ? (
                <div className="p-8 text-center">
                  <p className="text-[#A9B3C7]">No products found</p>
                </div>
              ) : (
                <div className="divide-y divide-[rgba(244,246,250,0.08)]">
                  {results.map((product) => (
                    <a
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-4 hover:bg-[rgba(244,246,250,0.05)] transition-colors"
                    >
                      <img
                        src={getOptimizedProductImageUrl(product.image, { width: 96 })}
                        alt={product.name}
                        className="w-12 h-12 object-contain rounded-lg bg-[rgba(7,10,18,0.5)]"
                        loading="lazy"
                        decoding="async"
                      />
                      <div>
                        <p className="font-medium text-[#F4F6FA]">{product.name}</p>
                        <p className="text-sm text-[#A9B3C7]">{product.category}</p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          {query.length < 2 && (
            <div className="p-4">
              <p className="text-xs text-[#A9B3C7] mb-3 uppercase tracking-wide">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['BPC-157', 'TB-500', 'CJC-1295', 'Ipamorelin', 'MOTS-C'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full bg-[rgba(244,246,250,0.08)] text-sm text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.12)] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
