import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

export type ThemeMode = 'dark' | 'light';

const STORAGE_KEY = 'peplab_theme';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readStoredTheme(): ThemeMode {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/** Auth + admin stay dark; every other public route can use the home light theme. */
const DARK_ONLY_PATHS = new Set([
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/admin/login',
  '/admin/dashboard',
]);

export function isHomeThemePreviewPath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path.startsWith('/admin')) return false;
  if (DARK_ONLY_PATHS.has(path)) return false;
  return true;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readStoredTheme);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/** Syncs `data-theme-preview="home"` while light mode is on any public (non-admin/auth) route. */
export function ThemePreviewSync() {
  const { theme } = useTheme();
  const { pathname } = useLocation();
  const lightPreviewActive = theme === 'light' && isHomeThemePreviewPath(pathname);

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    if (lightPreviewActive) {
      root.dataset.themePreview = 'home';
      root.style.colorScheme = 'light';
    } else {
      delete root.dataset.themePreview;
      root.style.colorScheme = 'dark';
    }

    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.setAttribute('content', lightPreviewActive ? '#F7F9FC' : '#070A12');
    }

    return () => {
      delete root.dataset.themePreview;
      root.style.colorScheme = 'dark';
      if (themeColor) themeColor.setAttribute('content', '#070A12');
    };
  }, [theme, lightPreviewActive]);

  return null;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}

/** True when the sitewide light shop redesign is active on the current public route. */
export function useLightShopPreview(): boolean {
  const { theme } = useTheme();
  const { pathname } = useLocation();
  return theme === 'light' && isHomeThemePreviewPath(pathname);
}
