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
  if (window.Trustpilot) return Promise.resolve();

  const existing = document.getElementById(TRUSTPILOT_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve) => {
      if (window.Trustpilot) {
        resolve();
        return;
      }
      existing.addEventListener('load', () => resolve(), { once: true });
      const poll = window.setInterval(() => {
        if (window.Trustpilot) {
          window.clearInterval(poll);
          resolve();
        }
      }, 150);
      window.setTimeout(() => {
        window.clearInterval(poll);
        resolve();
      }, 8000);
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.id = TRUSTPILOT_SCRIPT_ID;
    script.type = 'text/javascript';
    script.src = TRUSTPILOT_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

type TrustpilotTrustBoxProps = {
  templateId: string;
  height: string;
  className?: string;
  /** Optional Trustpilot widget token (shown in embed code on Plus plans). */
  token?: string;
  /** Filter to 4–5 star reviews only when supported by the template. */
  stars?: '4,5';
};

export default function TrustpilotTrustBox({
  templateId,
  height,
  className = '',
  token,
  stars,
}: TrustpilotTrustBoxProps) {
  const widgetRef = useRef<HTMLDivElement>(null);
  const businessUnitId = CONFIG.TRUSTPILOT.BUSINESS_UNIT_ID;

  useEffect(() => {
    const element = widgetRef.current;
    if (!element || !businessUnitId) return;

    let cancelled = false;

    void ensureTrustpilotScript().then(() => {
      if (cancelled || !widgetRef.current) return;
      window.Trustpilot?.loadFromElement(widgetRef.current, true);
    });

    return () => {
      cancelled = true;
    };
  }, [businessUnitId, templateId, height, token, stars]);

  if (!businessUnitId) return null;

  return (
    <div
      ref={widgetRef}
      className={`trustpilot-widget ${className}`.trim()}
      data-locale="en-AU"
      data-template-id={templateId}
      data-businessunit-id={businessUnitId}
      data-style-height={height}
      data-style-width="100%"
      data-theme="dark"
      {...(token ? { 'data-token': token } : {})}
      {...(stars ? { 'data-stars': stars } : {})}
    >
      <a href={CONFIG.TRUSTPILOT.PROFILE_URL} target="_blank" rel="noopener noreferrer">
        Trustpilot
      </a>
    </div>
  );
}
