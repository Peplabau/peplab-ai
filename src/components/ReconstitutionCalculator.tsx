import { useMemo, useState } from 'react';
import { AlertTriangle, Calculator, Copy, RotateCcw, Syringe } from 'lucide-react';

const SYRINGE_OPTIONS = [0.3, 0.5, 1] as const;
const COMPOUND_MG = [5, 10, 15, 20, 30, 40, 50, 60, 100] as const;
const COMPOUND_IU = [10, 75, 2000, 4000, 5000, 10000] as const;
const DILUENT_ML = [1, 2, 3, 5, 10] as const;
const DOSE_MG = [0.1, 0.25, 0.5, 1, 1.5, 2, 2.5, 3] as const;
const DOSE_MCG = [50, 100, 250, 500, 750, 1000] as const;
const DOSE_IU = [100, 250, 500, 750, 1000, 1500, 2000] as const;

type CompoundUnit = 'mg' | 'IU';
type DoseUnit = 'mg' | 'mcg' | 'IU';

type CalculatorState = {
  syringeMl: number;
  compoundUnit: CompoundUnit;
  compoundValue: number;
  diluentMl: number;
  doseUnit: DoseUnit;
  doseValue: number;
};

const DEFAULTS: CalculatorState = {
  syringeMl: 1,
  compoundUnit: 'mg',
  compoundValue: 10,
  diluentMl: 1,
  doseUnit: 'mg',
  doseValue: 0.5,
};

function parsePositive(value: string, fallback: number): number {
  const parsed = parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatNum(value: number, decimals: number): string {
  return value.toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCompound(value: number, unit: CompoundUnit): string {
  if (unit === 'IU') {
    return `${Math.round(value).toLocaleString('en-AU')} IU`;
  }
  return `${formatNum(value, value % 1 === 0 ? 0 : 1)} mg`;
}

function formatDose(value: number, unit: DoseUnit): string {
  if (unit === 'IU') return `${Math.round(value).toLocaleString('en-AU')} IU`;
  if (unit === 'mcg') return `${Math.round(value).toLocaleString('en-AU')} mcg`;
  return `${formatNum(value, value % 1 === 0 ? 0 : 2)} mg`;
}

function formatConcentration(value: number, unit: CompoundUnit): string {
  if (unit === 'IU') return `${Math.round(value).toLocaleString('en-AU')} IU/ml`;
  return `${formatNum(value, 3)} mg/ml`;
}

function SyringeIcon({ selected }: { selected: boolean }) {
  const barrel = selected ? '#22C55E' : '#A9B3C7';
  const plunger = selected ? '#16A34A' : '#6B7280';
  const needle = selected ? '#15803D' : '#4B5563';
  const mark = selected ? 'rgba(255,255,255,0.35)' : 'rgba(244,246,250,0.15)';

  return (
    <svg viewBox="0 0 120 40" className="rcalc-syringe-icon" aria-hidden>
      <rect x="6" y="12" width="72" height="16" rx="4" fill={barrel} />
      <rect x="78" y="9" width="18" height="22" rx="2.5" fill={plunger} />
      <rect x="96" y="17" width="22" height="6" rx="1.5" fill={needle} />
      <line x1="16" y1="20" x2="68" y2="20" stroke={mark} strokeWidth="2" strokeDasharray="5 4" />
    </svg>
  );
}

function getGuideTickLabels(maxUnits: number, maxLabels = 7): number[] {
  if (maxUnits <= 0) return [0];
  if (maxUnits <= maxLabels - 1) {
    return Array.from({ length: maxUnits + 1 }, (_, i) => i);
  }

  const labels = new Set<number>([0, maxUnits]);
  const slots = maxLabels - 2;
  for (let i = 1; i <= slots; i += 1) {
    labels.add(Math.round((maxUnits * i) / (slots + 1)));
  }
  return [...labels].sort((a, b) => a - b);
}

function SyringeVisualGuide({ units, syringeMl }: { units: number; syringeMl: number }) {
  const maxUnits = syringeMl * 100;
  const clamped = Math.min(maxUnits, Math.max(0, units));
  const fillPct = maxUnits > 0 ? (clamped / maxUnits) * 100 : 0;
  const tickLabels = getGuideTickLabels(maxUnits);

  return (
    <div className="rcalc-syringe-guide">
      <div className="rcalc-syringe-guide-top">
        <p className="rcalc-syringe-guide-label">Syringe Visual Guide ({syringeMl} ml capacity)</p>
        <p className="rcalc-syringe-guide-units" aria-live="polite">
          {formatNum(clamped, clamped % 1 === 0 ? 0 : 1)} units
        </p>
      </div>
      <div className="rcalc-syringe-scale-wrap">
        <div className="rcalc-syringe-scale">
          <div className="rcalc-syringe-fill" style={{ width: `${fillPct}%` }} />
          <div className="rcalc-syringe-marker" style={{ left: `${fillPct}%` }} aria-hidden />
        </div>
        <div className="rcalc-syringe-ticks" aria-hidden>
          {tickLabels.map((tick) => (
            <span key={tick} style={{ left: `${maxUnits > 0 ? (tick / maxUnits) * 100 : 0}%` }}>
              {tick}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChipGrid({
  options,
  selected,
  onSelect,
  suffix,
  layout = 'default',
  otherLabel,
  otherValue,
  onOtherChange,
}: {
  options: readonly number[];
  selected: number;
  onSelect: (value: number) => void;
  suffix: string;
  layout?: 'default' | 'compact';
  otherLabel?: string;
  otherValue?: string;
  onOtherChange?: (value: string) => void;
}) {
  const otherActive = otherValue !== undefined && otherValue.length > 0;

  return (
    <div className={`rcalc-chip-grid${layout === 'compact' ? ' rcalc-chip-grid--compact' : ''}`}>
      {options.map((option) => {
        const active = !otherActive && selected === option;
        return (
          <button
            key={option}
            type="button"
            className={`rcalc-chip${active ? ' rcalc-chip--active' : ''}`}
            onClick={() => onSelect(option)}
          >
            {option} {suffix}
          </button>
        );
      })}
      {otherLabel && onOtherChange ? (
        <input
          type="number"
          min="0"
          step="any"
          inputMode="decimal"
          placeholder={otherLabel}
          value={otherValue ?? ''}
          onChange={(e) => onOtherChange(e.target.value)}
          className={`rcalc-other-input rcalc-other-input--grid${otherActive ? ' rcalc-other-input--active' : ''}`}
          aria-label={otherLabel}
        />
      ) : null}
    </div>
  );
}

function UnitToggle<T extends string>({
  left,
  right,
  value,
  onChange,
}: {
  left: { id: T; label: string };
  right: { id: T; label: string };
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <div className="rcalc-toggle" role="group">
      <button
        type="button"
        className={`rcalc-toggle-btn${value === left.id ? ' rcalc-toggle-btn--active' : ''}`}
        aria-pressed={value === left.id}
        onClick={() => onChange(left.id)}
      >
        {left.label}
      </button>
      <button
        type="button"
        className={`rcalc-toggle-btn${value === right.id ? ' rcalc-toggle-btn--active' : ''}`}
        aria-pressed={value === right.id}
        onClick={() => onChange(right.id)}
      >
        {right.label}
      </button>
    </div>
  );
}

export default function ReconstitutionCalculator() {
  const [state, setState] = useState<CalculatorState>(DEFAULTS);
  const [compoundCustom, setCompoundCustom] = useState('');
  const [diluentCustom, setDiluentCustom] = useState('');
  const [doseCustom, setDoseCustom] = useState('');
  const [copied, setCopied] = useState(false);

  const compoundPresets = state.compoundUnit === 'mg' ? COMPOUND_MG : COMPOUND_IU;
  const dosePresets =
    state.compoundUnit === 'IU'
      ? DOSE_IU
      : state.doseUnit === 'mcg'
        ? DOSE_MCG
        : DOSE_MG;

  const compoundIsPreset = compoundPresets.includes(state.compoundValue as never);
  const diluentIsPreset = DILUENT_ML.includes(state.diluentMl as (typeof DILUENT_ML)[number]);
  const doseIsPreset = dosePresets.includes(state.doseValue as never);

  const results = useMemo(() => {
    const { compoundUnit, compoundValue, diluentMl, doseUnit, doseValue } = state;
    if (compoundValue <= 0 || diluentMl <= 0 || doseValue <= 0) return null;

    const concentration = compoundValue / diluentMl;
    let doseForCalc = doseValue;

    if (compoundUnit === 'mg' && doseUnit === 'mcg') {
      doseForCalc = doseValue / 1000;
    }

    const volumeMl = doseForCalc / concentration;
    const units = volumeMl * 100;
    const totalDoses = Math.floor(compoundValue / doseForCalc);

    return {
      concentration,
      volumeMl,
      units,
      totalDoses,
      doseForCalc,
    };
  }, [state]);

  const reset = () => {
    setState(DEFAULTS);
    setCompoundCustom('');
    setDiluentCustom('');
    setDoseCustom('');
    setCopied(false);
  };

  const setCompoundUnit = (unit: CompoundUnit) => {
    setCompoundCustom('');
    setDoseCustom('');
    if (unit === 'IU') {
      setState((prev) => ({
        ...prev,
        compoundUnit: 'IU',
        compoundValue: 5000,
        doseUnit: 'IU',
        doseValue: 500,
      }));
      return;
    }
    setState((prev) => ({
      ...prev,
      compoundUnit: 'mg',
      compoundValue: 10,
      doseUnit: 'mg',
      doseValue: 0.5,
    }));
  };

  const setDoseUnit = (unit: 'mg' | 'mcg') => {
    setDoseCustom('');
    if (unit === 'mcg') {
      setState((prev) => ({
        ...prev,
        doseUnit: 'mcg',
        doseValue: 500,
      }));
      return;
    }
    setState((prev) => ({
      ...prev,
      doseUnit: 'mg',
      doseValue: 0.5,
    }));
  };

  const copyResults = async () => {
    if (!results) return;
    const summary =
      state.compoundUnit === 'IU'
        ? `${formatCompound(state.compoundValue, 'IU')} compound + ${state.diluentMl} ml diluent = ${formatConcentration(results.concentration, 'IU')} concentration`
        : `${formatCompound(state.compoundValue, 'mg')} compound + ${state.diluentMl} ml diluent = ${formatConcentration(results.concentration, 'mg')} concentration`;

    const text = [
      summary,
      `Dose: ${formatDose(state.doseValue, state.doseUnit)}`,
      `Draw syringe to: ${formatNum(results.units, 2)} units / ticks (${formatNum(results.volumeMl, 3)} ml)`,
      `Your vial contains: ${results.totalDoses} doses`,
      `Concentration: ${formatConcentration(results.concentration, state.compoundUnit)}`,
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const doseSubtext =
    state.compoundUnit === 'mg' && state.doseUnit === 'mcg'
      ? `( ${formatNum(state.doseValue / 1000, 1)} mg)`
      : null;

  const doseDisplayValue =
    state.compoundUnit === 'IU'
      ? Math.round(state.doseValue).toLocaleString('en-AU')
      : state.doseUnit === 'mcg'
        ? Math.round(state.doseValue).toLocaleString('en-AU')
        : formatNum(state.doseValue, state.doseValue % 1 === 0 ? 1 : 2);

  const doseDisplayUnit = state.compoundUnit === 'IU' ? 'IU' : state.doseUnit;

  return (
    <div className="rcalc">
      <div className="rcalc-top">
        <div className="rcalc-header">
          <div className="rcalc-header-icon">
            <Calculator className="w-6 h-6" strokeWidth={2} />
          </div>
          <div className="rcalc-header-copy">
            <h3 className="rcalc-title">Research calculator</h3>
            <p className="rcalc-subtitle">Calculate your research dosage with precision.</p>
          </div>
        </div>

        <button type="button" className="rcalc-reset" onClick={reset}>
          <RotateCcw className="w-4 h-4" strokeWidth={2} />
          Reset calculator
        </button>
      </div>

      <div className="rcalc-warning">
        <AlertTriangle className="w-5 h-5 shrink-0" strokeWidth={2} />
        <p>
          <strong>Research use only.</strong> Standard insulin syringes typically have 100 units per 1 mL. Always verify your
          calculations and consult appropriate guidelines for your specific research application. This tool provides estimates
          based on the inputs provided and should be used as a reference guide only.
        </p>
      </div>

      <section className="rcalc-card">
        <h4 className="rcalc-step-title">
          <Syringe className="w-4 h-4" strokeWidth={2} />
          1. What is the total volume of your syringe?
        </h4>
        <div className="rcalc-syringe-grid">
          {SYRINGE_OPTIONS.map((ml) => {
            const active = state.syringeMl === ml;
            return (
              <button
                key={ml}
                type="button"
                className={`rcalc-syringe-card${active ? ' rcalc-syringe-card--active' : ''}`}
                aria-pressed={active}
                onClick={() => setState((prev) => ({ ...prev, syringeMl: ml }))}
              >
                <SyringeIcon selected={active} />
                <span>{ml} ml</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rcalc-card">
        <div className="rcalc-step-head">
          <h4 className="rcalc-step-title">
            <Syringe className="w-4 h-4" strokeWidth={2} />
            2. Select research compound quantity
          </h4>
          <UnitToggle
            left={{ id: 'mg', label: 'mg (Peptides)' }}
            right={{ id: 'IU', label: 'IU (HCG/HGH)' }}
            value={state.compoundUnit}
            onChange={setCompoundUnit}
          />
        </div>
        <ChipGrid
          options={compoundPresets}
          selected={compoundIsPreset ? state.compoundValue : -1}
          suffix={state.compoundUnit}
          layout={state.compoundUnit === 'IU' ? 'compact' : 'default'}
          otherLabel={`Other (${state.compoundUnit})`}
          otherValue={compoundCustom}
          onOtherChange={(value) => {
            setCompoundCustom(value);
            const next = parsePositive(value, state.compoundValue);
            setState((prev) => ({ ...prev, compoundValue: next }));
          }}
          onSelect={(value) => {
            setCompoundCustom('');
            setState((prev) => ({ ...prev, compoundValue: value }));
          }}
        />
      </section>

      <section className="rcalc-card">
        <h4 className="rcalc-step-title">
          <Syringe className="w-4 h-4" strokeWidth={2} />
          3. How much diluent (BAC water) are you adding?
        </h4>
        <ChipGrid
          options={DILUENT_ML}
          selected={diluentIsPreset ? state.diluentMl : -1}
          suffix="ml"
          otherLabel="Other (ml)"
          otherValue={diluentCustom}
          onOtherChange={(value) => {
            setDiluentCustom(value);
            const next = parsePositive(value, state.diluentMl);
            setState((prev) => ({ ...prev, diluentMl: next }));
          }}
          onSelect={(value) => {
            setDiluentCustom('');
            setState((prev) => ({ ...prev, diluentMl: value }));
          }}
        />
      </section>

      <section className="rcalc-card">
        <div className="rcalc-step-head">
          <h4 className="rcalc-step-title">
            <Syringe className="w-4 h-4" strokeWidth={2} />
            4. What is your desired dose?
          </h4>
          {state.compoundUnit === 'mg' ? (
            <UnitToggle
              left={{ id: 'mg', label: 'mg' }}
              right={{ id: 'mcg', label: 'mcg' }}
              value={state.doseUnit === 'mcg' ? 'mcg' : 'mg'}
              onChange={setDoseUnit}
            />
          ) : null}
        </div>
        <ChipGrid
          options={dosePresets}
          selected={doseIsPreset ? state.doseValue : -1}
          suffix={state.compoundUnit === 'IU' ? 'IU' : state.doseUnit}
          layout={state.compoundUnit === 'IU' ? 'compact' : 'default'}
          otherLabel={`Other (${state.compoundUnit === 'IU' ? 'IU' : state.doseUnit})`}
          otherValue={doseCustom}
          onOtherChange={(value) => {
            setDoseCustom(value);
            const next = parsePositive(value, state.doseValue);
            setState((prev) => ({ ...prev, doseValue: next }));
          }}
          onSelect={(value) => {
            setDoseCustom('');
            setState((prev) => ({ ...prev, doseValue: value }));
          }}
        />
      </section>

      <section className="rcalc-result">
        <div className="rcalc-result-head">
          <h4 className="rcalc-result-title">Result</h4>
          <button type="button" className="rcalc-copy-btn" onClick={copyResults}>
            <Copy className="w-4 h-4" strokeWidth={2} />
            {copied ? 'Copied' : 'Copy result'}
          </button>
        </div>

        {results ? (
          <>
            <div className="rcalc-summary">
              {formatCompound(state.compoundValue, state.compoundUnit)} compound + {state.diluentMl} ml diluent ={' '}
              <strong>{formatConcentration(results.concentration, state.compoundUnit)}</strong> concentration
            </div>

            <div className="rcalc-result-main">
              <div>
                <p className="rcalc-result-label">Dose</p>
                <p className="rcalc-result-value rcalc-result-value--light">
                  {doseDisplayValue}
                  <span className="rcalc-result-unit">{doseDisplayUnit}</span>
                </p>
                {doseSubtext ? <p className="rcalc-result-sub">{doseSubtext}</p> : null}
              </div>

              <div>
                <p className="rcalc-result-label">Draw syringe to</p>
                <p className="rcalc-result-value rcalc-result-value--green">
                  {formatNum(results.units, 2)}
                  <span className="rcalc-result-unit">Units / Ticks</span>
                </p>
                <p className="rcalc-result-sub">( {formatNum(results.volumeMl, 3)} ml)</p>
              </div>
            </div>

            <SyringeVisualGuide units={results.units} syringeMl={state.syringeMl} />

            <div className="rcalc-result-grid">
              <div className="rcalc-result-box">
                <p className="rcalc-result-label">Your vial contains</p>
                <p className="rcalc-result-stat rcalc-result-stat--purple">
                  <span>{results.totalDoses.toLocaleString('en-AU')}</span> doses
                </p>
              </div>
              <div className="rcalc-result-box">
                <p className="rcalc-result-label">Concentration</p>
                <p className="rcalc-result-stat rcalc-result-stat--green">
                  <span>
                    {state.compoundUnit === 'IU'
                      ? Math.round(results.concentration).toLocaleString('en-AU')
                      : formatNum(results.concentration, 3)}
                  </span>
                  {state.compoundUnit === 'IU' ? ' IU/ml' : ' mg/ml'}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="rcalc-empty">Enter valid values above to see your result.</p>
        )}
      </section>
    </div>
  );
}

