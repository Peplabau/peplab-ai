import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { supabase, getCurrentUser } from '@/lib/supabase';
import { getCartLineUnitPrice } from '@/utils/pricing';
import { CONFIG } from '@/lib/config';
import { sendAbandonedCart } from '@/lib/email';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS, type DiscountSettings } from '@/lib/settings';

export interface CartItem {
  productId: string;
  name: string;
  dosage: number | string;
  basePrice?: number;
  price: number;
  /** Original undiscounted price per unit — used to display savings in CartDrawer. */
  originalPrice?: number;
  quantity: number;
  image: string;
  isFree?: boolean;
  /** Out-of-stock line reserved at normal storefront price until restock. */
  isPreorder?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, dosage: number | string, isPreorder?: boolean) => void;
  updateQuantity: (productId: string, dosage: number | string, quantity: number, isPreorder?: boolean) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  paidItemsTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeGiftAdded: boolean;
  isLoading: boolean;
  /** Site discount + stacked Buy 2 / Buy 3+ bundle rules (for cart line pricing). */
  bundleDiscountSettings: DiscountSettings;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_GIFT_THRESHOLD = 300;
const FREE_GIFT_ITEM: CartItem = {
  productId: 'free-bac-water',
  name: 'BAC Water',
  dosage: '3 mL',
  price: 0,
  quantity: 1,
  image: '/bac-water.png',
  isFree: true,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [freeGiftAdded, setFreeGiftAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  /** Last server-side cart update (for abandoned-cart email timing) */
  const [cartRemoteUpdatedAt, setCartRemoteUpdatedAt] = useState<string | null>(null);
  const abandonedReminderSentRef = useRef(false);
  const [bundleDiscountSettings, setBundleDiscountSettings] = useState<DiscountSettings>(DEFAULT_DISCOUNT_SETTINGS);

  const bundlePricingKey = useMemo(
    () =>
      `${bundleDiscountSettings.discount_enabled}-${bundleDiscountSettings.discount_percentage}-${bundleDiscountSettings.buy2_percentage}-${bundleDiscountSettings.buy3_percentage}`,
    [
      bundleDiscountSettings.discount_enabled,
      bundleDiscountSettings.discount_percentage,
      bundleDiscountSettings.buy2_percentage,
      bundleDiscountSettings.buy3_percentage,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const s = await getSiteSetting('discount_settings', DEFAULT_DISCOUNT_SETTINGS);
      if (!cancelled) setBundleDiscountSettings(s);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Load cart from Supabase or localStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        const user = await getCurrentUser();

        if (user) {
          setUserId(user.id);
          await loadCartFromSupabase(user.id);
      } else {
        // No user logged in - use localStorage
        setCartRemoteUpdatedAt(null);
        loadFromLocalStorage();
      }
      } catch (error) {
        console.error('Error loading cart:', error);
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        await loadCartFromSupabase(session.user.id);
      } else {
        setUserId(null);
        setCartRemoteUpdatedAt(null);
        loadFromLocalStorage();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart from Supabase
  const loadCartFromSupabase = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('user_carts')
        .select('items, updated_at')
        .eq('user_id', uid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading cart:', error);
        return;
      }

      if (data?.items) {
        setItems(data.items);
        setCartRemoteUpdatedAt(
          (data as { updated_at?: string })?.updated_at
            ? String((data as { updated_at: string }).updated_at)
            : null
        );
      } else {
        setCartRemoteUpdatedAt(null);
      }
    } catch (error) {
      console.error('Error loading cart from Supabase:', error);
    }
  };

  // Load from localStorage (fallback)
  const loadFromLocalStorage = () => {
    const savedCart = localStorage.getItem('peplab_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  };

  const saveCartToSupabase = useCallback(async (newItems: CartItem[]) => {
    if (!userId) {
      localStorage.setItem('peplab_cart', JSON.stringify(newItems));
      return;
    }

    const nowIso = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('user_carts')
        .upsert(
          {
            user_id: userId,
            items: newItems,
            updated_at: nowIso,
          },
          {
            onConflict: 'user_id',
          }
        );

      if (error) {
        console.error('Error saving cart to Supabase:', error);
        localStorage.setItem('peplab_cart', JSON.stringify(newItems));
      } else {
        setCartRemoteUpdatedAt(nowIso);
      }
    } catch (error) {
      console.error('Error saving cart to Supabase:', error);
      localStorage.setItem('peplab_cart', JSON.stringify(newItems));
    }
  }, [userId]);

  // Calculate total price excluding free items
  const paidItemsTotal = items
    .filter(item => !item.isFree)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Auto-add/remove free gift based on threshold
  useEffect(() => {
    const hasFreeGift = items.some(item => item.isFree);
    
    if (paidItemsTotal >= FREE_GIFT_THRESHOLD && !hasFreeGift) {
      const newItems = [...items, FREE_GIFT_ITEM];
      setItems(newItems);
      saveCartToSupabase(newItems);
      setFreeGiftAdded(true);
    } else if (paidItemsTotal < FREE_GIFT_THRESHOLD && hasFreeGift) {
      const newItems = items.filter(item => !item.isFree);
      setItems(newItems);
      saveCartToSupabase(newItems);
      setFreeGiftAdded(false);
    }
  }, [paidItemsTotal, items, saveCartToSupabase]);

  // Logged-in users: one cart reminder per ~7 days if the cart was last updated 24+ hours ago and still has items.
  useEffect(() => {
    if (isLoading || !userId) return;
    if (abandonedReminderSentRef.current) return;

    const paid = items.filter((i) => !i.isFree);
    if (paid.length === 0) return;
    if (!cartRemoteUpdatedAt) return;

    const staleMs = Date.now() - new Date(cartRemoteUpdatedAt).getTime();
    if (staleMs < 24 * 60 * 60 * 1000) return;

    const storageKey = `peplab_cart_reminder_ts_${userId}`;
    let lastSent = 0;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) lastSent = parseInt(raw, 10) || 0;
    } catch {
      // ignore
    }
    if (lastSent && Date.now() - lastSent < 7 * 24 * 60 * 60 * 1000) return;

    let cancelled = false;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user?.email) return;

      const checkoutUrl = `${CONFIG.SITE_URL.replace(/\/$/, '')}/checkout`;
      const ok = await sendAbandonedCart(user.email, { items: paid, checkoutUrl });
      if (ok) {
        try {
          localStorage.setItem(storageKey, String(Date.now()));
        } catch {
          // ignore
        }
        abandonedReminderSentRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, userId, items, cartRemoteUpdatedAt]);

  // Re-apply stacked bundle unit prices when settings load or change (or after cart hydration).
  useEffect(() => {
    if (isLoading) return;
    setItems((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (item.isFree || item.basePrice == null) return item;
        const p = getCartLineUnitPrice(item.productId, item.basePrice, item.quantity, bundleDiscountSettings, item.name);
        if (Math.abs(p - item.price) > 0.001) changed = true;
        return { ...item, price: p };
      });
      if (!changed) return prev;
      void saveCartToSupabase(next);
      return next;
    });
  }, [isLoading, bundlePricingKey, saveCartToSupabase]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.productId === newItem.productId &&
          item.dosage === newItem.dosage &&
          !!item.isPreorder === !!newItem.isPreorder
      );

      let updated;
      if (existingIndex >= 0) {
        updated = [...prev];
        const newQty = updated[existingIndex].quantity + newItem.quantity;
        const base = updated[existingIndex].basePrice || newItem.basePrice;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          basePrice: base,
          price: base
            ? getCartLineUnitPrice(updated[existingIndex].productId, base, newQty, bundleDiscountSettings, updated[existingIndex].name)
            : updated[existingIndex].price,
        };
      } else {
        const base = newItem.basePrice;
        updated = [...prev, {
          ...newItem,
          price: base
            ? getCartLineUnitPrice(newItem.productId, base, newItem.quantity, bundleDiscountSettings, newItem.name)
            : newItem.price,
        }];
      }
      
      saveCartToSupabase(updated);
      return updated;
    });
  }, [bundleDiscountSettings, saveCartToSupabase]);

  const removeItem = useCallback((productId: string, dosage: number | string, isPreorder?: boolean) => {
    setItems((prev) => {
      const updated = prev.filter((item) => {
        if (item.productId !== productId || item.dosage !== dosage) return true;
        if (isPreorder === undefined) return false;
        return !!item.isPreorder !== isPreorder;
      });
      saveCartToSupabase(updated);
      return updated;
    });
  }, [saveCartToSupabase]);

  const updateQuantity = useCallback((productId: string, dosage: number | string, quantity: number, isPreorder?: boolean) => {
    if (quantity <= 0) {
      removeItem(productId, dosage, isPreorder);
      return;
    }

    setItems((prev) => {
      const updated = prev.map((item) => {
        const lineMatch =
          item.productId === productId &&
          item.dosage === dosage &&
          (isPreorder === undefined ? true : !!item.isPreorder === isPreorder);
        if (lineMatch) {
          const newPrice = item.basePrice
            ? getCartLineUnitPrice(item.productId, item.basePrice, quantity, bundleDiscountSettings, item.name)
            : item.price;
          return { ...item, quantity, price: newPrice };
        }
        return item;
      });
      saveCartToSupabase(updated);
      return updated;
    });
  }, [removeItem, bundleDiscountSettings, saveCartToSupabase]);

  const clearCart = useCallback(() => {
    setItems([]);
    saveCartToSupabase([]);
    setFreeGiftAdded(false);
  }, [saveCartToSupabase]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        paidItemsTotal,
        isCartOpen,
        setIsCartOpen,
        freeGiftAdded,
        isLoading,
        bundleDiscountSettings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
