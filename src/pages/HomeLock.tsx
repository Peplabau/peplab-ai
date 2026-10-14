/**
 * Home lock for `/` on peplab.ai.
 * Logo, sign-in, Telegram, WhatsApp, and a shop link to peplab.com.au.
 * A successful sign-in hands the session to peplab.com.au.
 */
import { useEffect, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail, MessageCircle, Send, ShoppingBag } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { AU_SITE_ORIGIN } from '@/lib/domain';
import { handoffToAuSite } from '@/lib/login-redirect';
import { DEFAULT_SUPPORT_LINKS, getSiteSetting } from '@/lib/settings';
import { getCurrentUser, signIn, supabase } from '@/lib/supabase';

const SHOP_HREF = `${AU_SITE_ORIGIN}/shop`;

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

export default function HomeLock() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [telegramLink, setTelegramLink] = useState(DEFAULT_SUPPORT_LINKS.telegram_link);
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_SUPPORT_LINKS.whatsapp_link);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getSiteSetting('telegram_link', { url: DEFAULT_SUPPORT_LINKS.telegram_link }),
      getSiteSetting('whatsapp_link', { url: DEFAULT_SUPPORT_LINKS.whatsapp_link }),
    ])
      .then(([telegramVal, whatsappVal]) => {
        if (cancelled) return;
        const tg = (telegramVal as { url?: string })?.url?.trim();
        const wa = (whatsappVal as { url?: string })?.url?.trim();
        setTelegramLink(tg || DEFAULT_SUPPORT_LINKS.telegram_link);
        setWhatsappLink(wa || DEFAULT_SUPPORT_LINKS.whatsapp_link);
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const leaveIfSignedIn = async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;
      if (currentUser) {
        await handoffToAuSite('/shop');
        return;
      }
      setIsLoading(false);
    };

    void leaveIfSignedIn();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled || !session?.user) return;
      await handoffToAuSite('/shop');
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(friendlyAuthErrorMessage(signInError.message));
        setIsLoading(false);
        return;
      }
      await handoffToAuSite('/shop');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
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
      <SEO
        title="PEPLAB | Sign in"
        description="Sign in to PEPLAB. The research catalogue and checkout are on peplab.com.au."
      />
      <div className="min-h-screen flex flex-col" style={{ background: '#070A12' }}>
        <div className="absolute inset-0 grid-overlay opacity-60" />

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
          <div className="w-full max-w-[420px]">
            <div className="text-center mb-6">
              <span className="text-4xl sm:text-5xl font-bold tracking-[0.12em] gradient-text leading-none">
                PEPLAB
              </span>
              <p className="mt-2 font-mono text-[10px] sm:text-xs uppercase tracking-[0.45em] text-[#8B5CF6]">
                Peptides Australia
              </p>
            </div>

            <div className="mb-5 space-y-2.5">
              <a
                href={SHOP_HREF}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold bg-[rgba(46,209,180,0.16)] border border-[rgba(46,209,180,0.4)] text-[#F4F6FA] hover:bg-[rgba(46,209,180,0.24)] transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-[#2ED1B4] shrink-0" />
                Shop
              </a>
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold bg-[rgba(0,136,204,0.14)] border border-[rgba(0,136,204,0.35)] text-[#F4F6FA] hover:bg-[rgba(0,136,204,0.22)] transition-colors"
                >
                  <Send className="w-4 h-4 text-[#0088CC] shrink-0" />
                  Telegram
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.35)] text-[#F4F6FA] hover:bg-[rgba(34,197,94,0.2)] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#22C55E] shrink-0" />
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="rounded-2xl bg-[rgba(17,24,39,0.75)] border border-[rgba(244,246,250,0.08)] p-6 sm:p-7 shadow-xl shadow-black/20">
              <h1 className="text-xl font-semibold text-[#F4F6FA] mb-1">Welcome back</h1>
              <p className="text-sm text-[#A9B3C7] mb-6">
                Sign in to continue on peplab.com.au.
              </p>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)]">
                  <p className="text-sm text-[#EF4444]">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#A9B3C7] mb-1.5" htmlFor="home-lock-email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      id="home-lock-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[rgba(7,10,18,0.55)] border border-[rgba(244,246,250,0.1)] text-[#F4F6FA] placeholder-[#6B7280] focus:outline-none focus:border-[#2ED1B4] transition-colors text-sm"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm text-[#A9B3C7]" htmlFor="home-lock-password">
                      Password
                    </label>
                    <a href="/forgot-password" className="text-xs text-[#2ED1B4] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                    <input
                      id="home-lock-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
