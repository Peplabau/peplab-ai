import { useEffect, useRef } from 'react';
import { CONFIG } from '@/lib/config';

declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, reload?: boolean) => void;
    };
  }
}

const TRUSTPILOT_SCRIPT_ID = 'trustpilot-bootstrap';
const TRUSTPILOT_SCRIPT_SRC =
  'https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js';

function ensureTrustpilotScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Trustpilot?.loadFromElement) return Promise.resolve();

  const existing = document.getElementById(TRUSTPILOT_SCRIPT_ID) as HTMLScriptElement | null;

  const waitForApi = () =>
    new Promise<void>((resolve) => {
      if (window.Trustpilot?.loadFromElement) {
        resolve();
        return;
      }
      const started = Date.now();
      const poll = window.setInterval(() => {
        if (window.Trustpilot?.loadFromElement || Date.now() - started > 10000) {
          window.clearInterval(poll);
          resolve();
        }
      }, 100);
    });

  if (existing) {
    return waitForApi();
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = TRUSTPILOT_SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = TRUSTPILOT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      void waitForApi().then(resolve);
    };
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

type TrustpilotTrustBoxProps = {
  templateId: string;
  height: string;
  className?: string;
  /** Optional Trustpilot widget token from embed code. */
  token?: string;
  /** Filter stars when supported by the template (e.g. "1,2,3,4,5"). */
  stars?: string;
  theme?: 'dark' | 'light';
  locale?: string;
};

export default function TrustpilotTrustBox({
  templateId,
  height,
  className = '',
  token,
  stars,
  theme = 'dark',
  locale = 'en-AU',
}: TrustpilotTrustBoxProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const businessUnitId = CONFIG.TRUSTPILOT.BUSINESS_UNIT_ID;

  useEffect(() => {
    const element = widgetRef.current;
    if (!element || !businessUnitId) return;

    let cancelled = false;
    let retryTimer: number | null = null;

    const load = () => {
      if (cancelled || !widgetRef.current || !window.Trustpilot?.loadFromElement) return;
      window.Trustpilot.loadFromElement(widgetRef.current, true);
    };

    void ensureTrustpilotScript().then(() => {
      if (cancelled) return;
      load();
      // SPA / lazy mount: retry once after paint in case the first call raced the iframe.
      retryTimer = window.setTimeout(load, 400);
    });

    const onVisible = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      if (retryTimer != null) window.clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [businessUnitId, templateId, height, token, stars, theme, locale]);

  if (!businessUnitId) return null;

  return (
    <div
      ref={widgetRef}
      className={`trustpilot-widget ${className}`.trim()}
      data-locale={locale}
      data-template-id={templateId}
      data-businessunit-id={businessUnitId}
      data-style-height={height}
      data-style-width="100%"
      data-theme={theme}
      {...(token ? { 'data-token': token } : {})}
      {...(stars ? { 'data-stars': stars } : {})}
    >
      <a href={CONFIG.TRUSTPILOT.PROFILE_URL} target="_blank" rel="noopener noreferrer">
        Trustpilot
      </a>
    </div>
  );
}
