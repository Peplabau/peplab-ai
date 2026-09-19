/**
 * Centralized points utility.
 * All point calculation logic must go through this file.
 * User balances are never stored — they are always derived from
 * SELECT SUM(points) FROM user_points WHERE user_id = ?.
 */

/** Points awarded automatically when a new account is created (via DB trigger). */
export const SIGNUP_BONUS = 50;

/** Points awarded for placing the very first paid order. */
export const FIRST_ORDER_BONUS = 100;

/** Points awarded once per calendar year on the member's birthday. */
export const BIRTHDAY_BONUS = 200;

/** Points awarded per dollar spent (1 pt per $1). */
export const POINTS_PER_DOLLAR = 1;

/**
 * When the customer uses a referral/promo code that applies a cart discount,
 * purchase points are reduced by this amount (on top of 1 pt per $1 subtotal).
 */
export const DISCOUNT_PROMO_PURCHASE_POINTS_DEDUCTION = 100;

export type CalculatePurchasePointsOptions = {
  promoDiscountApplied?: boolean;
  /**
   * Loyalty cashback % (5–10). Scales the earn rate so 5% = 1 pt/$1,
   * 6% = 1.2 pt/$1, …, 10% = 2 pt/$1. Defaults to base Member rate (5%).
   */
  cashbackPercent?: number;
};

/**
 * Calculate how many purchase points to award for a given order total.
 * Base Member rate is 1 point per $1 (5% cashback). Higher loyalty tiers
 * earn more points per dollar so effective cashback matches the tier %.
 * Optional penalty when a discount promo (referral) code was applied.
 */
export function calculatePurchasePoints(
  orderTotal: number,
  options?: CalculatePurchasePointsOptions,
): number {
  const cashbackPercent = options?.cashbackPercent ?? 5;
  const rate = (Number(cashbackPercent) || 5) / 5;
  const base = Math.floor(orderTotal * POINTS_PER_DOLLAR * rate);
  if (options?.promoDiscountApplied) {
    return Math.max(0, base - DISCOUNT_PROMO_PURCHASE_POINTS_DEDUCTION);
  }
  return base;
}

/** Supported point event types. */
export type PointType =
  | 'signup'
  | 'first_order'
  | 'purchase'
  | 'referral'
  | 'birthday'
  | 'admin_adjustment'
  | 'redeemed'
  | 'revoked';

/** Human-readable label for each point type. */
export const POINT_TYPE_LABELS: Record<PointType, string> = {
  signup:           'Signup Bonus',
  first_order:      'First Order Bonus',
  purchase:         'Purchase Points',
  referral:         'Referral Bonus',
  birthday:         'Birthday Gift',
  admin_adjustment: 'Admin Adjustment',
  redeemed:         'Points Redeemed',
  revoked:          'Points Removed',
};
