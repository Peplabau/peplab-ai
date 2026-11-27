# Cluched Orchestration setup (PEPLAB)

## What was built

- Checkout can choose **Bank transfer / PayID** or **Card / online checkout** (when public key is set).
- Card flow follows **PDF Option C** (`@orchestrapay/react` `<PaymentForm />`):
  place order → Edge Function creates a payment intent → embed form on peplab.ai
  (browser URL stays peplab.ai) → poll + webhook → `/checkout/complete`.
- Do **not** use hosted redirect (`pay.orchestrapay.com`) so the link stays on peplab.ai.
- Webhook marks the order `payment_status=confirmed` / `status=processing` (same as admin “mark paid”).
- Sandbox still needs a **Sandbox Gateway** connector in Cluched, or the embed shows “No payment methods configured”.

## 1. Paste keys

### Local / Vercel (public only)

```env
VITE_CLUCHED_PUBLIC_KEY=orch_pk_…
```

**Vercel:** add `VITE_CLUCHED_PUBLIC_KEY` under Project → Settings → Environment Variables
(Production). Vite bakes this in at **build** time, so the next Git push to the
production branch (usually `main`) triggers an auto-redeploy that picks up the key.
A dashboard-only “Redeploy” is not required if Git integration is connected.

### Supabase → Project Settings → Edge Functions → Secrets

| Secret | Value |
|--------|--------|
| `CLUCHED_SECRET_KEY` | `orch_sk_…` |
| `CLUCHED_WEBHOOK_SECRET` | generate with `openssl rand -hex 32` (never commit the real value) |
| `CLUCHED_API_BASE` | `https://api-eu1.orchestrapay.com` (change if your key region is `us1` / `eg1`) |
| `CLUCHED_API_VERSION` | `v202607` |
| `CLUCHED_APP_URL` | `https://peplab.ai` |

Match `CLUCHED_API_BASE` to the region in your key prefix (`orch_sk_live_eu1_…` → `api-eu1`).

## 2. Deploy database + functions

```bash
supabase db push
supabase functions deploy cluched-create-intent
supabase functions deploy cluched-webhook
supabase functions deploy cluched-order-status
```

Webhook URL (auto-registered per intent):

`https://dbhoyrqehxbjvdvddixc.supabase.co/functions/v1/cluched-webhook`

## 3. Test (sandbox)

1. Use sandbox tenant keys.
2. Place a checkout order with **Card / online checkout**.
3. Pay with a sandbox test card from the Cluched guide.
4. Confirm `/checkout/complete` shows paid and admin order is `confirmed` / `processing`.
