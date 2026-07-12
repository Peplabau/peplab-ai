import { CONFIG } from '@/lib/config';
import { LANDING_PATH } from '@/lib/routes';

export const SIGNUP_WELCOME_STORAGE_KEY = 'peplab_signup_welcome_v1';

export function isSignupWelcomeEnabled(): boolean {
  return CONFIG.FEATURES.ENABLE_SIGNUP_WELCOME_MODAL;
}

/** Routes where the signup welcome modal should not appear. */
const EXCLUDED_PATH_PREFIXES = [
  '/admin',
  '/checkout',
  '/login',
  '/dashboard',
  '/settings',
  '/forgot-password',
  '/reset-password',
];

export function isSignupWelcomeExcludedPath(pathname: string): boolean {
  const path = pathname || '/';
  return EXCLUDED_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function hasDismissedSignupWelcome(): boolean {
  try {
    return localStorage.getItem(SIGNUP_WELCOME_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissSignupWelcome(): void {
  try {
    localStorage.setItem(SIGNUP_WELCOME_STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
}

/** Delay before showing — longer on home / landing so brand splash can finish first. */
export function getSignupWelcomeDelayMs(pathname: string): number {
  const path = pathname || '/';
  if (path === '/' || path === '' || path === LANDING_PATH) return 3200;
  return 1800;
}

/** Wait until the tab is visible before starting the popup timer (mobile Safari). */
export function whenPageVisible(callback: () => void): () => void {
  if (typeof document === 'undefined') {
    callback();
    return () => {};
  }
  if (document.visibilityState === 'visible') {
    callback();
    return () => {};
  }
  const onVisible = () => {
    if (document.visibilityState !== 'visible') return;
    document.removeEventListener('visibilitychange', onVisible);
    callback();
  };
  document.addEventListener('visibilitychange', onVisible);
  return () => document.removeEventListener('visibilitychange', onVisible);
}
