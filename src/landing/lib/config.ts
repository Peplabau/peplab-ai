import { LANDING_SITE_URL, MAIN_SITE_URL } from '@/landing/lib/site';

export const CONFIG = {
  SITE_URL: LANDING_SITE_URL,
  MAIN_SITE_URL,
  SHARE_PREVIEW_IMAGE_PATH: '/chrome-seo.jpeg',
  FAVICON_PATH: '/favicon.png',
  SITE_DESCRIPTION: 'Premium Peptides Australia for research. Lab-tested, fast shipping, exceptional quality.',
  CONTACT_EMAIL: 'contact@peplab.com.au',
  BUSINESS: {
    PHONE_TEL: '+61451111104',
    PHONE_DISPLAY: '+61 451 111 104',
    ADDRESS_LINES: ['30 Shepherd Street Liverpool NSW 2170, Australia'] as const,
    BUSINESS_HOURS: 'Mon-Fri, 9:00 AM - 5:00 PM AEST',
  },
  SOCIAL: {
    TELEGRAM: 'https://t.me/peplabau',
  },
} as const;
