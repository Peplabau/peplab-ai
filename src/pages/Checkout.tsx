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
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Zap,
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
import {
  EMPTY_CHECKOUT_SHIPPING,
  loadCheckoutDefaults,
  mergeShippingDefaults,
  saveCheckoutProfile,
  type CheckoutShippingDetails,
} from '@/lib/checkout-profile';
import {
  inferCheckoutAddressType,
  validateAusPostAddress,
  validateAusPostLocality,
  validateCheckoutAddressFormat,
} from '@/lib/auspost-address';
import { Skeleton } from '@/components/ui/skeleton';

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

type DeliveryMode = 'simple' | 'manual' | 'collection';
type CollectionType = 'parcel_locker' | 'parcel_collect';

/** Address lines for order-confirmation email — phone is passed separately. */
function formatShippingForEmail(
  a: { firstName: string; lastName: string; address: string; apartment: string; suburb: string; state: string; postcode: string }
): string {
  const name = [a.firstName, a.lastName].filter(Boolean).join(' ').trim();
  const street = [a.address, a.apartment].filter(Boolean).join(', ').trim();
  const locality = [a.suburb, a.state, a.postcode].filter(Boolean).join(' ').trim();
  return [name, street, locality].filter(Boolean).join('\n');
}

function composeCollectionAddress(type: CollectionType, number: string): string {
  const n = number.trim();
  const label = type === 'parcel_collect' ? 'Parcel Collect' : 'Parcel Locker';
  return n ? `${label} ${n}` : label;
}

/** Detect AusPost collection-point addresses from saved profile / last order. */
function parseCollectionFromAddress(address: string): {
  mode: DeliveryMode;
  type: CollectionType;
  number: string;
} | null {
  const t = (address || '').trim();
  if (!t) return null;
  const collectMatch = t.match(/^parcel\s*collect\s*(.*)$/i);
  if (collectMatch) {
    return { mode: 'collection', type: 'parcel_collect', number: (collectMatch[1] || '').trim() };
  }
  const lockerMatch = t.match(/^(?:parcel\s*locker|mypost\s*locker|australia\s*post\s*locker)\s*(.*)$/i);
  if (lockerMatch) {
    return { mode: 'collection', type: 'parcel_locker', number: (lockerMatch[1] || '').trim() };
  }
  if (/parcel\s*collect/i.test(t)) {
    return {
      mode: 'collection',
      type: 'parcel_collect',
      number: t.replace(/parcel\s*collect/gi, '').replace(/^[\s,:-]+/, '').trim(),
    };
  }
  if (/parcel\s*locker|mypost\s*locker|australia\s*post\s*locker/i.test(t)) {
    return {
      mode: 'collection',
      type: 'parcel_locker',
      number: t
        .replace(/parcel\s*locker|mypost\s*locker|australia\s*post\s*locker/gi, '')
        .replace(/^[\s,:-]+/, '')
        .trim(),
    };
  }
  return null;
}

export default function Checkout() {
  const { items, paidItemsTotal, clearCart, isLoading: isCartLoading, updateQuantity } = useCart();
  const { balance, redeemPoints } = useRewards();
  const { appliedCode, appliedPromotion, applyCode, clearCode } = useAffiliate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  /** False until auth + saved shipping are resolved — prevents empty→filled flash. */
  const [isCheckoutReady, setIsCheckoutReady] = useState(false);
  /** Mobile order-summary accordion (desktop always shows full left panel). */
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Affiliate code input state
  const [affiliateInput, setAffiliateInput] = useState('');
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [affiliateError, setAffiliateError] = useState<string | null>(null);

  const [contactEmail, setContactEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState<CheckoutShippingDetails>({
    ...EMPTY_CHECKOUT_SHIPPING,
  });
  /** Default: compact address. Manual expands suburb/state; collection = locker/collect. */
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>('simple');
  const [collectionType, setCollectionType] = useState<CollectionType>('parcel_locker');
  const [collectionNumber, setCollectionNumber] = useState('');
  /** Shown when we autofilled from saved profile / last order. */
  const [autofillNotice, setAutofillNotice] = useState<string | null>(null);
  const [localityError, setLocalityError] = useState<string | null>(null);
  const [localitySuggestions, setLocalitySuggestions] = useState<string[]>([]);
  const [localityOk, setLocalityOk] = useState(false);
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
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

  // Resolve auth + saved shipping BEFORE painting the form (avoids empty→filled glitch).
  useEffect(() => {
    let cancelled = false;
    const prepareCheckout = async () => {
      try {
        const user = await getCurrentUser();
        if (cancelled) return;

        if (!user) {
          setUserId(null);
          setIsLoggedIn(false);
          return;
        }

        setUserId(user.id);
        setIsLoggedIn(true);

        let nextEmail = user.email || '';
        let nextShipping: CheckoutShippingDetails = { ...EMPTY_CHECKOUT_SHIPPING };
        let nextNotice: string | null = null;

        try {
          const defaults = await loadCheckoutDefaults(user.id);
          if (cancelled) return;
          if (defaults.email) nextEmail = nextEmail || defaults.email;
          if (defaults.shipping) {
            nextShipping = mergeShippingDefaults(nextShipping, defaults.shipping);
            if (defaults.source === 'profile') {
              nextNotice = 'Details filled from your saved profile.';
            } else if (defaults.source === 'order' || defaults.source === 'mixed') {
              nextNotice =
                'Details filled from your last order. You can edit anything before placing.';
            }
          }
        } catch (err) {
          // Autofill must never block checkout.
          console.warn('Checkout autofill skipped:', err);
        }

        if (cancelled) return;
        setContactEmail(nextEmail);
        setShippingAddress(nextShipping);
        setAutofillNotice(nextNotice);
        const parsedCollection = parseCollectionFromAddress(nextShipping.address);
        if (parsedCollection) {
          setDeliveryMode('collection');
          setCollectionType(parsedCollection.type);
          setCollectionNumber(parsedCollection.number);
          setShippingAddress({
            ...nextShipping,
            address: composeCollectionAddress(parsedCollection.type, parsedCollection.number).slice(0, 40),
          });
        } else if (
          nextShipping.address.trim() &&
          nextShipping.suburb.trim() &&
          nextShipping.state.trim() &&
          nextShipping.postcode.trim()
        ) {
          // Saved full street address — open manual so suburb/state stay visible/editable.
          setDeliveryMode('manual');
          setCollectionType('parcel_locker');
          setCollectionNumber('');
        } else {
          setDeliveryMode('simple');
          setCollectionType('parcel_locker');
          setCollectionNumber('');
        }
      } catch (err) {
        console.warn('Checkout prepare failed:', err);
      } finally {
        if (!cancelled) setIsCheckoutReady(true);
      }
    };
    void prepareCheckout();
    return () => {
      cancelled = true;
    };
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

  const FREE_SHIPPING_THRESHOLD = 250;
  const shippingCost = paidItemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingMethods.find(m => m.id === selectedShipping)?.price || 15;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - paidItemsTotal);

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

  const updateShipping = (patch: Partial<CheckoutShippingDetails>) => {
    if (patch.suburb !== undefined || patch.state !== undefined || patch.postcode !== undefined) {
      setLocalityOk(false);
      setLocalityError(null);
    }
    setShippingAddress((prev) => ({ ...prev, ...patch }));
  };

  const applyCollectionLine = (type: CollectionType, number: string) => {
    const composed = composeCollectionAddress(type, number).slice(0, 40);
    updateShipping({ address: composed });
  };

  const switchToCollectionMode = () => {
    setDeliveryMode('collection');
    const nextNumber = collectionNumber.trim()
      ? collectionNumber
      : (parseCollectionFromAddress(shippingAddress.address)?.number || '');
    setCollectionNumber(nextNumber);
    applyCollectionLine(collectionType, nextNumber);
  };

  const switchToManualMode = () => {
    setDeliveryMode('manual');
    if (parseCollectionFromAddress(shippingAddress.address)) {
      updateShipping({ address: '' });
    }
  };

  const switchToSimpleMode = () => {
    setDeliveryMode('simple');
    if (parseCollectionFromAddress(shippingAddress.address)) {
      updateShipping({ address: '' });
    }
  };

  const updateCollectionType = (type: CollectionType) => {
    setCollectionType(type);
    applyCollectionLine(type, collectionNumber);
  };

  const updateCollectionNumber = (value: string) => {
    setCollectionNumber(value);
    applyCollectionLine(collectionType, value);
  };

  const verifyLocality = async (
    details = shippingAddress,
    opts?: { quietIfIncomplete?: boolean },
  ): Promise<{ ok: boolean; error?: string }> => {
    const suburb = details.suburb.trim();
    const state = details.state.trim();
    const postcode = details.postcode.replace(/\D/g, '').slice(0, 4);
    if (opts?.quietIfIncomplete && (suburb.length < 2 || !state || postcode.length !== 4)) {
      return { ok: false };
    }
    setIsVerifyingAddress(true);
    setLocalityError(null);
    setLocalitySuggestions([]);
    try {
      const result = await validateAusPostLocality({ suburb, state, postcode });
      setLocalitySuggestions(result.suggestions || []);
      if (!result.valid) {
        const message = result.error || 'This address is not recognised by Australia Post.';
        setLocalityOk(false);
        setLocalityError(message);
        return { ok: false, error: message };
      }
      setLocalityOk(true);
      if (result.suburb && result.suburb.toUpperCase() !== suburb.toUpperCase()) {
        setShippingAddress((prev) => ({ ...prev, suburb: result.suburb || prev.suburb }));
      }
      return { ok: true };
    } finally {
      setIsVerifyingAddress(false);
    }
  };

  const handleSelectTier = (tier: typeof REDEMPTION_TIERS[0]) => {
    setSelectedTier((prev) => (prev?.points === tier.points ? null : tier));
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
      if (deliveryMode === 'collection') {
        if (!collectionNumber.trim()) {
          setSubmitError(
            collectionType === 'parcel_collect'
              ? 'Enter your Parcel Collect number.'
              : 'Enter your Parcel Locker number.',
          );
          return;
        }
        applyCollectionLine(collectionType, collectionNumber);
      }

      if (deliveryMode === 'simple') {
        const missingLocality =
          shippingAddress.suburb.trim().length < 2 ||
          !shippingAddress.state.trim() ||
          shippingAddress.postcode.replace(/\D/g, '').length !== 4;
        if (missingLocality) {
          setDeliveryMode('manual');
          setSubmitError(
            'Please enter your address manually so we can capture suburb, state & postcode.',
          );
          return;
        }
      }

      const addressLine =
        deliveryMode === 'collection'
          ? composeCollectionAddress(collectionType, collectionNumber).slice(0, 40)
          : shippingAddress.address;
      const apartmentLine = shippingAddress.apartment;

      const formatErr = validateCheckoutAddressFormat(addressLine, apartmentLine);
      if (formatErr) {
        setSubmitError(formatErr);
        return;
      }
      setIsVerifyingAddress(true);
      let auspostCheck;
      try {
        auspostCheck = await validateAusPostAddress({
          suburb: shippingAddress.suburb,
          state: shippingAddress.state,
          postcode: shippingAddress.postcode,
          address: addressLine,
          apartment: apartmentLine,
          addressType: inferCheckoutAddressType(`${addressLine} ${apartmentLine}`),
          shippingMethod: selectedShipping,
          name: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
          email: contactEmail.trim(),
        });
      } finally {
        setIsVerifyingAddress(false);
      }
      setLocalitySuggestions(auspostCheck.suggestions || []);
      if (!auspostCheck.valid) {
        setLocalityOk(false);
        setLocalityError(auspostCheck.error || 'Australia Post could not verify this address.');
        setSubmitError(auspostCheck.error || 'Australia Post could not verify this delivery address.');
        return;
      }
      setLocalityOk(true);
      setLocalityError(null);
      if (auspostCheck.suburb) {
        setShippingAddress((prev) => ({
          ...prev,
          address: addressLine,
          suburb: auspostCheck.suburb || prev.suburb,
          state: auspostCheck.state || prev.state,
          postcode: auspostCheck.postcode || prev.postcode,
        }));
      } else if (deliveryMode === 'collection') {
        setShippingAddress((prev) => ({ ...prev, address: addressLine }));
      }

      const shippingForOrder = {
        ...shippingAddress,
        address: addressLine,
        apartment: apartmentLine,
        suburb: auspostCheck.suburb || shippingAddress.suburb,
        state: auspostCheck.state || shippingAddress.state,
        postcode: auspostCheck.postcode || shippingAddress.postcode,
      };

      const wasPreorderCheckout = items.some((i) => !i.isFree && i.isPreorder);
      const newOrderNumber = wasPreorderCheckout
        ? await generatePreorderOrderNumberForCheckout()
        : await generateOrderNumberForCheckout();
      const finalOrderTotal = paidItemsTotal + shippingCost - pointsDiscount - affiliateDiscountAmount;
      setOrderNumber(newOrderNumber);
      setOrderTotal(finalOrderTotal);
      setCompletedOrderWasPreorder(wasPreorderCheckout);
      const shippingForEmail = formatShippingForEmail(shippingForOrder);

      const orderPayload: Record<string, unknown> = {
        order_number: newOrderNumber,
        user_id: userId,
        customer_email: contactEmail,
        customer_first_name: shippingForOrder.firstName,
        customer_last_name: shippingForOrder.lastName,
        customer_phone: shippingForOrder.phone,
        shipping_address: `${shippingForOrder.address}${shippingForOrder.apartment ? ', ' + shippingForOrder.apartment : ''}`,
        shipping_suburb: shippingForOrder.suburb,
        shipping_state: shippingForOrder.state,
        shipping_postcode: shippingForOrder.postcode,
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
            customer_phone: shippingForOrder.phone.trim() || undefined,
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

      // Save shipping to profile for next checkout (logged-in only, best-effort).
      if (!error && userId) {
        void saveCheckoutProfile(userId, shippingForOrder).catch((saveErr) => {
          console.warn('Could not save shipping to profile:', saveErr);
        });
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
              {/* Mobile PAYID */}
              <div className="p-3 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#8B5CF6] font-bold">MOBILE PAYID</p>
                    <p className="text-sm font-mono text-white">{bankDetails.payid_mobile}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(bankDetails.payid_mobile, 'payid_mobile')}
                    className="p-2 rounded bg-[#8B5CF6]/20"
                    aria-label="Copy mobile PAYID"
                  >
                    {copiedField === 'payid_mobile' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#8B5CF6]" />}
                  </button>
                </div>
              </div>

              {/* ABN PAYID */}
              <div className="p-3 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/30">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#8B5CF6] font-bold">ABN PAYID</p>
                    <p className="text-sm font-mono text-white">{bankDetails.payid}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void copyToClipboard(bankDetails.payid, 'payid')}
                    className="p-2 rounded bg-[#8B5CF6]/20"
                    aria-label="Copy ABN PAYID"
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

  // Wait for cart + saved details so we never flash empty cart / empty form.
  if (isCartLoading || !isCheckoutReady) {
    return (
      <>
        <SEO title="Checkout | PEPLAB" noIndex />
        <div className="min-h-screen bg-[#070A12]">
          <nav className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-xl font-bold tracking-wider gradient-text">PEPLAB</span>
            <span className="text-sm text-gray-500">Loading checkout…</span>
          </nav>
          <main className="px-4 py-6 max-w-lg mx-auto space-y-3">
            <Skeleton className="h-7 w-48 rounded-lg" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </main>
        </div>
      </>
    );
  }

  // Empty cart (only after cart has finished loading)
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

  // CHECKOUT FORM — full-page 50/50 split (Peplab dark summary | white form)
  const fieldClass =
    'block w-full min-w-0 box-border h-12 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 text-[15px] placeholder:text-slate-400 focus:border-[#2ED1B4] focus:ring-1 focus:ring-[#2ED1B4] outline-none transition-colors';
  const labelClass = 'block text-[13px] font-semibold text-slate-800 mb-2';
  const sectionTitleClass = 'text-xs font-bold uppercase tracking-[0.14em] text-slate-900 mb-5';
  const fieldWrapClass = 'w-full min-w-0';
  const halfFieldWrapClass = 'min-w-0 w-full';

  return (
    <>
      <SEO title="Checkout | PEPLAB" noIndex />
      <div className="min-h-svh w-full md:grid md:grid-cols-2">
        {/* ── Left half: order summary (Peplab dark + Aussie spacing) ── */}
        <aside className="bg-[#070A12] border-b md:border-b-0 md:h-svh md:overflow-y-auto">
          <div className="w-full max-w-[22rem] mx-auto px-6 py-12 md:py-16">
            {/* Centered brand — same gradient wordmark as site nav */}
            <div className="text-center mb-14 md:mb-16 relative">
              <a
                href={HOME_PATH}
                className="inline-flex flex-col items-center hover:opacity-90"
                aria-label="PEPLAB Australia home"
              >
                <span className="text-3xl md:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
                  PEPLAB
                </span>
                <span className="mt-1.5 font-mono uppercase text-[10px] md:text-xs tracking-[0.45em] text-[#8B5CF6]">
                  PEPTIDES AUSTRALIA
                </span>
              </a>
              <a
                href={SHOP_PATH}
                className="md:hidden absolute right-0 top-1 text-xs text-white/70 flex items-center gap-1 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Shop
              </a>
            </div>

            {/* Mobile accordion toggle */}
            <button
              type="button"
              className="md:hidden w-full flex items-center justify-between gap-3 mb-8 p-3 rounded-xl bg-white/5 border border-white/10"
              onClick={() => setMobileSummaryOpen((o) => !o)}
              aria-expanded={mobileSummaryOpen}
            >
              <span className="text-sm text-white font-medium flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#2ED1B4]" />
                Order summary ({items.length})
              </span>
              <span className="flex items-center gap-2 text-white font-semibold tabular-nums">
                ${finalTotal.toFixed(2)}
                {mobileSummaryOpen ? <ChevronUp className="w-4 h-4 text-white/60" /> : <ChevronDown className="w-4 h-4 text-white/60" />}
              </span>
            </button>

            <div className={`${mobileSummaryOpen ? 'block' : 'hidden'} md:block`}>
              {/* Line items */}
              <div className="space-y-8 mb-6">
                {items.map((item) => {
                  const lineKey = `${item.productId}-${item.dosage}-${item.isPreorder ? 'p' : ''}`;
                  return (
                    <div key={lineKey} className="flex items-start gap-4">
                      <div className="shrink-0 w-14 h-14 rounded-md overflow-hidden bg-black/25 border border-white/10 flex items-center justify-center">
                        <img
                          src={getOptimizedProductImageUrl(item.image, { width: 112 })}
                          alt={item.name}
                          className="w-full h-full object-contain p-0.5"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[15px] text-white font-medium leading-snug">
                              {item.name}
                              {item.dosage ? (
                                <span className="text-white/70 font-normal"> {item.dosage}</span>
                              ) : null}
                            </p>
                            {!item.isFree && item.isPreorder && (
                              <span className="inline-block mt-1.5 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[#FECACA] border border-red-500/40">
                                Preorder
                              </span>
                            )}
                            {!item.isFree && !productExcludesVolumeBundle(item.productId, item.name) && (
                              <span className="inline-block mt-1.5 ml-1 text-[9px] font-bold text-[#86EFAC] px-1 py-0.5 rounded bg-[#22C55E]/20">
                                {getMarketingBundleOffLabel(item.quantity)}
                              </span>
                            )}
                            {!item.isFree ? (
                              <div className="mt-3.5 inline-flex items-center h-8 rounded-full bg-[#2F3A4D] border border-white/10">
                                <button
                                  type="button"
                                  aria-label="Decrease quantity"
                                  className="px-2.5 h-full text-white/75 hover:text-white disabled:opacity-35"
                                  disabled={item.quantity <= 1}
                                  onClick={() => updateQuantity(item.productId, item.dosage, item.quantity - 1, item.isPreorder)}
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center text-sm text-white tabular-nums">{item.quantity}</span>
                                <button
                                  type="button"
                                  aria-label="Increase quantity"
                                  className="px-2.5 h-full text-white/75 hover:text-white"
                                  onClick={() => updateQuantity(item.productId, item.dosage, item.quantity + 1, item.isPreorder)}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <p className="mt-3 text-xs text-white/50">Free gift</p>
                            )}
                          </div>
                          <span className="text-[15px] text-white font-medium tabular-nums shrink-0 pt-0.5">
                            {item.isFree ? 'FREE' : `$${(item.price * item.quantity).toFixed(2)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <a
                href={SHOP_PATH}
                className="inline-flex items-center gap-1 text-[15px] text-white/90 hover:text-white mb-8"
              >
                + Add more items
              </a>

              {/* Totals — flow under items (no mt-auto / no huge middle gap) */}
              <div className="pt-2">
                {remainingForFreeShipping > 0 && (
                  <p className="text-xs text-white/55 mb-5">
                    Add ${remainingForFreeShipping.toFixed(2)} more for free shipping
                  </p>
                )}
                <div className="border-t border-white/25 pt-5 space-y-3.5">
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/80">Subtotal</span>
                    <span className="text-white tabular-nums">${paidItemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[15px]">
                    <span className="text-white/80">Shipping</span>
                    <span className="text-white tabular-nums">
                      {paidItemsTotal >= FREE_SHIPPING_THRESHOLD ? 'Free' : `$${shippingCost.toFixed(2)}`}
                    </span>
                  </div>
                  {affiliateDiscountAmount > 0 && (
                    <div className="flex justify-between text-[15px]">
                      <span className="text-[#86EFAC]">Code {appliedCode}</span>
                      <span className="text-[#86EFAC] tabular-nums">−${affiliateDiscountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-[15px]">
                      <span className="text-[#C4B5FD]">Points</span>
                      <span className="text-[#C4B5FD] tabular-nums">−${pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-white/25 mt-5 pt-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 mb-2.5">Total due</p>
                  <p className="text-[2.35rem] font-bold text-white tabular-nums tracking-tight leading-none">
                    A${finalTotal.toFixed(2)}
                  </p>
                  {isLoggedIn && estimatedPurchaseRewardPts > 0 && (
                    <p className="text-xs text-white/55 mt-3.5">
                      After payment: <span className="text-[#86EFAC]">{estimatedPurchaseRewardPts} pts</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Right half: white form ── */}
        <div className="bg-white md:h-svh md:overflow-y-auto">
          <div className="w-full px-6 py-6 sm:px-8 md:px-12 md:py-10">
            <div className="hidden md:flex w-full justify-end mb-8">
              <a href={SHOP_PATH} className="text-sm text-slate-500 flex items-center gap-1.5 hover:text-slate-800">
                <ArrowLeft className="w-4 h-4" />
                Back to shop
              </a>
            </div>

            {submitError && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">{submitError}</p>
              </div>
            )}

            {items.some((i) => !i.isFree && i.isPreorder) && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200">
                <p className="text-[12px] text-rose-800 leading-relaxed">
                  <span className="font-semibold">Preorder checkout:</span> your payment reference will be a{' '}
                  <span className="font-mono font-bold">PRE-</span> number. Pricing matches the storefront — no preorder markup.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-10">
              <section className="w-full space-y-5">
                <h2 className={sectionTitleClass}>Contact</h2>
                <div className={fieldWrapClass}>
                  <label className={labelClass}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    className={fieldClass}
                    placeholder="email@example.com"
                  />
                </div>
                <div className={fieldWrapClass}>
                  <label className={labelClass}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => updateShipping({ phone: e.target.value })}
                    required
                    autoComplete="tel"
                    className={fieldClass}
                    placeholder="04XX XXX XXX"
                  />
                </div>
              </section>

              <section className="w-full">
                <h2 className={sectionTitleClass}>Delivery details</h2>
                {autofillNotice && (
                  <div className="mb-5 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-teal-50 border border-teal-200">
                    <CheckCircle2 className="w-4 h-4 text-[#1FA896] shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-600 leading-snug flex-1">{autofillNotice}</p>
                    <button
                      type="button"
                      onClick={() => setAutofillNotice(null)}
                      className="text-slate-400 hover:text-slate-700 shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {!isLoggedIn && (
                  <p className="mb-5 text-[12px] text-slate-500 leading-snug">
                    <a href="/login" className="text-[#1FA896] hover:underline font-medium">Sign in</a>
                    {' '}to autofill your saved address next time.
                  </p>
                )}
                <div className="w-full space-y-5">
                  <div className="w-full grid grid-cols-2 gap-4">
                    <div className={halfFieldWrapClass}>
                      <label className={labelClass}>
                        First name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) => updateShipping({ firstName: e.target.value })}
                        required
                        autoComplete="given-name"
                        className={fieldClass}
                        placeholder="Jane"
                      />
                    </div>
                    <div className={halfFieldWrapClass}>
                      <label className={labelClass}>
                        Last name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) => updateShipping({ lastName: e.target.value })}
                        required
                        autoComplete="family-name"
                        className={fieldClass}
                        placeholder="Smith"
                      />
                    </div>
                  </div>

                  {deliveryMode === 'collection' ? (
                    <>
                      <div className={fieldWrapClass}>
                        <label className={labelClass}>
                          Australia Post collection point <span className="text-red-500">*</span>
                        </label>
                        <div className="w-full rounded-xl border border-slate-200 p-4 space-y-4">
                          <div className="w-full grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => updateCollectionType('parcel_locker')}
                              className={`w-full py-3 px-3 rounded-xl border text-sm font-medium transition-colors ${
                                collectionType === 'parcel_locker'
                                  ? 'border-[#2ED1B4] bg-[#2ED1B4]/10 text-[#0F766E]'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              Parcel Locker
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCollectionType('parcel_collect')}
                              className={`w-full py-3 px-3 rounded-xl border text-sm font-medium transition-colors ${
                                collectionType === 'parcel_collect'
                                  ? 'border-[#2ED1B4] bg-[#2ED1B4]/10 text-[#0F766E]'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              Parcel Collect
                            </button>
                          </div>
                          <div className={fieldWrapClass}>
                            <label className={labelClass}>
                              {collectionType === 'parcel_collect' ? 'Parcel Collect number' : 'Parcel Locker number'}{' '}
                              <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={collectionNumber}
                              onChange={(e) => updateCollectionNumber(e.target.value)}
                              required
                              maxLength={24}
                              className={fieldClass}
                              placeholder="e.g. 10"
                            />
                            <p className="mt-1.5 text-[11px] text-slate-500 leading-snug">
                              Copy it exactly as it appears in your MyPost account. Australia Post shortened these
                              numbers on 1 September 2026 — both the new short number and an older 10-digit one work
                              here.
                            </p>
                          </div>
                          <div className={fieldWrapClass}>
                            <label className={labelClass}>Locker street address (optional)</label>
                            <input
                              type="text"
                              value={shippingAddress.apartment}
                              onChange={(e) => updateShipping({ apartment: e.target.value })}
                              maxLength={40}
                              className={fieldClass}
                              placeholder="e.g. 245 Cowpasture Road"
                            />
                            <p className="mt-1.5 text-[11px] text-slate-500 leading-snug">
                              Leave blank unless MyPost shows a street address for your locker.
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className={fieldWrapClass}>
                        <button
                          type="button"
                          onClick={switchToSimpleMode}
                          className="text-[13px] text-[#1FA896] hover:underline font-medium"
                        >
                          Use a street address instead
                        </button>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className={halfFieldWrapClass}>
                          <label className={labelClass}>
                            Suburb <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.suburb}
                            onChange={(e) => updateShipping({ suburb: e.target.value })}
                            onBlur={() => void verifyLocality(shippingAddress, { quietIfIncomplete: true })}
                            required
                            autoComplete="address-level2"
                            className={fieldClass}
                            placeholder="Suburb"
                          />
                        </div>
                        <div className={halfFieldWrapClass}>
                          <label className={labelClass}>
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={shippingAddress.state}
                            onChange={(e) => {
                              updateShipping({ state: e.target.value });
                              void verifyLocality({ ...shippingAddress, state: e.target.value }, { quietIfIncomplete: true });
                            }}
                            required
                            autoComplete="address-level1"
                            className={`${fieldClass} appearance-none`}
                          >
                            <option value="">Select state</option>
                            <option value="NSW">NSW</option>
                            <option value="VIC">VIC</option>
                            <option value="QLD">QLD</option>
                            <option value="WA">WA</option>
                            <option value="SA">SA</option>
                            <option value="TAS">TAS</option>
                            <option value="ACT">ACT</option>
                            <option value="NT">NT</option>
                          </select>
                        </div>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className={halfFieldWrapClass}>
                          <label className={labelClass}>
                            Postcode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.postcode}
                            onChange={(e) => updateShipping({ postcode: e.target.value })}
                            onBlur={() => void verifyLocality(shippingAddress, { quietIfIncomplete: true })}
                            required
                            autoComplete="postal-code"
                            inputMode="numeric"
                            maxLength={4}
                            className={fieldClass}
                            placeholder="XXXX"
                          />
                        </div>
                      </div>
                    </>
                  ) : deliveryMode === 'manual' ? (
                    <>
                      <div className={fieldWrapClass}>
                        <label className={labelClass}>
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.address}
                          onChange={(e) => updateShipping({ address: e.target.value })}
                          required
                          autoComplete="address-line1"
                          maxLength={40}
                          className={fieldClass}
                          placeholder="Street address, PO Box, or Parcel Locker"
                        />
                      </div>
                      <div className={`${fieldWrapClass} space-y-1.5`}>
                        <button
                          type="button"
                          onClick={switchToSimpleMode}
                          className="block text-[13px] text-[#1FA896] hover:underline font-medium"
                        >
                          Use address search instead
                        </button>
                        <p className="text-[12px] text-slate-500">Can&apos;t find your address, or shipping to a PO Box?</p>
                        <button
                          type="button"
                          onClick={switchToCollectionMode}
                          className="block text-[13px] text-[#1FA896] hover:underline font-medium"
                        >
                          Deliver to a Parcel Locker or Parcel Collect
                        </button>
                      </div>
                      <div className={fieldWrapClass}>
                        <label className={labelClass}>Apartment / unit (optional)</label>
                        <input
                          type="text"
                          value={shippingAddress.apartment}
                          onChange={(e) => updateShipping({ apartment: e.target.value })}
                          autoComplete="address-line2"
                          maxLength={40}
                          className={fieldClass}
                          placeholder="Apt, suite, unit..."
                        />
                      </div>
                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className={halfFieldWrapClass}>
                          <label className={labelClass}>
                            Suburb <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.suburb}
                            onChange={(e) => updateShipping({ suburb: e.target.value })}
                            onBlur={() => void verifyLocality(shippingAddress, { quietIfIncomplete: true })}
                            required
                            autoComplete="address-level2"
                            className={fieldClass}
                            placeholder="Suburb"
                          />
                        </div>
                        <div className={halfFieldWrapClass}>
                          <label className={labelClass}>
                            State <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={shippingAddress.state}
                            onChange={(e) => {
                              updateShipping({ state: e.target.value });
                              void verifyLocality({ ...shippingAddress, state: e.target.value }, { quietIfIncomplete: true });
                            }}
                            required
                            autoComplete="address-level1"
                            className={`${fieldClass} appearance-none`}
                          >
                            <option value="">Select state</option>
                            <option value="NSW">NSW</option>
                            <option value="VIC">VIC</option>
                            <option value="QLD">QLD</option>
                            <option value="WA">WA</option>
                            <option value="SA">SA</option>
                            <option value="TAS">TAS</option>
                            <option value="ACT">ACT</option>
                            <option value="NT">NT</option>
                          </select>
                        </div>
                      </div>
                      <div className="w-full grid grid-cols-2 gap-4">
                        <div className={halfFieldWrapClass}>
                          <label className={labelClass}>
                            Postcode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={shippingAddress.postcode}
                            onChange={(e) => updateShipping({ postcode: e.target.value })}
                            onBlur={() => void verifyLocality(shippingAddress, { quietIfIncomplete: true })}
                            required
                            autoComplete="postal-code"
                            inputMode="numeric"
                            maxLength={4}
                            className={fieldClass}
                            placeholder="XXXX"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={fieldWrapClass}>
                        <label className={labelClass}>
                          Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingAddress.address}
                          onChange={(e) => updateShipping({ address: e.target.value })}
                          required
                          autoComplete="address-line1"
                          maxLength={40}
                          className={fieldClass}
                          placeholder="Start typing your address..."
                        />
                        <p className="mt-1.5 text-[12px] text-slate-500 leading-snug">
                          Enter your street address, then use manual entry so we capture suburb, state &amp; postcode.
                        </p>
                      </div>
                      <div className={`${fieldWrapClass} space-y-1.5`}>
                        <button
                          type="button"
                          onClick={switchToManualMode}
                          className="block text-[13px] text-[#1FA896] hover:underline font-medium"
                        >
                          Enter address manually
                        </button>
                        <p className="text-[12px] text-slate-500">Can&apos;t find your address, or shipping to a PO Box?</p>
                        <button
                          type="button"
                          onClick={switchToCollectionMode}
                          className="block text-[13px] text-[#1FA896] hover:underline font-medium"
                        >
                          Deliver to a Parcel Locker or Parcel Collect
                        </button>
                      </div>
                    </>
                  )}

                  {isVerifyingAddress && (
                    <p className="text-[12px] text-slate-500 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Checking address with Australia Post…
                    </p>
                  )}
                  {localityOk && !localityError && (
                    <p className="text-[12px] text-emerald-600 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      Address looks good for Australia Post
                    </p>
                  )}
                  {localityError && (
                    <p className="text-[12px] text-red-600 leading-snug">{localityError}</p>
                  )}
                  {localitySuggestions.length > 0 && !localityOk && (
                    <div className="flex flex-wrap gap-1.5">
                      {localitySuggestions.map((suburb) => (
                        <button
                          key={suburb}
                          type="button"
                          onClick={() => {
                            const next = { ...shippingAddress, suburb };
                            updateShipping({ suburb });
                            void verifyLocality(next);
                          }}
                          className="px-2.5 py-1 rounded-md border border-slate-200 text-[11px] text-slate-700 hover:border-[#2ED1B4]"
                        >
                          {suburb}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section className="w-full">
                <h2 className={sectionTitleClass}>Shipping method</h2>
                <div className="space-y-2.5">
                  {shippingMethods.map((method) => {
                    const selected = selectedShipping === method.id;
                    const Icon = method.id === 'express' ? Zap : Truck;
                    return (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                          selected
                            ? 'border-[#2ED1B4] bg-[#2ED1B4]/10'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={selected}
                          onChange={() => setSelectedShipping(method.id)}
                          className="w-4 h-4 accent-[#2ED1B4]"
                        />
                        <Icon className={`w-4 h-4 shrink-0 ${selected ? 'text-[#1FA896]' : 'text-slate-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <span className="text-sm text-slate-900 font-medium">{method.name}</span>
                            <span className="text-sm text-slate-900 font-semibold tabular-nums">
                              {paidItemsTotal >= FREE_SHIPPING_THRESHOLD ? 'FREE' : `$${method.price.toFixed(2)}`}
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-500 mt-0.5">{method.estimatedDays}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className={sectionTitleClass}>Coupon code</h2>
                {appliedCode && appliedPromotion?.valid ? (
                  referralBenefitsActive ? (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">
                          {appliedCode} — {affiliateDiscountPercent}% off
                        </p>
                        <p className="text-xs text-emerald-600/80">
                          Saving ${affiliateDiscountAmount.toFixed(2)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearCode}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-50 border border-amber-200 gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-amber-800">{appliedCode} applied</p>
                        <p className="text-xs text-amber-700/90 leading-snug">
                          Add ${referralSubtotalShortfall.toFixed(2)} for {affiliateDiscountPercent}% off (${REFERRAL_MIN_ORDER_SUBTOTAL_USD}+ subtotal).
                        </p>
                      </div>
                      <button type="button" onClick={clearCode} className="text-xs text-red-600 hover:underline shrink-0">
                        Remove
                      </button>
                    </div>
                  )
                ) : (
                  <>
                    <div className="flex w-full gap-2">
                      <input
                        type="text"
                        value={affiliateInput}
                        onChange={(e) => { setAffiliateInput(e.target.value.toUpperCase()); setAffiliateError(null); }}
                        placeholder="Enter coupon code"
                        className={`${fieldClass} flex-1 min-w-0 uppercase`}
                      />
                      <button
                        type="button"
                        onClick={handleApplyAffiliate}
                        disabled={affiliateLoading || !affiliateInput.trim()}
                        className="shrink-0 px-5 h-12 rounded-xl bg-[#2ED1B4] text-[#070A12] text-sm font-semibold hover:bg-[#25b89d] disabled:opacity-50 transition-colors"
                      >
                        {affiliateLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                    {affiliateError && (
                      <p className="mt-1.5 text-[12px] text-red-600">{affiliateError}</p>
                    )}
                  </>
                )}
              </section>

              <section className="rounded-xl border border-violet-200 overflow-hidden bg-gradient-to-br from-violet-50 to-teal-50/40">
                <div className="flex items-center justify-between px-4 py-3 border-b border-violet-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                      <Gift className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Redeem Points</p>
                      <p className="text-[11px] text-slate-500">Use rewards for a discount</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-100 border border-violet-200">
                    <Award className="w-3 h-3 text-[#8B5CF6]" />
                    <span className="text-xs font-bold text-[#8B5CF6]">
                      {isLoggedIn ? `${balance} pts` : 'Login to use'}
                    </span>
                  </div>
                </div>
                <div className="p-3.5">
                  {!isLoggedIn ? (
                    <p className="text-[12px] text-slate-500">
                      <a href="/login" className="text-[#8B5CF6] underline font-medium">Sign in</a> to use your reward points
                    </p>
                  ) : balance === 0 ? (
                    <p className="text-[12px] text-slate-500">You don't have any points yet. Earn points by placing orders!</p>
                  ) : (
                    <>
                      {selectedTier ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-3">
                          <div>
                            <p className="text-sm font-semibold text-emerald-700">{selectedTier.label} Applied!</p>
                            <p className="text-[11px] text-emerald-600/80">
                              −{selectedTier.points} pts → −${pointsDiscount.toFixed(2)} off
                              {pointsRefundEstimate > 0 && <> · +{pointsRefundEstimate} pts refunded</>}
                            </p>
                          </div>
                          <button type="button" onClick={() => setSelectedTier(null)} className="text-xs text-red-600 hover:underline">
                            Remove
                          </button>
                        </div>
                      ) : null}
                      <div className="grid grid-cols-2 gap-2">
                        {REDEMPTION_TIERS.map((tier) => {
                          const canAfford = balance >= tier.points;
                          const isSelected = selectedTier?.points === tier.points;
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
                              className={`relative p-3 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'border-[#8B5CF6] bg-violet-100'
                                  : canAfford
                                  ? 'border-slate-200 bg-white hover:border-violet-300'
                                  : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                              }`}
                            >
                              <p className="text-base font-bold text-slate-900 leading-none mb-0.5">{tier.points}</p>
                              <p className="text-[10px] text-slate-500 mb-1">points</p>
                              <p className="text-sm font-bold text-[#1FA896]">{tier.label}</p>
                              {!canAfford ? (
                                <p className="text-[9px] text-slate-400 mt-1">Need {tier.points - balance} more</p>
                              ) : previewRefundPoints > 0 ? (
                                <p className="text-[9px] text-emerald-600 mt-1">
                                  Applies ${previewDiscount.toFixed(2)} · +{previewRefundPoints} pts back
                                </p>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section>
                <h2 className={sectionTitleClass}>Payment</h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-[#1FA896]" />
                    <span className="text-sm font-semibold text-slate-900">Bank transfer after order</span>
                  </div>
                  <ul className="text-[12px] text-slate-600 space-y-1">
                    <li>• PayID / BSB details shown on the confirmation page</li>
                    <li>• Cash on pickup available</li>
                    <li>
                      •{' '}
                      <a href={CONFIG.SOCIAL.TELEGRAM} target="_blank" rel="noopener noreferrer" className="text-[#1FA896] underline">
                        Telegram support
                      </a>
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200">
                  <input
                    type="checkbox"
                    id="age"
                    checked={ageVerified}
                    onChange={(e) => setAgeVerified(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 accent-amber-500"
                  />
                  <label htmlFor="age" className="text-[12px] text-slate-600 leading-snug">
                    <span className="text-amber-700 font-semibold">I confirm I am 18 years or older</span> and purchasing these products for lawful research purposes only.
                  </label>
                </div>
                <div className="flex items-start gap-2.5 px-1">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    required
                    className="w-4 h-4 mt-0.5 accent-[#2ED1B4]"
                  />
                  <label htmlFor="terms" className="text-[12px] text-slate-600">
                    I agree to the <a href="/terms" className="text-[#1FA896] underline">Terms</a> & <a href="/privacy" className="text-[#1FA896] underline">Privacy</a>
                  </label>
                </div>
              </section>

              <button
                type="submit"
                disabled={!agreedToTerms || !ageVerified || isSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#2ED1B4] text-[#070A12] font-bold text-[15px] hover:bg-[#25b89d] disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Complete Order — $${finalTotal.toFixed(2)}`
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center pb-4">
                For research use only. Not for human consumption.
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

