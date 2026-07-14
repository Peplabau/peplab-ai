import { ArrowLeft, RotateCcw, AlertCircle, CheckCircle, XCircle, Package, Mail } from 'lucide-react';
import { SEO } from '@/components/SEO';
import Footer from '@/sections/Footer';

export default function Refund() {
  return (
    <div className="min-h-screen bg-[#070A12]">
      <SEO 
        title="Returns & Refunds Policy | PEPLAB"
        description="PEPLAB Returns & Refunds Policy - Australian Consumer Law compliant. Learn about our return and refund procedures."
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
          <RotateCcw className="w-16 h-16 mx-auto text-[#2ED1B4] mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Returns & Refunds Policy</h1>
          <p className="text-gray-400">Last Updated: {new Date().toLocaleDateString('en-AU')}</p>
          <p className="text-sm text-[#2ED1B4] mt-2">Compliant with Australian Consumer Law (ACL)</p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8B5CF6]" />
              1. Overview
            </h2>
            <p className="text-gray-400 leading-relaxed">
              At PEPLAB, we are committed to providing high-quality research products. Due to the nature of our products 
              (laboratory research chemicals), we have specific policies regarding returns and refunds to ensure safety, 
              quality, and compliance with Australian regulations.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              This policy is designed to comply with the <strong className="text-white">Australian Consumer Law (ACL)</strong> 
              while addressing the unique nature of research chemical products.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">All sales are final once an order has been dispatched</strong>,
              except where a refund, replacement, or remedy is required under the Australian Consumer Law
              or where PEPLAB approves a claim for a wrong, missing, damaged, or defective item.
            </p>
          </section>

          {/* No Returns */}
          <section className="p-6 rounded-2xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-[#EF4444]" />
              2. Products Not Eligible for Return
            </h2>
            <p className="text-gray-400 mb-4">
              Due to safety and quality control reasons, <strong className="text-white">we cannot accept change-of-mind returns</strong> for:
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Opened Products:</strong> Any product where the seal has been broken or packaging opened</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Used Products:</strong> Any product that has been partially or fully used</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Tampered Products:</strong> Any product showing signs of tampering or alteration</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Improperly Stored:</strong> Products damaged due to improper storage by the customer</span>
              </li>
              <li className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">After 14 Days:</strong> Any request made more than 14 days after delivery</span>
              </li>
            </ul>
          </section>

          {/* Eligible for Refund */}
          <section className="p-6 rounded-2xl bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)]">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#22C55E]" />
              3. Products Eligible for Refund/Replacement
            </h2>
            <p className="text-gray-400 mb-4">
              We may offer a refund or replacement for:
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Damaged in Transit:</strong> Products damaged during shipping (must be reported within 48 hours)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Defective Products:</strong> Products that are defective or do not match the description</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Wrong Item:</strong> We shipped the incorrect product</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <span><strong className="text-white">Missing Items:</strong> Items missing from your order</span>
              </li>
            </ul>
          </section>

          {/* How to Request */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#8B5CF6]" />
              4. How to Request a Refund/Replacement
            </h2>
            <p className="text-gray-400 mb-4">
              To request a refund or replacement:
            </p>
            <ol className="space-y-3 text-gray-400">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ED1B4] text-[#070A12] flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <span>Contact us within <strong className="text-white">48 hours</strong> of receiving your order</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ED1B4] text-[#070A12] flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <span>Message us via our <a href="/contact-info" className="text-[#2ED1B4] hover:underline">Telegram or WhatsApp support</a></span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ED1B4] text-[#070A12] flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <span>Include your order number and detailed description of the issue</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ED1B4] text-[#070A12] flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                <span>Attach clear photos showing the damage/defect (if applicable)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-[#2ED1B4] text-[#070A12] flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                <span>Wait for our assessment (typically 1-3 business days)</span>
              </li>
            </ol>
          </section>

          {/* Assessment */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">5. Assessment Process</h2>
            <p className="text-gray-400 leading-relaxed">
              Once we receive your request:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>We will review your request and supporting evidence within 1-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>We may request additional information or photos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>If approved, we will offer either a replacement or refund at our discretion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Refunds will be processed to the original payment method within 5-10 business days</span>
              </li>
            </ul>
          </section>

          {/* ACL Rights */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights Under Australian Consumer Law</h2>
            <p className="text-gray-400 leading-relaxed">
              Our products come with guarantees that cannot be excluded under the <strong className="text-white">Australian Consumer Law (ACL)</strong>. 
              You are entitled to:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E]">•</span>
                <span>A replacement or refund for a major failure</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E]">•</span>
                <span>Compensation for any other reasonably foreseeable loss or damage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E]">•</span>
                <span>Repair or replacement if goods fail to be of acceptable quality</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              However, these guarantees do not apply where:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Products are used for purposes other than laboratory research</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Products are not stored or handled according to instructions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Products are altered, tampered with, or damaged after delivery</span>
              </li>
            </ul>
          </section>

          {/* Cancellations */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">7. Order Cancellations</h2>
            <p className="text-gray-400 leading-relaxed">
              You may request to cancel your order if:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>The order has not been shipped yet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>You contact us within 24 hours of placing the order</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              Once an order has been shipped, it cannot be cancelled. You must follow the returns process if applicable.
            </p>
          </section>

          {/* Shipping Costs */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">8. Shipping Costs for Returns</h2>
            <p className="text-gray-400 leading-relaxed">
              For approved returns/replacements:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#22C55E]">•</span>
                <span>If the return is due to our error (wrong item, defective product), we will cover return shipping</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>If PEPLAB approves a return outside a statutory remedy, the customer may be responsible for return shipping costs</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">9. Contact Us</h2>
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
