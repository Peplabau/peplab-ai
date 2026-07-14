import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, ShoppingBag, History, Shield, Gift, TrendingUp, Users, Award, Sparkles, Zap, Ticket } from 'lucide-react';
import { useRewards, REDEMPTION_TIERS, BONUS_POINTS } from '@/context/RewardsContext';
import { supabase, signUp, signIn, getCurrentUser } from '@/lib/supabase';
import { checkIsAdmin } from '@/lib/supabase-db';
import { sendSignUpWelcome } from '@/lib/email';
import { resolvePostLoginPath } from '@/lib/login-redirect';
import { SEO } from '@/components/SEO';
import { isLoginOnlyDomain, buildCrossDomainLoginUrl, mainAppUrl } from '@/lib/domain';
import { validateSignupReferralCode } from '@/lib/signup-referral';

// Friendly fallback message in case the Supabase project still has
// "Confirm email" enabled. With email-confirmation OFF (recommended), users
// land in their dashboard immediately and never see this copy.
const VERIFICATION_PENDING_COPY =
  "Your account is created. We've also sent a quick confirmation email — open it to finish setting up your dashboard access.";

/** Map raw Supabase auth errors to friendlier storefront copy. */
function friendlyAuthErrorMessage(raw: string | undefined | null): string {
  const m = (raw || '').trim();
  if (/email\s+not\s+confirmed/i.test(m)) return VERIFICATION_PENDING_COPY;
  if (/invalid\s+login\s+credentials/i.test(m)) {
    return "That email and password combination doesn't match an account. Double-check your details or create a new account.";
  }
  if (/user\s+already\s+registered/i.test(m)) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  return m || 'Something went wrong. Please try again.';
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(() => {
    const mode = searchParams.get('signup') ?? searchParams.get('mode');
    return mode === '1' || mode === 'true' || mode === 'signup';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: '',
  });
  const [referralFromLink, setReferralFromLink] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useRewards();

  const redirectAfterLogin = useCallback(async () => {
    const destination = await resolvePostLoginPath(searchParams.get('redirect'));

    // On peplab.com.au (login-only host) we can't leave the user here — the
    // shop lives on peplab.ai. Hand the freshly-issued Supabase tokens off
    // to the main app via a URL hash fragment. See `src/lib/domain.ts`.
    if (isLoginOnlyDomain()) {
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
      // Fallback: session unexpectedly missing — send them to peplab.ai's
      // login (they'll have to sign in again there) rather than looping here.
      window.location.replace(mainAppUrl(`/login?redirect=${encodeURIComponent(destination)}`));
      return;
    }

    navigate(destination);
  }, [navigate, searchParams]);

  const checkUser = useCallback(async () => {
    const currentUser = await getCurrentUser();
    if (currentUser) {
      localStorage.setItem('peplab_logged_in', 'true');
      await redirectAfterLogin();
      return;
    }
    localStorage.removeItem('peplab_logged_in');
    setIsLoading(false);
  }, [redirectAfterLogin]);

  // Check for existing session on mount
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      void event;
      const nextUser = session?.user ?? null;
      if (nextUser) {
        localStorage.setItem('peplab_logged_in', 'true');
        await redirectAfterLogin();
      } else {
        localStorage.removeItem('peplab_logged_in');
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [checkUser, redirectAfterLogin]);

  const REF_STORAGE_KEY = 'peplab_ref';

  /** Get referrer user id from URL (?ref=...) or sessionStorage (so ref survives navigation from home to login). */
  const getReferrerIdFromUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search || '');
    let ref = params.get('ref');
    if (ref && /^[0-9a-f-]{36}$/i.test(ref)) {
      try {
        sessionStorage.setItem(REF_STORAGE_KEY, ref);
      } catch (err) {
        void err;
      }
      return ref;
    }
    try {
      ref = sessionStorage.getItem(REF_STORAGE_KEY);
      return ref && /^[0-9a-f-]{36}$/i.test(ref) ? ref : null;
    } catch (err) {
      void err;
      return null;
    }
  };

  /** Clear stored ref after use (so we don't award twice). */
  const clearStoredRef = () => {
    try {
      sessionStorage.removeItem(REF_STORAGE_KEY);
    } catch (err) {
      void err;
    }
  };

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: decodeURIComponent(emailParam) }));
    }

    const codeParam = searchParams.get('code') ?? searchParams.get('refcode');
    if (codeParam) {
      setFormData((prev) => ({ ...prev, referralCode: decodeURIComponent(codeParam) }));
    }

    if (getReferrerIdFromUrl()) {
      setReferralFromLink(true);
    }
  }, [searchParams]);

  const resolveSignupReferrerId = async (): Promise<string | null> => {
    const linkedRef = getReferrerIdFromUrl();
    if (linkedRef) {
      const linkedCheck = await validateSignupReferralCode(linkedRef);
      if (!linkedCheck.valid) {
        setError(linkedCheck.error);
        return null;
      }
      return linkedCheck.referrerId;
    }

    const codeCheck = await validateSignupReferralCode(formData.referralCode);
    if (!codeCheck.valid) {
      setError(codeCheck.error);
      return null;
    }
    return codeCheck.referrerId;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const referrerId = await resolveSignupReferrerId();
        if (!referrerId) {
          setIsLoading(false);
          return;
        }

        const { data: signUpData, error: signUpError } = await signUp(
          formData.email,
          formData.password,
          {
            name: formData.name,
            referrer_id: referrerId,
          },
        );

        if (signUpError) {
          setError(friendlyAuthErrorMessage(signUpError.message));
          return;
        }

        // Fire-and-forget the branded welcome email (with rewards info + hero
        // image). It is sent regardless of whether a session was returned.
        void sendSignUpWelcome(formData.email, formData.name);
        clearStoredRef();

        // When "Confirm email" is disabled at the Supabase project level
        // (recommended), signUp already returns a live session — the user is
        // logged in and we can go straight to the dashboard, no second auth
        // round-trip required.
        if (signUpData?.session) {
          // onAuthStateChange in the effect above will pick this up and route
          // the user, but we also navigate explicitly to feel instant.
          const signedInUser = signUpData.session.user;
          if (signedInUser && (await checkIsAdmin(signedInUser.id))) {
            localStorage.setItem('peplab_is_admin', 'true');
          } else {
            localStorage.removeItem('peplab_is_admin');
          }
          localStorage.setItem('peplab_logged_in', 'true');
          await redirectAfterLogin();
          return;
        }

        // Fallback: the Supabase project still requires email confirmation.
        // Try a password sign-in once (some projects allow it), otherwise
        // show a clear, non-blocking success message instead of an error.
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          setError(VERIFICATION_PENDING_COPY);
          return;
        }
      } else {
        // Sign in
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          setError(friendlyAuthErrorMessage(signInError.message));
          return;
        }
      }
      // Check if logged-in user is admin → redirect accordingly
      const signedInUser = await getCurrentUser();
      if (signedInUser && (await checkIsAdmin(signedInUser.id))) {
        localStorage.setItem('peplab_is_admin', 'true');
      } else {
        localStorage.removeItem('peplab_is_admin');
      }
      await redirectAfterLogin();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      setError(friendlyAuthErrorMessage(msg));
    } finally {
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
      <SEO title="Sign in | PEPLAB" noIndex />
    <div className="min-h-screen flex flex-col" style={{ background: '#070A12' }}>
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Navigation */}
      <nav className="relative z-50 px-6 lg:px-12 py-4">
        <div className="flex items-center justify-between">
          <a href={isLoginOnlyDomain() ? mainAppUrl('/') : '/'} className="flex flex-col items-start">
            <span className="text-3xl lg:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
              PEPLAB
            </span>
            <span className="text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">
              PEPTIDES AUSTRALIA
            </span>
          </a>
          <a
            href={isLoginOnlyDomain() ? mainAppUrl('/') : '/'}
            className="flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-6 lg:py-8 flex-1 flex items-center">
        <div className="max-w-md mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-5">
            <span className="eyebrow mb-2 block">MEMBERS AREA</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#F4F6FA] mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-[#A9B3C7]">
              {isSignUp
                ? 'Enter your referral code to create your PEPLAB account'
                : 'Sign in to access your account and rewards'}
            </p>
          </div>

          {isSignUp && (
            <div className="mb-4 p-4 rounded-xl bg-[rgba(46,209,180,0.08)] border border-[rgba(46,209,180,0.2)]">
              <p className="text-sm text-[#A9B3C7] leading-relaxed">
                New accounts need a referral code from an existing member. Past customers without a code can contact support with their order number.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
              <p className="text-sm text-[#EF4444]">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
            {/* {isSignUp && (
              <div className="mb-5 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[rgba(46,209,180,0.10)] to-[rgba(139,92,246,0.10)] border border-[rgba(46,209,180,0.25)] p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(46,209,180,0.18)]">
                  <Zap className="h-4 w-4 text-[#2ED1B4]" />
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-[#F4F6FA]">Instant access — no verification required</p>
                  <p className="text-xs text-[#A9B3C7]">You'll be in your dashboard the moment you tap the button below.</p>
                </div>
              </div>
            )} */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm text-[#A9B3C7] mb-2">Referral code</label>
                  {referralFromLink ? (
                    <div className="flex items-center gap-3 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] px-4 py-3">
                      <Ticket className="w-5 h-5 text-[#22C55E] shrink-0" />
                      <p className="text-sm text-[#22C55E]">Referral link applied — you&apos;re good to sign up.</p>
                    </div>
                  ) : (
                    <div className="relative">
                      <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                      <input
                        type="text"
                        value={formData.referralCode}
                        onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors uppercase tracking-wide"
                        placeholder="MEMBER-CODE"
                        autoComplete="off"
                      />
                    </div>
                  )}
                </div>
              )}

              {isSignUp && (
                <div>
                  <label className="block text-sm text-[#A9B3C7] mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A9B3C7]" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#A9B3C7] focus:outline-none focus:border-[#2ED1B4] transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              )}

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
                  {!isSignUp && (
                    <a href="/forgot-password" className="text-xs text-[#2ED1B4] hover:underline">
                      Forgot password?
                    </a>
                  )}
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
                    {isSignUp ? 'Setting up your dashboard...' : 'Signing In...'}
                  </>
                ) : isSignUp ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Create my account
                  </>
                ) : (
                  <>Sign In</>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[rgba(244,246,250,0.1)]" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-[#111827] text-xs text-[#A9B3C7]">or</span>
              </div>
            </div>

            <p className="text-center text-sm text-[#A9B3C7]">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-[#2ED1B4] hover:underline font-medium"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.4)] border border-[rgba(244,246,250,0.05)] text-center">
              <History className="w-6 h-6 text-[#8B5CF6] mx-auto mb-2" />
              <p className="text-sm text-[#F4F6FA] font-medium">Track Orders</p>
              <p className="text-xs text-[#A9B3C7]">View purchase history</p>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.4)] border border-[rgba(244,246,250,0.05)] text-center">
              <Shield className="w-6 h-6 text-[#F59E0B] mx-auto mb-2" />
              <p className="text-sm text-[#F4F6FA] font-medium">Secure Account</p>
              <p className="text-xs text-[#A9B3C7]">Protected access</p>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.4)] border border-[rgba(244,246,250,0.05)] text-center">
              <Gift className="w-6 h-6 text-[#22C55E] mx-auto mb-2" />
              <p className="text-sm text-[#F4F6FA] font-medium">Earn Points</p>
              <p className="text-xs text-[#A9B3C7]">1 pt per $1 spent</p>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(17,24,39,0.4)] border border-[rgba(244,246,250,0.05)] text-center">
              <Award className="w-6 h-6 text-[#2ED1B4] mx-auto mb-2" />
              <p className="text-sm text-[#F4F6FA] font-medium">Get Rewards</p>
              <p className="text-xs text-[#A9B3C7]">Redeem for discounts</p>
            </div>
          </div>

          {/* Rewards Preview */}
          <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-[rgba(139,92,246,0.1)] to-[rgba(46,209,180,0.1)] border border-[rgba(139,92,246,0.2)]">
            <div className="flex items-center gap-3 mb-3">
              <Award className="w-6 h-6 text-[#8B5CF6]" />
              <h3 className="text-lg font-semibold text-[#F4F6FA]">PEPLAB Rewards Program</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-[#A9B3C7]">
                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                <span>1 point per $1 spent</span>
              </div>
              <div className="flex items-center gap-2 text-[#A9B3C7]">
                <User className="w-4 h-4 text-[#8B5CF6]" />
                <span>{BONUS_POINTS.ACCOUNT_CREATION} pts on signup</span>
              </div>
              <div className="flex items-center gap-2 text-[#A9B3C7]">
                <ShoppingBag className="w-4 h-4 text-[#F59E0B]" />
                <span>{BONUS_POINTS.FIRST_PURCHASE} pts first order</span>
              </div>
              <div className="flex items-center gap-2 text-[#A9B3C7]">
                <Users className="w-4 h-4 text-[#2ED1B4]" />
                <span>{BONUS_POINTS.REFERRAL} pts per referral</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[rgba(244,246,250,0.08)]">
              <p className="text-xs text-[#A9B3C7] mb-2">Redemption Tiers:</p>
              <div className="flex flex-wrap gap-2">
                {REDEMPTION_TIERS.map((tier) => (
                  <span
                    key={tier.points}
                    className="px-2 py-1 rounded-md bg-[rgba(7,10,18,0.5)] text-xs text-[#A9B3C7]"
                  >
                    {tier.points} pts = {tier.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-4 border-t border-[rgba(244,246,250,0.08)]">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-[#A9B3C7]">
            © 2026 PEPLAB. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
    </>
  );
}
