import { ArrowLeft, Scale, Shield, FileText, AlertTriangle, Gavel, ExternalLink } from 'lucide-react';
import { SEO } from '@/components/SEO';
import Footer from '@/sections/Footer';

export default function Legal() {
  return (
    <div className="min-h-screen bg-[#070A12]">
      <SEO 
        title="Legal & Compliance | PEPLAB"
        description="PEPLAB Legal & Compliance Information - TGA, Australian Consumer Law, and research product regulations."
      />
      
      {/* Navigation */}
      <nav className="px-4 py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold tracking-wider gradient-text">PEPLAB</a>
          <a href="/" className="text-sm text-gray-400 flex items-center gap-2 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Scale className="w-16 h-16 mx-auto text-[#2ED1B4] mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Legal & Compliance</h1>
          <p className="text-gray-400">Important legal information about our products and services</p>
        </div>

        <div className="space-y-8">
          {/* TGA Notice */}
          <section className="p-6 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.3)]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
              TGA (Therapeutic Goods Administration) Notice
            </h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)]">
                <p className="text-[#F59E0B] font-bold text-lg mb-2">⚠️ NOT APPROVED BY THE TGA</p>
                <p className="text-gray-400 leading-relaxed">
                  The products sold on this website have <strong className="text-white">NOT been evaluated or approved</strong> by the 
                  Therapeutic Goods Administration (TGA) of Australia. Our products are:
                </p>
                <ul className="space-y-2 text-gray-400 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444]">✗</span>
                    <span>Not listed on the Australian Register of Therapeutic Goods (ARTG)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444]">✗</span>
                    <span>Not approved for therapeutic, diagnostic, or cosmetic use</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#EF4444]">✗</span>
                    <span>Not intended to diagnose, treat, cure, or prevent any disease</span>
                  </li>
                </ul>
              </div>
              <p className="text-gray-400 leading-relaxed">
                The TGA is Australia's regulatory authority for therapeutic goods. For more information, visit 
                <a href="https://www.tga.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#2ED1B4] hover:underline ml-1">
                  www.tga.gov.au <ExternalLink className="w-3 h-3 inline" />
                </a>
              </p>
            </div>
          </section>

          {/* Research Use Only */}
          <section className="p-6 rounded-2xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-[#EF4444]" />
              For Research Purposes Only
            </h2>
            <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)]">
              <p className="text-[#EF4444] font-bold text-lg mb-2">🔬 RESEARCH USE ONLY — NOT FOR HUMAN CONSUMPTION</p>
              <p className="text-gray-400 leading-relaxed">
                All products sold by PEPLAB are intended <strong className="text-white">exclusively for laboratory research purposes</strong>. By purchasing, you agree that:
              </p>
              <ul className="space-y-2 text-gray-400 mt-3">
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">•</span>
                  <span>You are a qualified researcher or laboratory professional</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">•</span>
                  <span>You will use products only in a controlled laboratory environment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">•</span>
                  <span>You understand these are research chemicals, not medicines or supplements</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">•</span>
                  <span>You assume full responsibility for proper handling and storage</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Not Therapeutic */}
          <section className="p-6 rounded-2xl bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.3)]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-[#8B5CF6]" />
              Not For Therapeutic Use
            </h2>
            <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)]">
              <p className="text-[#8B5CF6] font-bold text-lg mb-2">🚫 NOT FOR THERAPEUTIC USE</p>
              <p className="text-gray-400 leading-relaxed">
                Our products are <strong className="text-white">NOT intended for</strong>:
              </p>
              <ul className="space-y-2 text-gray-400 mt-3">
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">✗</span>
                  <span>Human or animal consumption</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">✗</span>
                  <span>Medical treatment or diagnosis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">✗</span>
                  <span>Cosmetic applications</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">✗</span>
                  <span>Veterinary use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#EF4444]">✗</span>
                  <span>Any application involving humans or animals</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Age Verification */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#8B5CF6]" />
              Age Verification (18+)
            </h2>
            <p className="text-gray-400 leading-relaxed">
              By using this website and purchasing our products, you confirm that you are at least 
              <strong className="text-white"> 18 years of age</strong>. We reserve the right to request proof of age 
              and to refuse service if we suspect you are under 18.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              It is illegal for persons under 18 to purchase research chemicals in Australia. By placing an order, 
              you warrant that you are of legal age to enter into binding contracts.
            </p>
          </section>

          {/* Prescription Products */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8B5CF6]" />
              Prescription Products
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Certain products on our website (including Semaglutide, Cagrilintide, and related combinations) 
              are marked as requiring prescription verification. By purchasing these products:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>You confirm you have a valid prescription OR</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>You are purchasing for legitimate research purposes in accordance with Australian law</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              We may request proof of prescription or research credentials before processing orders for these products.
            </p>
          </section>

          {/* Australian Consumer Law */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#8B5CF6]" />
              Australian Consumer Law
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Our products come with guarantees that cannot be excluded under the 
              <strong className="text-white"> Australian Consumer Law (ACL)</strong>. You are entitled to:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E]">✓</span>
                <span>Products of acceptable quality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E]">✓</span>
                <span>Products that match the description</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E]">✓</span>
                <span>Remedies for major failures</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              However, these guarantees do not apply where products are used for purposes other than laboratory research 
              or are not stored/handled according to instructions.
            </p>
          </section>

          {/* Prohibited Products */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#8B5CF6]" />
              Prohibited Products
            </h2>
            <p className="text-gray-400 leading-relaxed">
              The following products are <strong className="text-white">NOT available for public sale</strong> on our website:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#EF4444]">✗</span>
                <span><strong className="text-white">HGH 191AA (Somatropin)</strong> — Removed from public sale</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              These products may be available to licensed researchers or institutions upon request and verification.
            </p>
          </section>

          {/* Liability */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#8B5CF6]" />
              Limitation of Liability
            </h2>
            <p className="text-gray-400 leading-relaxed">
              PEPLAB is not liable for:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Any misuse, mishandling, or unlawful use of products</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Any claims regarding safety, efficacy, or suitability outside controlled research</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Any damages arising from use contrary to these terms</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              By purchasing from PEPLAB, you assume full responsibility for compliance with all applicable laws and regulations.
            </p>
          </section>

          {/* Links */}
          <section className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(46,209,180,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(46,209,180,0.2)]">
            <h2 className="text-xl font-semibold text-white mb-4">Related Legal Documents</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a href="/terms" className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)] hover:bg-[rgba(7,10,18,0.8)] transition-colors text-center">
                <FileText className="w-8 h-8 mx-auto text-[#2ED1B4] mb-2" />
                <p className="text-white font-medium">Terms of Service</p>
                <p className="text-xs text-gray-400 mt-1">Full terms of service</p>
              </a>
              <a href="/shipping" className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)] hover:bg-[rgba(7,10,18,0.8)] transition-colors text-center">
                <FileText className="w-8 h-8 mx-auto text-[#2ED1B4] mb-2" />
                <p className="text-white font-medium">Shipping Policy</p>
                <p className="text-xs text-gray-400 mt-1">Handling, transit, carriers, and costs</p>
              </a>
              <a href="/privacy" className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)] hover:bg-[rgba(7,10,18,0.8)] transition-colors text-center">
                <Shield className="w-8 h-8 mx-auto text-[#8B5CF6] mb-2" />
                <p className="text-white font-medium">Privacy Policy</p>
                <p className="text-xs text-gray-400 mt-1">How we handle your data</p>
              </a>
              <a href="/refund" className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)] hover:bg-[rgba(7,10,18,0.8)] transition-colors text-center">
                <Scale className="w-8 h-8 mx-auto text-[#F59E0B] mb-2" />
                <p className="text-white font-medium">Return & Refund Policy</p>
                <p className="text-xs text-gray-400 mt-1">Final-sale rules and ACL remedies</p>
              </a>
            </div>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <div className="p-4 rounded-xl bg-[rgba(46,209,180,0.1)] border border-[rgba(46,209,180,0.2)]">
              <p className="text-white font-medium">PEPLAB</p>
              <p className="text-gray-400">Support: <a href="/contact-info" className="text-[#2ED1B4] hover:underline">Telegram &amp; WhatsApp support</a></p>
              <p className="text-gray-400">Telegram: <a href="https://t.me/peplabau" target="_blank" rel="noopener noreferrer" className="text-[#2ED1B4] hover:underline">@peplabau</a></p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
