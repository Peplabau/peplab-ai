// PEPLAB - Complete Configuration
//
// All *non-secret* runtime settings for the client bundle. Real credentials
// come from environment variables (see `.env.example`). Reminder: anything
// referenced via `import.meta.env.VITE_*` ships in the client bundle and is
// public — never put a genuine secret behind a VITE_ variable.

export const CONFIG = {
  // Supabase (Required). Empty fallback is intentional — the real check /
  // hard failure lives in `src/lib/supabase.ts`, which is imported before
  // any UI can render.
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',

  // Email: primary path is the Supabase Edge Function `send-email` (server-
  // side; holds the real Resend key in Supabase secrets). VITE_RESEND_API_KEY
  // is a dev-only fallback via the Vite proxy — DO NOT set it in production
  // or the Resend key leaks into the public bundle.
  RESEND_API_KEY: import.meta.env.VITE_RESEND_API_KEY || '',
  // FROM_EMAIL is used server-side only (Supabase Edge Function → Resend "From:" header)
  // and by the dev-only Vite proxy path. Keep it out of the client UI.
  FROM_EMAIL: import.meta.env.VITE_FROM_EMAIL || '',
  // Public contact email intentionally left blank — customer-facing pages now
  // route enquiries through the Telegram / WhatsApp support page instead.
  SUPPORT_EMAIL: '',
  CONTACT_EMAIL: '',
  /**
   * When false (default), transactional email uses branded HTML from code — not `email_templates` body.
   * Set VITE_EMAIL_USE_SUPABASE_HTML_TEMPLATES=true only if you maintain HTML in Supabase and want that instead.
   */
  EMAIL_USE_SUPABASE_HTML_TEMPLATES: import.meta.env.VITE_EMAIL_USE_SUPABASE_HTML_TEMPLATES === 'true',

  // Google Analytics — disabled pending new GTM/GMC setup
  // GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-KPKKM59S9Y',
  GA_MEASUREMENT_ID: '',

  /** Blur COA PDF previews in the dialog (default on). Set VITE_COA_PDF_BLURRED=false to disable. */
  COA_PDF_BLURRED: import.meta.env.VITE_COA_PDF_BLURRED !== 'false',

  // Australia Post API (Optional — for live shipping rates).
  // Values come from env vars only; see `.env.example`. When the live
  // integration is enabled, move these to a Supabase Edge Function so the
  // key is not exposed in the client bundle at all.
  AUSPOST_API_KEY: import.meta.env.VITE_AUSPOST_API_KEY || '',
  AUSPOST_API_SECRET: import.meta.env.VITE_AUSPOST_API_SECRET || '',

  // Bank Transfer Details - CUSTOMER PAYS TO THIS ACCOUNT
  BANK_DETAILS: {
    ACCOUNT_NAME: 'PEPLAB',
    BSB: '062-329',
    ACCOUNT_NUMBER: '1063 8508',
    PAYID: '0451111104',
    BANK_NAME: 'Commonwealth Bank of Australia',
  },

  // Site Info
  SITE_URL: import.meta.env.VITE_SITE_URL || 'https://peplab.com.au',
  SITE_NAME: 'PEPLAB - Peptides Australia',
  SITE_DESCRIPTION: 'Premium Peptides Australia for research. Lab-tested, fast shipping, exceptional quality.',
  /** Browser tab, Apple touch, and structured-data logo (file in /public). */
  FAVICON_PATH: '/favicon.png',
  /** Open Graph / Google / social link preview (file in /public). */
  SHARE_PREVIEW_IMAGE_PATH: '/chrome-seo.jpeg',
  /** Public file in /public — full URL built with SITE_URL for the signup welcome email image. */
  WELCOME_EMAIL_IMAGE_PATH: '/welcome-email.jpeg',

  // Business Info
  BUSINESS: {
    NAME: 'PEPLAB',
    // ABN + phone number intentionally omitted from the client bundle for
    // privacy. They remain on official documentation only.
    ABN: '',
    PHONE_DISPLAY: '',
    PHONE_TEL: '',
    ADDRESS_LINES: ['30 Shepherd Street Liverpool NSW 2170, Australia'] as const,
    BUSINESS_HOURS: 'Mon-Fri, 9:00 AM - 5:00 PM AEST',
  },

  // Social Links
  SOCIAL: {
    TELEGRAM: 'https://t.me/peplabau',
  },

  /** Trustpilot — review link is only shown to verified purchasers (dashboard + order emails). */
  TRUSTPILOT: {
    REVIEW_URL: 'https://www.trustpilot.com/evaluate/peplab.com.au',
    PROFILE_URL: 'https://www.trustpilot.com/review/peplab.com.au',
  },

  // Shipping
  SHIPPING: {
    FREE_THRESHOLD: 250,
    EXPRESS_PRICE: 15,
    STANDARD_PRICE: 10,
    SYDNEY_DROPOFF_PRICE: 50,
  },

  // Rewards
  // NOTE: kept in sync with src/context/RewardsContext.tsx, which is the
  // *active* source of truth. Nothing in the app currently reads this mirror,
  // but external tooling / docs sometimes import from `@/lib/config`, so the
  // shape stays accurate.
  REWARDS: {
    POINTS_PER_DOLLAR: 1,
    REDEMPTION_TIERS: [
      { points: 100, value: 5, label: '$5 off' },
      { points: 500, value: 25, label: '$25 off' },
      { points: 1000, value: 50, label: '$50 off' },
      { points: 2500, value: 125, label: '$125 off' },
      { points: 5000, value: 250, label: '$250 off' },
      { points: 10000, value: 500, label: '$500 off' },
    ],
  },

  // Features
  FEATURES: {
    ENABLE_REVIEWS: true,
    ENABLE_WISHLIST: true,
    ENABLE_NEWSLETTER: true,
    ENABLE_LIVE_CHAT: true,
    ENABLE_ANALYTICS: true,
    /** First-visit welcome popup. Set VITE_ENABLE_SIGNUP_WELCOME_MODAL=false to disable. */
    ENABLE_SIGNUP_WELCOME_MODAL: import.meta.env.VITE_ENABLE_SIGNUP_WELCOME_MODAL !== 'false',
    /** Show COA links and certificate dialog on product cards and detail pages. */
    ENABLE_STOREFRONT_COA: true,
  },
};

// Helper to check if config is valid
export const isConfigValid = () => {
  return CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;
};
