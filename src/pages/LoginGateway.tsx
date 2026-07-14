/**
 * LoginGateway — the entry page on the login-only host (peplab.com.au / staging.*).
 *
 * Sign-in only. New members are directed to peplab.ai to create an account
 * with a verified referral code.
 */
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
} from 'lucide-react';
import { supabase, signIn, getCurrentUser } from '@/lib/supabase';
import { resolvePostLoginPath } from '@/lib/login-redirect';
import { SEO } from '@/components/SEO';
import { buildCrossDomainLoginUrl, mainAppUrl, LOGIN_GATEWAY_PAGE_TITLE } from '@/lib/domain';
import { CONFIG } from '@/lib/config';
import { getSiteSetting, DEFAULT_SUPPORT_LINKS } from '@/lib/settings';

function friendlyAuthErrorMessage(raw: string | undefined | null): string {
  const m = (raw || '').trim();
  if (/email\s+not\s+confirmed/i.test(m)) {
    return "We've sent a confirmation email — open it to finish setting up your account.";
  }
  if (/invalid\s+login\s+credentials/i.test(m)) {
    return "That email and password don't match an account we have on file. Double-check your details, or use the options below if you're new.";
  }
  return m || 'Something went wrong. Please try again.';
}

export default function LoginGateway() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewMemberHelp, setShowNewMemberHelp] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [telegramLink, setTelegramLink] = useState(CONFIG.SOCIAL.TELEGRAM);

  const signupUrl = mainAppUrl('/login?signup=1');

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
    (async () => {
      try {
        const telegramVal = await getSiteSetting('telegram_link', {
          url: DEFAULT_SUPPORT_LINKS.telegram_link,
        });
        if (!cancelled) {
          setTelegramLink((telegramVal as { url?: string })?.url || DEFAULT_SUPPORT_LINKS.telegram_link);
        }
      } catch {
        /* keep default */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
        <div className="absolute inset-0 grid-overlay opacity-60" />

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-[420px]">
            {/* Logo */}
            <div className="text-center mb-8">
              <span className="text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
                PEPLAB
              </span>
              <p className="mt-3 text-sm text-[#A9B3C7]">Sign in to continue to your account</p>
            </div>

            {/* Sign-in card */}
            <div className="rounded-2xl bg-[rgba(17,24,39,0.75)] border border-[rgba(244,246,250,0.08)] p-6 sm:p-7 shadow-xl shadow-black/20">
              <h1 className="text-xl font-semibold text-[#F4F6FA] mb-1">Welcome back</h1>
              <p className="text-sm text-[#A9B3C7] mb-6">
                Enter the email and password for your existing account.
              </p>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                  <p className="text-sm text-[#EF4444]">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A9B3C7] mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </div>

            {/* New member section */}
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
                      'Create your account on peplab.ai using that code',
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
                    <a
                      href={signupUrl}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[rgba(46,209,180,0.12)] border border-[rgba(46,209,180,0.25)] text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.18)] transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      I have a code — create account
                    </a>
                    <a
                      href={telegramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-[rgba(244,246,250,0.04)] border border-[rgba(244,246,250,0.08)] text-[#A9B3C7] hover:text-[#F4F6FA] hover:border-[rgba(244,246,250,0.15)] transition-colors"
                    >
                      <Send className="w-4 h-4 text-[#0088CC]" />
                      Past customer? Contact us on Telegram
                    </a>
                  </div>

                  <p className="mt-4 flex items-start gap-2 text-xs text-[#6B7280]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2ED1B4] shrink-0 mt-0.5" />
                    After sign-in you&apos;ll be taken straight to your PEPLAB dashboard.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="relative z-10 px-6 py-5 text-center">
          <p className="text-xs text-[#6B7280]">© 2026 PEPLAB. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
