import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { supabase } from '@/lib/supabase'
import { CROSS_DOMAIN_LOGIN_HASH_TYPE, applyLoginGatewayDocumentBranding } from '@/lib/domain'

/**
 * Consume a cross-domain login handoff (from peplab.com.au → peplab.ai)
 * *before* the React tree mounts. Doing it here avoids a flash of the
 * un-authed shop while `supabase.auth.setSession(...)` completes.
 *
 * The URL looks like:
 *   https://peplab.ai/#access_token=…&refresh_token=…&type=cross-domain-login&next=/dashboard
 *
 * We only ever accept this handoff on the *target* domain, so a malicious
 * link served on peplab.com.au can't hijack a session there.
 */
async function consumeCrossDomainLoginHandoff(): Promise<void> {
  const rawHash = window.location.hash;
  if (!rawHash || rawHash.length < 2) return;

  const hashParams = new URLSearchParams(rawHash.slice(1));
  if (hashParams.get('type') !== CROSS_DOMAIN_LOGIN_HASH_TYPE) return;

  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  const next = hashParams.get('next') ?? '/dashboard';

  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';

  const cleanUrl = window.location.origin + safeNext;

  if (!accessToken || !refreshToken) {
    window.history.replaceState(null, '', cleanUrl);
    return;
  }

  try {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (err) {
    console.error('Cross-domain login handoff failed:', err);
  } finally {
    window.history.replaceState(null, '', cleanUrl);
  }
}

async function boot() {
  applyLoginGatewayDocumentBranding();
  await consumeCrossDomainLoginHandoff();
  createRoot(document.getElementById('root')!).render(<App />);
}

void boot();
