import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import {
  dismissSignupWelcome,
  getSignupWelcomeDelayMs,
  hasDismissedSignupWelcome,
  isSignupWelcomeEnabled,
  isSignupWelcomeExcludedPath,
  whenPageVisible,
} from '@/lib/signup-welcome';
import { cn } from '@/lib/utils';

const FEATURE_BULLETS = [
  'EVERY BATCH TESTED',
  'SAME-DAY DISPATCH',
  '≥99% PURITY',
] as const;

export default function SignupWelcomeModal() {
  const enabled = isSignupWelcomeEnabled();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelVisibleWait: (() => void) | undefined;

    const scheduleShow = () => {
      cancelVisibleWait = whenPageVisible(() => {
        if (cancelled) return;
        const delay = getSignupWelcomeDelayMs(location.pathname);
        timer = window.setTimeout(() => {
          if (!cancelled) setOpen(true);
        }, delay);
      });
    };

    const evaluate = async () => {
      if (isSignupWelcomeExcludedPath(location.pathname)) return;
      if (hasDismissedSignupWelcome()) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          dismissSignupWelcome();
          return;
        }
      } catch {
        /* still show for logged-out visitors */
      }

      scheduleShow();
    };

    void evaluate();

    return () => {
      cancelled = true;
      cancelVisibleWait?.();
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled, location.pathname]);

  if (!enabled) return null;

  const handleClose = () => {
    dismissSignupWelcome();
    setOpen(false);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError(null);
    dismissSignupWelcome();
    setOpen(false);
    navigate(`/login?signup=1&email=${encodeURIComponent(trimmed)}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else setOpen(true);
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/65 !z-[10100]"
        className={cn(
          'gap-0 overflow-hidden border border-[rgba(244,246,250,0.14)] bg-[#070A12] p-0 outline-none ring-0',
          'w-[min(100vw-1.5rem,420px)] max-w-[420px] rounded-[1.25rem]',
          'shadow-[0_24px_64px_rgba(0,0,0,0.5)]',
          '!z-[10101]',
        )}
      >
        <DialogTitle className="sr-only">Welcome to PEPLAB</DialogTitle>
        <DialogDescription className="sr-only">
          Get 10% off your first order and earn rewards on every purchase. Enter your email to claim your discount.
        </DialogDescription>

        <DialogClose
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(139,92,246,0.4)] bg-[#070A12] text-[#A9B3C7] transition-all hover:border-[rgba(44,243,87,0.55)] hover:text-[#F4F6FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2CF357]"
          aria-label="Close"
        >
          <X size={16} strokeWidth={2.25} />
        </DialogClose>

        <div className="relative z-10 max-h-[min(90vh,680px)] overflow-y-auto px-6 pb-6 pt-7 sm:px-7 sm:pb-7 sm:pt-8">
          {/* Header */}
          <div className="mb-7 flex items-start justify-between gap-4 pr-8">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A9B3C7]">
                Welcome to
              </p>
              <span className="block text-[1.85rem] font-bold tracking-[0.12em] gradient-text leading-none sm:text-[2rem]">
                PEPLAB
              </span>
            </div>

            <div className="shrink-0 pt-0.5 text-right">
              <div className="mb-3">
                <p className="text-[2.15rem] font-extrabold leading-none tracking-[-0.04em] text-[#F4F6FA]">
                  10<span className="text-[#2CF357]">%</span>
                </p>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A9B3C7]">
                  Off first order
                </p>
              </div>
              <div>
                <p className="text-[1.85rem] font-extrabold leading-none tracking-[-0.04em] text-[#F4F6FA]">
                  +5<span className="text-[#2CF357]">%</span>
                </p>
                <p className="mt-1 max-w-[8.5rem] text-[9px] font-semibold uppercase leading-snug tracking-[0.16em] text-[#A9B3C7]">
                  Credit on every order
                </p>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-6 text-center">
            <h2 className="text-[1.05rem] font-extrabold uppercase leading-[1.2] tracking-[-0.015em] text-[#F4F6FA] sm:text-[1.15rem]">
              We handle the <span className="text-[#2CF357]">purity</span>.
              <br />
              You handle the <span className="text-[#2CF357]">discovery</span>.
            </h2>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A9B3C7]">
              {FEATURE_BULLETS.map((item, index) => (
                <span key={item} className="inline-flex items-center gap-2.5">
                  {index > 0 && (
                    <span className="text-[#2CF357]" aria-hidden>
                      •
                    </span>
                  )}
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-5 h-px bg-[rgba(244,246,250,0.08)]" aria-hidden />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="welcome-email"
                className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A9B3C7]"
              >
                Email address
              </label>
              <input
                id="welcome-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="you@lab.edu"
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-[rgba(244,246,250,0.12)] bg-[#111827] px-3.5 text-sm text-[#F4F6FA] placeholder:text-[#6B7280] outline-none transition-colors focus:border-[rgba(44,243,87,0.5)] focus:ring-2 focus:ring-[rgba(44,243,87,0.16)]"
              />
              {emailError && (
                <p className="mt-2 text-xs text-[#F87171]">{emailError}</p>
              )}
            </div>

            <button
              type="submit"
              className="flex h-11 w-full items-center justify-center rounded-xl border border-[rgba(44,243,87,0.42)] bg-[#0B1220] text-xs font-bold uppercase tracking-[0.14em] text-[#F4F6FA] transition-all hover:border-[rgba(44,243,87,0.62)] hover:bg-[rgba(44,243,87,0.12)] hover:shadow-[0_16px_48px_-20px_rgba(44,243,87,0.45)] active:translate-y-0.5"
            >
              Get my discount
            </button>
          </form>

          <p className="mt-4 text-center text-[9px] font-medium uppercase tracking-[0.11em] text-[#6B7280]">
            Applied automatically · No spam · Unsubscribe anytime
          </p>

          <button
            type="button"
            onClick={handleClose}
            className="mt-4 flex min-h-[38px] w-full items-center justify-center text-sm font-medium text-[#6B7280] transition-colors hover:text-[#A9B3C7]"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
