import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Search,
  Check,
  Truck,
  CreditCard,
  Box,
  Home,
  AlertCircle,
  XCircle,
  Copy,
  Loader2,
  ShieldCheck,
  Mail,
} from 'lucide-react';

import {
  lookupOrderTracking,
  resolveCurrentStageIndex,
  isCancelled,
  TRACKING_STAGES,
  type TrackOrderResult,
} from '@/lib/trackOrder';
import { sendOrderTrackingUpdate } from '@/lib/email';
import { formatOrderNumberDisplay } from '@/utils/order-number';
import { SEO } from '@/components/SEO';

// Throttle duplicate status emails so re-submits don't spam the customer.
// Keyed by (order_number, email) and stored in sessionStorage — resets every tab.
const TRACK_EMAIL_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

function trackEmailCooldownKey(orderNumber: string, email: string): string {
  return `peplab_track_email_sent:${orderNumber.toLowerCase()}:${email.toLowerCase()}`;
}

function shouldSendTrackEmail(orderNumber: string, email: string): boolean {
  try {
    const raw = sessionStorage.getItem(trackEmailCooldownKey(orderNumber, email));
    if (!raw) return true;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return true;
    return Date.now() - ts > TRACK_EMAIL_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markTrackEmailSent(orderNumber: string, email: string) {
  try {
    sessionStorage.setItem(trackEmailCooldownKey(orderNumber, email), String(Date.now()));
  } catch {
    // sessionStorage can fail in private mode — we just skip the cooldown.
  }
}

const STAGE_ICONS = [Package, CreditCard, Box, Truck, Home] as const;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function formatShippingMethod(m: string | null): string {
  if (!m) return '';
  return m
    .split(/[_\s-]+/)
    .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : ''))
    .join(' ');
}

export default function TrackOrder() {
  const location = useLocation();

  const [orderInput, setOrderInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<TrackOrderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  // Toast-like inline confirmation for the status email.
  // - 'sending'  → email dispatched, awaiting network
  // - 'sent'     → Resend / edge function returned ok
  // - 'cooldown' → skipped because we already emailed this (order, email) pair recently
  // - 'failed'   → send attempt returned an error
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'cooldown' | 'failed'>('idle');
  const [emailSentTo, setEmailSentTo] = useState<string>('');

  // Prefill from ?order=XXXX&email=foo@bar.com for deep-linking from email/receipts.
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const o = params.get('order');
    const e = params.get('email');
    if (o) setOrderInput(o);
    if (e) setEmailInput(e);
  }, [location.search]);

  const currentStage = useMemo(() => (result ? resolveCurrentStageIndex(result) : -1), [result]);
  const cancelled = useMemo(() => (result ? isCancelled(result) : false), [result]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setEmailState('idle');
    setEmailSentTo('');
    setSubmitting(true);
    try {
      const { data, error: err } = await lookupOrderTracking(orderInput, emailInput);
      if (err) {
        setError(err);
        return;
      }
      setResult(data);

      // Fire-and-forget status email — the RPC has already verified that the
      // (order_number, email) pair matches, so we only ever email the legitimate
      // customer. Do not block the UI on the email send.
      if (data) {
        const cleanEmail = emailInput.trim().toLowerCase();
        if (!shouldSendTrackEmail(data.order_number, cleanEmail)) {
          setEmailState('cooldown');
          setEmailSentTo(cleanEmail);
        } else {
          setEmailState('sending');
          setEmailSentTo(cleanEmail);
          // Intentionally NOT awaited — don't hold up the user.
          void sendOrderTrackingUpdate(cleanEmail, {
            order_number: data.order_number,
            status: data.status,
            payment_status: data.payment_status,
            tracking_number: data.tracking_number,
            shipping_method: data.shipping_method,
            total: data.total,
          })
            .then((res) => {
              if (res.ok) {
                markTrackEmailSent(data.order_number, cleanEmail);
                setEmailState('sent');
              } else {
                console.warn('[trackOrder] status email failed:', res.error);
                setEmailState('failed');
              }
            })
            .catch((sendErr) => {
              console.warn('[trackOrder] status email threw:', sendErr);
              setEmailState('failed');
            });
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderNumber = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatOrderNumberDisplay(result.order_number));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // noop — clipboard may be blocked
    }
  };

  return (
    <>
      <SEO
        title="Track Your Order | PEPLAB"
        description="Track your PEPLAB peptide order with your order number and email. Australia-wide AusPost tracking updates."
      />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Top nav */}
      <nav className="relative z-50 px-6 lg:px-12 py-6">
        <div className="flex items-center justify-between">
          <a href="/" className="flex flex-col items-start">
            <span className="text-3xl lg:text-4xl font-bold tracking-[0.12em] gradient-text leading-none">
              PEPLAB
            </span>
            <span className="text-xs lg:text-sm font-mono uppercase tracking-[0.5em] text-[#8B5CF6] mt-0.5">
              PEPTIDES AUSTRALIA
            </span>
          </a>
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-[#A9B3C7] hover:text-[#F4F6FA] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </a>
        </div>
      </nav>

      <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-[#2ED1B4]" />
            </div>
            <span className="eyebrow mb-4 block">ORDER TRACKING</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
              Track your <span className="gradient-text">order</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A9B3C7]">
              Enter your order number and the email you used at checkout.
            </p>
          </div>

          {/* Lookup form */}
          <form
            onSubmit={onSubmit}
            className="p-5 sm:p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] mb-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="trk-order"
                  className="block text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider mb-2"
                >
                  Order Number
                </label>
                <input
                  id="trk-order"
                  name="order"
                  type="text"
                  autoComplete="off"
                  inputMode="text"
                  spellCheck={false}
                  value={orderInput}
                  onChange={(e) => setOrderInput(e.target.value)}
                  placeholder="e.g. ABCD1234"
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.08)] text-[#F4F6FA] placeholder-[#5A667E] font-mono tracking-wider focus:outline-none focus:border-[#2ED1B4] transition-colors"
                  disabled={submitting}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="trk-email"
                  className="block text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider mb-2"
                >
                  Email used at checkout
                </label>
                <input
                  id="trk-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.08)] text-[#F4F6FA] placeholder-[#5A667E] focus:outline-none focus:border-[#2ED1B4] transition-colors"
                  disabled={submitting}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-5 w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Looking up…
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Track Order
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)]">
                <AlertCircle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#F4F6FA]">{error}</p>
              </div>
            )}

            <p className="mt-4 flex items-center gap-2 text-xs text-[#5A667E]">
              <ShieldCheck className="w-3.5 h-3.5" />
              We only show status details — no billing or personal information.
            </p>
          </form>

          {/* Result */}
          {result && (
            <div className="p-5 sm:p-7 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 mb-6 border-b border-[rgba(244,246,250,0.06)]">
                <div>
                  <p className="text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider mb-1">
                    Order Number
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-[#F4F6FA] font-mono tracking-wider">
                      {formatOrderNumberDisplay(result.order_number)}
                    </span>
                    <button
                      type="button"
                      onClick={copyOrderNumber}
                      title="Copy order number"
                      className="p-1.5 rounded-lg text-[#A9B3C7] hover:text-[#2ED1B4] hover:bg-[rgba(46,209,180,0.08)] transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <p className="text-xs text-[#5A667E] mt-1">
                    Placed {formatDate(result.created_at)}
                  </p>
                </div>

                <StatusBadge status={result.status} cancelled={cancelled} />
              </div>

              {/* Email confirmation strip */}
              {emailState !== 'idle' && emailSentTo && (
                <EmailStatusStrip state={emailState} email={emailSentTo} />
              )}

              {/* Timeline or cancelled banner */}
              {cancelled ? (
                <div className="p-5 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-[#F4F6FA] mb-1">
                      This order has been cancelled.
                    </p>
                    <p className="text-sm text-[#A9B3C7]">
                      If this wasn’t expected, please contact our support team and we’ll sort it
                      out right away.
                    </p>
                  </div>
                </div>
              ) : (
                <Timeline currentStage={currentStage} order={result} />
              )}

              {/* Tracking number */}
              {result.tracking_number && !cancelled && (
                <div className="mt-6 p-4 rounded-xl bg-[rgba(46,209,180,0.06)] border border-[rgba(46,209,180,0.2)]">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-[#2ED1B4] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#2ED1B4] uppercase tracking-wider mb-1">
                        Tracking Number
                      </p>
                      <p className="text-sm font-mono text-[#F4F6FA] break-all">
                        {result.tracking_number}
                      </p>
                      {result.shipping_method && (
                        <p className="text-xs text-[#A9B3C7] mt-1">
                          Shipping via {formatShippingMethod(result.shipping_method)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              {result.items.length > 0 && (
                <div className="mt-6">
                  <p className="text-xs font-semibold text-[#A9B3C7] uppercase tracking-wider mb-3">
                    Items ({result.items.length})
                  </p>
                  <div className="rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.06)] divide-y divide-[rgba(244,246,250,0.04)]">
                    {result.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[#F4F6FA] truncate">
                            {item.name}
                            {item.is_free && (
                              <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#34D399] bg-[rgba(52,211,153,0.1)] uppercase tracking-wider">
                                Free
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#A9B3C7]">{item.dosage}</p>
                        </div>
                        <span className="text-sm font-mono text-[#A9B3C7] flex-shrink-0">
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <Totals label="Subtotal" value={result.subtotal} />
                <Totals label="Shipping" value={result.shipping_cost} />
                <Totals label="Total" value={result.total} emphasize />
              </div>
            </div>
          )}

          {/* Helpful info when no result yet */}
          {!result && !error && !submitting && (
            <div className="text-center text-sm text-[#5A667E] leading-relaxed">
              Can’t find your order number? Check the confirmation email we sent when you placed
              the order — the number is printed near the top.
            </div>
          )}
        </div>
      </main>
    </div>
    </>
  );
}

function StatusBadge({ status, cancelled }: { status: string; cancelled: boolean }) {
  const s = (status || '').toLowerCase();
  let color = '#A9B3C7';
  let bg = 'rgba(169,179,199,0.12)';
  let label = status || 'Unknown';

  if (cancelled) {
    color = '#EF4444';
    bg = 'rgba(239,68,68,0.12)';
    label = 'Cancelled';
  } else if (s === 'delivered') {
    color = '#22C55E';
    bg = 'rgba(34,197,94,0.12)';
    label = 'Delivered';
  } else if (s === 'shipped') {
    color = '#2ED1B4';
    bg = 'rgba(46,209,180,0.12)';
    label = 'Shipped';
  } else if (s === 'processing' || s === 'finalised') {
    color = '#8B5CF6';
    bg = 'rgba(139,92,246,0.12)';
    label = 'Processing';
  } else if (s === 'pending_payment') {
    color = '#F59E0B';
    bg = 'rgba(245,158,11,0.12)';
    label = 'Awaiting Payment';
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider self-start"
      style={{ color, background: bg, border: `1px solid ${color}33` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 6px ${color}` }}
      />
      {label}
    </span>
  );
}

function Timeline({ currentStage, order }: { currentStage: number; order: TrackOrderResult }) {
  return (
    <ol className="relative">
      {TRACKING_STAGES.map((stage, idx) => {
        const Icon = STAGE_ICONS[idx] ?? Package;
        const isDone = idx < currentStage;
        const isActive = idx === currentStage;
        const isUpcoming = idx > currentStage;
        const isLast = idx === TRACKING_STAGES.length - 1;

        // Stage-specific timestamp (only when we have one).
        let ts = '';
        if (idx === 0) ts = formatDate(order.created_at);
        else if (idx === 1) ts = formatDate(order.paid_at);

        const dotColor = isDone ? '#22C55E' : isActive ? '#2ED1B4' : 'rgba(169,179,199,0.25)';
        const labelColor = isUpcoming ? '#5A667E' : '#F4F6FA';

        return (
          <li key={stage.key} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Connector line */}
            {!isLast && (
              <span
                aria-hidden
                className="absolute left-[15px] top-8 bottom-0 w-[2px]"
                style={{
                  background: isDone
                    ? '#22C55E'
                    : 'linear-gradient(to bottom, rgba(46,209,180,0.25), rgba(169,179,199,0.1))',
                }}
              />
            )}

            {/* Dot */}
            <span
              className="relative z-10 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2"
              style={{
                borderColor: dotColor,
                background: isActive ? 'rgba(46,209,180,0.12)' : isDone ? 'rgba(34,197,94,0.12)' : 'rgba(7,10,18,0.6)',
                boxShadow: isActive ? `0 0 0 4px rgba(46,209,180,0.15)` : 'none',
              }}
            >
              {isDone ? (
                <Check className="w-4 h-4 text-[#22C55E]" strokeWidth={3} />
              ) : (
                <Icon
                  className="w-3.5 h-3.5"
                  style={{ color: isActive ? '#2ED1B4' : '#5A667E' }}
                />
              )}
            </span>

            {/* Text */}
            <div className="flex-1 pt-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold" style={{ color: labelColor }}>
                  {stage.label}
                </p>
                {isActive && (
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold text-[#2ED1B4] bg-[rgba(46,209,180,0.12)] uppercase tracking-wider">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A9B3C7] mt-0.5">{stage.description}</p>
              {ts && (
                <p className="text-[11px] text-[#5A667E] mt-1 font-mono">{ts}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function EmailStatusStrip({
  state,
  email,
}: {
  state: 'sending' | 'sent' | 'cooldown' | 'failed';
  email: string;
}) {
  let tone: { color: string; bg: string; border: string };
  let icon: React.ReactNode;
  let message: React.ReactNode;

  switch (state) {
    case 'sending':
      tone = {
        color: '#A9B3C7',
        bg: 'rgba(169,179,199,0.08)',
        border: 'rgba(169,179,199,0.2)',
      };
      icon = <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#A9B3C7' }} />;
      message = (
        <>
          Sending a copy of this update to <strong className="text-[#F4F6FA]">{email}</strong>…
        </>
      );
      break;
    case 'sent':
      tone = {
        color: '#2ED1B4',
        bg: 'rgba(46,209,180,0.08)',
        border: 'rgba(46,209,180,0.24)',
      };
      icon = <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#2ED1B4' }} />;
      message = (
        <>
          We’ve emailed this update to <strong className="text-[#F4F6FA]">{email}</strong>. Check
          your inbox (and spam folder, just in case).
        </>
      );
      break;
    case 'cooldown':
      tone = {
        color: '#A9B3C7',
        bg: 'rgba(169,179,199,0.06)',
        border: 'rgba(244,246,250,0.08)',
      };
      icon = <Mail className="w-4 h-4 flex-shrink-0" style={{ color: '#A9B3C7' }} />;
      message = (
        <>
          We already emailed this status to <strong className="text-[#F4F6FA]">{email}</strong> a
          moment ago — we won’t send it again right away.
        </>
      );
      break;
    case 'failed':
    default:
      tone = {
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.24)',
      };
      icon = <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#F59E0B' }} />;
      message = (
        <>
          We couldn’t send the status email to <strong className="text-[#F4F6FA]">{email}</strong>{' '}
          right now — the status above is still up to date.
        </>
      );
      break;
  }

  return (
    <div
      className="mb-6 flex items-start gap-2.5 px-4 py-3 rounded-xl"
      style={{ background: tone.bg, border: `1px solid ${tone.border}`, color: tone.color }}
    >
      {icon}
      <p className="text-sm leading-relaxed">{message}</p>
    </div>
  );
}

function Totals({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <div className="p-3 rounded-xl bg-[rgba(7,10,18,0.5)] border border-[rgba(244,246,250,0.06)]">
      <p className="text-[10px] font-semibold text-[#5A667E] uppercase tracking-wider">{label}</p>
      <p
        className={`mt-1 font-mono ${emphasize ? 'text-base font-bold text-[#2ED1B4]' : 'text-sm text-[#F4F6FA]'}`}
      >
        ${(value ?? 0).toFixed(2)}
      </p>
    </div>
  );
}
