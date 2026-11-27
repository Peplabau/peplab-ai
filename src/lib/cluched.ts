/**
 * Cluched Orchestration — browser helpers.
 * Secret key must never live here; only the public key + edge-function calls.
 */
import { CONFIG } from '@/lib/config';
import { supabase } from '@/lib/supabase';

export type CluchedPaymentMethod = 'payid' | 'cluched';

export function isCluchedEnabled(): boolean {
  return Boolean(CONFIG.CLUCHED_PUBLIC_KEY?.trim());
}

export async function createCluchedPaymentIntent(params: {
  orderNumber: string;
  email: string;
}): Promise<{ paymentIntent: string; checkoutUrl: string }> {
  const { data, error } = await supabase.functions.invoke('cluched-create-intent', {
    body: {
      order_number: params.orderNumber,
      email: params.email,
    },
  });

  if (error) {
    throw new Error(error.message || 'Could not start card payment');
  }

  const payload = data as {
    error?: string;
    paymentIntent?: string;
    checkoutUrl?: string;
  } | null;

  if (!payload || payload.error || !payload.paymentIntent || !payload.checkoutUrl) {
    throw new Error(payload?.error || 'Could not start card payment');
  }

  return {
    paymentIntent: payload.paymentIntent,
    checkoutUrl: payload.checkoutUrl,
  };
}

export async function fetchCluchedOrderStatus(params: {
  orderNumber: string;
  email: string;
}): Promise<{
  paymentStatus: string;
  status?: string;
  total?: number;
  providerStatus?: string | null;
}> {
  const { data, error } = await supabase.functions.invoke('cluched-order-status', {
    body: {
      order_number: params.orderNumber,
      email: params.email,
    },
  });

  if (error) {
    throw new Error(error.message || 'Could not load payment status');
  }

  const payload = data as {
    error?: string;
    paymentStatus?: string;
    status?: string;
    total?: number;
    providerStatus?: string | null;
  } | null;

  if (!payload || payload.error || !payload.paymentStatus) {
    throw new Error(payload?.error || 'Could not load payment status');
  }

  return {
    paymentStatus: payload.paymentStatus,
    status: payload.status,
    total: payload.total,
    providerStatus: payload.providerStatus,
  };
}
