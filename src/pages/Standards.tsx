import { ArrowLeft, Beaker, Shield, FileText, MessageCircle, Heart } from 'lucide-react';
import { SEO } from '@/components/SEO';

export default function Standards() {
  return (
    <>
      <SEO
        title="Quality Standards | PEPLAB — HPLC-verified research peptides"
        description="How PEPLAB tests every peptide batch: HPLC purity, identity verification, published COAs, and research-grade handling standards."
      />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-12 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex flex-col items-start">
            <span className="text-3xl lg:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
              PEPLAB
            </span>
            <span className="text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">
              PEPTIDES AUSTRALIA
            </span>
          </a>
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center mb-6">
              <Beaker className="w-8 h-8 text-[#2ED1B4]" />
            </div>
            <span className="eyebrow mb-4 block">QUALITY ASSURANCE</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
              Our <span className="gradient-text">Standards</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A9B3C7] max-w-2xl mx-auto">
              At PEPLAB, we are committed to maintaining the highest standards in research-grade products 
              and services. Our standards ensure consistency, reliability, and safety for all of our 
              laboratory customers.
            </p>
          </div>

          {/* Standards Cards */}
          <div className="space-y-6">
            {/* Standard 1 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center flex-shrink-0">
                  <Beaker className="w-6 h-6 text-[#2ED1B4]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F4F6FA] mb-3">1. Research-Grade Quality</h2>
                  <ul className="space-y-2 text-[#A9B3C7]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#2ED1B4] mt-1">•</span>
                      <span>All products are intended strictly for laboratory research and are manufactured to meet high-purity standards.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#2ED1B4] mt-1">•</span>
                      <span>Every batch undergoes rigorous quality control testing to ensure accuracy and consistency.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Standard 2 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F4F6FA] mb-3">2. Compliance and Safety</h2>
                  <ul className="space-y-2 text-[#A9B3C7]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#8B5CF6] mt-1">•</span>
                      <span>We adhere to local and international regulations governing the production, handling, and distribution of research chemicals.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#8B5CF6] mt-1">•</span>
                      <span>Our products are not for human or animal consumption, nor for therapeutic, diagnostic, or cosmetic use.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Standard 3 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-[#3B82F6]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F4F6FA] mb-3">3. Transparency and Documentation</h2>
                  <ul className="space-y-2 text-[#A9B3C7]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#3B82F6] mt-1">•</span>
                      <span>Product specifications, certificates of analysis (COA), and safety information are provided to support research and compliance.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#3B82F6] mt-1">•</span>
                      <span>We maintain clear records of all batches, shipping, and customer orders.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Standard 4 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(236,72,153,0.1)] flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-[#EC4899]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F4F6FA] mb-3">4. Customer Support and Guidance</h2>
                  <ul className="space-y-2 text-[#A9B3C7]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#EC4899] mt-1">•</span>
                      <span>Our team is available to provide guidance on proper storage, handling, and research usage.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#EC4899] mt-1">•</span>
                      <span>
                        Live chat support via Telegram ({' '}
                        <a 
                          href="https://t.me/PepLabAu" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#2ED1B4] hover:underline"
                        >
                          @PepLabAu
                        </a>
                        {' '} ) and email ensures quick and reliable assistance.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Standard 5 */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[rgba(16,185,129,0.1)] flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-[#10B981]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#F4F6FA] mb-3">5. Ethical Standards</h2>
                  <ul className="space-y-2 text-[#A9B3C7]">
                    <li className="flex items-start gap-2">
                      <span className="text-[#10B981] mt-1">•</span>
                      <span>We operate with integrity and professionalism, serving only qualified researchers and institutions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#10B981] mt-1">•</span>
                      <span>We continuously review our processes to uphold ethical and scientific best practices.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-[#A9B3C7] mb-6">
              Have questions about our standards or products?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="/contact-info" className="btn-primary inline-flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Contact Us
              </a>
              <a href="/#tutorial" className="btn-outline inline-flex items-center gap-2">
                View Reconstitution Guide
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-[rgba(244,246,250,0.08)]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A9B3C7]">
            © 2026 PEPLAB. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#A9B3C7]">
            <a href="/privacy" className="hover:text-[#F4F6FA] transition-colors">Privacy</a>
            <a href="/terms" className="hover:text-[#F4F6FA] transition-colors">Terms</a>
            <a href="/refund" className="hover:text-[#F4F6FA] transition-colors">Refunds</a>
            <a href="/shipping" className="hover:text-[#F4F6FA] transition-colors">Shipping</a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
