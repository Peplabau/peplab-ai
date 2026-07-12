import { useEffect, useState, type ReactNode } from 'react';
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin, ExternalLink, Send, Phone } from 'lucide-react';
import QRCode from 'react-qr-code';
import { getSiteSetting, DEFAULT_SUPPORT_LINKS } from '@/lib/settings';
import { CONFIG } from '@/lib/config';
import { SEO } from '@/components/SEO';

function telegramHandleFromUrl(input: string): string {
  const s = input.trim();
  const m = s.match(/(?:t\.me\/)([^/?#]+)/i);
  const fromPath = m?.[1];
  return (fromPath || s.replace(/^@/, '')).replace(/\/$/, '') || 'PepLabAu';
}

type QrAccent = 'telegram' | 'whatsapp';

function ContactQrTile({
  title,
  subtitle,
  emptyHint,
  url,
  accent,
  Icon,
}: {
  title: string;
  subtitle: string;
  emptyHint?: string;
  url: string;
  accent: QrAccent;
  Icon?: ReactNode;
}) {
  const trimmed = url.trim();

  const border =
    accent === 'telegram'
      ? 'border-[rgba(0,136,204,0.38)] hover:border-[rgba(0,136,204,0.6)]'
      : 'border-[rgba(34,197,94,0.38)] hover:border-[rgba(34,197,94,0.6)]';

  if (!trimmed) {
    return (
      <div
        className={`w-full max-w-[320px] flex flex-col rounded-2xl border border-dashed border-[rgba(244,246,250,0.12)] bg-[rgba(17,24,39,0.45)] p-6 sm:p-7 text-center`}
      >
        <div className="mx-auto mb-3 flex items-center gap-2 text-[#A9B3C7]">
          {Icon}
          <span className="font-bold text-[#F4F6FA]">{title}</span>
        </div>
        <p className="text-sm text-[#A9B3C7]">{emptyHint ?? subtitle}</p>
      </div>
    );
  }

  let displayLabel = trimmed.replace(/^https?:\/\/(www\.)?/, '');
  if (displayLabel.length > 48) displayLabel = `${displayLabel.slice(0, 44)}…`;

  const ctaBg =
    accent === 'telegram'
      ? 'bg-[#0088CC] hover:bg-[#0077b5]'
      : 'bg-[#22C55E] hover:bg-[#16A34A]';

  return (
    <div
      className={`w-full max-w-[320px] flex flex-col rounded-2xl bg-[rgba(17,24,39,0.75)] border p-6 sm:p-7 transition-colors hover:bg-[rgba(17,24,39,0.9)] ${border}`}
    >
      <div className="mb-4 flex justify-center">{Icon}</div>
      <h3 className="text-lg font-bold text-[#F4F6FA] mb-2 text-center">{title}</h3>
      <p className="text-sm text-[#A9B3C7] mb-5 text-center leading-snug">{subtitle}</p>

      <div className="mx-auto rounded-2xl bg-white p-3 sm:p-4 shadow-inner border border-black/10">
        <QRCode value={trimmed} size={168} fgColor="#070A12" bgColor="#ffffff" level="M" />
      </div>
      <p className="mt-3 text-[11px] text-[#6B7280] text-center">Scan with camera to open in app</p>

      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-5 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-white text-sm font-semibold transition-colors ${ctaBg}`}
      >
        {accent === 'telegram' ? (
          <>
            <Send className="w-4 h-4 shrink-0" />
            Open Telegram
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4 shrink-0" />
            Open WhatsApp
          </>
        )}
      </a>
      <p className="mt-3 text-xs text-[#6B7280] text-center break-all px-1">{displayLabel}</p>
    </div>
  );
}

export default function ContactInfo() {
  const [telegramLink, setTelegramLink] = useState(DEFAULT_SUPPORT_LINKS.telegram_link);
  const [whatsappLink, setWhatsappLink] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const telegramVal = await getSiteSetting<{ url: string }>('telegram_link', { url: DEFAULT_SUPPORT_LINKS.telegram_link });
        const whatsappVal = await getSiteSetting<{ url: string }>('whatsapp_link', { url: '' });
        if (cancelled) return;
        setTelegramLink(telegramVal?.url || DEFAULT_SUPPORT_LINKS.telegram_link);
        setWhatsappLink(typeof whatsappVal?.url === 'string' ? whatsappVal.url : '');
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tgHandle = telegramHandleFromUrl(telegramLink);
  const mapsQuery = encodeURIComponent(CONFIG.BUSINESS.ADDRESS_LINES.join(', '));
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <>
      <SEO
        title="Contact & Support | PEPLAB — Peptides Australia"
        description="PEPLAB contact details, Telegram support, business hours, and registered address. Australian research peptide supplier."
      />
    <div className="min-h-screen" style={{ background: '#070A12' }}>
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-overlay opacity-60" />

      {/* Navigation */}
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

      {/* Main Content */}
      <main className="relative z-10 px-6 lg:px-12 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="eyebrow mb-4 block">GET IN TOUCH</span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#F4F6FA] mb-4">
              Contact <span className="gradient-text">Information</span>
            </h1>
            <p className="text-base sm:text-lg text-[#A9B3C7] max-w-xl mx-auto">
              We&apos;re here to help. Email us anytime, or scan a QR code below to jump straight into Telegram
              or WhatsApp.
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] hover:border-[rgba(46,209,180,0.3)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[rgba(46,209,180,0.1)] flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[#2ED1B4]" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F6FA] mb-2">Email</h3>
              <p className="text-sm text-[#A9B3C7] mb-4">
                Send us an email — we reply within 24–48 hours.
              </p>
              <a
                href={`mailto:${CONFIG.CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 text-[#2ED1B4] hover:underline break-all"
              >
                {CONFIG.CONTACT_EMAIL}
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] hover:border-[rgba(236,72,153,0.35)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[rgba(236,72,153,0.1)] flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-[#EC4899]" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F6FA] mb-2">Phone</h3>
              <p className="text-sm text-[#A9B3C7] mb-4">
                Call or text during business hours — tap to dial on mobile.
              </p>
              <a
                href={`tel:${CONFIG.BUSINESS.PHONE_TEL}`}
                className="inline-flex items-center gap-2 text-[#EC4899] hover:underline whitespace-nowrap"
              >
                {CONFIG.BUSINESS.PHONE_DISPLAY}
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] hover:border-[rgba(0,136,204,0.35)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[rgba(0,136,204,0.12)] flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-[#0088CC]" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F6FA] mb-2">Telegram</h3>
              <p className="text-sm text-[#A9B3C7] mb-4">Fast replies — QR below encodes our live Telegram link.</p>
              <a
                href={telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0088CC] hover:underline"
              >
                @{tgHandle}
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)] hover:border-[rgba(139,92,246,0.3)] transition-colors">
              <div className="w-12 h-12 rounded-xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#8B5CF6]" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F6FA] mb-2">Response time</h3>
              <p className="text-sm text-[#A9B3C7] mb-4">
                We aim to respond to enquiries quickly Mon–Fri (AEST).
              </p>
              <span className="text-[#8B5CF6] font-medium">Within 24–48 hours · Often faster on chat</span>
            </div>
          </div>

          {/* QR section */}
          <div className="mb-14">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F4F6FA] mb-2">Scan to connect</h2>
              <p className="text-sm sm:text-base text-[#A9B3C7] max-w-2xl mx-auto">
                Codes are generated from the same Telegram and WhatsApp URLs you configure in Admin — no
                static fake patterns.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-10 gap-y-12">
              <ContactQrTile
                title="Telegram"
                subtitle={`Quick support on @{tgHandle}. Scan to open Telegram.`}
                url={telegramLink}
                accent="telegram"
                Icon={
                  <div className="w-12 h-12 rounded-xl bg-[rgba(0,136,204,0.2)] flex items-center justify-center">
                    <Send className="w-6 h-6 text-[#0088CC]" />
                  </div>
                }
              />
              <ContactQrTile
                title="WhatsApp"
                subtitle="Same WhatsApp chat link PEPLAB uses on the storefront — scan to open."
                emptyHint="Add your WhatsApp URL (for example wa.me/614…) in Admin → Support Links to show a QR here."
                url={whatsappLink}
                accent="whatsapp"
                Icon={
                  <div className="w-12 h-12 rounded-xl bg-[rgba(34,197,94,0.2)] flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-[#22C55E]" />
                  </div>
                }
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-5 h-5 text-[#EC4899]" />
                <h3 className="text-lg font-bold text-[#F4F6FA]">Our address</h3>
              </div>
              <address className="text-[#A9B3C7] not-italic leading-relaxed mb-4">
                {CONFIG.BUSINESS.ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </address>
              <p className="text-sm text-[#A9B3C7] mb-4">
                ABN: <span className="text-[#F4F6FA]">{CONFIG.BUSINESS.ABN}</span>
              </p>
              <p className="text-sm text-[#A9B3C7] mb-4">
                Australian-based with dispatch from our local warehouse. EU shipping available on select orders.
              </p>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-[#2ED1B4] hover:underline"
              >
                Open in Google Maps
                <ExternalLink className="w-4 h-4 shrink-0" />
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-[rgba(17,24,39,0.6)] border border-[rgba(244,246,250,0.08)]">
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-5 h-5 text-[#2ED1B4]" />
                <h3 className="text-lg font-bold text-[#F4F6FA]">Support hours</h3>
              </div>
              <p className="text-[#A9B3C7]">
                Core team: Monday–Friday, 9:00 AM–6:00 PM AEDT. Telegram/WhatsApp often get faster turnaround when
                available.
              </p>
            </div>
          </div>

          {/* Contact Form Link */}
          <div className="mt-12 text-center">
            <p className="text-[#A9B3C7] mb-4">Prefer a written enquiry through the site?</p>
            <a href="/contact" className="inline-flex items-center gap-2 btn-primary">
              <MessageCircle className="w-4 h-4" />
              Go to contact form
            </a>
          </div>
        </div>
      </main>

      <footer className="relative z-10 px-6 lg:px-12 py-8 border-t border-[rgba(244,246,250,0.08)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A9B3C7]">© 2026 PEPLAB. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-[#A9B3C7]">
            <a href="/privacy" className="hover:text-[#F4F6FA] transition-colors">
              Privacy
            </a>
            <a href="/terms" className="hover:text-[#F4F6FA] transition-colors">
              Terms
            </a>
            <a href="/refund" className="hover:text-[#F4F6FA] transition-colors">
              Refunds
            </a>
            <a href="/shipping" className="hover:text-[#F4F6FA] transition-colors">
              Shipping
            </a>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
