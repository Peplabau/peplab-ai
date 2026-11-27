import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PaymentForm, type PaymentFormHandle, type PaymentFailureData } from '@orchestrapay/react';
import { CONFIG } from '@/lib/config';
import { fetchCluchedOrderStatus } from '@/lib/cluched';
import { Loader2 } from 'lucide-react';

type Props = {
  orderNumber: string;
  email: string;
  /** `pi_…` from our server (Cluched create-intent). */
  paymentIntent: string;
  onFailure?: (message: string) => void;
};

/**
 * PDF Option C — React `<PaymentForm />` so the customer stays on peplab.ai.
 *
 * Guide rules we follow:
 * - publicKey (orch_pk_…) + paymentIntent (pi_…) only in the browser
 * - onPaymentSuccess / onPaymentFailure are UX only
 * - webhook + order-status polling are the source of truth for “paid”
 */
export default function CluchedPaymentEmbed({
  orderNumber,
  email,
  paymentIntent,
  onFailure,
}: Props) {
  const navigate = useNavigate();
  const formRef = useRef<PaymentFormHandle>(null);
  const [readyMs, setReadyMs] = useState<number | null>(null);
  const publicKey = CONFIG.CLUCHED_PUBLIC_KEY;
  const paymentFormId = CONFIG.CLUCHED_PAYMENT_FORM_ID || undefined;

  const goToComplete = () => {
    navigate(
      `/checkout/complete?order=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`,
    );
  };

  // PDF Option B/C companion: poll our server (updated by webhooks) until paid/canceled.
  useEffect(() => {
    if (!orderNumber || !email) return;
    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      while (!cancelled && attempts < 150) {
        attempts += 1;
        try {
          const status = await fetchCluchedOrderStatus({ orderNumber, email });
          if (cancelled) return;
          if (status.paymentStatus === 'confirmed') {
            goToComplete();
            return;
          }
          if (status.providerStatus === 'canceled' || status.status === 'cancelled') {
            onFailure?.('Payment was canceled. You can try again or use bank transfer.');
            return;
          }
        } catch {
          // Keep polling — transient network / webhook lag is expected.
        }
        await new Promise((r) => setTimeout(r, 4000));
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- poll once per intent mount
  }, [orderNumber, email, paymentIntent]);

  if (!publicKey) {
    return (
      <p className="text-sm text-rose-200">
        Card checkout is not configured (missing VITE_CLUCHED_PUBLIC_KEY).
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden bg-white border border-white/10">
        {readyMs == null && (
          <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 border-b border-gray-100">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading secure payment form…
          </div>
        )}
        {/* Guide Option C props */}
        <PaymentForm
          ref={formRef}
          publicKey={publicKey}
          paymentIntent={paymentIntent}
          paymentForm={paymentFormId}
          apiVersion="v202607"
          locale="en"
          saveCardsOnFile="never"
          style={{ theme: 'minimalist', poweredBy: false }}
          className="w-full min-h-[360px]"
          containerStyle={{ width: '100%', minHeight: 360 }}
          onLoaded={(ms) => setReadyMs(ms)}
          onPaymentSuccess={() => {
            // UX only — fulfilment is webhook-driven (guide ch. 4.4 / 8).
            goToComplete();
          }}
          onPaymentFailure={(err: PaymentFailureData) => {
            const message =
              err?.message ||
              err?.reason ||
              'Payment attempt failed. You can try again or use bank transfer below.';
            onFailure?.(message);
          }}
        />
      </div>
      <button
        type="button"
        onClick={() => formRef.current?.submit()}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2ED1B4] to-[#8B5CF6] text-white font-semibold text-sm"
      >
        Pay now
      </button>
      <p className="text-[10px] text-gray-500 text-center">
        Secure payment on peplab.ai · powered by Cluched Orchestration
      </p>
    </div>
  );
}
