import { CONFIG } from './config';

/** Light transactional palette — white card, no dark outer frame (matches saved-cart emails). */
export const EMAIL_THEME = {
  pageBg: '#FFFFFF',
  panel: '#FFFFFF',
  panel2: '#F3F4F6',
  border: 'rgba(46, 209, 180, 0.35)',
  borderSub: '#E5E7EB',
  tableHead: '#EFF6FF',
  text: '#111827',
  muted: '#6B7280',
  teal: '#2ED1B4',
  tealDeep: '#1FA896',
  purple: '#8B5CF6',
  amber: '#D97706',
  success: '#059669',
} as const;

const C = EMAIL_THEME;

/** @deprecated Use default light theme — kept so older call sites compile unchanged. */
export const PEPLAB_TRANSACTIONAL_EMAIL_COLORS = {
  pageBg: C.pageBg,
  panel: C.panel,
  panel2: C.panel2,
} as const;

export function escapeHtml(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type WrapOpts = {
  preheader?: string;
  headline: string;
  subline?: string;
  bodyHtml: string;
  /** Optional palette overrides (defaults to light transactional theme). */
  colors?: Partial<{ pageBg: string; panel: string; panel2: string }>;
  /** Telegram / WhatsApp only — no email in customer-facing footers. */
  supportLinks?: EmailSupportLinks;
};

export type EmailSupportLinks = {
  telegramUrl?: string;
  whatsappUrl?: string;
};

/** Inline Telegram · WhatsApp links for email bodies and footers. */
export function emailSupportContactLinks(links?: EmailSupportLinks): string {
  const telegram = (links?.telegramUrl || CONFIG.SOCIAL.TELEGRAM || '').trim();
  const whatsapp = (links?.whatsappUrl || '').trim();
  const linkStyle = `color:${C.teal};text-decoration:none;font-weight:600;`;
  const parts: string[] = [];
  if (telegram) {
    parts.push(`<a href="${escapeHtml(telegram)}" style="${linkStyle}">Telegram</a>`);
  }
  if (whatsapp) {
    parts.push(`<a href="${escapeHtml(whatsapp)}" style="${linkStyle}">WhatsApp</a>`);
  }
  return parts.join(' · ');
}

/** Tracking + need-help contact block (Telegram / WhatsApp only). */
export function emailSupportHelpBlock(links?: EmailSupportLinks): string {
  const contact = emailSupportContactLinks(links);
  if (!contact) return '';
  return `
    <p style="margin:18px 0 0;text-align:center;font-size:14px;color:${C.muted};line-height:1.65;">If you don't receive a tracking number within <strong style="color:${C.text};">24 hours</strong>, please contact us: ${contact}</p>
    <p style="margin:18px 0 0;text-align:center;font-size:13px;color:${C.muted};">Need help? ${contact}</p>
  `;
}

/**
 * PEPLAB transactional wrapper — centered white card, brand bar, light footer.
 */
export function wrapPeplabEmail(opts: WrapOpts): string {
  const pre = escapeHtml(opts.preheader ?? '').slice(0, 140);
  const headline = escapeHtml(opts.headline);
  const subline = opts.subline ? escapeHtml(opts.subline) : '';
  const site = escapeHtml(CONFIG.SITE_URL.replace(/\/$/, ''));
  const supportContact = emailSupportContactLinks(opts.supportLinks);
  const pageBg = opts.colors?.pageBg ?? C.pageBg;
  const panel = opts.colors?.panel ?? C.panel;
  const panel2 = opts.colors?.panel2 ?? C.panel2;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:${pageBg};-webkit-text-size-adjust:100%;">
  ${pre ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${pre}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${pageBg};">
    <tr>
      <td align="center" style="padding:24px 16px 32px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;background:${panel};border-radius:20px;border:1px solid ${C.borderSub};overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">
          <tr>
            <td style="height:4px;background:${C.teal};background:linear-gradient(90deg,${C.teal} 0%,${C.purple} 100%);"></td>
          </tr>
          <tr>
            <td align="center" style="padding:28px 24px 8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
              <span style="font-size:11px;font-weight:700;letter-spacing:0.35em;color:${C.teal};text-transform:uppercase;">PEPLAB</span>
              <h1 style="margin:14px 0 0;font-size:24px;line-height:1.25;font-weight:700;color:${C.text};text-align:center;">${headline}</h1>
              ${subline ? `<p style="margin:10px 0 0;font-size:15px;line-height:1.5;color:${C.muted};text-align:center;max-width:480px;margin-left:auto;margin-right:auto;">${subline}</p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:${C.muted};">
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 24px 24px;border-top:1px solid ${C.borderSub};background:${panel2};">
              <p style="margin:0 0 8px;font-size:12px;color:${C.muted};text-align:center;line-height:1.5;">
                ${supportContact
                  ? `Questions? Reach us on ${supportContact}`
                  : 'Questions? Visit us online'}
              </p>
              <p style="margin:0;font-size:11px;color:${C.muted};opacity:0.85;text-align:center;">
                <a href="${site}" style="color:${C.muted};text-decoration:underline;">${site}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailCtaRow(
  href: string,
  label: string,
  textColor = '#FFFFFF',
  button: 'brand' | 'green' = 'brand',
): string {
  const h = escapeHtml(href);
  const l = escapeHtml(label);
  const bgStyle =
    button === 'green'
      ? `background:#22C55E;`
      : `background:linear-gradient(90deg,${C.teal},${C.tealDeep});`;
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 8px;">
    <tr>
      <td align="center" style="padding:0;">
        <a href="${h}" style="display:inline-block;${bgStyle}color:${textColor};font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:999px;letter-spacing:0.02em;">${l}</a>
      </td>
    </tr>
  </table>`;
}

export function emailCallout(htmlInner: string, variant: 'info' | 'warn' | 'success' = 'info'): string {
  const border =
    variant === 'warn' ? C.amber : variant === 'success' ? C.success : C.teal;
  const bg =
    variant === 'warn'
      ? '#FFFBEB'
      : variant === 'success'
        ? '#ECFDF5'
        : '#ECFEFF';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;border-radius:14px;border:1px solid ${border};background:${bg};">
    <tr>
      <td style="padding:16px 18px;font-size:14px;line-height:1.55;color:${C.text};text-align:center;">
        ${htmlInner}
      </td>
    </tr>
  </table>`;
}

export function emailDetailRow(label: string, value: string, mono = true): string {
  const v = escapeHtml(value);
  const font = mono ? 'font-family:ui-monospace,Menlo,Consolas,monospace;' : '';
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 10px;">
    <tr>
      <td align="center" style="padding:10px 14px;background:${C.panel2};border-radius:12px;border:1px solid ${C.borderSub};">
        <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${C.muted};text-align:center;">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:15px;font-weight:600;color:${C.text};text-align:center;${font}">${v}</p>
      </td>
    </tr>
  </table>`;
}

export type OrderItemRow = { name: string; dosage: string; quantity: number; lineTotal: string };

export function emailOrderItemsTable(items: OrderItemRow[]): string {
  if (!items.length) return '';
  const rows = items
    .map(
      (it) => `
    <tr>
      <td style="padding:12px 14px;border-bottom:1px solid ${C.borderSub};color:${C.text};font-size:14px;text-align:center;">${escapeHtml(it.name)}</td>
      <td style="padding:12px 14px;border-bottom:1px solid ${C.borderSub};color:${C.muted};font-size:13px;text-align:center;">${escapeHtml(it.dosage)} × ${it.quantity}</td>
      <td style="padding:12px 14px;border-bottom:1px solid ${C.borderSub};color:${C.teal};font-size:14px;font-weight:700;text-align:center;font-family:ui-monospace,Menlo,Consolas,monospace;">${escapeHtml(it.lineTotal)}</td>
    </tr>`,
    )
    .join('');
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;border-radius:14px;overflow:hidden;border:1px solid ${C.borderSub};">
    <tr style="background:${C.tableHead};">
      <th style="padding:10px 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.muted};text-align:center;">Product</th>
      <th style="padding:10px 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.muted};text-align:center;">Qty</th>
      <th style="padding:10px 8px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${C.muted};text-align:center;">Total</th>
    </tr>
    ${rows}
  </table>`;
}
