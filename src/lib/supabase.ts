import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import { mainAppUrl } from '@/lib/domain';

// PEPLAB Supabase Configuration
//
// These values are injected at build time from environment variables
// (`.env` locally, Vercel project env vars in production). There is
// intentionally no source-code fallback — see `.env.example` for the
// values you need to set. The anon key is public by design (protected
// by Row Level Security on the DB), but hardcoding it in a JS file
// means it lands in git history, so we keep it out of source.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const missing = [
    !SUPABASE_URL ? 'VITE_SUPABASE_URL' : null,
    !SUPABASE_ANON_KEY ? 'VITE_SUPABASE_ANON_KEY' : null,
  ]
    .filter(Boolean)
    .join(', ');
  throw new Error(
    `[peplab] Missing required Supabase env var(s): ${missing}. ` +
      `Copy .env.example → .env locally, and set the same values in Vercel ` +
      `Project Settings → Environment Variables for every environment.`,
  );
}

/** Prevents hung tabs after long backgrounding: native fetch has no default timeout. */
const FETCH_TIMEOUT_MS = 15_000;
/** Hard cap on how long any auth read may block before we fall back to cached data. */
const AUTH_READ_TIMEOUT_MS = 2_500;

const SUPABASE_PROJECT_REF = SUPABASE_URL.match(/https?:\/\/([^.]+)\./)?.[1] ?? '';
const AUTH_STORAGE_KEY = SUPABASE_PROJECT_REF ? `sb-${SUPABASE_PROJECT_REF}-auth-token` : '';

function combineAbortSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.any === 'function') {
    return AbortSignal.any([a, b]);
  }
  const merged = new AbortController();
  const abort = () => {
    merged.abort();
  };
  if (a.aborted || b.aborted) {
    abort();
    return merged.signal;
  }
  a.addEventListener('abort', abort);
  b.addEventListener('abort', abort);
  return merged.signal;
}

/**
 * Wraps fetch so requests fail fast instead of hanging indefinitely (common after
 * a tab sleeps for hours and the browser leaves TCP connections in a bad state).
 */
export const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const outer = init?.signal;
  const signal = outer ? combineAbortSignals(controller.signal, outer) : controller.signal;
  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer));
};

/** Same as Supabase default no-op when navigator.locks is unavailable — avoids hard-refresh deadlocks from the Lock API. */
async function authNoOpLock(
  _name: string,
  _acquireTimeout: number,
  fn: () => PromiseLike<unknown> | unknown,
): Promise<unknown> {
  return await fn();
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { fetch: fetchWithTimeout },
  db: { timeout: FETCH_TIMEOUT_MS },
  auth: {
    lock: authNoOpLock,
  },
});

/**
 * Read the persisted session straight from localStorage — bypasses the auth client's
 * internal lock entirely. The token may be expired (the auto-refresh ticker keeps it
 * fresh in the background) but it's always available immediately.
 */
function readPersistedSessionFromStorage(): Session | null {
  if (!AUTH_STORAGE_KEY) return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.access_token && parsed.user?.id) {
      return parsed as Session;
    }
  } catch {
    // ignore parse / storage errors
  }
  return null;
}

function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    Promise.resolve(promise).then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
    );
  });
}

/**
 * THE CORE FIX.
 *
 * Every PostgREST query (`supabase.from(...).select(...)`) internally calls
 * `supabase.auth.getSession()` to fetch the access token. After a long backgrounded
 * period, the auth client's lock can wedge — making `getSession()` (and therefore every
 * single Supabase query) hang forever before it ever reaches the network. That's the
 * "no console, no network, just keep loading" behaviour we were seeing.
 *
 * We monkey-patch `getSession` so it always resolves within AUTH_READ_TIMEOUT_MS:
 *   1. Race the real `getSession()` against a short timer.
 *   2. If the real call wins, use its result.
 *   3. If the timer wins (lock is wedged), synthesize a result from the persisted
 *      session in localStorage. The token may be slightly stale, but PostgREST will
 *      either succeed or 401 (which the UI handles) — never hang.
 *
 * The auth client's auto-refresh ticker still runs in the background and keeps the
 * persisted session fresh, so once the network recovers the stale-token window closes
 * automatically.
 */
const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
supabase.auth.getSession = async function patchedGetSession() {
  const real = await withTimeout(originalGetSession(), AUTH_READ_TIMEOUT_MS);
  if (real && real.data) return real;
  const fallback = readPersistedSessionFromStorage();
  return { data: { session: fallback }, error: null } as Awaited<ReturnType<typeof originalGetSession>>;
};

export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  return user?.user_metadata?.role === 'admin';
};

// Auth helpers
//
// NOTE: For the frictionless "no verification" signup UX, make sure
// "Confirm email" is DISABLED in the Supabase Dashboard
// (Authentication → Sign In / Up → Email). With it disabled, `signUp` returns
// a live session immediately and users land in their dashboard with no extra
// step. The `emailRedirectTo` below is only a safety-net for projects that
// still have confirmation enabled — clicking the link returns the user
// straight to /dashboard instead of a generic Supabase page.
export const signUp = async (email: string, password: string, metadata?: object) => {
  // Always land verification-email clicks on the main app (peplab.ai) — even
  // when signup happens on the login-only host — so users never bounce back
  // to peplab.com.au after confirming their email.
  const dashboardUrl = mainAppUrl('/dashboard');
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
      emailRedirectTo: dashboardUrl,
    },
  });
};

export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

/**
 * Fast logout for UI buttons.
 *
 * `supabase.auth.signOut()` defaults to `scope: 'global'`, which makes a
 * network round-trip to /logout *before* the local session is cleared. On a
 * slow connection (or after the tab has been backgrounded and TCP sockets are
 * stale) that call can stall for many seconds — during which the user clicks
 * "Logout" and nothing visible happens, until they reload the page and finally
 * land on /login.
 *
 * To make the button feel instant we:
 *   1. Capture the current access token *before* we touch the session, so the
 *      background revocation call still has credentials to send.
 *   2. Wipe our own auth-related localStorage flags synchronously.
 *   3. Run a `scope: 'local'` signOut — clears the persisted Supabase session
 *      and fires `SIGNED_OUT` on every `onAuthStateChange` listener. No
 *      network call, so React can navigate immediately.
 *   4. Fire-and-forget a real `/logout` request in the background to revoke
 *      the refresh token server-side. Failures are ignored because the local
 *      session is already gone; the worst case is a stale refresh token that
 *      will expire on its own.
 */
export const signOut = async () => {
  let accessToken: string | undefined;
  try {
    const { data } = await supabase.auth.getSession();
    accessToken = data.session?.access_token ?? undefined;
  } catch {
    // ignore — we'll still do a local sign-out
  }

  try {
    localStorage.removeItem('peplab_logged_in');
    localStorage.removeItem('peplab_is_admin');
  } catch { /* ignore quota / disabled-storage */ }

  const result = await supabase.auth.signOut({ scope: 'local' });

  if (accessToken) {
    void fetchWithTimeout(`${SUPABASE_URL}/auth/v1/logout?scope=global`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
    }).catch(() => {
      // network may be offline / slow; local session is already cleared
    });
  }

  return result;
};

/**
 * Prefer this over `supabase.auth.getUser()` for UI: `getUser()` always hits the Auth
 * HTTP API and can stall after the tab has been backgrounded. Our patched `getSession`
 * already has a timeout + localStorage fallback so this never hangs.
 */
export const getCurrentUser = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
};

export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};
