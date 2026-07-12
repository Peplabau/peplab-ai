import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  validateAffiliateCode,
  getPromoterForSessionUser,
  getAffiliateOrdersForPromoter,
  getStoreCreditTransactions,
  type Promoter,
  type AffiliateOrder,
  type StoreCreditTransaction,
  type AffiliateValidation,
} from '@/lib/affiliates';
import { getSiteSetting, DEFAULT_AFFILIATE_PROGRAM_SETTINGS } from '@/lib/settings';

interface AffiliateContextType {
  /** The validated affiliate code applied to the current session */
  appliedCode: string | null;
  /** Validation result for the applied code */
  appliedPromotion: AffiliateValidation | null;
  /** Apply an affiliate code — validates and stores it */
  applyCode: (code: string) => Promise<AffiliateValidation>;
  /** Remove the applied code */
  clearCode: () => void;

  /** If logged-in user is a promoter, their promoter record */
  myPromoter: Promoter | null;
  /** Affiliate orders for this promoter */
  myAffiliateOrders: AffiliateOrder[];
  /** Store credit transactions for this promoter */
  myCreditTransactions: StoreCreditTransaction[];
  /** Whether promoter data is loading */
  isPromoterLoading: boolean;
  /** Refresh promoter data */
  refreshPromoterData: () => Promise<void>;
}

const AffiliateContext = createContext<AffiliateContextType | undefined>(undefined);

const STORAGE_KEY = 'peplab_affiliate_code';

export function AffiliateProvider({ children }: { children: React.ReactNode }) {
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [appliedPromotion, setAppliedPromotion] = useState<AffiliateValidation | null>(null);
  const [myPromoter, setMyPromoter] = useState<Promoter | null>(null);
  const [myAffiliateOrders, setMyAffiliateOrders] = useState<AffiliateOrder[]>([]);
  const [myCreditTransactions, setMyCreditTransactions] = useState<StoreCreditTransaction[]>([]);
  const [isPromoterLoading, setIsPromoterLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Restore code from sessionStorage only when affiliate codes are enabled site-wide
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const program = await getSiteSetting('affiliate_program_settings', DEFAULT_AFFILIATE_PROGRAM_SETTINGS);
      if (cancelled) return;
      if (program.codes_enabled === false) {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        return;
      }
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.code && parsed.promotion?.valid) {
            setAppliedCode(parsed.code);
            setAppliedPromotion(parsed.promotion);
          }
        }
      } catch (_) {}
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Track auth state for promoter data
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load promoter data when userId changes
  useEffect(() => {
    if (userId) {
      refreshPromoterData();
    } else {
      setMyPromoter(null);
      setMyAffiliateOrders([]);
      setMyCreditTransactions([]);
    }
  }, [userId]);

  const applyCode = useCallback(async (code: string): Promise<AffiliateValidation> => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return { valid: false, error: 'Please enter a code' };

    // Fraud: prevent self-referral
    if (userId) {
      const me = await getPromoterForSessionUser();
      if (me && me.referral_code.toUpperCase() === trimmed) {
        return { valid: false, error: 'You cannot use your own referral code' };
      }
    }

    const result = await validateAffiliateCode(trimmed);
    if (result.valid) {
      setAppliedCode(trimmed);
      setAppliedPromotion(result);
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ code: trimmed, promotion: result }));
      } catch (_) {}
    } else {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { autoApply?: boolean };
          if (parsed.autoApply) sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (_) {}
    }
    return result;
  }, [userId]);

  const clearCode = useCallback(() => {
    setAppliedCode(null);
    setAppliedPromotion(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }, []);

  const refreshPromoterData = useCallback(async () => {
    if (!userId) return;
    setIsPromoterLoading(true);
    try {
      const promoter = await getPromoterForSessionUser();
      setMyPromoter(promoter);
      if (promoter) {
        const [orders, txns] = await Promise.all([
          getAffiliateOrdersForPromoter(promoter.id),
          getStoreCreditTransactions(promoter.id),
        ]);
        setMyAffiliateOrders(orders);
        setMyCreditTransactions(txns);
      } else {
        setMyAffiliateOrders([]);
        setMyCreditTransactions([]);
      }
    } catch (e) {
      console.error('Error loading promoter data:', e);
    } finally {
      setIsPromoterLoading(false);
    }
  }, [userId]);

  return (
    <AffiliateContext.Provider
      value={{
        appliedCode,
        appliedPromotion,
        applyCode,
        clearCode,
        myPromoter,
        myAffiliateOrders,
        myCreditTransactions,
        isPromoterLoading,
        refreshPromoterData,
      }}
    >
      {children}
    </AffiliateContext.Provider>
  );
}

export function useAffiliate() {
  const ctx = useContext(AffiliateContext);
  if (!ctx) throw new Error('useAffiliate must be used within AffiliateProvider');
  return ctx;
}
