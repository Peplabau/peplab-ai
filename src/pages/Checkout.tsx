import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Truck, 
  MapPin,
  Check,
  ShoppingBag,
  Award,
  Building2,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Gift,
  X,
  Lock,
  Tag,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useRewards, REDEMPTION_TIERS } from '@/context/RewardsContext';
import { useAffiliate } from '@/context/AffiliateContext';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { CONFIG } from '@/lib/config';
import { getOptimizedProductImageUrl } from '@/lib/product-image';
import { HOME_PATH, SHOP_PATH } from '@/lib/routes';
import { getSiteSetting, DEFAULT_BANK_DETAILS, type BankDetails } from '@/lib/settings';
import {
  awardPromoterReferralPoints,
  recordAffiliateOrder,
  getPromoterById,
  REFERRAL_MIN_ORDER_SUBTOTAL_USD,
} from '@/lib/affiliates';
import { redeemPromoCode } from '@/lib/promo-codes';
import { sendOrderConfirmation } from '@/lib/email';
import { SEO } from '@/components/SEO';
import { generateOrderNumberForCheckout, generatePreorderOrderNumberForCheckout } from '@/lib/orderNumber';
import { copyTextToClipboard } from '@/lib/clipboard';
import { formatOrderNumberDisplay } from '@/utils/order-number';
import { getMarketingBundleOffLabel, productExcludesVolumeBundle } from '@/utils/pricing';
import {
  calculatePurchasePoints,
  DISCOUNT_PROMO_PURCHASE_POINTS_DEDUCTION,
} from '@/utils/points';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: string;
}

const shippingMethods: ShippingMethod[] = [
  { id: 'express', name: 'Express Shipping', description: 'Priority delivery with tracking', price: 15, estimatedDays: '2-4 business days' },
  { id: 'standard', name: 'Standard Shipping', description: 'Reliable tracked delivery', price: 10, estimatedDays: '5-8 business days' }
];

function formatShippingForEmail(
  a: { firstName: string; lastName: string; address: string; apartment: string; suburb: string; state: string; postcode: string; phone: string }
): string {
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
  const line3 = [a.suburb, a.state, a.postcode].filter(Boolean).join(' ').trim();
  return [name, a.address, a.apartment, line3, a.phone].filter(Boolean).join(', ');
}

export default function Checkout() {
  const { items, paidItemsTotal, clearCart } = useCart();
  const { balance, redeemPoints } = useRewards();
  const { appliedCode, appliedPromotion, applyCode, clearCode } = useAffiliate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Affiliate code input state
  const [affiliateInput, setAffiliateInput] = useState('');
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [affiliateError, setAffiliateError] = useState<string | null>(null);

  const [contactEmail, setContactEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    suburb: '',
    state: '',
    postcode: '',
    phone: ''
  });
  const [selectedShipping, setSelectedShipping] = useState<string>('express');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [ageVerified, setAgeVerified] = useState(false);

  // Redemption: selected tier held locally — points deducted ONLY on order submit.
  // The tier's full point cost is spent on submit; if the tier's $-value is
  // larger than the cart can absorb the unused portion is refunded as points
  // (see RewardsContext.redeemPoints).
  const [selectedTier, setSelectedTier] = useState<typeof REDEMPTION_TIERS[0] | null>(null);
  const redeemPointsAmount = selectedTier?.points ?? 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** Shown on success screen if Resend failed (order still saved). */
  const [orderEmailNotice, setOrderEmailNotice] = useState<string | null>(null);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);
  /** Success screen: cart included preorder line(s). */
  const [completedOrderWasPreorder, setCompletedOrderWasPreorder] = useState(false);

  const [bankDetails, setBankDetails] = useState<BankDetails>(DEFAULT_BANK_DETAILS);

  // Get current user on mount
  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        setIsLoggedIn(true);
        if (user.email) setContactEmail(user.email);
      }
    };
    getUser();
  }, []);

  // Load admin-editable bank details for the order confirmation page.
  useEffect(() => {
    let cancelled = false;
    const loadBankDetails = async () => {
      try {
        const data = await getSiteSetting<BankDetails>('bank_details', DEFAULT_BANK_DETAILS);
        if (!cancelled) setBankDetails(data);
      } catch (e) {
        // Keep fallback defaults if DB is unavailable.
        console.error('Failed to load bank_details:', e);
      }
    };
    loadBankDetails();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-apply affiliate code from URL/sessionStorage
  useEffect(() => {
    if (appliedCode) return;
    try {
      const saved = sessionStorage.getItem('peplab_affiliate_code');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.autoApply && parsed.code && !appliedCode) {
          applyCode(parsed.code);
        }
      }
    } catch (_) {}
  }, []);

  const affiliateDiscountPercent = appliedPromotion?.valid ? (appliedPromotion.discount_percent ?? 10) : 0;
  const referralBenefitsActive =
    !!appliedPromotion?.valid && paidItemsTotal >= REFERRAL_MIN_ORDER_SUBTOTAL_USD;
  const affiliateDiscountAmount = referralBenefitsActive
    ? Math.round(paidItemsTotal * affiliateDiscountPercent) / 100
    : 0;
  const referralSubtotalShortfall = Math.max(0, REFERRAL_MIN_ORDER_SUBTOTAL_USD - paidItemsTotal);

  const handleApplyAffiliate = async () => {
    if (!affiliateInput.trim()) return;
    setAffiliateLoading(true);
    setAffiliateError(null);

    // Fraud check: self-referral
    if (contactEmail && appliedPromotion?.promoter_id) {
      // Already applied — skip
    }

    const result = await applyCode(affiliateInput.trim());
    if (!result.valid) {
      setAffiliateError(result.error || 'Invalid code');
    } else {
      setAffiliateInput('');
    }
    setAffiliateLoading(false);
  };

  const shippingCost = paidItemsTotal >= 250 ? 0 : shippingMethods.find(m => m.id === selectedShipping)?.price || 15;

  // Cap the tier's $-discount at the items total *after* the affiliate
  // discount so the order can never go negative on the items line. The
  // unused portion of the tier value is refunded back to the user's points
  // balance (see redeemPoints) — so customers never lose value just because
  // their cart was smaller than the tier they picked.
  const tierValue = selectedTier?.value ?? 0;
  const discountableItemsTotal = Math.max(0, paidItemsTotal - affiliateDiscountAmount);
  const pointsDiscount = Math.min(tierValue, discountableItemsTotal);
  const unusedTierValue = Math.max(0, tierValue - pointsDiscount);
  const pointsRefundEstimate = selectedTier && unusedTierValue > 0
    ? Math.round((unusedTierValue * selectedTier.points) / selectedTier.value)
    : 0;

  const finalTotal = paidItemsTotal + shippingCost - pointsDiscount - affiliateDiscountAmount;

  const referralPromoDiscountActive = referralBenefitsActive && affiliateDiscountAmount > 0;
  const estimatedPurchaseRewardPts = calculatePurchasePoints(paidItemsTotal, {
    promoDiscountApplied: referralPromoDiscountActive,
  });

  const handleSelectTier = (tier: typeof REDEMPTION_TIERS[0]) => {
    setSelectedTier(prev => prev?.points === tier.points ? null : tier);
  };

  // Auto-apply a points redemption selected from Dashboard.
  useEffect(() => {
    if (!isLoggedIn || selectedTier) return;
    try {
      const saved = sessionStorage.getItem('peplab_pending_redemption');
      if (!saved) return;
      const parsed = JSON.parse(saved) as { points?: number };
      const matchedTier = REDEMPTION_TIERS.find((tier) => tier.points === parsed?.points);
      if (!matchedTier) {
        sessionStorage.removeItem('peplab_pending_redemption');
        return;
      }
      if (balance >= matchedTier.points) {
        setSelectedTier(matchedTier);
      }
      sessionStorage.removeItem('peplab_pending_redemption');
    } catch (error) {
      console.error('Failed to load pending redemption:', error);
      sessionStorage.removeItem('peplab_pending_redemption');
    }
  }, [isLoggedIn, selectedTier, balance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setOrderEmailNotice(null);

    try {
      const wasPreorderCheckout = items.some((i) => !i.isFree && i.isPreorder);
      const newOrderNumber = wasPreorderCheckout
        ? await generatePreorderOrderNumberForCheckout()
        : await generateOrderNumberForCheckout();
      const finalOrderTotal = paidItemsTotal + shippingCost - pointsDiscount - affiliateDiscountAmount;
      setOrderNumber(newOrderNumber);
      setOrderTotal(finalOrderTotal);
      setCompletedOrderWasPreorder(wasPreorderCheckout);
      const shippingForEmail = formatShippingForEmail(shippingAddress);

      const orderPayload: Record<string, unknown> = {
        order_number: newOrderNumber,
        user_id: userId,
        customer_email: contactEmail,
        customer_first_name: shippingAddress.firstName,
        customer_last_name: shippingAddress.lastName,
        customer_phone: shippingAddress.phone,
        shipping_address: `${shippingAddress.address}${shippingAddress.apartment ? ', ' + shippingAddress.apartment : ''}`,
        shipping_suburb: shippingAddress.suburb,
        shipping_state: shippingAddress.state,
        shipping_postcode: shippingAddress.postcode,
        shipping_method: selectedShipping,
        subtotal: paidItemsTotal,
        shipping_cost: shippingCost,
        discount_amount: pointsDiscount + affiliateDiscountAmount,
        points_redeemed: redeemPointsAmount,
        total: finalOrderTotal,
        age_verified: ageVerified,
        status: 'pending_payment',
        payment_status: 'pending',
        order_source: 'direct',
        is_preorder: wasPreorderCheckout,
        items: items.map(item => ({
          product_id: item.productId,
          name: item.name,
          dosage: item.dosage,
          quantity: item.quantity,
          price: item.price,
          is_free: item.isFree,
          is_preorder: !item.isFree && !!item.isPreorder,
        })),
      };

      if (appliedCode && referralBenefitsActive) {
        orderPayload.affiliate_code = appliedCode.trim().toUpperCase();
        orderPayload.affiliate_discount = affiliateDiscountAmount;
        orderPayload.order_source = 'referral';
        orderPayload.referral_campaign_type =
          appliedPromotion?.code_type === 'admin' ? 'admin_promo' : 'promo_code';
        orderPayload.referral_recorded_at = new Date().toISOString();
      }

      if (appliedCode && referralBenefitsActive && appliedPromotion?.promoter_id) {
        orderPayload.referral_promoter_id = appliedPromotion.promoter_id;
        try {
          const promoter = await getPromoterById(appliedPromotion.promoter_id);
          if (promoter) {
            orderPayload.referral_promoter_name = promoter.name;
            orderPayload.referral_promoter_email = promoter.email;
          }
        } catch (promoterErr) {
          // Metadata enrichment is best-effort only and should never block checkout.
          console.warn('Failed to enrich referral promoter metadata:', promoterErr);
        }
      }

      // Save order to Supabase.
      // We intentionally do NOT chain `.select('id')` here — that turns the query into
      // `INSERT ... RETURNING id`, and the RETURNING step requires a SELECT RLS policy
      // to match. Guests (anon) have no SELECT policy on `orders` (correctly), so the
      // whole transaction would roll back with a 42501. The INSERT itself is authorised
      // by `orders_insert_guest_or_self` for both guests and logged-in users.
      const { error } = await supabase.from('orders').insert(orderPayload);

      if (error) {
        console.error('Order save error:', error);
        const fallbackOrder = { ...orderPayload, created_at: new Date().toISOString() };
        const orders = JSON.parse(localStorage.getItem('peplab_orders') || '[]');
        orders.push(fallbackOrder);
        localStorage.setItem('peplab_orders', JSON.stringify(orders));
      }

      if (!error && appliedCode && referralBenefitsActive && appliedPromotion?.code_type === 'admin') {
        try {
          const { data: orderId, error: idErr } = await supabase.rpc('get_order_id_by_number', {
            p_order_number: newOrderNumber,
            p_email: contactEmail,
          });
          if (!idErr && orderId) {
            const redeemResult = await redeemPromoCode(
              appliedCode.trim().toUpperCase(),
              orderId as string,
              contactEmail,
            );
            if (!redeemResult.ok) {
              console.error('Admin promo redemption error:', redeemResult.error);
            }
            clearCode();
          } else if (idErr) {
            console.error('Could not resolve order id for promo redemption:', idErr);
          }
        } catch (e) {
          console.error('Admin promo redemption error:', e);
        }
      }

      // Record affiliate order for tracking/commission.
      // We need the order's UUID for the affiliate RPC. Since we dropped `.select('id')`
      // above, fetch it through a SECURITY DEFINER RPC that only returns the UUID when
      // both `order_number` and `email` match — safe for anon callers.
      if (!error && appliedCode && referralBenefitsActive && appliedPromotion?.promoter_id) {
        try {
          const { data: orderId, error: idErr } = await supabase.rpc('get_order_id_by_number', {
            p_order_number: newOrderNumber,
            p_email: contactEmail,
          });
          if (!idErr && orderId) {
            const affiliateResult = await recordAffiliateOrder({
              promoter_id: appliedPromotion.promoter_id,
              order_id: orderId as string,
              order_number: newOrderNumber,
              customer_email: contactEmail,
              order_total: finalOrderTotal,
              customer_discount: affiliateDiscountAmount,
            });
            if (!affiliateResult.ok) {
              console.error('Affiliate tracking error:', affiliateResult.error);
            }

            const pointsResult = await awardPromoterReferralPoints(
              appliedPromotion.promoter_id,
              orderId as string,
              newOrderNumber,
            );
            if (!pointsResult.ok) {
              console.error('Promo points error:', pointsResult.error);
            }

            clearCode();
          } else if (idErr) {
            console.error('Could not resolve order id for affiliate tracking:', idErr);
          }
        } catch (e) {
          console.error('Affiliate id-resolution error:', e);
        }
      }

      if (contactEmail.trim()) {
        const itemsForEmail = items
          .filter((item) => !item.isFree)
          .map((item) => ({
            name: item.name,
            dosage: item.dosage,
            quantity: item.quantity,
            price: item.price,
          }));
        const emailResult = await sendOrderConfirmation(
          contactEmail.trim(),
          {
            order_number: newOrderNumber,
            total: finalOrderTotal,
            items: itemsForEmail,
            shipping_address: shippingForEmail,
          },
          bankDetails,
        );
        if (!emailResult.ok) {
          setOrderEmailNotice(
            emailResult.error
              ? `We could not send the confirmation email: ${emailResult.error}. Your order is still valid — save your order number and payment details below.`
              : 'We could not send the confirmation email. Check spam, or save your order number below.'
          );
        }
      }

      // Deduct redeemed points NOW that the order is successfully saved.
      // Pass the capped applied discount so any unused $-value (when the cart
      // was smaller than the tier value) is automatically refunded as points.
      if (selectedTier && userId) {
        await redeemPoints(
          selectedTier.points,
          `Checkout discount - ${selectedTier.label}`,
          pointsDiscount,
        );
      }

      clearCart();
      setOrderComplete(true);
    } catch (err) {
      console.error('Order submission error:', err);
      setSubmitError('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    setCopyNotice(null);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      setCopyNotice('Could not copy automatically. Select the text and copy it manually.');
      setTimeout(() => setCopyNotice(null), 5000);
    }
  };

  // ORDER CONFIRMATION PAGE
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-[#070A12]">
        <nav className="px-4 py-4 border-b border-white/10">
          <a href="/" className="text-2xl font-bold tracking-wider gradient-text">PEPLAB</a>
        </nav>

        <main className="px-4 py-6 max-w-md mx-auto">
          {/* Success */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Order Confirmed!</h1>
            <p className="text-sm text-gray-400">Thanks, {shippingAddress.firstName}</p>
          </div>

          {completedOrderWasPreorder && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-red-500/40 mb-4 text-left">
              <p className="text-xs text-rose-100 font-semibold mb-1">Preorder</p>
              <p className="text-[11px] text-rose-100/90 leading-relaxed">
                This order includes out-of-stock item(s) reserved at the prices shown. Use your <span className="font-mono font-bold">PRE-</span> reference when you pay. We ship when stock is back — you will receive email updates.
              </p>
            </div>
          )}

          {orderEmailNotice && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/35 mb-4 text-left">
              <p className="text-xs text-rose-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{orderEmailNotice}</span>
              </p>
            </div>
          )}

          {/* MAKE PAYMENT Reminder */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
            <h2 className="text-lg font-bold text-amber-500 text-center mb-1">MAKE PAYMENT</h2>
            <p className="text-xs text-amber-400 text-center">Complete your order by making a bank transfer</p>
          </div>

          {/* Order Details */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Order #</span>
              <span className="text-sm font-mono text-white">{formatOrderNumberDisplay(orderNumber)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Amount to Pay</span>
              <span className="text-lg font-bold text-[#2ED1B4]">${orderTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Bank Details */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#2ED1B4]/10 to-[#8B5CF6]/10 border border-[#2ED1B4]/20 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-[#2ED1B4]" />
              <span className="font-semibold text-white">Bank Transfer</span>
            </div>

            {copyNotice && (
              <p className="mb-2 text-xs text-amber-200/95 bg-amber-500/15 border border-amber-500/25 rounded-lg px-3 py-2">
                {copyNotice}
              </p>
            )}

            <div className="space-y-2">
              {/* PAYID */}
              <div className="p-3 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#8B5CF6] font-bold">PAYID (Easiest)</p>
                    <p className="text-sm font-mono text-white">{bankDetails.payid}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(bankDetails.payid, 'payid')}
                    className="p-2 rounded bg-[#8B5CF6]/20"
                    aria-label="Copy PAYID"
                  >
                    {copiedField === 'payid' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#8B5CF6]" />}
                  </button>
                </div>
              </div>

              {/* BSB & Account */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">BSB</p>
                      <p className="text-sm font-mono text-white break-all">{bankDetails.bsb}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(bankDetails.bsb, 'bsb')}
                      className="p-2 rounded bg-white/10 shrink-0"
                      aria-label="Copy BSB"
                    >
                      {copiedField === 'bsb' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">Account</p>
                      <p className="text-sm font-mono text-white break-all">{bankDetails.account_number}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void copyToClipboard(bankDetails.account_number, 'account')}
                      className="p-2 rounded bg-white/10 shrink-0"
                      aria-label="Copy account number"
                    >
                      {copiedField === 'account' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Account Name */}
              <div className="p-3 rounded-lg bg-black/30 border border-white/10">
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-400">Account Name</p>
                    <p className="text-sm text-white">{bankDetails.account_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(bankDetails.account_name, 'account_name')}
                    className="p-2 rounded bg-white/10 shrink-0"
                    aria-label="Copy account name"
                  >
                    {copiedField === 'account_name' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Reference */}
              <div className="p-3 rounded-lg bg-amber-500/15 border border-amber-500/30">
                <p className="text-xs text-amber-500 font-bold">Reference (REQUIRED)</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-mono text-white font-bold">{formatOrderNumberDisplay(orderNumber)}</p>
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(formatOrderNumberDisplay(orderNumber), 'ref')}
                    className="p-1"
                    aria-label="Copy payment reference"
                  >
                    {copiedField === 'ref' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-amber-500" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-4">
            <p className="text-xs text-gray-400 mb-2">How to pay:</p>
            <ol className="text-sm text-white space-y-1">
              <li>1. Transfer <span className="text-[#2ED1B4] font-bold">${orderTotal.toFixed(2)}</span></li>
              <li>2. Use <span className="text-amber-500 font-mono">{formatOrderNumberDisplay(orderNumber)}</span> as reference</li>
              <li>
                3.{' '}
                {completedOrderWasPreorder
                  ? 'We fulfil preorders when stock returns — watch your email for updates.'
                  : "We'll ship within 24 hours"}
              </li>
            </ol>
          </div>

          {/* Telegram Support */}
          <a 
            href={CONFIG.SOCIAL.TELEGRAM}
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-[#0088cc] text-white font-semibold text-center flex items-center justify-center gap-2 mb-3"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Support on Telegram
          </a>

          <a href={SHOP_PATH} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2ED1B4] to-[#8B5CF6] text-white font-semibold text-center block">
            Continue Shopping
          </a>

          {/* Research Disclaimer */}
          <p className="mt-4 text-[10px] text-gray-500 text-center">
            For research use only. Not for human consumption.
          </p>
        </main>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#070A12] flex items-center justify-center">
        <div className="text-center px-4">
          <ShoppingBag className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">Your cart is empty</h1>
          <a href={SHOP_PATH} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2ED1B4] to-[#8B5CF6] text-white font-semibold">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  // CHECKOUT FORM
  return (
    <>
      <SEO title="Checkout | PEPLAB" noIndex />
    <div className="min-h-screen bg-[#070A12]">
      {/* Header */}
      <nav className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
        <a href="/" className="text-xl font-bold tracking-wider gradient-text">PEPLAB</a>
        <a href="/" className="text-sm text-gray-400 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back
        </a>
      </nav>

      <main className="px-4 py-3 max-w-lg mx-auto">
        {/* Title */}
        <h1 className="text-lg font-bold text-white mb-3">Complete Your Order</h1>

        {submitError && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-400">{submitError}</p>
          </div>
        )}

        {items.some((i) => !i.isFree && i.isPreorder) && (
          <div className="mb-3 p-3 rounded-xl bg-rose-950/40 border border-red-500/35">
            <p className="text-[11px] text-rose-100/95 leading-relaxed">
              <span className="font-semibold text-rose-200">Preorder checkout:</span> your payment reference will be a <span className="font-mono font-bold">PRE-</span> number. Pricing matches the storefront — no preorder markup.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Order Summary */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5 text-[#2ED1B4]" />
              Order ({items.length} items)
            </h2>
            <div className="space-y-1.5 mb-2">
              {items.map((item) => (
                <div key={`${item.productId}-${item.dosage}-${item.isPreorder ? 'p' : ''}`} className="flex items-center gap-2">
                  <img
                    src={getOptimizedProductImageUrl(item.image, { width: 96 })}
                    alt={item.name}
                    className="w-10 h-10 object-contain rounded bg-black/30"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs text-white truncate">{item.name}</p>
                      {!item.isFree && item.isPreorder && (
                        <span className="shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[#FECACA] border border-red-500/40">
                          Preorder
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1.5 flex-wrap">
                      <span>
                        {item.dosage} x{item.quantity}
                      </span>
                      {!item.isFree && !productExcludesVolumeBundle(item.productId, item.name) && (
                        <span className="text-[9px] font-bold text-[#22C55E] px-1 py-0.5 rounded bg-[#22C55E]/15">
                          {getMarketingBundleOffLabel(item.quantity)}
                        </span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs text-[#2ED1B4]">{item.isFree ? 'FREE' : `$${(item.price * item.quantity).toFixed(2)}`}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-2 space-y-0.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">${paidItemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Shipping</span>
                <span className={paidItemsTotal >= 250 ? 'text-green-400' : 'text-white'}>
                  {paidItemsTotal >= 250 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              {appliedPromotion?.valid && !referralBenefitsActive && (
                <div className="flex justify-between text-[10px] text-amber-200/90 gap-2">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3 h-3 shrink-0 text-amber-400" />
                    Referral code — ${REFERRAL_MIN_ORDER_SUBTOTAL_USD}+ subtotal for discount and referrer points
                  </span>
                  <span className="shrink-0 text-amber-300/90">Need ${referralSubtotalShortfall.toFixed(2)}</span>
                </div>
              )}
              {affiliateDiscountAmount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-[#22C55E]">
                    <Tag className="w-3 h-3" />
                    Code {appliedCode} ({affiliateDiscountPercent}%)
                  </span>
                  <span className="text-[#22C55E] font-medium">−${affiliateDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1 text-[#8B5CF6]">
                    <Gift className="w-3 h-3" />
                    Points ({redeemPointsAmount} pts)
                  </span>
                  <span className="text-[#8B5CF6] font-medium">−${pointsDiscount.toFixed(2)}</span>
                </div>
              )}
              {pointsRefundEstimate > 0 && (
                <div className="flex justify-between text-[10px] text-emerald-300/90 -mt-1">
                  <span className="flex items-center gap-1">
                    <Gift className="w-3 h-3 shrink-0 text-emerald-400" />
                    Unused ${unusedTierValue.toFixed(2)} refunded as points
                  </span>
                  <span className="shrink-0 font-medium">+{pointsRefundEstimate} pts</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-[#2ED1B4]">${finalTotal.toFixed(2)}</span>
              </div>
              {isLoggedIn && estimatedPurchaseRewardPts > 0 && (
                <p className="text-[10px] text-gray-400 mt-2 leading-snug">
                  Purchase rewards after payment:{' '}
                  <span className="text-[#22C55E] font-medium">{estimatedPurchaseRewardPts} pts</span>
                  {referralPromoDiscountActive && (
                    <>
                      {' '}
                      (includes −{DISCOUNT_PROMO_PURCHASE_POINTS_DEDUCTION} pts for referral code discount)
                    </>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xs font-semibold text-white mb-2">Contact</h2>
            <input 
              type="email" 
              value={contactEmail} 
              onChange={(e) => setContactEmail(e.target.value)} 
              required
              className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
              placeholder="Email"
            />
          </div>

          {/* Delivery */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
              Delivery
            </h2>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={shippingAddress.firstName} 
                  onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
                  placeholder="First name"
                />
                <input 
                  type="text" 
                  value={shippingAddress.lastName} 
                  onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
                  placeholder="Last name"
                />
              </div>
              <input 
                type="text" 
                value={shippingAddress.address} 
                onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})} 
                required
                className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
                placeholder="Street address"
              />
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="text" 
                  value={shippingAddress.suburb} 
                  onChange={(e) => setShippingAddress({...shippingAddress, suburb: e.target.value})} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
                  placeholder="Suburb"
                />
                <input 
                  type="text" 
                  value={shippingAddress.postcode} 
                  onChange={(e) => setShippingAddress({...shippingAddress, postcode: e.target.value})} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
                  placeholder="Postcode"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select 
                  value={shippingAddress.state} 
                  onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
                >
                  <option value="">State</option>
                  <option value="NSW">NSW</option>
                  <option value="VIC">VIC</option>
                  <option value="QLD">QLD</option>
                  <option value="WA">WA</option>
                  <option value="SA">SA</option>
                  <option value="TAS">TAS</option>
                  <option value="ACT">ACT</option>
                  <option value="NT">NT</option>
                </select>
                <input 
                  type="tel" 
                  value={shippingAddress.phone} 
                  onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})} 
                  required
                  className="w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none"
                  placeholder="Phone"
                />
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5 text-blue-400" />
              Shipping
            </h2>
            <div className="space-y-1.5">
              {shippingMethods.map((method) => (
                <label 
                  key={method.id} 
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                    selectedShipping === method.id ? 'border-[#2ED1B4] bg-[#2ED1B4]/5' : 'border-white/10'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="shipping" 
                    value={method.id} 
                    checked={selectedShipping === method.id} 
                    onChange={() => setSelectedShipping(method.id)} 
                    className="w-3.5 h-3.5 accent-[#2ED1B4]"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-white">{method.name}</span>
                      <span className="text-xs text-[#2ED1B4]">
                        {paidItemsTotal >= 250 ? 'FREE' : `$${method.price}`}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">{method.estimatedDays}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* ── AFFILIATE / REFERRAL CODE ── */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <h2 className="text-xs font-semibold text-white mb-2 flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#22C55E]" />
              Referral Code
            </h2>
            {appliedCode && appliedPromotion?.valid ? (
              referralBenefitsActive ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-green-500/10 border border-green-500/25">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green-400">
                        {appliedCode} — {affiliateDiscountPercent}% off
                      </p>
                      <p className="text-[10px] text-green-500/70">
                        Saving ${affiliateDiscountAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearCode}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Tag className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-200">
                        {appliedCode} applied
                      </p>
                      <p className="text-[10px] text-amber-200/80 leading-snug">
                        Add <span className="font-semibold text-amber-300">${referralSubtotalShortfall.toFixed(2)}</span> to
                        subtotal for {affiliateDiscountPercent}% off; referrer earns points at ${REFERRAL_MIN_ORDER_SUBTOTAL_USD}+ orders.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearCode}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors shrink-0"
                  >
                    <X className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              )
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={affiliateInput}
                    onChange={(e) => { setAffiliateInput(e.target.value.toUpperCase()); setAffiliateError(null); }}
                    placeholder="Enter code (e.g. MIKE10)"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#22C55E] outline-none uppercase"
                  />
                  <button
                    type="button"
                    onClick={handleApplyAffiliate}
                    disabled={affiliateLoading || !affiliateInput.trim()}
                    className="px-4 py-2 rounded-lg bg-[#22C55E] text-[#070A12] text-xs font-semibold hover:bg-[#16A34A] disabled:opacity-50 transition-colors"
                  >
                    {affiliateLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {affiliateError && (
                  <p className="mt-1.5 text-[10px] text-red-400">{affiliateError}</p>
                )}
              </>
            )}
          </div>

          {/* ── REWARDS REDEMPTION ── */}
          <div className="rounded-xl border overflow-hidden"
            style={{ borderColor: selectedTier ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.2)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(46,209,180,0.06) 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                  <Gift className="w-3.5 h-3.5 text-[#8B5CF6]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">Redeem Points</p>
                  <p className="text-[10px] text-gray-400">Use your rewards for a discount</p>
                </div>
              </div>
              {/* Balance badge */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/25">
                <Award className="w-3 h-3 text-[#8B5CF6]" />
                <span className="text-xs font-bold text-[#8B5CF6]">
                  {isLoggedIn ? `${balance} pts` : 'Login to use'}
                </span>
              </div>
            </div>

            <div className="p-3">
              {/* Not logged in */}
              {!isLoggedIn ? (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5">
                  <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-[11px] text-gray-400">
                    <a href="/login" className="text-[#8B5CF6] underline font-medium">Sign in</a> to use your reward points
                  </p>
                </div>
              ) : balance === 0 ? (
                /* No points */
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5">
                  <Award className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                  <p className="text-[11px] text-gray-400">You don't have any points yet. Earn points by placing orders!</p>
                </div>
              ) : (
                /* Can redeem — show tier cards */
                <>
                  {selectedTier ? (
                    /* Applied state */
                    <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/25 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-green-400">{selectedTier.label} Applied!</p>
                          <p className="text-[10px] text-green-500/70">
                            −{selectedTier.points} pts → −${pointsDiscount.toFixed(2)} off your order
                            {pointsRefundEstimate > 0 && (
                              <> · <span className="text-emerald-300">+{pointsRefundEstimate} pts refunded</span></>
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedTier(null)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/20 text-[10px] text-red-400 hover:bg-red-500/25 transition-colors"
                      >
                        <X className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-2 gap-2">
                    {REDEMPTION_TIERS.map((tier) => {
                      const canAfford = balance >= tier.points;
                      const isSelected = selectedTier?.points === tier.points;
                      // Preview the cap + refund directly on each tier card so
                      // the customer can see at a glance what they'd actually
                      // get if they picked a tier bigger than their cart.
                      const previewDiscount = Math.min(tier.value, discountableItemsTotal);
                      const previewRefundValue = Math.max(0, tier.value - previewDiscount);
                      const previewRefundPoints =
                        previewRefundValue > 0
                          ? Math.round((previewRefundValue * tier.points) / tier.value)
                          : 0;
                      return (
                        <button
                          key={tier.points}
                          type="button"
                          disabled={!canAfford}
                          onClick={() => handleSelectTier(tier)}
                          className={`relative p-3 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-[#8B5CF6] bg-[#8B5CF6]/20 shadow-lg shadow-[#8B5CF6]/10'
                              : canAfford
                              ? 'border-white/10 bg-white/5 hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10'
                              : 'border-white/5 bg-white/[0.02] opacity-40 cursor-not-allowed'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <p className="text-base font-bold text-white leading-none mb-0.5">{tier.points}</p>
                          <p className="text-[10px] text-gray-400 mb-1.5">points</p>
                          <p className="text-sm font-bold text-[#2ED1B4]">{tier.label}</p>
                          {!canAfford ? (
                            <p className="text-[9px] text-gray-500 mt-1">Need {tier.points - balance} more pts</p>
                          ) : previewRefundPoints > 0 ? (
                            <p className="text-[9px] text-emerald-300/90 mt-1">
                              Applies ${previewDiscount.toFixed(2)} · +{previewRefundPoints} pts back
                            </p>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  {!selectedTier && (
                    <p className="text-[10px] text-gray-500 text-center mt-2">
                      Select a tier above to apply a discount
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2ED1B4]/10 to-[#8B5CF6]/10 border border-[#2ED1B4]/20">
            <div className="flex items-center gap-2 mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#2ED1B4]" />
              <span className="text-xs font-medium text-white">Payment Methods</span>
            </div>
            <ul className="text-[10px] text-gray-400 space-y-0.5">
              <li>• Bank Transfer (details after order)</li>
              <li>• Cash on pickup</li>
              <li>• <a href={CONFIG.SOCIAL.TELEGRAM} target="_blank" rel="noopener noreferrer" className="text-[#2ED1B4] underline">Message us on Telegram</a> for more info</li>
            </ul>
          </div>

          {/* Age Verification */}
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" 
                id="age" 
                checked={ageVerified} 
                onChange={(e) => setAgeVerified(e.target.checked)} 
                required
                className="w-3.5 h-3.5 mt-0.5 accent-amber-500"
              />
              <label htmlFor="age" className="text-[10px] text-gray-400">
                <span className="text-amber-500 font-medium">I confirm I am 18 years or older</span> and purchasing these products for lawful research purposes only.
              </label>
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreedToTerms} 
              onChange={(e) => setAgreedToTerms(e.target.checked)} 
              required
              className="w-3.5 h-3.5 mt-0.5 accent-[#2ED1B4]"
            />
            <label htmlFor="terms" className="text-[10px] text-gray-400">
              I agree to the <a href="/terms" className="text-[#2ED1B4]">Terms</a> & <a href="/privacy" className="text-[#2ED1B4]">Privacy</a>
            </label>
          </div>

          {/* Submit */}
          <button 
            type="submit" 
            disabled={!agreedToTerms || !ageVerified || isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2ED1B4] to-[#8B5CF6] text-white font-semibold text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </span>
            ) : (
              `Complete Order — $${finalTotal.toFixed(2)}`
            )}
          </button>

          {/* Research Disclaimer */}
          <p className="text-[9px] text-gray-500 text-center">
            For research use only. Not for human consumption.
          </p>
        </form>
      </main>
    </div>
    </>
  );
}