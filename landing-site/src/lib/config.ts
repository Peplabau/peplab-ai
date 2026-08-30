import { LANDING_SITE_URL, MAIN_SITE_URL } from '@/lib/site';

export const CONFIG = {
  SITE_URL: LANDING_SITE_URL,
  MAIN_SITE_URL,
  SHARE_PREVIEW_IMAGE_PATH: '/chrome-seo.jpeg',
  FAVICON_PATH: '/favicon.png',
  SITE_DESCRIPTION: 'Premium Peptides Australia for research. Lab-tested, fast shipping, exceptional quality.',
  CONTACT_EMAIL: 'peplab@proton.me',
  BUSINESS: {
    PHONE_TEL: '+61435717401',
    PHONE_DISPLAY: '+61 435 717 401',
    ADDRESS_LINES: ['30 Shepherd Street Liverpool NSW 2170, Australia'] as const,
    BUSINESS_HOURS: 'Mon-Fri, 9:00 AM - 5:00 PM AEST',
  },
  SOCIAL: {
    TELEGRAM: 'https://t.me/PeplabSupport',
  },
} as const;
