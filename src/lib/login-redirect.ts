import { SHOP_PATH } from '@/lib/routes';
import { getAdminAccess } from '@/lib/admin-access';
import { DEFAULT_LANDING_PAGE_SETTINGS, getSiteSetting } from '@/lib/settings';
import { AU_SITE_ORIGIN, buildCrossDomainLoginUrl, MAIN_APP_ORIGIN, mainAppUrl } from '@/lib/domain';
import { supabase } from '@/lib/supabase';

const DASHBOARD_PATH = '/dashboard';

/** Allow same-origin path redirects only (blocks protocol-relative URLs). */
export function sanitizeRedirectPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const decoded = decodeURIComponent(raw).trim();
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function isLandingPageEnabled(): Promise<boolean> {
  const settings = await getSiteSetting('landing_page_settings', DEFAULT_LANDING_PAGE_SETTINGS);
  return settings.enabled !== false;
}

/** Where to send a customer after login, based on admin landing toggle and ?redirect=. */
export async function resolvePostLoginPath(
  redirectParam: string | null | undefined,
  userId?: string | null,
): Promise<string> {
  const safeRedirect = sanitizeRedirectPath(redirectParam ?? null);
  if (safeRedirect) return safeRedirect;

  if (userId) {
    const access = await getAdminAccess(userId);
    if (access === 'landing') return '/admin/dashboard';
  }

  const landingEnabled = await isLandingPageEnabled();
  return landingEnabled ? DASHBOARD_PATH : SHOP_PATH;
}

/**
 * Send the current session from a login-only host (peplab.com.au) to peplab.ai.
 * Tokens go in the URL hash (never sent to the server); peplab.ai consumes them in main.tsx.
 */
export async function handoffToMainApp(nextPath?: string | null): Promise<void> {
  const next = sanitizeRedirectPath(nextPath) ?? '/';
  if (typeof window === 'undefined') return;

  const currentOrigin = window.location.origin.replace(/\/+$/, '');
  if (currentOrigin === MAIN_APP_ORIGIN) {
    window.location.assign(`${MAIN_APP_ORIGIN}${next}`);
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token && session.refresh_token) {
    window.location.assign(
      buildCrossDomainLoginUrl({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        next,
      }),
    );
    return;
  }

  window.location.assign(mainAppUrl(next));
}

/**
 * Send the current session from the peplab.ai home lock to peplab.com.au.
 * Tokens travel in the URL hash so the .com.au app can sign the same user in.
 */
export async function handoffToAuSite(nextPath: string = '/shop'): Promise<void> {
  const next = sanitizeRedirectPath(nextPath) ?? '/shop';
  if (typeof window === 'undefined') return;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token && session.refresh_token) {
    window.location.assign(
      buildCrossDomainLoginUrl(
        {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          next,
        },
        AU_SITE_ORIGIN,
      ),
    );
    return;
  }

  window.location.assign(`${AU_SITE_ORIGIN}${next}`);
}
