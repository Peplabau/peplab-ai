import { useState, useEffect } from 'react';
import { ChevronDown, Search, HelpCircle, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';

interface FAQCategory {
  id: string;
  name: string;
  slug: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category_id: string;
}

export default function FAQ() {
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFAQ();
  }, []);

  const loadFAQ = async () => {
    try {
      const { data: cats } = await supabase
        .from('faq_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      const { data: items } = await supabase
        .from('faq_items')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      setCategories(cats || []);
      setFaqs(items || []);
    } catch (error) {
      console.error('Error loading FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category_id === activeCategory;
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12" style={{ background: '#070A12' }}>
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3 mb-10">
            <Skeleton className="h-10 w-32 rounded-full mx-auto" />
            <Skeleton className="h-12 w-72 rounded-lg mx-auto" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          {/* Category tabs */}
          <div className="flex gap-2 flex-wrap">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
          {/* Accordion items */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-5 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-3/4 rounded" />
              <Skeleton className="h-5 w-5 rounded shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      <SEO 
        title="FAQ | PEPLAB - Frequently Asked Questions"
        description="Find answers to common questions about ordering, shipping, products, and more."
      />
      
      <div className="absolute inset-0 grid-overlay opacity-40" />
      
      <main className="relative z-10 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="eyebrow mb-4 block">SUPPORT</span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F6FA] mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-[#A9B3C7] max-w-xl mx-auto">
              Find answers to common questions about ordering, shipping, products, and more.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for answers..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#2ED1B4] text-white'
                  : 'bg-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#F4F6FA]'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-[#2ED1B4] text-white'
                    : 'bg-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#F4F6FA]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 mx-auto text-[rgba(244,246,250,0.2)] mb-4" />
                <p className="text-[#A9B3C7]">No questions found. Try a different search.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] overflow-hidden"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium text-[#F4F6FA] pr-4">{faq.question}</span>
                    <ChevronDown 
                      className={`w-5 h-5 text-[#2ED1B4] flex-shrink-0 transition-transform ${
                        openItem === faq.id ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                  {openItem === faq.id && (
                    <div className="px-5 pb-5">
                      <div className="pt-2 border-t border-[rgba(244,246,250,0.08)]">
                        <p className="text-[#A9B3C7] pt-4 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-[rgba(46,209,180,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(46,209,180,0.2)] text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-[#2ED1B4] mb-4" />
            <h3 className="text-xl font-semibold text-[#F4F6FA] mb-2">Still have questions?</h3>
            <p className="text-[#A9B3C7] mb-6">Can't find the answer you're looking for? Contact our support team.</p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2ED1B4] text-[#070A12] font-semibold hover:bg-[#25b89d] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
