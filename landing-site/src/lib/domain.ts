import { LANDING_SITE_URL, MAIN_SITE_URL } from '@/lib/site';

/** Hostname shown in footers, e.g. peplab.com.au */
export function siteHostname(): string {
  try {
    return new URL(LANDING_SITE_URL || MAIN_SITE_URL).hostname;
  } catch {
    return 'peplab.com.au';
  }
}
