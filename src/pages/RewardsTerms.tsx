import { ArrowLeft, Award, Gift, TrendingUp, Users, Clock, AlertTriangle } from 'lucide-react';

export default function RewardsTerms() {
  return (
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] mb-6">
              <Award className="w-4 h-4 text-[#8B5CF6]" />
              <span className="text-sm text-[#8B5CF6] font-medium">PEPLAB Rewards Program</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F6FA] mb-4">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-[#A9B3C7] max-w-2xl mx-auto">
              Please read these terms carefully before participating in the PEPLAB Rewards Program.
              By enrolling, you agree to be bound by these terms.
            </p>
            <p className="text-sm text-[rgba(169,179,199,0.6)] mt-4">
              Last Updated: February 2026
            </p>
          </div>

          {/* Quick Summary */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(46,209,180,0.1)] border border-[rgba(139,92,246,0.2)] mb-12">
            <h2 className="text-lg font-semibold text-[#F4F6FA] mb-4">Program Overview</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(34,197,94,0.1)] flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F4F6FA]">Earn Points</p>
                  <p className="text-xs text-[#A9B3C7]">1 point per $1 spent</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
                  <Gift className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F4F6FA]">Redeem</p>
                  <p className="text-xs text-[#A9B3C7]">For discounts</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(46,209,180,0.1)] flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#2ED1B4]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F4F6FA]">Refer Friends</p>
                  <p className="text-xs text-[#A9B3C7]">Earn 100 pts each</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#F4F6FA]">Expires</p>
                  <p className="text-xs text-[#A9B3C7]">After 12 months</p>
                </div>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <div className="space-y-8">
            {/* Section 1 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">1. Program Eligibility</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>1.1. The PEPLAB Rewards Program is open to individuals aged 18 years or older.</p>
                <p>1.2. Each customer may maintain only one Rewards account. Multiple accounts per person are prohibited.</p>
                <p>1.3. PEPLAB reserves the right to refuse membership or terminate accounts at its sole discretion.</p>
                <p>1.4. Business entities and resellers are not eligible for the Rewards Program.</p>
              </div>
            </section>

            {/* Section 2 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">2. Earning Points</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>2.1. Members earn 1 PEPLAB Point for every $1.00 AUD spent on order subtotal.</p>
                <p>2.2. Points are calculated on the order subtotal only, excluding shipping costs, taxes, and fees.</p>
                <p>2.3. Points are awarded only after an order is completed and payment is successfully processed.</p>
                <p>2.4. Points are not awarded for refunded, cancelled, or disputed orders.</p>
                <p>2.5. Points may be revoked if an order is returned or if fraudulent activity is detected.</p>
                <p>2.6. Bonus points may be awarded for specific promotions, account creation, first purchases, and successful referrals as specified by PEPLAB.</p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">3. Redeeming Points</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>3.1. Any redemption tier may be applied as soon as your points balance meets or exceeds the tier's cost — no level, no manual unlock, no minimum order, and no lifetime-spend requirement. Only the tier's listed points are spent when you redeem at checkout.</p>
                <p>3.2. If a redemption tier's dollar value is greater than your order can absorb (for example, you select a $50 discount on a $30 order), only the amount needed to bring the order line to zero is applied and the unused portion is automatically converted back to points at the tier's native rate — you never lose value just because the cart was smaller than the tier you chose.</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li className="font-medium text-[#F4F6FA]/90">Redemption tiers</li>
                  <li className="ml-4">100 points = $5.00 AUD discount</li>
                  <li className="ml-4">500 points = $25.00 AUD discount</li>
                  <li className="ml-4">1,000 points = $50.00 AUD discount</li>
                  <li className="ml-4">2,500 points = $125.00 AUD discount</li>
                  <li className="ml-4">5,000 points = $250.00 AUD discount</li>
                  <li className="ml-4">10,000 points = $500.00 AUD discount</li>
                </ul>
                <p>3.3. Points cannot be combined with other discount codes or promotional offers.</p>
                <p>3.4. Points have no cash value and cannot be redeemed for cash or credit.</p>
                <p>3.5. Points are non-transferable and may only be used by the account holder.</p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">4. Points Expiration</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>4.1. All points expire 12 months from the date they were earned.</p>
                <p>4.2. Expired points cannot be reinstated or transferred.</p>
                <p>4.3. Members will not receive notification prior to points expiration.</p>
                <p>4.4. It is the member's responsibility to track their points balance and expiration dates.</p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">5. Referral Program</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>5.1. Members may refer friends and family to PEPLAB.</p>
                <p>5.2. The referrer will receive 100 bonus points only after the referred customer completes their first purchase.</p>
                <p>5.3. Self-referrals are strictly prohibited and will result in account termination.</p>
                <p>5.4. Each referred customer may only generate one referral reward.</p>
                <p>5.5. PEPLAB reserves the right to void referral rewards if fraudulent activity is suspected.</p>
                <p>5.6. The referred customer must be a new PEPLAB customer with no previous purchase history.</p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">6. Abuse Prevention</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>6.1. PEPLAB reserves the right to adjust product pricing to prevent points farming.</p>
                <p>6.2. Low-cost products may be excluded from points earning at PEPLAB's discretion.</p>
                <p>6.3. Any attempt to manipulate the Rewards Program will result in immediate account termination and forfeiture of all points.</p>
                <p>6.4. Bulk purchases made for the purpose of earning points may be cancelled at PEPLAB's discretion.</p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">7. Account Termination & Forfeiture</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>7.1. PEPLAB reserves the right to terminate any Rewards account for:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Fraudulent activity or abuse of the program</li>
                  <li>Chargebacks or payment disputes</li>
                  <li>Violation of these Terms & Conditions</li>
                  <li>Violation of PEPLAB's general Terms & Conditions</li>
                </ul>
                <p>7.2. Upon termination, all accumulated points will be forfeited immediately.</p>
                <p>7.3. Terminated members may be prohibited from re-enrolling in the program.</p>
              </div>
            </section>

            {/* Section 8 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">8. Program Modifications</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>8.1. PEPLAB reserves the right to modify, suspend, or terminate the Rewards Program at any time without prior notice.</p>
                <p>8.2. Changes to the program may include adjustments to point earning rates, redemption values, and eligibility criteria.</p>
                <p>8.3. Continued participation in the program after changes constitutes acceptance of the modified terms.</p>
                <p>8.4. PEPLAB will make reasonable efforts to communicate significant changes to active members.</p>
              </div>
            </section>

            {/* Section 9 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">9. No Cash Value</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>9.1. PEPLAB Points have no monetary or cash value.</p>
                <p>9.2. Points cannot be sold, transferred, or exchanged for cash.</p>
                <p>9.3. Points are not the property of the member and may be revoked by PEPLAB at any time.</p>
                <p>9.4. In the event of program termination, points will not be converted to cash or credit.</p>
              </div>
            </section>

            {/* Section 10 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">10. Research-Use Compliance</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>10.1. Participation in the Rewards Program does not alter the classification of PEPLAB products.</p>
                <p>10.2. All products remain strictly for research use only.</p>
                <p>10.3. Discounts and rewards do not imply medical, therapeutic, or diagnostic approval of any product.</p>
                <p>10.4. Members must continue to comply with all applicable laws and regulations regarding research compounds.</p>
              </div>
            </section>

            {/* Section 11 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">11. Privacy & Data</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>11.1. Personal information collected for the Rewards Program is handled in accordance with PEPLAB's Privacy Policy.</p>
                <p>11.2. PEPLAB will not sell or share member data with third parties for marketing purposes.</p>
                <p>11.3. Member data may be used to communicate program updates, rewards, and promotional offers.</p>
              </div>
            </section>

            {/* Section 12 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">12. Limitation of Liability</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>12.1. PEPLAB is not liable for any system errors, technical failures, or incorrect points balances.</p>
                <p>12.2. PEPLAB's decision on all matters relating to the Rewards Program is final.</p>
                <p>12.3. PEPLAB is not responsible for lost or stolen points.</p>
                <p>12.4. Members participate in the program at their own risk.</p>
              </div>
            </section>

            {/* Section 13 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">13. Governing Law</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>13.1. These Terms & Conditions are governed by the laws of New South Wales, Australia.</p>
                <p>13.2. Any disputes arising from the Rewards Program will be resolved in accordance with Australian law.</p>
              </div>
            </section>

            {/* Section 14 */}
            <section className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <h2 className="text-xl font-semibold text-[#F4F6FA] mb-4">14. Contact Information</h2>
              <div className="space-y-3 text-[#A9B3C7]">
                <p>For questions or concerns regarding the PEPLAB Rewards Program, please contact us:</p>
                <div className="mt-4 p-4 rounded-xl bg-[rgba(7,10,18,0.5)]">
                  <p className="text-[#F4F6FA]">Email: contact@peplab.com.au</p>
                  <p className="text-[#A9B3C7] mt-1">Response time: 24-48 hours</p>
                </div>
              </div>
            </section>

            {/* Cross-Reference */}
            <section className="p-6 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-lg font-semibold text-[#F4F6FA] mb-2">Related Documents</h2>
                  <p className="text-sm text-[#A9B3C7] mb-3">
                    These Rewards Terms & Conditions should be read in conjunction with:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a href="/terms" className="px-3 py-1.5 rounded-lg bg-[rgba(7,10,18,0.5)] text-sm text-[#F59E0B] hover:bg-[rgba(7,10,18,0.7)] transition-colors">
                      Terms & Conditions
                    </a>
                    <a href="/privacy" className="px-3 py-1.5 rounded-lg bg-[rgba(7,10,18,0.5)] text-sm text-[#F59E0B] hover:bg-[rgba(7,10,18,0.7)] transition-colors">
                      Privacy Policy
                    </a>
                    <a href="/refund" className="px-3 py-1.5 rounded-lg bg-[rgba(7,10,18,0.5)] text-sm text-[#F59E0B] hover:bg-[rgba(7,10,18,0.7)] transition-colors">
                      Refund & Return Policy
                    </a>
                    <a href="/shipping" className="px-3 py-1.5 rounded-lg bg-[rgba(7,10,18,0.5)] text-sm text-[#F59E0B] hover:bg-[rgba(7,10,18,0.7)] transition-colors">
                      Shipping Policy
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <a href="/login" className="btn-primary inline-flex items-center gap-2">
              <Award className="w-5 h-5" />
              Join PEPLAB Rewards
            </a>
            <p className="text-sm text-[#A9B3C7] mt-4">
              Already a member? <a href="/login" className="text-[#2ED1B4] hover:underline">Sign in to view your points</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-[rgba(244,246,250,0.08)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-[#A9B3C7]">
            © 2026 PEPLAB. All rights reserved. For research use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
