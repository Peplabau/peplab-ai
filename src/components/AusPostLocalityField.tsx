import { useEffect, useRef, useState } from 'react';
import { suggestAusPostLocalities, type AusPostLocalitySuggestion } from '@/lib/auspost-address';

const inputClass =
  'w-full px-3 py-2 rounded-lg bg-black/30 border border-white/10 text-white text-xs focus:border-[#2ED1B4] outline-none';

export default function AusPostLocalityField({
  kind,
  value,
  onChange,
  onPick,
  onBlurVerify,
}: {
  kind: 'suburb' | 'postcode';
  value: string;
  onChange: (value: string) => void;
  onPick: (suggestion: AusPostLocalitySuggestion) => void;
  onBlurVerify: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const blurTimer = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const [suggestions, setSuggestions] = useState<AusPostLocalitySuggestion[]>([]);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = window.setTimeout(() => {
      void suggestAusPostLocalities(q).then((rows) => {
        if (cancelled) return;
        setSuggestions(rows);
        setActive(0);
        setLoading(false);
      });
    }, 280);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    return () => {
      if (blurTimer.current) window.clearTimeout(blurTimer.current);
    };
  }, []);

  const pick = (row: AusPostLocalitySuggestion) => {
    if (blurTimer.current) window.clearTimeout(blurTimer.current);
    setOpen(false);
    setSuggestions([]);
    onPick(row);
  };

  const showList = open && (loading || suggestions.length > 0);

  return (
    <div ref={wrapRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(kind === 'postcode' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => {
            setOpen(false);
            onBlurVerify();
          }, 160);
        }}
        onKeyDown={(e) => {
          if (!showList || suggestions.length === 0) return;
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, suggestions.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === 'Enter' && suggestions[active]) {
            e.preventDefault();
            pick(suggestions[active]);
          } else if (e.key === 'Escape') {
            setOpen(false);
          }
        }}
        required
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode={kind === 'postcode' ? 'numeric' : 'text'}
        maxLength={kind === 'postcode' ? 4 : undefined}
        className={inputClass}
        placeholder={kind === 'postcode' ? 'Postcode' : 'Suburb'}
        aria-autocomplete="list"
        aria-expanded={showList}
      />
      {showList && (
        <div className="absolute left-0 right-0 z-30 mt-1 rounded-lg border border-white/15 bg-[#111827] shadow-xl overflow-hidden">
          {loading && suggestions.length === 0 && (
            <p className="px-3 py-2 text-[11px] text-[#A9B3C7]">Searching Australia Post…</p>
          )}
          {suggestions.map((row, index) => (
            <button
              key={row.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(row)}
              className={`w-full text-left px-3 py-2 text-[11px] ${
                index === active ? 'bg-[#2ED1B4]/15 text-white' : 'text-[#F4F6FA] hover:bg-white/5'
              }`}
            >
              {row.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
