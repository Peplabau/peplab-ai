import { useEffect, useState } from 'react';
import {
  DEFAULT_SEASONAL_THEME_SETTINGS,
  getSeasonalThemeSync,
  getSiteSetting,
  normalizeSeasonalTheme,
  type SeasonalTheme,
} from '@/lib/settings';

export const SEASONAL_PROMO_COPY: Record<
  SeasonalTheme,
  { title: string; label: string; cartNote: string; announce: string }
> = {
  christmas: {
    title: 'CHRISTMAS GIFT',
    label: 'Christmas Gift',
    cartNote: 'Christmas Gift — Free BAC Water added!',
    announce: 'Christmas Gift',
  },
  halloween: {
    title: 'HALLOWEEN TREAT',
    label: 'Halloween Treat',
    cartNote: 'Halloween Special — Free BAC Water added!',
    announce: 'Halloween Special',
  },
};

/** Admin-controlled seasonal promo theme (Christmas / Halloween). */
export function useSeasonalTheme(): SeasonalTheme {
  const [theme, setTheme] = useState<SeasonalTheme>(getSeasonalThemeSync);

  useEffect(() => {
    let cancelled = false;
    getSiteSetting('seasonal_theme_settings', DEFAULT_SEASONAL_THEME_SETTINGS)
      .then((settings) => {
        if (!cancelled) setTheme(normalizeSeasonalTheme(settings.theme));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return theme;
}
