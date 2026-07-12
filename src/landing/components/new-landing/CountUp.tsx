import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

type CountUpProps = {
  end: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  onComplete?: () => void;
};

export default function CountUp({
  end,
  duration = 1.75,
  delay = 0.55,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  onComplete,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = (value: number) => {
      const n = decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
      return `${prefix}${n}${suffix}`;
    };

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      el.textContent = format(end);
      onComplete?.();
      return;
    }

    el.textContent = format(0);
    const obj = { val: 0 };

    const tween = gsap.to(obj, {
      val: end,
      duration,
      delay,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = format(obj.val);
      },
      onComplete,
    });

    return () => {
      tween.kill();
    };
  }, [end, duration, delay, prefix, suffix, decimals, onComplete]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
