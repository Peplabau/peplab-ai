import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2, AlertCircle, XCircle } from 'lucide-react';
import ContentPageHeader from '@/components/ContentPageHeader';
import Footer from '@/sections/Footer';
import { SEO } from '@/components/SEO';
import { SHOP_PATH } from '@/lib/routes';
import { fetchCluchedOrderStatus } from '@/lib/cluched';
import { formatOrderNumberDisplay } from '@/utils/order-number';

type Phase = 'loading' | 'paid' | 'pending' | 'canceled' | 'error';

export default function CheckoutComplete() {
  const [params] = useSearchParams();
  const orderNumber = (params.get('order') || '').trim();
  const email = (params.get('email') || '').trim();
  const [phase, setPhase] = useState<Phase>('loading');
  const [total, setTotal] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber || !email) {
      setPhase('error');
      setMessage('Missing order details. Check your confirmation email or track your order.');
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const poll = async () => {
      try {
        const status = await fetchCluchedOrderStatus({ orderNumber, email });
        if (cancelled) return;
        if (typeof status.total === 'number') setTotal(status.total);

        if (status.paymentStatus === 'confirmed') {
          setPhase('paid');
          return;
        }
        if (status.providerStatus === 'canceled' || status.status === 'cancelled') {
          setPhase('canceled');
          return;
        }

        attempts += 1;
        if (attempts < 40) {
          setPhase('pending');
          window.setTimeout(() => {
            void poll();
          }, 3000);
          return;
        }
        setPhase('pending');
        setMessage('Payment is still processing. You will get an email when it clears.');
      } catch (err) {
        if (cancelled) return;
        setPhase('error');
        setMessage(err instanceof Error ? err.message : 'Could not verify payment status');
      }
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [orderNumber, email]);

  return (
    <div className="min-h-screen bg-[#070A12]">
      <SEO title="Payment status | PEPLAB" noIndex />
      <ContentPageHeader />
      <main className="px-4 py-10 max-w-md mx-auto text-center">
        {phase === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-[#2ED1B4] animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Confirming payment…</h1>
            <p className="text-sm text-gray-400">Please wait a moment.</p>
          </>
        )}

        {phase === 'paid' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Payment received</h1>
            <p className="text-sm text-gray-400 mb-4">
              Order {formatOrderNumberDisplay(orderNumber)}
              {total != null ? ` · $${total.toFixed(2)}` : ''}
            </p>
            <p className="text-sm text-gray-300 mb-6">
              Thanks — your order is now being prepared for dispatch.
            </p>
          </>
        )}

        {phase === 'pending' && (
          <>
            <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">Waiting for confirmation</h1>
            <p className="text-sm text-gray-400 mb-4">
              Order {formatOrderNumberDisplay(orderNumber)}
            </p>
            <p className="text-sm text-gray-300 mb-6">
              {message || 'If you completed payment, this page will update shortly.'}
            </p>
          </>
        )}

        {phase === 'canceled' && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Payment canceled</h1>
            <p className="text-sm text-gray-400 mb-6">
              No charge was completed. You can return to checkout and try again.
            </p>
          </>
        )}

        {phase === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Could not verify payment</h1>
            <p className="text-sm text-gray-400 mb-6">{message}</p>
          </>
        )}

        <div className="flex flex-col gap-2">
          <Link
            to="/track-order"
            className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold text-sm"
          >
            Track order
          </Link>
          <Link
            to={SHOP_PATH}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2ED1B4] to-[#8B5CF6] text-white font-semibold text-sm"
          >
            Continue shopping
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
