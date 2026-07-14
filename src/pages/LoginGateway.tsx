/**
 * LoginGateway — entry pages on the login-only host (peplab.com.au / staging.*).
 *
 * Sign-in for returning members; sign-up with referral verification for new members.
 * After auth, tokens are handed off to peplab.ai so the user lands logged in.
 */
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Send,
  UserPlus,
  HelpCircle,
  CheckCircle2,
  User,
  Ticket,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';
import { supabase, signIn, signUp, getCurrentUser } from '@/lib/supabase';
import { checkIsAdmin } from '@/lib/supabase-db';
import { sendSignUpWelcome } from '@/lib/email';
import { resolvePostLoginPath } from '@/lib/login-redirect';
import { SEO } from '@/components/SEO';
import { buildCrossDomainLoginUrl, LOGIN_GATEWAY_PAGE_TITLE } from '@/lib/domain';
import { CONFIG } from '@/lib/config';
import { getSiteSetting, DEFAULT_SUPPORT_LINKS } from '@/lib/settings';
import { validateSignupReferralCode } from '@/lib/signup-referral';

const VERIFICATION_PENDING_COPY =
  "Your account is created. We've also sent a quick confirmation email — open it to finish setting up your dashboard access.";

const REF_STORAGE_KEY = 'peplab_ref';

function friendlyAuthErrorMessage(raw: string | undefined | null): string {
  const m = (raw || '').trim();
  if (/email\s+not\s+confirmed/i.test(m)) {
    return "We've sent a confirmation email — open it to finish setting up your account.";
  }
  if (/invalid\s+login\s+credentials/i.test(m)) {
    return "That email and password don't match an account we have on file. Double-check your details, or use the options below if you're new.";
  }
  if (/user\s+already\s+registered/i.test(m)) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  return m || 'Something went wrong. Please try again.';
}

export default function LoginGateway() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSignUp =
    location.pathname === '/signup' ||
    (() => {
      const mode = searchParams.get('signup') ?? searchParams.get('mode');
      return mode === '1' || mode === 'true' || mode === 'signup';
    })();

  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewMemberHelp, setShowNewMemberHelp] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: '',
  });
  const [referralFromLink, setReferralFromLink] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [telegramLink, setTelegramLink] = useState(CONFIG.SOCIAL.TELEGRAM);
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_SUPPORT_LINKS.whatsapp_link);

  const getReferrerIdFromUrl = (): string | null => {
    const params = new URLSearchParams(window.location.search || '');
    let ref = params.get('ref');
    if (ref && /^[0-9a-f-]{36}$/i.test(ref)) {
      try {
        sessionStorage.setItem(REF_STORAGE_KEY, ref);
      } catch {
        /* ignore */
      }
      return ref;
    }
    try {
      ref = sessionStorage.getItem(REF_STORAGE_KEY);
      return ref && /^[0-9a-f-]{36}$/i.test(ref) ? ref : null;
    } catch {
      return null;
    }
  };

  const clearStoredRef = () => {
    try {
      sessionStorage.removeItem(REF_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const redirectAfterAuth = useCallback(async () => {
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

    setError('Signed in, but we could not continue automatically. Please try signing in again.');
    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSiteSetting('telegram_link', { url: DEFAULT_SUPPORT_LINKS.telegram_link }),
      getSiteSetting('whatsapp_link', { url: DEFAULT_SUPPORT_LINKS.whatsapp_link }),
    ])
      .then(([telegramVal, whatsappVal]) => {
        if (cancelled) return;
        setTelegramLink((telegramVal as { url?: string })?.url || DEFAULT_SUPPORT_LINKS.telegram_link);
        setWhatsappLink((whatsappVal as { url?: string })?.url || '');
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      const email = decodeURIComponent(emailParam);
      setSignInData((prev) => ({ ...prev, email }));
      setSignUpData((prev) => ({ ...prev, email }));
    }

    const codeParam = searchParams.get('code') ?? searchParams.get('refcode');
    if (codeParam) {
      setSignUpData((prev) => ({ ...prev, referralCode: decodeURIComponent(codeParam) }));
    }

    if (getReferrerIdFromUrl()) {
      setReferralFromLink(true);
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const checkExisting = async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;
      if (currentUser) {
        localStorage.setItem('peplab_logged_in', 'true');
        await redirectAfterAuth();
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
        await redirectAfterAuth();
      } else {
        localStorage.removeItem('peplab_logged_in');
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [redirectAfterAuth]);

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

    const codeCheck = await validateSignupReferralCode(signUpData.referralCode);
    if (!codeCheck.valid) {
      setError(codeCheck.error);
      return null;
    }
    return codeCheck.referrerId;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(signInData.email, signInData.password);
      if (signInError) {
        setError(friendlyAuthErrorMessage(signInError.message));
        setIsLoading(false);
        return;
      }
      await redirectAfterAuth();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err);
      setError(friendlyAuthErrorMessage(msg));
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const referrerId = await resolveSignupReferrerId();
      if (!referrerId) {
        setIsLoading(false);
        return;
      }

      const { data: signUpResult, error: signUpError } = await signUp(
        signUpData.email,
        signUpData.password,
        {
          name: signUpData.name,
          referrer_id: referrerId,
        },
      );

      if (signUpError) {
        setError(friendlyAuthErrorMessage(signUpError.message));
        setIsLoading(false);
        return;
      }

      clearStoredRef();

      void sendSignUpWelcome(signUpData.email, signUpData.name).catch(() => {
        /* non-blocking */
      });

      if (signUpResult?.session) {
        const signedInUser = signUpResult.session.user;
        if (signedInUser && (await checkIsAdmin(signedInUser.id))) {
          localStorage.setItem('peplab_is_admin', 'true');
        } else {
          localStorage.removeItem('peplab_is_admin');
        }
        localStorage.setItem('peplab_logged_in', 'true');
        await redirectAfterAuth();
        return;
      }

      const { error: signInError } = await signIn(signUpData.email, signUpData.password);
      if (signInError) {
        setError(VERIFICATION_PENDING_COPY);
        setIsLoading(false);
        return;
      }

      const signedInUser = await getCurrentUser();
      if (signedInUser && (await checkIsAdmin(signedInUser.id))) {
        localStorage.setItem('peplab_is_admin', 'true');
      } else {
        localStorage.removeItem('peplab_is_admin');
      }
      await redirectAfterAuth();
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

  const pageTitle = isSignUp ? 'PEPLAB | Create account' : LOGIN_GATEWAY_PAGE_TITLE;
  const pageDescription = isSignUp
    ? 'Create your PEPLAB account with a referral code.'
    : 'Sign in to your PEPLAB account.';

  return (
    <>
      <SEO title={pageTitle} description={pageDescription} noIndex />
      <div className="min-h-screen flex flex-col" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60" />

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-8">
              <span className="text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
                PEPLAB
              </span>
              <p className="mt-3 text-sm text-[#A9B3C7]">
                {isSignUp ? 'Create your account to get started' : 'Sign in to continue to your account'}
              </p>
            </div>

            <div className="rounded-2xl bg-[rgba(17,24,39,0.75)] border border-[rgba(244,246,250,0.08)] p-6 sm:p-7 shadow-xl shadow-black/20">
              {isSignUp ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#A9B3C7] transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back to sign in
                    </Link>
                  </div>
                  <h1 className="text-xl font-semibold text-[#F4F6FA] mb-1">Create account</h1>
                  <p className="text-sm text-[#A9B3C7] mb-5">
                    Enter your referral code and details. We'll take you to your account once you're in.
                  </p>

                  {error && (
                    <div className="mb-4 p-3.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                      <p className="text-sm text-[#EF4444]">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#A9B3C7] mb-1.5">Referral code</label>
                      {referralFromLink ? (
                        <div className="flex items-center gap-3 rounded-xl bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.25)] px-4 py-3">
                          <Ticket className="w-4 h-4 text-[#22C55E] shrink-0" />
                          <p className="text-sm text-[#22C55E]">Referral link applied — you're good to sign up.</p>
                        </div>
                      ) : (
                        <div className="relative">
                          <Ticket className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                          <input
                            type="text"
                            value={signUpData.referralCode}
                            onChange={(e) =>
                              setSignUpData({
                                ...signUpData,
                                referralCode: e.target.value.toUpperCase(),
                              })
                            }
                            required
                            autoComplete="off"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#6B7280] focus:outline-none focus:border-[#2ED1B4] transition-colors text-sm uppercase tracking-wide"
                            placeholder="MEMBER-CODE"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm text-[#A9B3C7] mb-1.5">Full name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type="text"
                          value={signUpData.name}
                          onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                          required
                          autoComplete="name"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#6B7280] focus:outline-none focus:border-[#2ED1B4] transition-colors text-sm"
                          placeholder="Your name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#A9B3C7] mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type="email"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                          required
                          autoComplete="email"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#6B7280] focus:outline-none focus:border-[#2ED1B4] transition-colors text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-[#A9B3C7] mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                          required
                          minLength={8}
                          autoComplete="new-password"
                          className="w-full pl-10 pr-11 py-3 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#6B7280] focus:outline-none focus:border-[#2ED1B4] transition-colors text-sm"
                          placeholder="At least 8 characters"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F4F6FA] transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 bg-[#2ED1B4] text-[#070A12] hover:bg-[#26b89e]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create account
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-semibold text-[#F4F6FA] mb-1">Welcome back</h1>
                  <p className="text-sm text-[#A9B3C7] mb-6">
                    Enter the email and password for your existing account.
                  </p>

                  {error && (
                    <div className="mb-4 p-3.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                      <p className="text-sm text-[#EF4444]">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#A9B3C7] mb-1.5">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type="email"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          required
                          autoComplete="email"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#6B7280] focus:outline-none focus:border-[#2ED1B4] transition-colors text-sm"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-sm text-[#A9B3C7]">Password</label>
                        <a href="/forgot-password" className="text-xs text-[#2ED1B4] hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          required
                          minLength={8}
                          autoComplete="current-password"
                          className="w-full pl-10 pr-11 py-3 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#6B7280] focus:outline-none focus:border-[#2ED1B4] transition-colors text-sm"
                          placeholder="Your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#F4F6FA] transition-colors"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 bg-[#2ED1B4] text-[#070A12] hover:bg-[#26b89e]"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            {!isSignUp && (
              <div className="mt-5 rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.45)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowNewMemberHelp((open) => !open)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-[rgba(244,246,250,0.03)] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgba(139,92,246,0.15)]">
                      <HelpCircle className="h-4 w-4 text-[#8B5CF6]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#F4F6FA]">New to PEPLAB?</p>
                      <p className="text-xs text-[#A9B3C7] truncate">How to get access and create an account</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#6B7280] shrink-0">{showNewMemberHelp ? 'Hide' : 'Show'}</span>
                </button>

                {showNewMemberHelp && (
                  <div className="px-5 pb-5 border-t border-[rgba(244,246,250,0.06)]">
                    <p className="text-sm text-[#A9B3C7] leading-relaxed pt-4 mb-4">
                      To help protect PEPLAB, new accounts need a referral code from an existing member.
                    </p>

                    <ol className="space-y-3 mb-5">
                      {[
                        'Ask a current member for their referral code',
                        'Create your account here using that code',
                        'Already ordered before? Message us your order number and we\'ll help',
                      ].map((step, i) => (
                        <li key={step} className="flex items-start gap-3 text-sm text-[#A9B3C7]">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[rgba(46,209,180,0.12)] text-xs font-semibold text-[#2ED1B4]">
                            {i + 1}
                          </span>
                          <span className="pt-0.5 leading-snug">{step}</span>
                        </li>
                      ))}
                    </ol>

                    <div className="space-y-2.5">
                      <Link
                        to="/signup"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[rgba(46,209,180,0.12)] border border-[rgba(46,209,180,0.25)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.18)] transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        I have a code — create account
                      </Link>
                      <a
                        href={telegramLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[rgba(244,246,250,0.04)] border border-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#F4F6FA] hover:border-[rgba(244,246,250,0.15)] transition-colors"
                      >
                        <Send className="w-4 h-4 text-[#0088CC]" />
                        Past customer? Contact us on Telegram
                      </a>
                      {whatsappLink ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[rgba(34,197,94,0.08)] border border-[rgba(34,197,94,0.2)] text-[#A9B3C7] hover:text-[#F4F6FA] hover:border-[rgba(34,197,94,0.35)] transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 text-[#22C55E]" />
                          Past customer? Contact us on WhatsApp
                        </a>
                      ) : null}
                    </div>

                    <p className="mt-4 flex items-start gap-2 text-xs text-[#6B7280]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2ED1B4] shrink-0 mt-0.5" />
                      After signing in or signing up, you'll be redirected to the shop.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="relative z-10 px-6 py-5 text-center">
          <p className="text-xs text-[#6B7280]">© 2026 PEPLAB. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
