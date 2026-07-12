import { useState, useEffect } from 'react';
import { useAffiliate } from '@/context/AffiliateContext';
import {
  updateSessionUserReferralCode,
  REFERRAL_CODE_MIN_LEN,
  REFERRAL_CODE_MAX_LEN,
} from '@/lib/affiliates';

/**
 * Lets a promoter choose a custom referral code (letters and numbers only,
 * unique across all promoters). Parent should only render when `myPromoter` exists.
 */
export default function PromoCodeEditor() {
  const { myPromoter, refreshPromoterData } = useAffiliate();
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (myPromoter) setValue(myPromoter.referral_code);
  }, [myPromoter?.id, myPromoter?.referral_code]);

  if (!myPromoter) return null;

  const unchanged =
    value.trim().toUpperCase() === myPromoter.referral_code.toUpperCase();

  const onSave = async () => {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      const res = await updateSessionUserReferralCode(value);
      if (!res.ok) {
        setError(res.error ?? 'Could not update code');
        return;
      }
      setSuccess(true);
      await refreshPromoterData();
      window.setTimeout(() => setSuccess(false), 2800);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-[rgba(244,246,250,0.08)] space-y-2">
      <p className="text-[10px] uppercase tracking-wider text-[#A9B3C7]">Customize code</p>
      <div className="flex flex-col sm:flex-row gap-2 sm:items-stretch">
        <input
          type="text"
          value={value}
          onChange={(e) =>
            setValue(e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
          }
          maxLength={REFERRAL_CODE_MAX_LEN}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-0 px-3 py-2 rounded-xl bg-[rgba(7,10,18,0.6)] border border-[rgba(244,246,250,0.12)] text-sm text-[#F4F6FA] font-mono tracking-wider outline-none focus:border-[#22C55E]/50"
          placeholder={`${REFERRAL_CODE_MIN_LEN}-${REFERRAL_CODE_MAX_LEN} letters or numbers`}
        />
        <button
          type="button"
          onClick={onSave}
          disabled={saving || unchanged}
          className="px-4 py-2 rounded-xl bg-[#22C55E] text-[#070A12] text-xs sm:text-sm font-semibold hover:bg-[#16A34A] disabled:opacity-45 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p className="text-[10px] text-[#A9B3C7]/90 leading-snug">
        Must be unique. Changing your code updates your share link — old codes stop working.
      </p>
      {error && <p className="text-xs text-rose-300">{error}</p>}
      {success && <p className="text-xs text-emerald-400">Promo code updated.</p>}
    </div>
  );
}
