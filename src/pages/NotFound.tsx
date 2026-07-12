import { ArrowLeft, Search, Home, Package } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="Page not found | PEPLAB" noIndex />
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#070A12' }}>
      <div className="absolute inset-0 grid-overlay opacity-40" />
      
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* 404 Number */}
        <div className="mb-8">
          <span className="text-8xl sm:text-9xl font-bold gradient-text">404</span>
        </div>
        
        {/* Message */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F4F6FA] mb-4">
          Page Not Found
        </h1>
        <p className="text-[#A9B3C7] mb-8 max-w-md mx-auto">
          Sorry, the page you're looking for doesn't exist. It might have been moved or deleted.
        </p>
        
        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <a 
            href="/" 
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] hover:border-[#2ED1B4] transition-colors group"
          >
            <Home className="w-5 h-5 text-[#2ED1B4] group-hover:scale-110 transition-transform" />
            <span className="text-[#F4F6FA]">Home</span>
          </a>
          
          <a 
            href="/shop" 
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] hover:border-[#8B5CF6] transition-colors group"
          >
            <Package className="w-5 h-5 text-[#8B5CF6] group-hover:scale-110 transition-transform" />
            <span className="text-[#F4F6FA]">Shop</span>
          </a>
          
          <a 
            href="/contact" 
            className="flex items-center justify-center gap-2 p-4 rounded-xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] hover:border-[#2ED1B4] transition-colors group"
          >
            <Search className="w-5 h-5 text-[#2ED1B4] group-hover:scale-110 transition-transform" />
            <span className="text-[#F4F6FA]">Contact</span>
          </a>
        </div>
        
        {/* Back Button */}
        <button 
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-[#A9B3C7] hover:text-[#2ED1B4] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
    </>
  );
}
