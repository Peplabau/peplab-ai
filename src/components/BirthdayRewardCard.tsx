import { useCallback, useEffect, useRef, useState } from 'react';
import { Cake, Gift, Check } from 'lucide-react';
import {
  claimBirthdayReward,
  getUserBirthdayInfo,
  saveUserDateOfBirth,
} from '@/lib/supabase-db';
import BirthdayDatePicker from '@/components/BirthdayDatePicker';
import {
  BIRTHDAY_BONUS,
  formatBirthdayDisplay,
  isBirthdayToday,
  isValidBirthdayInput,
  normalizeBirthdayInput,
} from '@/utils/birthday-reward';

interface BirthdayRewardCardProps {
  userId: string;
  onPointsClaimed?: () => void;
  /** Fits inside Settings profile tab without a second heavy card shell. */
  variant?: 'default' | 'embedded';
}

export default function BirthdayRewardCard({
  userId,
  onPointsClaimed,
  variant = 'default',
}: BirthdayRewardCardProps) {
  const [dateOfBirth, setDateOfBirth] = useState<string | null>(null);
  const [lastRewardYear, setLastRewardYear] = useState<number | null>(null);
  const [draftDob, setDraftDob] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const claimedThisYear = lastRewardYear === currentYear;
  const birthdayToday = dateOfBirth ? isBirthdayToday(dateOfBirth) : false;

  const loadBirthdayInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await getUserBirthdayInfo(userId);
      setDateOfBirth(info.dateOfBirth);
      setLastRewardYear(info.lastBirthdayRewardYear);
      if (info.dateOfBirth) {
        setDraftDob(normalizeBirthdayInput(info.dateOfBirth) ?? info.dateOfBirth.slice(0, 10));
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const autoClaimRef = useRef(false);

  const tryAutoClaim = useCallback(async () => {
    try {
      const result = await claimBirthdayReward();
      if (result.ok) {
        setLastRewardYear(result.year);
        setSuccessMessage(`Happy birthday! ${result.points} points have been added to your account.`);
        onPointsClaimed?.();
        return;
      }
      if (result.error === 'already_claimed') {
        setLastRewardYear(result.year ?? currentYear);
      }
    } catch {
      /* ignore — user can revisit on next login */
    }
  }, [currentYear, onPointsClaimed]);

  useEffect(() => {
    void loadBirthdayInfo();
  }, [loadBirthdayInfo]);

  useEffect(() => {
    if (loading || !dateOfBirth || claimedThisYear || !birthdayToday || autoClaimRef.current) return;
    autoClaimRef.current = true;
    void tryAutoClaim();
  }, [loading, dateOfBirth, claimedThisYear, birthdayToday, tryAutoClaim]);

  const handleSave = async () => {
    setError(null);
    setSuccessMessage(null);

    const normalizedDob = normalizeBirthdayInput(draftDob);
    if (!normalizedDob || !isValidBirthdayInput(normalizedDob)) {
      setError('Please enter a valid date of birth.');
      return;
    }

    setSaving(true);
    try {
      const result = await saveUserDateOfBirth(normalizedDob);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDateOfBirth(result.dateOfBirth);
      if (result.claimed && result.points) {
        setLastRewardYear(result.year ?? currentYear);
        setSuccessMessage(`Happy birthday! ${result.points} points have been added to your account.`);
        onPointsClaimed?.();
      } else {
        setSuccessMessage(`Date of birth saved. You'll receive ${BIRTHDAY_BONUS} points each year on ${formatBirthdayDisplay(result.dateOfBirth)}.`);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    if (variant === 'embedded') {
      return (
        <div className="pt-5 border-t border-[rgba(244,246,250,0.08)] animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-[rgba(244,246,250,0.08)]" />
          <div className="h-13 w-full rounded-xl bg-[rgba(244,246,250,0.06)]" />
        </div>
      );
    }
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.22)] animate-pulse">
        <div className="h-5 w-40 rounded bg-[rgba(244,246,250,0.08)] mb-3" />
        <div className="h-10 w-full rounded-xl bg-[rgba(244,246,250,0.06)]" />
      </div>
    );
  }

  const shellClass =
    variant === 'embedded'
      ? 'pt-5 border-t border-[rgba(244,246,250,0.08)]'
      : 'p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[rgba(245,158,11,0.12)] to-[rgba(236,72,153,0.1)] border border-[rgba(245,158,11,0.28)]';

  return (
    <div className={shellClass}>
      <div className={`flex items-start gap-3 ${variant === 'embedded' ? 'mb-4' : 'mb-4'}`}>
        <div
          className={`rounded-xl flex items-center justify-center shrink-0 ${
            variant === 'embedded'
              ? 'w-10 h-10 bg-[rgba(245,158,11,0.12)]'
              : 'w-10 h-10 bg-[rgba(245,158,11,0.18)]'
          }`}
        >
          <Cake className="w-5 h-5 text-[#F59E0B]" />
        </div>
        <div className="min-w-0">
          <h3 className={`font-semibold text-[#F4F6FA] ${variant === 'embedded' ? 'text-sm' : 'text-base sm:text-lg'}`}>
            Birthday gift
          </h3>
          <p className={`text-[#A9B3C7] mt-1 ${variant === 'embedded' ? 'text-xs' : 'text-xs sm:text-sm'}`}>
            Get <span className="text-[#F59E0B] font-semibold">{BIRTHDAY_BONUS} points</span> on your birthday.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.25)] text-sm text-[#22C55E]">
          <Check className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {claimedThisYear ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(7,10,18,0.45)] border border-[rgba(244,246,250,0.08)] text-sm text-[#A9B3C7]">
          <Gift className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            You received your {currentYear} birthday gift
            {dateOfBirth ? ` (${formatBirthdayDisplay(dateOfBirth)})` : ''}.
          </span>
        </div>
      ) : dateOfBirth ? (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-[rgba(7,10,18,0.45)] border border-[rgba(244,246,250,0.08)]">
            <p className="text-xs uppercase tracking-[0.12em] text-[#A9B3C7] mb-1">Your birthday</p>
            <p className="text-sm font-medium text-[#F4F6FA]">{formatBirthdayDisplay(dateOfBirth)}</p>
            <p className="text-xs text-[#A9B3C7] mt-2">
              {birthdayToday
                ? `Your ${BIRTHDAY_BONUS} birthday points are being added…`
                : `We'll add ${BIRTHDAY_BONUS} points automatically on ${formatBirthdayDisplay(dateOfBirth)} each year.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <span className={`font-medium text-[#A9B3C7] mb-2 block ${variant === 'embedded' ? 'text-sm' : 'text-xs'}`}>
              Date of birth
            </span>
            <BirthdayDatePicker
              value={draftDob}
              onChange={(next) => {
                setDraftDob(next);
                setError(null);
              }}
              className={variant === 'embedded' ? undefined : 'text-sm'}
            />
          </label>
          {error && <p className="text-xs text-[#EF4444]">{error}</p>}
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !draftDob}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F59E0B] text-[#070A12] text-sm font-semibold hover:bg-[#D97706] disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving…' : 'Save date of birth'}
          </button>
        </div>
      )}
    </div>
  );
}
