import {
  ArrowLeft,
  Scale,
  FileCheck,
  AlertTriangle,
  UserCheck,
  Package,
  Truck,
  CreditCard,
  Ban,
  Shield,
  Smartphone,
  ExternalLink,
  Building2,
  Gavel,
  Mail,
} from 'lucide-react';
import { SEO } from '@/components/SEO';
import Footer from '@/sections/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#070A12]">
      <SEO
        title="Terms of Service | PEPLAB"
        description="PEPLAB Terms of Service — Australian Consumer Law compliant. Read our terms before purchasing research products."
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
          <p className="text-sm font-medium tracking-widest text-[#8B5CF6] uppercase mb-2">Legal</p>
          <Scale className="w-16 h-16 mx-auto text-[#2ED1B4] mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400">Last updated: 12 June 2026</p>
        </div>

        {/* Introduction */}
        <section className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8">
          <p className="text-gray-400 leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the website{' '}
            <a href="https://peplab.ai" className="text-[#2ED1B4] hover:underline">
              https://peplab.ai
            </a>{' '}
            ("the Website") and the purchase of any products supplied by PEPLAB ("we," "us," "our"). By browsing the site,
            registering an account or placing an order, you confirm that you have read, understood and agree to be bound by
            these Terms, our{' '}
            <a href="/privacy" className="text-[#2ED1B4] hover:underline">Privacy Policy</a>,{' '}
            <a href="/shipping" className="text-[#2ED1B4] hover:underline">Shipping Policy</a> and{' '}
            <a href="/refund" className="text-[#2ED1B4] hover:underline">Refund Policy</a>.
          </p>
        </section>

        <div className="space-y-8">
          {/* 1. Use of Services & Eligibility */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#8B5CF6]" />
              1. Use of Services & Eligibility
            </h2>
            <p className="text-gray-400 leading-relaxed">By accessing or using our services you confirm that:</p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  You are at least 18 years of age and have full legal capacity to enter into a binding contract under
                  Australian law.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  You will use our website and products only for lawful purposes and in accordance with these Terms and all
                  applicable Commonwealth, State and Territory legislation.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  You are acquiring products solely for legitimate laboratory, analytical, scientific or educational research
                  purposes, and not for human or animal consumption, therapeutic application, or any use inconsistent with
                  our research-only positioning.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  The information you supply during account registration and at checkout — including identity, contact and
                  address details — is accurate, current and complete, and will be kept up to date.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  You will not impersonate another person, use the services in any manner that interferes with their
                  operation, or attempt to gain unauthorised access to any account, system or data.
                </span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              We reserve the right to suspend, restrict or terminate access to your account or refuse to supply products
              where there is a reasonable belief that these eligibility requirements have been breached.
            </p>
          </section>

          {/* 2. Research-Use Products, COAs & Customer Responsibilities */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#8B5CF6]" />
              2. Research-Use Products, COAs & Customer Responsibilities
            </h2>
            <div className="p-4 rounded-xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] mb-4">
              <p className="text-[#F59E0B] font-medium">
                ⚠️ FOR RESEARCH PURPOSES ONLY — NOT FOR HUMAN OR ANIMAL CONSUMPTION
              </p>
            </div>
            <p className="text-gray-400 leading-relaxed">
              All products supplied by PEPLAB are classified as research compounds intended exclusively for in-vitro
              laboratory research, scientific investigation, analytical and educational purposes. Our products are not
              therapeutic goods as defined under the Therapeutic Goods Act 1989 (Cth), are not listed or registered on the
              Australian Register of Therapeutic Goods (ARTG), and are not supplied for human or animal consumption,
              ingestion, injection, topical application or any clinical use.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              PEPLAB does not provide medical, clinical, diagnostic, dosing or therapeutic advice of any kind. No content
              on this website constitutes medical advice or a recommendation for therapeutic use, and no statement has been
              evaluated by the Therapeutic Goods Administration (TGA).
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">Prescription Products:</strong> Certain products (including but not limited to
              Semaglutide, Cagrilintide, and related combinations) are marked as requiring prescription verification. By
              purchasing these products, you confirm you have a valid prescription or are purchasing for legitimate research
              purposes in accordance with Australian law.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">Certificates of Analysis (COAs) and analytical testing.</strong> Where
              reasonably available, we may provide Certificates of Analysis, HPLC and/or LC-MS data for individual
              production batches. COAs are provided for technical documentation purposes only and do not constitute a
              therapeutic, medical or fitness-for-use representation. COAs may not always be publicly displayed and may be
              made available on request, subject to availability and verification. The absence, delay or non-publication of
              a COA does not constitute grounds for refund, chargeback, return or cancellation.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              By placing an order, the customer expressly acknowledges and accepts that:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  They possess the knowledge, qualifications and facilities required to handle laboratory-grade research
                  compounds safely.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  They are solely responsible for the safe handling, storage, use and disposal of products in accordance
                  with applicable laws, workplace health and safety standards, and good laboratory practice.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  They will not on-sell, redistribute or supply products for human or animal consumption, or in any manner
                  that contravenes Australian law.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  They release PEPLAB from any liability arising from any misuse, off-label use, or unauthorised application
                  of products.
                </span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              We reserve the right to cancel any order, suspend an account or refuse future supply where there is a
              reasonable belief that products may be misused, used for purposes inconsistent with these Terms, or supplied
              to a recipient who does not meet our eligibility criteria.
            </p>
          </section>

          {/* 3. Orders & Payments */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#8B5CF6]" />
              3. Orders & Payments
            </h2>
            <p className="text-gray-400 leading-relaxed">
              When placing an order, you agree to provide accurate, current and complete information, including identity,
              contact, shipping and payment details. You authorise us to verify this information and, where appropriate, to
              perform fraud, identity or compliance checks prior to dispatch.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">Payment Methods:</strong> We accept bank transfer, cash on pickup (Sydney
              local pickup available), and other methods as specified at checkout. Orders will not be shipped until payment
              has been received and cleared.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              All prices are listed in Australian Dollars (AUD) and are inclusive of GST where applicable. Prices, product
              availability and specifications may change without notice. An order is not accepted until payment has been
              confirmed and we have issued an order confirmation.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              We reserve the right, at our sole discretion, to refuse, cancel, limit or hold any order — including, without
              limitation, where:
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>we suspect fraud, payment risk, identity misuse, or chargeback abuse;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>the order appears inconsistent with research-use supply;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>pricing or stock errors are identified on the website;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>the customer has previously breached these Terms or any of our policies.</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              Each order placed forms part of the customer's account record and is treated as a renewed declaration of the
              customer's research-use intent and eligibility under these Terms.
            </p>
          </section>

          {/* 4. Shipping, Delivery & Force Majeure */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#8B5CF6]" />
              4. Shipping, Delivery & Force Majeure
            </h2>
            <p className="text-gray-400 leading-relaxed">
              PEPLAB ships exclusively within Australia. Estimated delivery windows published at checkout or on our{' '}
              <a href="/shipping" className="text-[#2ED1B4] hover:underline">Shipping Policy</a> page are provided as a
              guide only and are not a guaranteed delivery date.
            </p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  <strong className="text-white">Express Shipping:</strong> 2-4 business days ($15 or FREE over $250)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#2ED1B4]">•</span>
                <span>
                  <strong className="text-white">Standard Shipping:</strong> 5-8 business days ($10 or FREE over $250)
                </span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              Risk of loss and title for items pass to you upon delivery to the carrier. Once a parcel has been handed to
              the carrier, transit timing is managed by the carrier.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              We are not liable for delays, loss, damage or non-performance caused by events outside our reasonable control,
              including but not limited to: carrier or courier disruptions; high-volume shipping periods; public holidays;
              severe weather; natural disasters; pandemics; industrial action; supply-chain interruptions; cyber events; or
              any action or direction of a government, regulatory or law-enforcement authority.
            </p>
          </section>

          {/* 5. Refunds & Returns */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Ban className="w-5 h-5 text-[#8B5CF6]" />
              5. Refunds & Returns
            </h2>
            <p className="text-gray-400 leading-relaxed">
              All sales are considered final, except as expressly set out in our{' '}
              <a href="/refund" className="text-[#2ED1B4] hover:underline">Refund Policy</a> and as required under the
              Australian Consumer Law.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">Due to the nature of our products, we do not accept returns for:</p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#EF4444]">•</span>
                <span>Opened or used products</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#EF4444]">•</span>
                <span>Products that have been tampered with</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#EF4444]">•</span>
                <span>Products damaged due to improper storage by the customer</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">Damaged or Defective Products:</strong> If you receive a damaged or defective
              product, please contact us within 48 hours of delivery with photos. We will assess and may offer replacement or
              refund at our discretion.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Refunds are not available for change of mind, incorrect address entry, failure to collect a parcel, carrier
              delays outside our control, improper handling or storage after delivery, or the absence/non-publication of a
              COA.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Customers should review the{' '}
              <a href="/refund" className="text-[#2ED1B4] hover:underline">Refund Policy</a> and{' '}
              <a href="/shipping" className="text-[#2ED1B4] hover:underline">Shipping Policy</a> carefully before placing
              an order.
            </p>
          </section>

          {/* 6. Australian Consumer Law (ACL) Rights */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#8B5CF6]" />
              6. Australian Consumer Law (ACL) Rights
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Nothing in these Terms excludes, restricts or modifies any consumer guarantee, right or remedy under the
              Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010 (Cth)) that cannot be excluded or
              limited by law.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Our products come with guarantees that cannot be excluded under the ACL. You are entitled to a replacement or
              refund for a major failure and compensation for any other reasonably foreseeable loss or damage. You are also
              entitled to have the goods repaired or replaced if the goods fail to be of acceptable quality and the failure
              does not amount to a major failure.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">However, the ACL consumer guarantees do not apply where:</p>
            <ul className="space-y-2 text-gray-400 mt-4">
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Products are used for purposes other than laboratory research</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Products are not stored or handled as directed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A9B3C7]">•</span>
                <span>Products are altered, tampered with, or damaged after delivery</span>
              </li>
            </ul>
            <p className="text-gray-400 leading-relaxed mt-4">
              To the maximum extent permitted by law, our liability for breach of any non-excludable guarantee is limited, at
              our election, to the replacement of the relevant product, the supply of an equivalent product, or the refund of
              the price paid for that product.
            </p>
          </section>

          {/* 7. Limitation of Liability & Indemnity */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#8B5CF6]" />
              7. Limitation of Liability & Indemnity
            </h2>
            <p className="text-gray-400 leading-relaxed">
              To the maximum extent permitted by law, PEPLAB, its directors, employees, contractors and affiliates will not
              be liable for any indirect, incidental, special, consequential, exemplary or punitive damages, loss of profits,
              loss of business, loss of data or loss of opportunity arising out of or in connection with the website, the
              supply of any product, or any use or misuse of any product.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              PEPLAB is not liable for any misuse, mishandling, or unlawful use of products. We make no claims regarding
              safety, efficacy, or suitability outside controlled research.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Our total aggregate liability arising out of or in connection with any product or order shall not exceed the
              amount paid by the customer for the specific product giving rise to the claim.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">Misuse indemnity.</strong> The customer agrees to indemnify and hold harmless
              PEPLAB and its related parties from and against any claims, liabilities, damages, losses, fines and expenses
              (including reasonable legal costs) arising out of or in connection with: (a) any breach of these Terms; (b) any
              misuse, off-label use or unlawful use of any product; (c) any claim that products were used for human or animal
              consumption, therapeutic, diagnostic or clinical purposes; or (d) any failure by the customer to comply with
              applicable Australian law.
            </p>
          </section>

          {/* 8. Intellectual Property */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#8B5CF6]" />
              8. Intellectual Property
            </h2>
            <p className="text-gray-400 leading-relaxed">
              All content published on this website — including text, copy, product descriptions, branding, logos,
              photography, graphics, layout and code — is the property of PEPLAB or its licensors and is protected by the
              Copyright Act 1968 (Cth) and other applicable intellectual property laws. No content may be copied,
              reproduced, republished, modified, distributed, sold or otherwise exploited without our prior written
              consent. Unauthorised use may give rise to civil and/or criminal liability.
            </p>
          </section>

          {/* 9. Mobile Messaging Terms */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#8B5CF6]" />
              9. Mobile Messaging Terms
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Where you provide your mobile number and opt in to receive SMS communications from PEPLAB — for example at
              checkout, account signup or via a dedicated subscribe form — you consent to receive transactional,
              customer-service and (where opted in) marketing messages from us.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Messages may include order confirmations, dispatch and delivery updates, account or security notifications,
              restock alerts, and limited promotional offers. Message frequency varies. Message and data rates may apply
              according to your mobile carrier's plan. PEPLAB is not responsible for carrier charges incurred by recipients.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">Cart reminders.</strong> If you enter contact details at checkout but do not
              complete your order, you may receive a limited number of follow-up reminders (by email and, where consent has
              been provided, by SMS) inviting you to complete your purchase.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              <strong className="text-white">Opt-out.</strong> You may opt out of marketing SMS messages at any time by
              replying STOP to any marketing SMS, by using the unsubscribe link in marketing emails, or by contacting us via our{' '}
              <a href="/contact-info" className="text-[#2ED1B4] hover:underline">
                support channels
              </a>
              . Transactional messages relating to your order, account or legal obligations may continue regardless of
              marketing opt-out preferences.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              Information collected for mobile messaging is handled in accordance with our{' '}
              <a href="/privacy" className="text-[#2ED1B4] hover:underline">Privacy Policy</a>.
            </p>
          </section>

          {/* 10. Third-Party Links */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-[#8B5CF6]" />
              10. Third-Party Links
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Our website may contain links to third-party websites, services or resources that are not owned or controlled
              by PEPLAB. We provide such links for convenience only and do not endorse, warrant or assume any responsibility
              for the content, products, services, policies or practices of any third party. Your access to and use of any
              third-party site is at your own risk and subject to the terms and policies of that third party.
            </p>
          </section>

          {/* 11. Privacy */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#8B5CF6]" />
              11. Privacy
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Your use of our website and services is also governed by our{' '}
              <a href="/privacy" className="text-[#2ED1B4] hover:underline">Privacy Policy</a>, which describes how we
              collect, hold, use and disclose personal information in accordance with the Privacy Act 1988 (Cth) and the
              Australian Privacy Principles. By using our services, you acknowledge and consent to the practices described in
              that policy.
            </p>
          </section>

          {/* 12. Business Transfers */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#8B5CF6]" />
              12. Business Transfers
            </h2>
            <p className="text-gray-400 leading-relaxed">
              In the event of a merger, acquisition, restructure, or sale of all or part of our business or assets, your
              personal data and account information may be transferred to the successor entity as part of that transaction. We
              will notify you of any such change in ownership or control of your personal information.
            </p>
          </section>

          {/* 13. Governing Law & Updates */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Gavel className="w-5 h-5 text-[#8B5CF6]" />
              13. Governing Law & Updates
            </h2>
            <p className="text-gray-400 leading-relaxed">
              These Terms are governed by the laws of the Commonwealth of Australia and the State of New South Wales. The
              parties submit to the exclusive jurisdiction of the courts of New South Wales and the Federal Court of Australia
              in respect of any dispute arising out of or in connection with these Terms.
            </p>
            <p className="text-gray-400 leading-relaxed mt-4">
              We may amend these Terms from time to time to reflect changes in our business, services, legal obligations or
              industry practice. Updates take effect on publication to the website. Your continued use of the website or
              placement of further orders following any update constitutes acceptance of the revised Terms.
            </p>
          </section>

          {/* 14. Contact */}
          <section className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#8B5CF6]" />
              14. Contact
            </h2>
            <p className="text-gray-400 leading-relaxed mb-4">For questions about these Terms, please contact:</p>
            <div className="p-4 rounded-xl bg-[rgba(46,209,180,0.1)] border border-[rgba(46,209,180,0.2)]">
              <p className="text-white font-medium">PEPLAB</p>
              <p className="text-gray-400">
                Support:{' '}
                <a href="/contact-info" className="text-[#2ED1B4] hover:underline">
                  Telegram &amp; WhatsApp support
                </a>
              </p>
              <p className="text-gray-400">
                Telegram:{' '}
                <a
                  href="https://t.me/peplabau"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#2ED1B4] hover:underline"
                >
                  @peplabau
                </a>
              </p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
