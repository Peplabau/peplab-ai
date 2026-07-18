// Email Service - Sends order notifications, password resets, etc.
import { CONFIG } from './config';
import { DEFAULT_BANK_DETAILS, DEFAULT_SUPPORT_LINKS, getSiteSetting, type BankDetails } from './settings';
import { supabase } from './supabase';
import { formatOrderNumberDisplay } from '@/utils/order-number';
import { MAIN_APP_ORIGIN } from '@/lib/domain';
import {
  wrapPeplabEmail,
  emailCtaRow,
  emailCallout,
  emailDetailRow,
  emailOrderItemsTable,
  emailSupportHelpBlock,
  emailSupportContactLinks,
  escapeHtml,
  EMAIL_THEME,
  type EmailSupportLinks,
  type OrderItemRow,
} from './email-layout';

const T = EMAIL_THEME;

/** Shop origin for clickable email links (peplab.ai). SEO SITE_URL may be peplab.com.au. */
function shopOrigin(): string {
  return (MAIN_APP_ORIGIN || CONFIG.SITE_URL || 'https://peplab.ai').replace(/\/$/, '');
}

async function getEmailSupportLinks(): Promise<EmailSupportLinks> {
  const [telegramVal, whatsappVal] = await Promise.all([
    getSiteSetting<{ url: string }>('telegram_link', { url: DEFAULT_SUPPORT_LINKS.telegram_link }),
    getSiteSetting<{ url: string }>('whatsapp_link', { url: DEFAULT_SUPPORT_LINKS.whatsapp_link }),
  ]);
  return {
    telegramUrl: telegramVal?.url?.trim() || DEFAULT_SUPPORT_LINKS.telegram_link,
    whatsappUrl: whatsappVal?.url?.trim() || '',
  };
}

/** Matches Resend REST `attachments` shape for inline images (`content_id` + `cid:` in HTML). */
export type EmailAttachmentInput = {
  filename: string;
  content_id?: string;
  /** HTTPS URL — Resend fetches server-side (avoids huge base64 from the browser). */
  path?: string;
  /** Raw base64 bytes (no `data:` prefix). */
  content?: string;
  content_type?: string;
};

interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: EmailAttachmentInput[];
}

/** Resend cannot be called from the browser (CORS). Production uses Supabase Edge Function `send-email`. */
async function sendViaEdgeFunction(data: EmailData): Promise<{ success: boolean; error?: string }> {
  const { data: res, error } = await supabase.functions.invoke('send-email', {
    body: {
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      ...(data.attachments?.length ? { attachments: data.attachments } : {}),
    },
  });
  if (error) {
    return { success: false, error: error.message };
  }
  if (res && typeof res === 'object' && 'error' in res && (res as { error: unknown }).error) {
    return { success: false, error: String((res as { error: unknown }).error) };
  }
  return { success: true };
}

/** Dev-only: Vite proxies /api/resend/emails → api.resend.com with server-side Authorization. */
async function sendViaDevProxy(data: EmailData, fromEmail: string): Promise<{ success: boolean; error?: string }> {
  const response = await fetch('/api/resend/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: fromEmail,
      to: data.to,
      subject: data.subject,
      html: data.html,
      text: data.text,
      ...(data.attachments?.length ? { attachments: data.attachments } : {}),
    }),
  });
  if (!response.ok) {
    let message = `Resend HTTP ${response.status}`;
    try {
      const errBody = (await response.json()) as { message?: string };
      message = errBody.message || message;
    } catch {
      const text = await response.text();
      if (text) message = text.slice(0, 200);
    }
    return { success: false, error: message };
  }
  return { success: true };
}

async function queuePendingEmail(data: EmailData): Promise<{ success: boolean; error?: string }> {
  const { error: insertError } = await supabase.from('pending_emails').insert({
    to_email: data.to,
    subject: data.subject,
    html_content: data.html,
    text_content: data.text,
    status: 'pending',
  });
  if (insertError) {
    console.error('[email] pending_emails insert failed:', insertError.message);
    return { success: false, error: insertError.message };
  }
  return { success: true };
}

// Send email: Supabase Edge Function first (works from localhost + production — no browser→Resend CORS).
// Fallback in dev only: Vite proxy + VITE_RESEND_API_KEY if the function is not deployed yet.
export const sendEmail = async (data: EmailData): Promise<{ success: boolean; error?: string }> => {
  const apiKey = (CONFIG.RESEND_API_KEY || '').trim();
  const fromEmail = (CONFIG.FROM_EMAIL || '').trim();

  try {
    const edge = await sendViaEdgeFunction(data);
    if (edge.success) return edge;
    console.warn('[email] Edge function failed:', edge.error);

    if (import.meta.env.DEV && apiKey && apiKey !== 're_YOUR_KEY_HERE' && fromEmail) {
      const proxied = await sendViaDevProxy(data, fromEmail);
      if (proxied.success) return proxied;
      console.warn('[email] Dev proxy failed:', proxied.error);
    }

    return await queuePendingEmail(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[email] Send failed:', msg);
    return { success: false, error: msg };
  }
};

// Get email template from database (HTML only used when CONFIG.EMAIL_USE_SUPABASE_HTML_TEMPLATES is true)
export const getEmailTemplate = async (name: string): Promise<{ subject: string; html: string } | null> => {
  if (!CONFIG.EMAIL_USE_SUPABASE_HTML_TEMPLATES) {
    return null;
  }
  const { data, error } = await supabase
    .from('email_templates')
    .select('subject, html_content')
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  return {
    subject: data.subject,
    html: data.html_content,
  };
};

// Send order confirmation email
export const sendOrderConfirmation = async (
  to: string,
  orderData: {
    order_number: string;
    total: number;
    items: any[];
    shipping_address: string;
  },
  /** Same source as checkout success screen — `site_settings.bank_details`. Pass through so email matches UI; otherwise fetched from DB. */
  bankDetailsOverride?: BankDetails,
): Promise<{ ok: boolean; error?: string }> => {
  const displayOrderNo = formatOrderNumberDisplay(orderData.order_number);
  const [bankResolved, supportLinks] = await Promise.all([
    bankDetailsOverride ?? getSiteSetting<BankDetails>('bank_details', DEFAULT_BANK_DETAILS),
    getEmailSupportLinks(),
  ]);
  
  const itemRows: OrderItemRow[] =
    Array.isArray(orderData.items) && orderData.items.length > 0
      ? orderData.items.map((it: { name?: string; dosage?: unknown; quantity?: number; price?: number }) => ({
          name: it.name || 'Item',
          dosage: String(it.dosage ?? ''),
          quantity: it.quantity ?? 0,
          lineTotal: `$${(((it.price ?? 0) as number) * (it.quantity ?? 0)).toFixed(2)}`,
        }))
      : [];

  const on = escapeHtml(displayOrderNo);
  const tot = escapeHtml(orderData.total.toFixed(2));
  const ship = escapeHtml(orderData.shipping_address || '—');

  const defaultBody = `
    <p style="margin:0 0 20px;text-align:center;font-size:15px;color:${T.text};line-height:1.55;">We've received your order and reserved your items. Transfer the <strong style="color:${T.text};">exact</strong> amount below using the bank details in this email.</p>
    ${emailCallout(
      `<span style="font-size:13px;color:${T.muted};text-transform:uppercase;letter-spacing:0.12em;">Amount due</span><br>
       <span style="font-size:32px;font-weight:800;color:${T.teal};letter-spacing:-0.02em;">$${tot}</span><br>
       <span style="font-size:13px;color:${T.text};">Order <strong style="color:${T.text};font-family:ui-monospace,Menlo,Consolas,monospace;">${on}</strong></span>`,
      'info',
    )}
    ${itemRows.length ? emailOrderItemsTable(itemRows) : ''}
    <p style="margin:18px 0 6px;text-align:center;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.muted};">Ship to</p>
    <p style="margin:0 0 22px;text-align:center;font-size:14px;color:${T.text};line-height:1.55;">${ship}</p>
    <p style="margin:0 0 10px;text-align:center;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${T.muted};">Bank transfer</p>
    ${emailDetailRow('PAYID (easiest)', bankResolved.payid)}
    ${emailDetailRow('BSB', bankResolved.bsb)}
    ${emailDetailRow('Account number', bankResolved.account_number)}
    ${emailDetailRow('Account name', bankResolved.account_name, false)}
    ${emailCallout(
      `<strong style="color:${T.amber};">Payment reference (required):</strong><br>
       <span style="font-size:20px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:${T.text};letter-spacing:0.04em;">${on}</span><br>
       <span style="font-size:13px;color:${T.muted};margin-top:8px;display:inline-block;">Use this exact code so we can match your payment to your order.</span>`,
      'warn',
    )}
    <p style="margin:22px 0 0;text-align:center;font-size:13px;color:${T.muted};line-height:1.55;">We dispatch within <strong style="color:${T.text};">24 hours</strong> of cleared funds.</p>
    ${emailSupportHelpBlock(supportLinks)}
  `;

  let html = wrapPeplabEmail({
    preheader: `PEPLAB order ${displayOrderNo} — $${orderData.total.toFixed(2)} due`,
    headline: 'Order confirmed',
    subline: 'Next step: complete your bank transfer using the details below.',
    bodyHtml: defaultBody,
    supportLinks,
  });
  
  // Replace placeholders (display without legacy PEP- prefix)
  html = html
    .replace(/{order_number}/g, displayOrderNo)
    .replace(/{total}/g, orderData.total.toFixed(2))
    .replace(/{shipping_address}/g, orderData.shipping_address || '—')
    .replace(/{payid}/g, escapeHtml(bankResolved.payid))
    .replace(/{bsb}/g, escapeHtml(bankResolved.bsb))
    .replace(/{account}/g, escapeHtml(bankResolved.account_number))
    .replace(/{account_name}/g, escapeHtml(bankResolved.account_name))
    .replace(/{trustpilot_url}/g, escapeHtml(CONFIG.TRUSTPILOT.REVIEW_URL));
  
  const subject = `Your PEPLAB Order Confirmation - #${displayOrderNo}`;
  
  const result = await sendEmail({ to, subject, html });

  // Mark email as sent in order
  if (result.success) {
    const { error: updateErr } = await supabase
      .from('orders')
      .update({ confirmation_email_sent: true })
      .eq('order_number', orderData.order_number);
    if (updateErr) {
      console.warn('[email] Order confirmation sent but DB flag update failed:', updateErr.message);
    }
  }

  return { ok: result.success, error: result.error };
};

/** Trustpilot CTA for order emails — only sent to customers who placed an order. */
function emailTrustpilotReviewBlock(): string {
  const url = CONFIG.TRUSTPILOT.REVIEW_URL;
  return `${emailCallout(
    `<strong style="color:${T.text};">Leave a review on Trustpilot</strong><br>
     <span style="font-size:13px;color:${T.muted};margin-top:8px;display:inline-block;line-height:1.55;">Share your experience with other researchers. This link is reserved for verified customers who placed this order.</span>`,
    'info',
  )}
  ${emailCtaRow(url, 'Review us on Trustpilot')}`;
}

// Send payment received email
export const sendPaymentReceived = async (
  to: string,
  orderData: { order_number: string; total: number }
): Promise<boolean> => {
  const displayOrderNo = formatOrderNumberDisplay(orderData.order_number);
  const template = await getEmailTemplate('payment_received');
  const supportLinks = await getEmailSupportLinks();

  const on = escapeHtml(displayOrderNo);
  const tot = escapeHtml(orderData.total.toFixed(2));
  const defaultBody = `
    ${emailCallout(
      `<span style="font-size:13px;color:${T.muted};text-transform:uppercase;letter-spacing:0.12em;">Payment received</span><br>
       <span style="font-size:15px;color:${T.text};">Order <strong style="font-family:ui-monospace,Menlo,Consolas,monospace;">${on}</strong></span><br>
       <span style="font-size:28px;font-weight:800;color:${T.success};margin-top:6px;display:inline-block;">$${tot}</span>`,
      'success',
    )}
    <p style="margin:8px 0 0;text-align:center;font-size:15px;color:${T.muted};line-height:1.6;">Your order is now <strong style="color:${T.text};">being prepared</strong>. We aim to ship within <strong style="color:${T.text};">24 hours</strong>.</p>
    <p style="margin:16px 0 0;text-align:center;font-size:14px;color:${T.muted};">You’ll get a separate email with <strong style="color:${T.teal};">tracking</strong> as soon as it leaves our facility.</p>
    ${emailSupportHelpBlock(supportLinks)}
    ${emailTrustpilotReviewBlock()}
  `;

  const html = (template?.html
    ? template.html
    : wrapPeplabEmail({
        preheader: `We received your payment for order ${displayOrderNo}`,
        headline: 'Payment received',
        subline: 'Thank you — we’re on it.',
        bodyHtml: defaultBody,
        supportLinks,
      }))
    .replace(/{order_number}/g, displayOrderNo)
    .replace(/{total}/g, orderData.total.toFixed(2))
    .replace(/{trustpilot_url}/g, escapeHtml(CONFIG.TRUSTPILOT.REVIEW_URL));
  
  const subject = (template?.subject || 'Payment Received - Order #{order_number}')
    .replace(/{order_number}/g, displayOrderNo);
  
  const result = await sendEmail({ to, subject, html });
  
  if (result.success) {
    await supabase.from('orders')
      .update({ payment_email_sent: true })
      .eq('order_number', orderData.order_number);
  }
  
  return result.success;
};

// Send order shipped email
export const sendOrderShipped = async (
  to: string,
  orderData: { order_number: string; tracking_number: string; tracking_carrier?: string }
): Promise<boolean> => {
  const displayOrderNo = formatOrderNumberDisplay(orderData.order_number);
  const template = await getEmailTemplate('order_shipped');
  const trackingUrl = `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(orderData.tracking_number)}`;
  const carrier = orderData.tracking_carrier || 'Australia Post';
  const on = escapeHtml(displayOrderNo);
  const tn = escapeHtml(orderData.tracking_number);
  const cr = escapeHtml(carrier);

  const defaultBody = `
    <p style="margin:0 0 16px;text-align:center;font-size:15px;color:${T.muted};">Your parcel is on the way.</p>
    ${emailCallout(
      `<span style="font-size:12px;color:${T.muted};text-transform:uppercase;letter-spacing:0.12em;">Tracking</span><br>
       <span style="font-size:20px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:${T.teal};letter-spacing:0.03em;">${tn}</span><br>
       <span style="font-size:13px;color:${T.muted};margin-top:8px;display:inline-block;">Carrier: <strong style="color:${T.text};">${cr}</strong></span>`,
      'info',
    )}
    ${emailCtaRow(trackingUrl, 'Track shipment')}
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:${T.muted};line-height:1.55;">Typical delivery: <strong style="color:${T.text};">2–4 business days</strong> (Express) or <strong style="color:${T.text};">5–8</strong> (Standard).</p>
    <p style="margin:10px 0 0;text-align:center;font-size:13px;color:${T.muted};">Order <strong style="color:${T.text};font-family:ui-monospace,Menlo,Consolas,monospace;">${on}</strong></p>
  `;

  const html = (template?.html
    ? template.html
    : wrapPeplabEmail({
        preheader: `Your PEPLAB order ${displayOrderNo} has shipped`,
        headline: 'Shipped',
        subline: 'Use your tracking number to follow delivery.',
        bodyHtml: defaultBody,
      }))
    .replace(/{order_number}/g, displayOrderNo)
    .replace(/{tracking_number}/g, orderData.tracking_number)
    .replace(/{tracking_carrier}/g, carrier)
    .replace(/{tracking_url}/g, trackingUrl);
  
  const subject = (template?.subject || 'Your Order Has Shipped - #{order_number}')
    .replace(/{order_number}/g, displayOrderNo);
  
  const result = await sendEmail({ to, subject, html });
  
  if (result.success) {
    await supabase.from('orders')
      .update({ shipped_email_sent: true })
      .eq('order_number', orderData.order_number);
  }
  
  return result.success;
};

/** Sent when admin marks an order as delivered — Trustpilot review request. */
export const sendOrderDeliveredReviewEmail = async (
  to: string,
  orderData: { order_number: string; customer_first_name?: string | null },
): Promise<boolean> => {
  const displayOrderNo = formatOrderNumberDisplay(orderData.order_number);
  const supportLinks = await getEmailSupportLinks();
  const firstName = (orderData.customer_first_name || '').trim();
  const greeting = firstName ? `Hi, ${escapeHtml(firstName)}` : 'Hi';
  const reviewUrl = CONFIG.TRUSTPILOT.REVIEW_URL;
  const contactLinks = emailSupportContactLinks(supportLinks);

  const defaultBody = `
    <p style="margin:0 0 18px;text-align:left;font-size:15px;color:${T.text};line-height:1.65;">${greeting},</p>
    <p style="margin:0 0 16px;text-align:left;font-size:15px;color:${T.muted};line-height:1.65;">If you've had a great experience with PEPLAB, we'd really appreciate it if you could leave us a quick review on Trustpilot.</p>
    <p style="margin:0 0 16px;text-align:left;font-size:15px;color:${T.muted};line-height:1.65;">With so many scam websites online, genuine reviews from real customers help others shop with confidence and know they're buying from a business they can trust.</p>
    <p style="margin:0 0 16px;text-align:left;font-size:15px;color:${T.muted};line-height:1.65;">If you're not completely satisfied or have experienced any issues, please ${contactLinks ? `reach us on ${contactLinks}` : 'contact us'} first. Your satisfaction is our top priority, and we're committed to making things right.</p>
    <p style="margin:0 0 22px;text-align:left;font-size:15px;color:${T.muted};line-height:1.65;">Thank you for your support. We truly appreciate every review!</p>
    ${emailCtaRow(reviewUrl, 'Leave a review on Trustpilot')}
    <p style="margin:24px 0 0;text-align:left;font-size:15px;color:${T.muted};line-height:1.65;">Kind regards,<br><strong style="color:${T.text};">The PEPLAB Team</strong></p>
    <p style="margin:14px 0 0;text-align:left;font-size:13px;color:${T.muted};line-height:1.55;">Order <strong style="color:${T.text};font-family:ui-monospace,Menlo,Consolas,monospace;">${escapeHtml(displayOrderNo)}</strong></p>
  `;

  const html = wrapPeplabEmail({
    preheader: `How was your PEPLAB order ${displayOrderNo}? Leave a review on Trustpilot`,
    headline: 'Thank you for your order',
    subline: 'Your feedback helps other researchers shop with confidence.',
    bodyHtml: defaultBody,
    supportLinks,
  })
    .replace(/{order_number}/g, displayOrderNo)
    .replace(/{trustpilot_url}/g, escapeHtml(reviewUrl));

  const subject = `We'd love your feedback — PEPLAB order ${displayOrderNo}`;
  const result = await sendEmail({ to, subject, html });
  return result.success;
};

/** Email for replacement / follow-up shipments (always sends; does not touch shipped_email_sent). */
export const sendReplacementTrackingEmail = async (
  to: string,
  orderData: { order_number: string; tracking_number: string; tracking_carrier?: string },
): Promise<boolean> => {
  const displayOrderNo = formatOrderNumberDisplay(orderData.order_number);
  const trackingUrl = `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(orderData.tracking_number)}`;
  const carrier = orderData.tracking_carrier || 'Australia Post';
  const on = escapeHtml(displayOrderNo);
  const tn = escapeHtml(orderData.tracking_number);
  const cr = escapeHtml(carrier);

  const defaultBody = `
    <p style="margin:0 0 16px;text-align:center;font-size:15px;color:${T.muted};">We’ve sent a replacement parcel for your order.</p>
    ${emailCallout(
      `<span style="font-size:12px;color:${T.muted};text-transform:uppercase;letter-spacing:0.12em;">Replacement tracking</span><br>
       <span style="font-size:20px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:${T.teal};letter-spacing:0.03em;">${tn}</span><br>
       <span style="font-size:13px;color:${T.muted};margin-top:8px;display:inline-block;">Carrier: <strong style="color:${T.text};">${cr}</strong></span>`,
      'info',
    )}
    ${emailCtaRow(trackingUrl, 'Track replacement shipment')}
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:${T.muted};line-height:1.55;">Typical delivery: <strong style="color:${T.text};">2–4 business days</strong> (Express) or <strong style="color:${T.text};">5–8</strong> (Standard).</p>
    <p style="margin:10px 0 0;text-align:center;font-size:13px;color:${T.muted};">Order <strong style="color:${T.text};font-family:ui-monospace,Menlo,Consolas,monospace;">${on}</strong></p>
  `;

  const html = wrapPeplabEmail({
    preheader: `Replacement shipment tracking for PEPLAB order ${displayOrderNo}`,
    headline: 'Replacement shipped',
    subline: 'Use your new tracking number to follow delivery.',
    bodyHtml: defaultBody,
  });

  const subject = `Replacement Shipment Tracking - ${displayOrderNo}`;
  const result = await sendEmail({ to, subject, html });
  return result.success;
};

// Human-readable labels for the internal `status` column.
const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_payment: 'Awaiting Payment',
  processing: 'Processing',
  finalised: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

// Short copy next to the status — one sentence the customer actually wants to read.
const ORDER_STATUS_DESCRIPTIONS: Record<string, string> = {
  pending_payment: 'We’re waiting for your payment to land. Once it does, we move to preparing your order.',
  processing: 'Payment confirmed — your order is being prepared for dispatch.',
  finalised: 'Payment confirmed — your order is being prepared for dispatch.',
  shipped: 'Your order has left our facility and is on its way.',
  delivered: 'Your order has arrived.',
  cancelled: 'This order has been cancelled. If that’s unexpected, reply to this email and we’ll sort it out.',
};

// Send an on-demand order-tracking-status email.
// Triggered when a user looks up their order on /track-order — emails a clean summary of
// where the order is right now, including the tracking number if the order has shipped.
export const sendOrderTrackingUpdate = async (
  to: string,
  order: {
    order_number: string;
    status: string;
    payment_status?: string | null;
    tracking_number?: string | null;
    shipping_method?: string | null;
    total?: number | null;
  },
): Promise<{ ok: boolean; error?: string }> => {
  const displayOrderNo = formatOrderNumberDisplay(order.order_number);
  const statusKey = (order.status || '').toLowerCase();
  const statusLabel = ORDER_STATUS_LABELS[statusKey] || order.status || 'In Progress';
  const statusDesc =
    ORDER_STATUS_DESCRIPTIONS[statusKey] || 'Here’s the latest on your order.';

  const on = escapeHtml(displayOrderNo);
  const stLabel = escapeHtml(statusLabel);
  const stDesc = escapeHtml(statusDesc);
  const site = shopOrigin();
  const trackUrl = `${site}/track-order?order=${encodeURIComponent(displayOrderNo)}&email=${encodeURIComponent(to)}`;

  // Build a tracking-number callout only when we actually have one.
  const trackingBlock = order.tracking_number
    ? emailCallout(
        `<span style="font-size:12px;color:${T.muted};text-transform:uppercase;letter-spacing:0.12em;">Tracking Number</span><br>
         <span style="font-size:18px;font-weight:800;font-family:ui-monospace,Menlo,Consolas,monospace;color:${T.teal};letter-spacing:0.03em;">${escapeHtml(order.tracking_number)}</span>${
          order.shipping_method
            ? `<br><span style="font-size:12px;color:${T.muted};margin-top:6px;display:inline-block;">via <strong style="color:${T.text};">${escapeHtml(order.shipping_method)}</strong></span>`
            : ''
        }`,
        'info',
      )
    : '';

  // Status-tinted callout colour map.
  const calloutVariant: 'success' | 'info' | 'warn' =
    statusKey === 'delivered'
      ? 'success'
      : statusKey === 'cancelled'
        ? 'warn'
        : 'info';

  const defaultBody = `
    ${emailCallout(
      `<span style="font-size:13px;color:${T.muted};text-transform:uppercase;letter-spacing:0.12em;">Status</span><br>
       <span style="font-size:22px;font-weight:800;color:${T.text};">${stLabel}</span><br>
       <span style="font-size:14px;color:${T.muted};margin-top:6px;display:inline-block;line-height:1.55;">${stDesc}</span>`,
      calloutVariant,
    )}
    ${trackingBlock}
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:${T.muted};">Order <strong style="color:${T.text};font-family:ui-monospace,Menlo,Consolas,monospace;">${on}</strong></p>
    ${emailCtaRow(trackUrl, 'View latest status')}
    <p style="margin:14px 0 0;text-align:center;font-size:12px;color:${T.muted};line-height:1.55;">You’re receiving this because someone looked up this order on our tracking page. If that wasn’t you, you can safely ignore this email.</p>
  `;

  const template = await getEmailTemplate('order_tracking_update');
  const html = (template?.html
    ? template.html
    : wrapPeplabEmail({
        preheader: `Order ${displayOrderNo} — ${statusLabel}`,
        headline: 'Order update',
        subline: 'Here’s the latest on your PEPLAB order.',
        bodyHtml: defaultBody,
      }))
    .replace(/{order_number}/g, displayOrderNo)
    .replace(/{status}/g, statusLabel)
    .replace(/{tracking_number}/g, order.tracking_number || '')
    .replace(/{track_url}/g, trackUrl);

  const subject = (template?.subject || 'Your PEPLAB order status — #{order_number}').replace(
    /{order_number}/g,
    displayOrderNo,
  );

  const result = await sendEmail({ to, subject, html });
  return { ok: result.success, error: result.error };
};

// Welcome email after successful sign-up. Sent in addition to (not instead of)
// any auth-system email the Supabase project might be configured to send.
/** CID for inline welcome hero — must match attachment `content_id` sent to Resend. */
const WELCOME_EMAIL_IMAGE_CID = 'peplab-welcome-hero';

export const sendSignUpWelcome = async (to: string, name: string): Promise<boolean> => {
  const displayName = (name || '').trim() || 'there';
  const template = await getEmailTemplate('signup_welcome');
  const site = shopOrigin();
  const path = CONFIG.WELCOME_EMAIL_IMAGE_PATH.startsWith('/')
    ? CONFIG.WELCOME_EMAIL_IMAGE_PATH
    : `/${CONFIG.WELCOME_EMAIL_IMAGE_PATH}`;
  const welcomeImageUrl = `${site}${path}`;
  /** Inline MIME part — shows without loading remote images (still bundled as attachment). */
  const welcomeImageInlineSrc = `cid:${WELCOME_EMAIL_IMAGE_CID}`;
  const welcomeImg = escapeHtml(welcomeImageInlineSrc);
  const nm = escapeHtml(displayName);
  const dashboardUrl = `${site}/dashboard`;

  const welcomeImageBlock = `
    <p style="margin:0 0 22px;text-align:center;">
      <img src="${welcomeImg}" alt="Welcome to PEPLAB" width="552"
        style="max-width:100%;width:100%;height:auto;border-radius:14px;display:block;margin:0 auto;border:0;outline:none;text-decoration:none;" />
    </p>`;

  const defaultBody = `
    ${welcomeImageBlock}
    <p style="margin:0 0 16px;text-align:center;font-size:16px;color:${T.text};">Hi <strong>${nm}</strong>,</p>
    <p style="margin:0 0 18px;text-align:center;font-size:15px;color:${T.muted};line-height:1.65;">You're all set — <strong style="color:${T.text};">no email verification needed</strong>. Your PEPLAB dashboard is ready, and you'll start earning rewards on your first order.</p>
    ${emailCtaRow(dashboardUrl, 'Go to my dashboard')}
    ${emailCallout(
      `<span style="font-size:13px;color:${T.muted};">Earn <strong style="color:${T.text};">1 point per $1 spent</strong>, plus a bonus on your first order — redeemable at checkout for instant discounts.</span>`,
      'info',
    )}
  `;

  const html = (template?.html
    ? template.html
    : wrapPeplabEmail({
        preheader: `Welcome to PEPLAB, ${displayName}`,
        headline: 'Welcome aboard',
        subline: 'Premium peptides, rewards, and support — all in one place.',
        bodyHtml: defaultBody,
      }))
    .replace(/{name}/g, displayName)
    .replace(/{site_url}/g, site)
    .replace(/{welcome_image_url}/g, welcomeImageInlineSrc);

  const subject =
    (template?.subject || 'Welcome to PEPLAB').replace(/{name}/g, displayName);

  const result = await sendEmail({
    to,
    subject,
    html,
    attachments: [
      {
        filename: 'welcome-email.jpeg',
        path: welcomeImageUrl,
        content_id: WELCOME_EMAIL_IMAGE_CID,
        content_type: 'image/jpeg',
      },
    ],
  });
  return result.success;
};

// Send password reset email
export const sendPasswordReset = async (
  to: string,
  resetUrl: string
): Promise<boolean> => {
  const template = await getEmailTemplate('password_reset');

  const defaultBody = `
    <p style="margin:0 0 14px;text-align:center;font-size:15px;color:${T.muted};line-height:1.6;">We received a request to reset the password for your PEPLAB account.</p>
    ${emailCtaRow(resetUrl, 'Reset password')}
    ${emailCallout(
      `<span style="font-size:13px;color:${T.muted};">This link expires in <strong style="color:${T.amber};">1 hour</strong>. If you didn’t ask for a reset, you can ignore this email — your password will stay the same.</span>`,
      'warn',
    )}
  `;

  const html = (template?.html ? template.html : wrapPeplabEmail({
    preheader: 'Reset your PEPLAB password',
    headline: 'Password reset',
    subline: 'Use the button below to choose a new password.',
    bodyHtml: defaultBody,
  })).replace(/{reset_url}/g, resetUrl);
  
  const result = await sendEmail({
    to,
    subject: 'Reset Your PEPLAB Password',
    html,
  });
  
  return result.success;
};

// Send affiliate discount confirmation to customer
export const sendAffiliateDiscountEmail = async (
  to: string,
  data: { order_number: string; code: string; discount_percent: number; discount_amount: number; total: number }
): Promise<boolean> => {
  const on = escapeHtml(formatOrderNumberDisplay(data.order_number));
  const code = escapeHtml(data.code);
  const defaultBody = `
    <p style="margin:0 0 16px;text-align:center;font-size:15px;color:${T.muted};">You used referral code <strong style="color:${T.teal};font-size:18px;">${code}</strong> on your order.</p>
    ${emailCallout(
      `<p style="margin:0 0 8px;"><strong style="color:${T.text};">Order:</strong> #${on}</p>
       <p style="margin:0 0 8px;"><strong style="color:${T.text};">Discount:</strong> ${data.discount_percent}% off (−$${data.discount_amount.toFixed(2)})</p>
       <p style="margin:0;"><strong style="color:${T.text};">Order Total:</strong> $${data.total.toFixed(2)}</p>`,
      'success',
    )}
    <p style="margin:16px 0 0;text-align:center;font-size:15px;color:${T.muted};">Thanks for shopping with PEPLAB!</p>
  `;

  const html = wrapPeplabEmail({
    preheader: `Discount applied on order ${data.order_number}`,
    headline: 'Discount applied',
    subline: 'Your promo code was applied successfully.',
    bodyHtml: defaultBody,
  });

  const result = await sendEmail({
    to,
    subject: `Discount Applied — Order #${formatOrderNumberDisplay(data.order_number)}`,
    html,
  });
  return result.success;
};

// Send commission notification to promoter
export const sendPromoterCommissionEmail = async (
  to: string,
  data: { promoter_name: string; order_number: string; commission: number; total_credit: number }
): Promise<boolean> => {
  const name = escapeHtml(data.promoter_name);
  const on = escapeHtml(formatOrderNumberDisplay(data.order_number));
  const dashboardUrl = `${shopOrigin()}/promoter`;
  const defaultBody = `
    <p style="margin:0 0 14px;text-align:center;font-size:15px;color:${T.muted};">Hey ${name},</p>
    <p style="margin:0 0 18px;text-align:center;font-size:15px;color:${T.muted};">Great news — someone used your referral code!</p>
    ${emailCallout(
      `<p style="margin:0 0 8px;"><strong style="color:${T.text};">Order #:</strong> ${on}</p>
       <p style="margin:0 0 8px;"><strong style="color:${T.text};">Your Commission:</strong> <span style="font-size:20px;color:${T.success};font-weight:bold;">$${data.commission.toFixed(2)}</span></p>
       <p style="margin:0;"><strong style="color:${T.text};">Total Store Credit:</strong> $${data.total_credit.toFixed(2)}</p>`,
      'success',
    )}
    <p style="margin:16px 0 0;text-align:center;font-size:15px;color:${T.muted};">Your commission has been added to your store credit. You can use it at checkout or view it in your Promoter Dashboard.</p>
    ${emailCtaRow(dashboardUrl, 'View dashboard')}
  `;

  const html = wrapPeplabEmail({
    preheader: `You earned $${data.commission.toFixed(2)} commission`,
    headline: 'You earned a commission',
    subline: 'Someone used your referral code.',
    bodyHtml: defaultBody,
  });

  const result = await sendEmail({
    to,
    subject: `You earned $${data.commission.toFixed(2)} — Order #${formatOrderNumberDisplay(data.order_number)}`,
    html,
  });
  return result.success;
};

// Send abandoned cart reminder
export const sendAbandonedCart = async (
  to: string,
  cartData: {
    items: Array<{ name?: string; dosage?: unknown; quantity?: number; price?: number }>;
    checkoutUrl: string;
  }
): Promise<boolean> => {
  const supportLinks = await getEmailSupportLinks();
  const rows: OrderItemRow[] = cartData.items.map((item: { name?: string; dosage?: unknown; quantity?: number; price?: number }) => ({
    name: String(item.name ?? 'Item'),
    dosage: String(item.dosage ?? ''),
    quantity: item.quantity ?? 0,
    lineTotal: `$${((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}`,
  }));

  const checkout = cartData.checkoutUrl;
  const defaultBody = `
    <p style="margin:0 0 20px;text-align:center;font-size:15px;color:${T.text};line-height:1.55;">Complete checkout to secure yours.</p>
    ${emailOrderItemsTable(rows)}
    ${emailCtaRow(checkout, 'Complete checkout', '#FFFFFF', 'green')}
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:${T.muted};">Need help? ${emailSupportContactLinks(supportLinks)}</p>
  `;

  const html = wrapPeplabEmail({
    preheader: 'Your PEPLAB selection is saved. Complete checkout when you are ready.',
    headline: 'Stock temporarily reserved',
    subline:
      'Your selection is saved, but availability is limited and we can\u2019t hold items for long.',
    bodyHtml: defaultBody,
    supportLinks,
  });

  const result = await sendEmail({
    to,
    subject: 'Your saved cart at PEPLAB',
    html,
  });
  
  return result.success;
};
