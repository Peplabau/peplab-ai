import { ArrowLeft, Shield, Lock, Eye, FileText, User, Mail, Cookie } from 'lucide-react';
import { SEO } from '@/components/SEO';
import Footer from '@/sections/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#070A12]">
      <SEO 
        title="Privacy Policy | PEPLAB"
        description="PEPLAB Privacy Policy - Australian Privacy Principles compliant. Learn how we collect, use, and protect your personal information."
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
          <Shield className="w-16 h-16 mx-auto text-[#2ED1B4] mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400">Last Updated: {new Date().toLocaleDateString('en-AU')}</p>
          <p className="text-sm text-[#2ED1B4] mt-2">Compliant with Australian Privacy Principles (APPs)</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#8B5CF6]" />
              1. Introduction
            </h2>
            <p className="text-gray-400 leading-relaxed">
              PEPLAB ("we," "us," or "our") is committed to protecting your privacy in accordance with the 
              <strong className="text-white"> Privacy Act 1988 (Cth)</strong> and the <strong className="text-white">Australian Privacy Principles (APPs)</strong>. 
              This Privacy Policy explains how we collect, use, disclose, and protect your personal information when you use our website and services.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              By accessing our website or using our services, you consent to the collection and use of your personal information as described in this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#8B5CF6]" />
              2. Information We Collect
            </h2>
            <p className="text-gray-400 mb-4">We may collect the following types of personal information:</p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Identity Information:</strong> Name, date of birth (for age verification)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Contact Information:</strong> Email address, phone number, shipping/billing address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Order Information:</strong> Purchase history, product preferences, order details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Technical Information:</strong> IP address, browser type, device information, cookies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Communication:</strong> Records of correspondence with us</span>
              </li>
            </ul>
          </section>

          {/* How We Collect */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#8B5CF6]" />
              3. How We Collect Information
            </h2>
            <p className="text-gray-400 mb-4">We collect personal information through:</p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Direct interactions when you create an account or place an order</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Automated technologies (cookies, server logs) when you browse our website</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Third parties such as payment processors and shipping providers</span>
              </li>
            </ul>
          </section>

          {/* Purpose of Collection */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8B5CF6]" />
              4. Purpose of Collection
            </h2>
            <p className="text-gray-400 mb-4">We collect personal information to:</p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Process and fulfill your orders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Verify your age (18+ requirement)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Communicate with you about your orders and account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Provide customer support and respond to inquiries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Send promotional communications (with your consent)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Improve our website, products, and services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Comply with legal obligations</span>
              </li>
            </ul>
          </section>

          {/* Disclosure */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#8B5CF6]" />
              5. Disclosure of Personal Information
            </h2>
            <p className="text-gray-400 mb-4">We may disclose your personal information to:</p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Service Providers:</strong> Payment processors, shipping carriers, IT service providers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Legal Authorities:</strong> When required by law or to protect our rights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span><strong className="text-white">Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</span>
              </li>
            </ul>
            <p className="text-gray-400 mt-4">
              We do not sell or rent your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* Security */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#8B5CF6]" />
              6. Security of Personal Information
            </h2>
            <p className="text-gray-400 leading-relaxed">
              We take reasonable steps to protect your personal information from misuse, interference, loss, 
              unauthorised access, modification, or disclosure. This includes:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Encryption of sensitive data in transit and at rest</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Secure server infrastructure with regular security updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Access controls and authentication mechanisms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Regular security assessments and monitoring</span>
              </li>
            </ul>
          </section>

          {/* Cookies */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Cookie className="w-5 h-5 text-[#8B5CF6]" />
              7. Cookies and Tracking
            </h2>
            <p className="text-gray-400 leading-relaxed">
              We use cookies and similar technologies to enhance your browsing experience, analyse website traffic, 
              and personalise content. You can control cookies through your browser settings. 
              Disabling cookies may affect the functionality of our website.
            </p>
          </section>

          {/* Your Rights */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#8B5CF6]" />
              8. Your Rights (APP Rights)
            </h2>
            <p className="text-gray-400 mb-4">Under the Privacy Act 1988, you have the right to:</p>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Access your personal information (APP 12)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Request correction of inaccurate information (APP 13)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Complain about a breach of the APPs (APP 1)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Request deletion of your personal information (where applicable)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>Opt-out of marketing communications</span>
              </li>
            </ul>
            <p className="text-gray-400 mt-4">
              To exercise these rights, please contact us using the details below.
            </p>
          </section>

          {/* Contact */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#8B5CF6]" />
              9. Contact Us
            </h2>
            <p className="text-gray-400 mb-4">
              If you have any questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
            </p>
            <div className="p-4 rounded-xl bg-[rgba(46,209,180,0.1)] border border-[rgba(46,209,180,0.2)]">
              <p className="text-white font-medium">PEPLAB</p>
              <p className="text-gray-400">Support: <a href="/contact-info" className="text-[#2ED1B4] hover:underline">Telegram &amp; WhatsApp support</a></p>
              <p className="text-gray-400">Telegram: <a href="https://t.me/peplabau" target="_blank" rel="noopener noreferrer" className="text-[#2ED1B4] hover:underline">@peplabau</a></p>
            </div>
          </section>

          {/* Complaints */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">10. Complaints</h2>
            <p className="text-gray-400 leading-relaxed">
              If you believe we have breached the Australian Privacy Principles, you may lodge a complaint with us 
              using the contact details above. We will respond within 30 days. If you are not satisfied with our response, 
              you may complain to the <strong className="text-white">Office of the Australian Information Commissioner (OAIC)</strong> at 
              <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer" className="text-[#2ED1B4] hover:underline"> www.oaic.gov.au</a>.
            </p>
          </section>

          {/* Changes */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">11. Changes to This Policy</h2>
            <p className="text-gray-400 leading-relaxed">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated 
              revision date. We encourage you to review this policy periodically.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
