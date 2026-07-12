import { supabase } from './supabase';
import { cached, invalidateCache, TTL_SETTINGS } from './cache';

export interface BankDetails {
  account_name: string;
  bsb: string;
  account_number: string;
  payid: string;
  bank_name: string;
}

export interface DiscountSettings {
  enabled: boolean;
  badge_text: string;
  show_percentage: boolean;
  badge_position: string;
  /** Whether the global storefront price discount is active. */
  discount_enabled: boolean;
  /** Buy 1 — percentage off the original price (e.g. 20 = 20% off). */
  discount_percentage: number;
  /** Buy 2 — extra percentage off after Buy 1 discount. */
  buy2_percentage: number;
  /** Buy 3 — extra percentage off after Buy 1 discount. */
  buy3_percentage: number;
}

export interface FreeGiftSettings {
  enabled: boolean;
  threshold: number;
  product_id: string;
  dosage: string;
  name: string;
}

export interface SupportLinks {
  telegram_link: string;
  whatsapp_link: string;
}

export interface LandingPageSettings {
  enabled: boolean;
}

/** Site-wide affiliate / referral promo codes at checkout (?aff=, manual apply). */
export interface AffiliateProgramSettings {
  /** When false, no referral codes can be applied and stored codes are ignored. */
  codes_enabled: boolean;
}

/** Scrolling research disclaimer on the shop catalog page. */
export interface ResearchDisclaimerSettings {
  message: string;
}

// Default values (fallback)
export const DEFAULT_BANK_DETAILS: BankDetails = {
  account_name: 'PEPLAB',
  bsb: '062-329',
  account_number: '1063 8508',
  payid: '0451111104',
  bank_name: 'Commonwealth Bank of Australia',
};

export const DEFAULT_DISCOUNT_SETTINGS: DiscountSettings = {
  enabled: true,
  badge_text: 'SAVE',
  show_percentage: true,
  badge_position: 'top-right',
  discount_enabled: true,
  discount_percentage: 20,
  buy2_percentage: 5,
  buy3_percentage: 10,
};

export const DEFAULT_FREE_GIFT_SETTINGS: FreeGiftSettings = {
  enabled: true,
  threshold: 300,
  product_id: 'bac-water',
  dosage: '3 mL',
  name: 'BAC Water',
};

export const DEFAULT_SUPPORT_LINKS: SupportLinks = {
  telegram_link: 'https://t.me/PepLabAu',
  whatsapp_link: '',
};

export const DEFAULT_LANDING_PAGE_SETTINGS: LandingPageSettings = {
  enabled: true,
};

export const DEFAULT_AFFILIATE_PROGRAM_SETTINGS: AffiliateProgramSettings = {
  codes_enabled: true,
};

export const DEFAULT_RESEARCH_DISCLAIMER_SETTINGS: ResearchDisclaimerSettings = {
  message: 'For Research Purposes Only — Not For Human Consumption',
};

export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
  return cached(
    `setting:${key}`,
    async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', key)
          .maybeSingle();

        if (error || !data) {
          console.warn(`Setting ${key} not found, using default`);
          return defaultValue;
        }

        const raw = data as { value?: Record<string, unknown> | null };
        const value = raw?.value && typeof raw.value === 'object' && !Array.isArray(raw.value) ? raw.value : {};
        return { ...defaultValue, ...value } as T;
      } catch (err) {
        console.error(`Error fetching setting ${key}:`, err);
        return defaultValue;
      }
    },
    TTL_SETTINGS,
    true,  // persist to localStorage
    true,  // SWR
  );
}

// Update settings (admin only) — invalidates the cache so next read is fresh
export async function updateSiteSetting<T>(
  key: string,
  value: T
): Promise<boolean> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('update_site_setting', {
      p_key: key,
      p_value: value,
      p_user_id: user.id,
    });

    if (error) throw error;

    // Bust relevant cache entries so the next read fetches fresh data
    invalidateCache(`setting:${key}`);
    invalidateCache('all_settings');
    return true;
  } catch (err) {
    console.error(`Error updating setting ${key}:`, err);
    return false;
  }
}

// Normalize a single row's value (JSONB) into a plain object
function normalizeValue(val: unknown): Record<string, unknown> {
  if (val && typeof val === 'object' && !Array.isArray(val)) return val as Record<string, unknown>;
  return {};
}

// Fetch all rows from site_settings via RPC (bypasses RLS) or direct select — cached
export async function fetchAllSiteSettings(): Promise<{
  bankDetails: BankDetails;
  discountSettings: DiscountSettings;
  freeGiftSettings: FreeGiftSettings;
  supportLinks: SupportLinks;
  landingPageSettings: LandingPageSettings;
  affiliateProgramSettings: AffiliateProgramSettings;
  researchDisclaimerSettings: ResearchDisclaimerSettings;
}> {
  const defaults = {
    bankDetails: DEFAULT_BANK_DETAILS,
    discountSettings: DEFAULT_DISCOUNT_SETTINGS,
    freeGiftSettings: DEFAULT_FREE_GIFT_SETTINGS,
    supportLinks: DEFAULT_SUPPORT_LINKS,
    landingPageSettings: DEFAULT_LANDING_PAGE_SETTINGS,
    affiliateProgramSettings: DEFAULT_AFFILIATE_PROGRAM_SETTINGS,
    researchDisclaimerSettings: DEFAULT_RESEARCH_DISCLAIMER_SETTINGS,
  };

  try {
    const { data: rpcRows, error: rpcError } = await supabase.rpc('get_all_site_settings');

    if (!rpcError && Array.isArray(rpcRows) && rpcRows.length > 0) {
      const byKey: Record<string, Record<string, unknown>> = {};
      for (const row of rpcRows as { key?: string; value?: unknown }[]) {
        const key = row?.key;
        if (key != null) byKey[key] = normalizeValue(row.value);
      }
    
      const telegramVal = byKey['telegram_link'] as { url?: unknown } | undefined;
      const whatsappVal = byKey['whatsapp_link'] as { url?: unknown } | undefined;
      return {
        bankDetails: { ...DEFAULT_BANK_DETAILS, ...byKey['bank_details'] } as BankDetails,
        discountSettings: { ...DEFAULT_DISCOUNT_SETTINGS, ...byKey['discount_settings'] } as DiscountSettings,
        freeGiftSettings: { ...DEFAULT_FREE_GIFT_SETTINGS, ...byKey['free_gift_settings'] } as FreeGiftSettings,
        supportLinks: {
          telegram_link: (telegramVal?.url as string) || DEFAULT_SUPPORT_LINKS.telegram_link,
          whatsapp_link: (whatsappVal?.url as string) || DEFAULT_SUPPORT_LINKS.whatsapp_link,
        },
        landingPageSettings: { ...DEFAULT_LANDING_PAGE_SETTINGS, ...byKey['landing_page_settings'] } as LandingPageSettings,
        affiliateProgramSettings: { ...DEFAULT_AFFILIATE_PROGRAM_SETTINGS, ...byKey['affiliate_program_settings'] } as AffiliateProgramSettings,
        researchDisclaimerSettings: { ...DEFAULT_RESEARCH_DISCLAIMER_SETTINGS, ...byKey['research_disclaimer_settings'] } as ResearchDisclaimerSettings,
      };
    }

    const { data: rows, error } = await supabase
      .from('site_settings')
      .select('key, value');

    if (error) throw error;

    const byKey: Record<string, Record<string, unknown>> = {};
    if (Array.isArray(rows) && rows.length > 0) {
      for (const row of rows) {
        const key = (row as { key?: string }).key;
        const value = (row as { value?: unknown }).value;
        if (key != null) byKey[key] = normalizeValue(value);
      }
    
      const telegramVal = byKey['telegram_link'] as { url?: unknown } | undefined;
      const whatsappVal = byKey['whatsapp_link'] as { url?: unknown } | undefined;
      return {
        bankDetails: { ...DEFAULT_BANK_DETAILS, ...byKey['bank_details'] } as BankDetails,
        discountSettings: { ...DEFAULT_DISCOUNT_SETTINGS, ...byKey['discount_settings'] } as DiscountSettings,
        freeGiftSettings: { ...DEFAULT_FREE_GIFT_SETTINGS, ...byKey['free_gift_settings'] } as FreeGiftSettings,
        supportLinks: {
          telegram_link: (telegramVal?.url as string) || DEFAULT_SUPPORT_LINKS.telegram_link,
          whatsapp_link: (whatsappVal?.url as string) || DEFAULT_SUPPORT_LINKS.whatsapp_link,
        },
        landingPageSettings: { ...DEFAULT_LANDING_PAGE_SETTINGS, ...byKey['landing_page_settings'] } as LandingPageSettings,
        affiliateProgramSettings: { ...DEFAULT_AFFILIATE_PROGRAM_SETTINGS, ...byKey['affiliate_program_settings'] } as AffiliateProgramSettings,
        researchDisclaimerSettings: { ...DEFAULT_RESEARCH_DISCLAIMER_SETTINGS, ...byKey['research_disclaimer_settings'] } as ResearchDisclaimerSettings,
      };
    }

    return defaults;
  } catch (err) {
    console.error('Error fetching all site settings:', err);
    return defaults;
  }
}

// Get all settings at once — cached
export function getAllSettings() {
  return cached('all_settings', fetchAllSiteSettings, TTL_SETTINGS, true, true);
}
