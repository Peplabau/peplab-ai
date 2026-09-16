import { useState } from 'react';
import { Check, Copy, Percent } from 'lucide-react';
import {
  EMAIL_CAMPAIGN_DISCOUNT_PERCENT,
  EMAIL_CAMPAIGN_PROMO_CODE,
  isEmailCampaignPromoCode,
  setEmailCampaignPromoActive,
  type PromoCode,
} from '@/lib/promo-codes';
import { copyTextToClipboard } from '@/lib/clipboard';

export default function EmailCampaignPromoToggle({
  codes,
  onChanged,
}: {
  codes: PromoCode[];
  onChanged: () => Promise<void> | void;
}) {
  const campaign = codes.find((row) => isEmailCampaignPromoCode(row.code)) ?? null;
  const isActive = Boolean(campaign?.is_active);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleToggle = async () => {
    if (saving) return;
    setError('');
    setSaving(true);
    const result = await setEmailCampaignPromoActive(!isActive, campaign);
    setSaving(false);
    if (!result.ok) {
      setError(result.error || `Could not update ${EMAIL_CAMPAIGN_PROMO_CODE}`);
      return;
    }
    await onChanged();
  };

  const handleCopy = async () => {
    await copyTextToClipboard(EMAIL_CAMPAIGN_PROMO_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-[rgba(245,158,11,0.12)] to-[rgba(139,92,246,0.12)] border border-[rgba(245,158,11,0.28)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-[#F4F6FA] flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#F59E0B]" />
            {EMAIL_CAMPAIGN_DISCOUNT_PERCENT}% off email campaign
          </h3>
          <p className="text-sm text-[#A9B3C7] mt-1">
            Shared across every storefront on this Supabase backend. Turn it on to accept{' '}
            <span className="font-mono text-[#F4F6FA]">{EMAIL_CAMPAIGN_PROMO_CODE}</span> at checkout, off to reject it.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(244,246,250,0.12)] font-mono font-semibold tracking-widest text-[#F4F6FA] text-sm"
            >
              {EMAIL_CAMPAIGN_PROMO_CODE}
              {copied ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5 opacity-50" />}
            </button>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                isActive
                  ? 'bg-[rgba(34,197,94,0.15)] text-[#22C55E]'
                  : 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
              }`}
            >
              {isActive ? 'Live at checkout' : 'Off — customers cannot use it'}
            </span>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${EMAIL_CAMPAIGN_PROMO_CODE}`}
          disabled={saving}
          onClick={() => void handleToggle()}
          className={`relative inline-flex items-center w-14 h-8 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50 ${
            isActive ? 'bg-[#22C55E]' : 'bg-[rgba(244,246,250,0.15)]'
          }`}
        >
          <span
            className={`inline-block w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
              isActive ? 'translate-x-[26px]' : 'translate-x-[4px]'
            }`}
          />
        </button>
      </div>
      {error && <p className="text-sm text-[#EF4444] mt-3">{error}</p>}
    </div>
  );
}
