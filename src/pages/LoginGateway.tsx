/**
 * LoginGateway
 *
 * The login page mounted on the login-only host (peplab.com.au / staging.*).
 *
 * Deliberately much smaller than the full storefront `Login.tsx`:
 *   - Sign-in only. No sign-up form, no signup toggle, no rewards preview.
 *   - Shows a referral-gate notice explaining why sign-up is not available
 *     here and how existing customers can obtain a referral code.
 *   - After a successful sign-in, hands the freshly-issued Supabase tokens
 *     off to the main app (peplab.ai) via `buildCrossDomainLoginUrl`.
 *
 * The full-featured `Login.tsx` continues to power sign-in AND sign-up on
 * peplab.ai — this file only affects the locked-down entry domain.
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase, signIn, getCurrentUser } from '@/lib/supabase';
import { resolvePostLoginPath } from '@/lib/login-redirect';
import { SEO } from '@/components/SEO';
import { buildCrossDomainLoginUrl, mainAppUrl, LOGIN_GATEWAY_PAGE_TITLE } from '@/lib/domain';

/** Map raw Supabase auth errors to friendlier storefront copy. */
function friendlyAuthErrorMessage(raw: string | undefined | null): string {
  const m = (raw || '').trim();
  if (/email\s+not\s+confirmed/i.test(m)) {
    return "We've sent a confirmation email — open it to finish setting up your account.";
  }
  if (/invalid\s+login\s+credentials/i.test(m)) {
    return "That email and password combination doesn't match an account. If you're new, request a referral code first.";
  }
  return m || 'Something went wrong. Please try again.';
}

export default function LoginGateway() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  /**
   * Where to send the browser once we have a live Supabase session.
   *
   * Always redirects off this login-only host onto the main app, carrying
   * the fresh access + refresh tokens in the URL hash. If the session isn't
   * available for any reason we fall back to peplab.ai's own /login so the
   * user can sign in again there rather than looping on this page.
   */
  const redirectAfterLogin = useCallback(async () => {
    const destination = await resolvePostLoginPath(searchParams.get('redirect'));

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token && session?.refresh_token) {
      window.location.replace(
        buildCrossDomainLoginUrl({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          next: destination,
        }),
      );
      return;
    }

    window.location.replace(mainAppUrl(`/login?redirect=${encodeURIComponent(destination)}`));
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;
      if (currentUser) {
        localStorage.setItem('peplab_logged_in', 'true');
        await redirectAfterLogin();
        return;
      }
      localStorage.removeItem('peplab_logged_in');
      setIsLoading(false);
    };

    checkExisting();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        localStorage.setItem('peplab_logged_in', 'true');
        await redirectAfterLogin();
      } else {
        localStorage.removeItem('peplab_logged_in');
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [redirectAfterLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(formData.email, formData.password);
      if (signInError) {
        setError(friendlyAuthErrorMessage(signInError.message));
        setIsLoading(false);
        return;
      }
      // onAuthStateChange will pick up the new session and drive the redirect,
      // but we also call it explicitly so the transition feels instant.
      await redirectAfterLogin();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      setError(friendlyAuthErrorMessage(msg));
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#070A12' }}>
        <div className="w-8 h-8 border-2 border-[#2ED1B4] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <SEO title={LOGIN_GATEWAY_PAGE_TITLE} description="Sign in to your PEPLAB account." noIndex />
      <div className="min-h-screen flex flex-col" style={{ background: '#070A12' }}>
        {/* Grid Overlay */}
        <div className="absolute inset-0 grid-overlay opacity-60" />

        {/* Navigation — just the wordmark. No "Back to Shop" link since the
            shop lives on a different domain and we want to keep this host
            locked to the auth flow. */}
        <nav className="relative z-50 px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start">
              <span className="text-3xl lg:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
                PEPLAB
              </span>
              <span className="text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">
                PEPTIDES AUSTRALIA
              </span>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="relative z-10 px-6 lg:px-12 py-6 lg:py-8 flex-1 flex items-center">
          <div className="max-w-md mx-auto w-full">
            {/* Welcome / referral gate message */}
            <div className="mb-6 rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.10)] to-[rgba(46,209,180,0.10)] border border-[rgba(139,92,246,0.25)] p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(139,92,246,0.20)]">
                  <ShieldCheck className="h-4 w-4 text-[#8B5CF6]" />
                </div>
                <h2 className="text-lg font-semibold text-[#F4F6FA] leading-tight">
                  Welcome to PEPLAB
                </h2>
              </div>
              <p className="text-sm text-[#A9B3C7] leading-relaxed mb-3">
                To help protect PEPLAB, new accounts require a referral code from an existing member.
              </p>
              <p className="text-sm text-[#A9B3C7] leading-relaxed">
                If you&apos;ve previously ordered from PEPLAB but don&apos;t have a referral code,
                contact us with your order number. We&apos;ll verify your purchase and provide you
                with a referral code to unlock sign up.
              </p>
            </div>

            {/* Header */}
            <div className="text-center mb-5">
              <span className="eyebrow mb-2 block">MEMBERS AREA</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F6FA] mb-2">
                Welcome Back
              </h1>
              <p className="text-[#A9B3C7]">Sign in to access your account and rewards</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                <p className="text-sm text-[#EF4444]">{error}</p>
              </div>
            )}

            {/* Sign-in form */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm text-[#A9B3C7] mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-[#A9B3C7]">Password</label>
                    <a href="/forgot-password" className="text-xs text-[#2ED1B4] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={8}
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 bg-[#2ED1B4] text-[#070A12] hover:bg-[#26b89e]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>Sign In</>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 px-6 lg:px-12 py-4 border-t border-[rgba(244,246,250,0.08)]">
          <div className="max-w-md mx-auto text-center">
            <p className="text-xs text-[#A9B3C7]">© 2026 PEPLAB. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
