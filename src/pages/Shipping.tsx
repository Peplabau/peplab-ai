import { ArrowLeft, Truck, MapPin, Package, Globe, Mail } from 'lucide-react';
import Footer from '@/sections/Footer';
import { CONFIG } from '@/lib/config';
import { SEO } from '@/components/SEO';

export default function Shipping() {
  return (
    <>
      <SEO
        title="Shipping Policy | PEPLAB — Australia-wide peptide dispatch"
        description="PEPLAB shipping across Australia: express and standard AusPost options, same-day Mon–Fri dispatch, tracking on every order."
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
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(59,130,246,0.1)] flex items-center justify-center mb-6">
              <Truck className="w-8 h-8 text-[#3B82F6]" />
            </div>
            <span className="eyebrow mb-4 block">LEGAL</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
              Shipping <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A9B3C7]">
              Last updated: February 2026
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="p-6 sm:p-8 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] space-y-8">
              
              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">1. Shipping Overview</h2>
                <p className="text-[#A9B3C7] leading-relaxed">
                  PEPLAB is committed to providing fast, reliable, and discreet shipping for all orders. 
                  We ship from our Australian facility using Australia Post and tracked courier services.
                  All orders are packaged securely, dispatched with tracking, and handled during business
                  hours only.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">2. Shipping Destinations</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-[#2ED1B4]" />
                      <span className="font-semibold text-[#F4F6FA]">Domestic (Australia)</span>
                    </div>
                    <p className="text-sm text-[#A9B3C7]">
                      We ship to all states and territories within Australia including NSW, VIC, QLD, WA, SA, TAS, ACT, and NT.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                    <div className="flex items-center gap-3 mb-3">
                      <Globe className="w-5 h-5 text-[#8B5CF6]" />
                      <span className="font-semibold text-[#F4F6FA]">International</span>
                    </div>
                    <p className="text-sm text-[#A9B3C7]">
                      Select international shipping available. Please contact us for availability to your country.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">3. Shipping Methods</h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[rgba(46,209,180,0.05)] border border-[rgba(46,209,180,0.2)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-[#2ED1B4]" />
                      <span className="font-semibold text-[#F4F6FA]">Express Shipping</span>
                      </div>
                      <span className="text-[#2ED1B4] font-medium">${CONFIG.SHIPPING.EXPRESS_PRICE.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-[#A9B3C7] ml-8">
                      Australia Post Express or tracked courier, estimated 2-4 business days with priority handling.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-[rgba(139,92,246,0.05)] border border-[rgba(139,92,246,0.2)]">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Package className="w-5 h-5 text-[#8B5CF6]" />
                        <span className="font-semibold text-[#F4F6FA]">Standard Shipping</span>
                      </div>
                      <span className="text-[#8B5CF6] font-medium">${CONFIG.SHIPPING.STANDARD_PRICE.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-[#A9B3C7] ml-8">
                      Australia Post Standard or tracked courier, estimated 5-8 business days.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">4. Free Shipping</h2>
                <div className="p-4 rounded-xl bg-[rgba(46,209,180,0.1)] border border-[rgba(46,209,180,0.2)]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#2ED1B4] flex items-center justify-center">
                      <span className="text-[#070A12] font-bold text-sm">FREE</span>
                    </div>
                    <span className="font-semibold text-[#F4F6FA]">Free Express Shipping</span>
                  </div>
                  <p className="text-sm text-[#A9B3C7] ml-11">
                    All orders over <strong className="text-[#F4F6FA]">${CONFIG.SHIPPING.FREE_THRESHOLD} AUD</strong> qualify for free express shipping within Australia.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">5. Processing Time</h2>
                <p className="text-[#A9B3C7] leading-relaxed mb-4">
                  We strive to process and dispatch all orders as quickly as possible:
                </p>
                <ul className="list-disc list-inside space-y-2 text-[#A9B3C7]">
                  <li>Handling time is typically 1 business day after payment confirmation</li>
                  <li>Orders placed before 2:00 PM AEST on business days are typically dispatched the same day where stock and payment status allow</li>
                  <li>Orders placed after 2:00 PM AEST or on weekends/public holidays are dispatched the next business day</li>
                  <li>You will receive a shipping confirmation email with tracking information once your order is dispatched</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">6. Delivery Timeframes</h2>
                <p className="text-[#A9B3C7] leading-relaxed mb-4">
                  Estimated delivery times are as follows:
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[rgba(244,246,250,0.1)]">
                        <th className="text-left py-3 px-4 text-[#F4F6FA] font-semibold">Destination</th>
                        <th className="text-left py-3 px-4 text-[#F4F6FA] font-semibold">Express</th>
                        <th className="text-left py-3 px-4 text-[#F4F6FA] font-semibold">Standard</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#A9B3C7]">
                      <tr className="border-b border-[rgba(244,246,250,0.05)]">
                        <td className="py-3 px-4">Major Cities (Sydney, Melbourne, Brisbane)</td>
                        <td className="py-3 px-4">1-2 business days</td>
                        <td className="py-3 px-4">3-5 business days</td>
                      </tr>
                      <tr className="border-b border-[rgba(244,246,250,0.05)]">
                        <td className="py-3 px-4">Regional Australia</td>
                        <td className="py-3 px-4">2-4 business days</td>
                        <td className="py-3 px-4">5-8 business days</td>
                      </tr>
                      <tr className="border-b border-[rgba(244,246,250,0.05)]">
                        <td className="py-3 px-4">Remote Areas</td>
                        <td className="py-3 px-4">3-5 business days</td>
                        <td className="py-3 px-4">7-12 business days</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">International</td>
                        <td className="py-3 px-4">5-10 business days</td>
                        <td className="py-3 px-4">10-20 business days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[#A9B3C7] leading-relaxed mt-4 text-sm">
                  Please note that these are estimates only. Actual delivery times may vary due to circumstances 
                  beyond our control, including weather, customs delays, and carrier issues.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">7. Tracking Your Order</h2>
                <p className="text-[#A9B3C7] leading-relaxed">
                  All orders include tracking. Once your order is dispatched, you will receive an email 
                  with your tracking number and a link to track your package. You can also track your order 
                  by logging into your account on our website.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">8. Packaging</h2>
                <p className="text-[#A9B3C7] leading-relaxed">
                  All orders are shipped in discreet, unmarked packaging to protect your privacy. Products 
                  are carefully packed with appropriate insulation and cooling materials when necessary to 
                  maintain product integrity during transit.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">9. Shipping Restrictions</h2>
                <p className="text-[#A9B3C7] leading-relaxed mb-4">
                  We comply with all applicable laws and regulations regarding the shipment of research 
                  peptides. Some destinations may have restrictions on certain products. It is your 
                  responsibility to ensure that the products you order are legal in your jurisdiction. 
                  We reserve the right to cancel orders to destinations where shipment is prohibited.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">10. Lost or Damaged Packages</h2>
                <p className="text-[#A9B3C7] leading-relaxed">
                  If your package is lost in transit or arrives damaged, please contact us immediately. 
                  We will work with the shipping carrier to locate lost packages or file claims for damaged 
                  items. Please retain all packaging materials for damaged item claims.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">11. Address Changes</h2>
                <p className="text-[#A9B3C7] leading-relaxed">
                  If you need to change your shipping address after placing an order, please contact us 
                  as soon as possible. We can only change the address if the order has not yet been dispatched. 
                  Once an order is in transit, address changes may not be possible.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">12. Customs and Duties (International)</h2>
                <p className="text-[#A9B3C7] leading-relaxed">
                  International customers are responsible for any customs duties, taxes, or fees imposed 
                  by their country's customs authority. These charges are not included in our shipping fees 
                  and must be paid by the recipient. Please check with your local customs office for 
                  information about potential charges.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[#F4F6FA] mb-4">13. Contact Us</h2>
                <p className="text-[#A9B3C7] leading-relaxed mb-4">
                  If you have any questions about shipping or need assistance with your order, please contact us:
                </p>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.08)]">
                  <Mail className="w-5 h-5 text-[#2ED1B4]" />
                  <a 
                    href="mailto:contact@peplab.com.au" 
                    className="text-[#F4F6FA] hover:text-[#2ED1B4] transition-colors"
                  >
                    contact@peplab.com.au
                  </a>
                </div>
              </section>

            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
  );
}
