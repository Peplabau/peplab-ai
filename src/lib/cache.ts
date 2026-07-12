/**
 * Lightweight TTL cache with optional localStorage persistence.
 *
 * - Memory cache  → ultra-fast, per-tab, survives React re-renders.
 * - Persist flag  → serialises to localStorage so the next hard-refresh / new
 *   tab gets data instantly and only re-fetches after the TTL has expired.
 * - Stale-while-revalidate (SWR) flag → returns stale data immediately and
 *   kicks off a background refresh, eliminating loading states on repeat visits.
 */

const PREFIX = 'peplab_cache_';
const CACHE_VERSION = 'v3';
const VERSION_KEY = 'peplab_cache_version';

// On first load after a cache-version bump, wipe all stale persisted entries
// so corrupt/empty data from a previous deployment doesn't block product fetches.
try {
  if (localStorage.getItem(VERSION_KEY) !== CACHE_VERSION) {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX)) localStorage.removeItem(k);
    }
    localStorage.setItem(VERSION_KEY, CACHE_VERSION);
  }
} catch { /* private mode / quota — ignore */ }

interface Entry<T> {
  data: T;
  expiresAt: number;
}

const memory = new Map<string, Entry<unknown>>();

/** Write a value to memory (and optionally localStorage).
 *  Empty arrays are stored in memory but NOT persisted — a failed first fetch
 *  should never poison the localStorage cache for future hard reloads. */
export function setCache<T>(key: string, data: T, ttlMs: number, persist = false): void {
  const entry: Entry<T> = { data, expiresAt: Date.now() + ttlMs };
  memory.set(key, entry as Entry<unknown>);
  const isEmpty = Array.isArray(data) && (data as unknown[]).length === 0;
  if (persist && !isEmpty) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(entry));
    } catch {
      // localStorage may be unavailable (private mode, quota exceeded)
    }
  }
}

/** Read a value; returns `null` on miss, expiry, or if the stored value is null/undefined. */
export function getCache<T>(key: string, persist = false): T | null {
  const mem = memory.get(key);
  if (mem) {
    if (mem.expiresAt > Date.now()) {
      return mem.data != null ? (mem.data as T) : null;
    }
    memory.delete(key);
  }

  if (persist) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      if (raw) {
        const entry = JSON.parse(raw) as Entry<T>;
        if (entry.expiresAt > Date.now() && entry.data != null) {
          memory.set(key, entry as Entry<unknown>); // promote to memory
          return entry.data;
        }
        localStorage.removeItem(PREFIX + key);
      }
    } catch {
      // ignore parse / storage errors — treat as cache miss
      try { localStorage.removeItem(PREFIX + key); } catch { /* ignore */ }
    }
  }

  return null;
}

/** Remove all entries whose key starts with `prefix`. */
export function invalidateCache(prefix: string): void {
  for (const k of [...memory.keys()]) {
    if (k.startsWith(prefix)) memory.delete(k);
  }
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIX + prefix)) localStorage.removeItem(k);
    }
  } catch {
    // ignore
  }
}

/**
 * Fetch-or-cache helper.
 *
 * @param key      Cache key.
 * @param fetcher  Async function that produces the data.
 * @param ttlMs    How long to keep the value (milliseconds).
 * @param persist  Whether to persist to localStorage.
 * @param swr      Stale-while-revalidate: return stale data immediately while
 *                 refreshing in the background (great for non-critical reads).
 *                 Only applies when a persist-cached (potentially stale) value exists.
 */
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  persist = false,
  swr = false,
): Promise<T> {
  const hit = getCache<T>(key, persist);

  if (hit !== null) {
    if (swr) {
      // Fire background refresh — deliberately not awaited
      fetcher()
        .then((fresh) => setCache(key, fresh, ttlMs, persist))
        .catch(() => {/* silently ignore background errors */ });
    }
    return hit;
  }

  const data = await fetcher();
  setCache(key, data, ttlMs, persist);
  return data;
}

// ─── TTL constants (milliseconds) ──────────────────────────────────────────

/** Public product list — persist + SWR so catalog shows instantly on return. */
export const TTL_PRODUCTS = 5 * 60 * 1000;  // 5 min
/** Per-product page — persist so PDPs load instantly. */
export const TTL_PRODUCT = 5 * 60 * 1000;  // 5 min
/** Site settings (prices/discounts) — persist, rarely changes. */
export const TTL_SETTINGS = 10 * 60 * 1000;  // 10 min
/** Homepage reviews — memory-only, refresh after 3 min. */
export const TTL_REVIEWS = 3 * 60 * 1000;  // 3 min
/** Admin check — memory-only, long TTL for the session. */
export const TTL_ADMIN = 30 * 60 * 1000;  // 30 min
/** Slug → UUID lookup — rarely changes. */
export const TTL_UUID = 30 * 60 * 1000;  // 30 min
/** Per-user review count — short, in-session. */
export const TTL_USER_SHORT = 60 * 1000;        // 1 min
/** Per-user orders — refresh every 2 minutes. */
export const TTL_USER_ORDERS = 2 * 60 * 1000;  // 2 min
/** Per-user reviews list — refresh every 2 minutes. */
export const TTL_USER_REVIEWS = 2 * 60 * 1000;  // 2 min

// ─── Admin section TTLs (memory-only — never persisted, data is sensitive) ──

/** Overview stats — refresh every minute. */
export const TTL_ADMIN_OVERVIEW = 60 * 1000;   // 1 min
/** All orders — short, payment status changes frequently. */
export const TTL_ADMIN_ORDERS = 30 * 1000;   // 30 s
/** Admin product list (includes inactive) — refresh every minute. */
export const TTL_ADMIN_PRODUCTS = 60 * 1000;   // 1 min
/** User list + balances — refresh every 2 minutes. */
export const TTL_ADMIN_USERS = 120 * 1000;   // 2 min
/** Reviews list — refresh every minute. */
export const TTL_ADMIN_REVIEWS = 60 * 1000;   // 1 min
