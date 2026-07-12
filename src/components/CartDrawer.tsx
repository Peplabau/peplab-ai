import { X, Plus, Minus, ShoppingBag, Truck, Gift, Droplets, Tag, Award, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';
import { formatDosageLabel, getDefaultStorefrontDosage } from '@/products';
import { loadEssentialProductsFromSupabase } from '@/lib/supabase-db';
import { getSiteSetting, DEFAULT_DISCOUNT_SETTINGS } from '@/lib/settings';
import { getMarketingBundleOffLabel, getStorefrontPrice, productExcludesVolumeBundle } from '@/utils/pricing';
import { getOptimizedProductImageUrl } from '@/lib/product-image';

export default function CartDrawer() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    totalItems,
    isCartOpen,
    setIsCartOpen,
    freeGiftAdded,
  } = useCart();

  const [showSydneyOption, setShowSydneyOption] = useState(false);

  type SuggestedItem = {
    productId: string;
    name: string;
    description?: string;
    image: string;
    dosage: number | string;
    inStock: boolean;
    originalPrice: number;
    unitPrice: number; // price for quantity=1 (already discounted)
    discountEnabled: boolean;
    discountPercentage: number;
    savings: number;
  };

  const [suggestedItems, setSuggestedItems] = useState<SuggestedItem[]>([]);

  const freeShippingThreshold = 250;
  const freeGiftThreshold = 300;
  
  const hasPreorderLines = items.some((i) => !i.isFree && i.isPreorder);
  const paidItems = items.filter(item => !item.isFree);
  const paidTotal = paidItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate points to be earned (1 point per $1 on subtotal)
  const pointsToEarn = Math.floor(paidTotal);
  
  // Calculate total savings using originalPrice stored on each CartItem
  const totalSavings = paidItems.reduce((sum, item) => {
    if (productExcludesVolumeBundle(item.productId, item.name)) return sum;
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - paidTotal);
  const remainingForFreeGift = Math.max(0, freeGiftThreshold - paidTotal);

  const paidProductIdsInCart = new Set(
    items.filter((item) => !item.isFree).map((item) => item.productId),
  );
  const suggestedToShow = suggestedItems.filter((s) => !paidProductIdsInCart.has(s.productId));

  const handleAddSuggested = (product: SuggestedItem) => {
    if (!product.inStock) return;
    addItem({
      productId: product.productId,
      name: product.name,
      dosage: product.dosage,
      basePrice: product.originalPrice,
      price: product.unitPrice,
      originalPrice: product.originalPrice,
      quantity: 1,
      image: product.image,
    });
  };

  useEffect(() => {
    if (!isCartOpen) return;

    let cancelled = false;

    const loadSuggested = async () => {
      try {
        const [discountSettings, essentials] = await Promise.all([
          getSiteSetting('discount_settings', DEFAULT_DISCOUNT_SETTINGS),
          loadEssentialProductsFromSupabase(),
        ]);

        if (cancelled) return;

        const discountEnabled = discountSettings.discount_enabled ?? true;
        const discountPercentage = discountSettings.discount_percentage ?? 20;

        const list: SuggestedItem[] = [];
        for (const product of essentials) {
          if (!product.dosages?.length) continue;
          let dosage = getDefaultStorefrontDosage(product);
          if (product.id === 'bac-water') {
            const tenMl = product.dosages.find((d) => {
              const unit = String(d.unit ?? '').toUpperCase();
              const value = typeof d.mg === 'number' ? d.mg : parseFloat(String(d.mg));
              return unit === 'ML' && value === 10;
            });
            if (tenMl) dosage = tenMl;
          }
          if (!dosage) continue;
          const unitPrice = getStorefrontPrice(dosage.originalPrice, discountEnabled, discountPercentage);
          const savings = Math.max(0, Math.round((dosage.originalPrice - unitPrice) * 100) / 100);
          list.push({
            productId: product.id,
            name: product.name,
            description: product.description,
            image: product.image,
            dosage: formatDosageLabel(dosage.mg, dosage.unit),
            inStock: dosage.inStock,
            originalPrice: dosage.originalPrice,
            unitPrice,
            discountEnabled,
            discountPercentage,
            savings,
          });
        }

        setSuggestedItems(list);
      } catch (e) {
        console.error('Failed to load suggested products:', e);
        if (!cancelled) setSuggestedItems([]);
      }
    };

    loadSuggested();
    return () => {
      cancelled = true;
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer - More compact on mobile */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0D1117] border-l border-[rgba(244,246,250,0.08)] z-50 flex flex-col">
        {/* Header - Compact */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[rgba(244,246,250,0.08)]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#2ED1B4]" />
            <h2 className="text-sm sm:text-base font-semibold text-[#F4F6FA]">Your Cart</h2>
            <span className="px-1.5 py-0.5 rounded-full bg-[rgba(46,209,180,0.15)] text-[#2ED1B4] text-[10px] sm:text-xs font-medium">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1 sm:p-1.5 rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#A9B3C7]" />
          </button>
        </div>

        {hasPreorderLines && (
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 bg-[rgba(127,29,29,0.35)] border-b border-[rgba(239,68,68,0.35)]">
            <p className="text-[10px] sm:text-xs text-[#FECACA] font-medium leading-snug">
              This cart includes a <span className="font-bold text-[#FCA5A5]">preorder</span> — out-of-stock items at the listed price. Order reference will start with <span className="font-mono font-semibold">PRE-</span> at checkout.
            </p>
          </div>
        )}

        {/* Free Gift Banner - Compact */}
        {freeGiftAdded && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[rgba(139,92,246,0.1)] border-b border-[rgba(139,92,246,0.2)]">
            <div className="flex items-center gap-1.5">
              <Gift className="w-3 h-3 sm:w-4 sm:h-4 text-[#8B5CF6]" />
              <span className="text-[10px] sm:text-xs text-[#8B5CF6] font-medium">
                Free BAC Water 10mL added!
              </span>
            </div>
          </div>
        )}

        {/* Progress Section - Compact */}
        <div className="px-3 py-2 sm:px-4 sm:py-3 bg-[rgba(7,10,18,0.5)] border-b border-[rgba(244,246,250,0.08)] space-y-2 sm:space-y-3">
          {/* Free Shipping Progress */}
          <div>
            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#2ED1B4]" />
                {remainingForFreeShipping > 0 ? (
                  <span className="text-[10px] sm:text-xs text-[#A9B3C7]">
                    Add <span className="text-[#2ED1B4] font-medium">${remainingForFreeShipping.toFixed(0)}</span> for free shipping
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs text-[#2ED1B4] font-medium">
                    Free shipping unlocked!
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#A9B3C7]">${paidTotal.toFixed(0)}/${freeShippingThreshold}</span>
            </div>
            <div className="h-1 sm:h-1.5 bg-[rgba(244,246,250,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2ED1B4] to-[#3B82F6] transition-all duration-500"
                style={{ width: `${Math.min(100, (paidTotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Free Gift Progress */}
          <div>
            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8B5CF6]" />
                {remainingForFreeGift > 0 ? (
                  <span className="text-[10px] sm:text-xs text-[#A9B3C7]">
                    Add <span className="text-[#8B5CF6] font-medium">${remainingForFreeGift.toFixed(0)}</span> for free BAC Water
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs text-[#8B5CF6] font-medium">
                    Free BAC Water unlocked!
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-[#A9B3C7]">${paidTotal.toFixed(0)}/${freeGiftThreshold}</span>
            </div>
            <div className="h-1 sm:h-1.5 bg-[rgba(244,246,250,0.08)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] transition-all duration-500"
                style={{ width: `${Math.min(100, (paidTotal / freeGiftThreshold) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Cart Items - Compact */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
              <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-[rgba(244,246,250,0.2)] mb-2 sm:mb-3" />
              <p className="text-[#A9B3C7] text-sm mb-0.5">Your cart is empty</p>
              <p className="text-[10px] sm:text-xs text-[rgba(169,179,199,0.6)]">
                Add some peptides to get started
              </p>
            </div>
          ) : (
            <div className="p-2 sm:p-3 space-y-1.5 sm:space-y-2">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.dosage}-${item.isPreorder ? 'pre' : 'stk'}`}
                  className={`flex gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border ${
                    item.isFree 
                      ? 'bg-[rgba(139,92,246,0.1)] border-[rgba(139,92,246,0.3)]' 
                      : item.isPreorder
                        ? 'bg-[rgba(127,29,29,0.25)] border-[rgba(239,68,68,0.25)]'
                        : 'bg-[rgba(17,24,39,0.6)] border-[rgba(244,246,250,0.08)]'
                  }`}
                >
                  <img
                    src={getOptimizedProductImageUrl(item.image, { width: 96 })}
                    alt={item.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded bg-[rgba(7,10,18,0.5)] flex-shrink-0"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <h3 className="font-medium text-[#F4F6FA] text-xs sm:text-sm truncate">{item.name}</h3>
                      {item.isFree && (
                        <span className="px-1 py-0.5 rounded-full bg-[#8B5CF6] text-white text-[8px] sm:text-[10px] font-bold flex-shrink-0">
                          FREE
                        </span>
                      )}
                      {!item.isFree && item.isPreorder && (
                        <span className="px-1.5 py-0.5 rounded bg-[#7F1D1D] text-[#FECACA] text-[8px] sm:text-[10px] font-bold flex-shrink-0 border border-[#EF4444]/40">
                          PREORDER
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[9px] sm:text-[10px] text-[#A9B3C7]">{item.dosage}</p>
                      {!item.isFree && !productExcludesVolumeBundle(item.productId, item.name) && (
                        <span className="px-1 py-0.5 rounded bg-[rgba(34,197,94,0.15)] text-[#22C55E] text-[7px] sm:text-[8px] font-bold">
                          {getMarketingBundleOffLabel(item.quantity)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      {!item.isFree ? (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.dosage, item.quantity - 1, !!item.isPreorder)
                            }
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[rgba(244,246,250,0.08)] flex items-center justify-center hover:bg-[rgba(244,246,250,0.15)] transition-colors"
                          >
                            <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#F4F6FA]" />
                          </button>
                          <span className="text-[10px] sm:text-xs font-medium text-[#F4F6FA] w-3 sm:w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.dosage, item.quantity + 1, !!item.isPreorder)
                            }
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[rgba(244,246,250,0.08)] flex items-center justify-center hover:bg-[rgba(244,246,250,0.15)] transition-colors"
                          >
                            <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#F4F6FA]" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-[#8B5CF6]">Gift item</span>
                      )}
                      <span className={`text-[10px] sm:text-xs font-medium ${item.isFree ? 'text-[#8B5CF6]' : 'text-[#2ED1B4]'}`}>
                        {item.isFree ? 'FREE' : `$${(item.price * item.quantity).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                  {!item.isFree && (
                    <button
                      onClick={() => removeItem(item.productId, item.dosage, !!item.isPreorder)}
                      className="p-0.5 sm:p-1 h-fit rounded-full hover:bg-[rgba(244,246,250,0.08)] transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#A9B3C7]" />
                    </button>
                  )}
                </div>
              ))}

              {/* Suggested: all Essentials category products from Supabase (one query) */}
              {items.length > 0 && suggestedToShow.length > 0 && (
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[rgba(244,246,250,0.08)]">
                  <p className="text-[10px] sm:text-xs text-[#A9B3C7] mb-2">You might also need:</p>
                  <div className="space-y-1.5 sm:space-y-2">
                    {suggestedToShow.map((s) => (
                      <div
                        key={s.productId}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]"
                      >
                        <img
                          src={getOptimizedProductImageUrl(s.image, { width: 96 })}
                          alt={s.name}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded bg-[rgba(7,10,18,0.5)]"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-[#F4F6FA] truncate">{s.name}</p>
                          <p className="text-[9px] sm:text-[10px] text-[#A9B3C7] truncate">{s.dosage}</p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="flex flex-col items-end leading-tight">
                            {s.discountEnabled && s.savings > 0 && !productExcludesVolumeBundle(s.productId, s.name) ? (
                              <span className="text-[9px] sm:text-[10px] text-[#A9B3C7] line-through">
                                ${s.originalPrice.toFixed(2)}
                              </span>
                            ) : null}
                            <span className="text-xs sm:text-sm font-medium text-[#2ED1B4]">
                              ${s.unitPrice.toFixed(2)}
                            </span>
                            {s.discountEnabled && s.savings > 0 && !productExcludesVolumeBundle(s.productId, s.name) ? (
                              <span className="text-[9px] sm:text-[10px] text-[#22C55E] font-medium">
                                {`Save ${s.discountPercentage}% ($${s.savings.toFixed(2)})`}
                              </span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddSuggested(s)}
                            disabled={!s.inStock}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors ${
                              s.inStock
                                ? 'bg-[#2ED1B4] hover:bg-[#25b89d]'
                                : 'bg-[rgba(169,179,199,0.3)] cursor-not-allowed'
                            }`}
                          >
                            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#070A12]" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Compact */}
        {items.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-[rgba(244,246,250,0.08)] space-y-2 sm:space-y-3">
            {/* Sydney Drop-off Service - Only for Sydney residents */}
            <div className="p-2 sm:p-2.5 rounded-lg bg-[rgba(46,209,180,0.08)] border border-[rgba(46,209,180,0.2)]">
              {!showSydneyOption ? (
                <button 
                  onClick={() => setShowSydneyOption(true)}
                  className="w-full flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2ED1B4]" />
                    <span className="text-[10px] sm:text-xs text-[#F4F6FA] font-medium">Sydney resident?</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A9B3C7]" />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setShowSydneyOption(false)}
                    className="w-full flex items-center justify-between mb-2"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2ED1B4]" />
                      <span className="text-[10px] sm:text-xs text-[#F4F6FA] font-medium">Sydney Same-Day Drop-off</span>
                    </div>
                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A9B3C7]" />
                  </button>
                  <div className="pl-5 sm:pl-6">
                    <p className="text-[9px] sm:text-[10px] text-[#A9B3C7]">
                      $50 delivery service in NSW Sydney area.{' '}
                      <a 
                        href="https://t.me/peplab" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#2ED1B4] hover:underline"
                      >
                        Message us on Telegram
                      </a>
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Savings Banner */}
            {totalSavings > 0 && (
              <div className="p-1.5 sm:p-2 rounded-lg bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.2)] flex items-center gap-1.5 sm:gap-2">
                <Tag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#22C55E]" />
                <span className="text-[10px] sm:text-xs text-[#22C55E] font-medium">
                  Saving <span className="font-bold">${totalSavings.toFixed(2)}</span>
                </span>
              </div>
            )}
            
            {/* Points Summary */}
            <div className="p-1.5 sm:p-2 rounded-lg bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8B5CF6]" />
                  <span className="text-[10px] sm:text-xs text-[#A9B3C7]">Points to earn</span>
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-[#8B5CF6]">{pointsToEarn} pts</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs sm:text-sm text-[#A9B3C7]">Subtotal</span>
              <span className="text-base sm:text-lg font-semibold text-[#F4F6FA]">
                ${paidTotal.toFixed(2)}
              </span>
            </div>
            <a 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-2 sm:py-2.5 rounded-full bg-[#2ED1B4] text-[#070A12] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-[#25b89d] transition-colors"
            >
              <span>Checkout</span>
              <span className="opacity-80">${paidTotal.toFixed(2)}</span>
            </a>
            <p className="text-[9px] sm:text-[10px] text-center text-[rgba(169,179,199,0.6)]">
              Shipping & taxes calculated at checkout
            </p>
          </div>
        )}
      </div>
    </>
  );
}
