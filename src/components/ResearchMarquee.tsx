import { useEffect, useRef, useState, type CSSProperties } from 'react';

const SEPARATOR = '\u00A0·\u00A0';

type ResearchMarqueeProps = {
  text: string;
  className?: string;
  /** When true, the banner is decorative only (e.g. admin preview). */
  decorative?: boolean;
};

/**
 * Seamless infinite horizontal marquee. Measures one text segment and scrolls
 * exactly that distance per loop so the end of each copy meets the start of
 * the next with no jump.
 */
export default function ResearchMarquee({ text, className = '', decorative = false }: ResearchMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [copyCount, setCopyCount] = useState(3);
  const [shiftPx, setShiftPx] = useState(0);
  const [durationSec, setDurationSec] = useState(24);

  const trimmed = text.trim();
  const segment = trimmed ? `${trimmed}${SEPARATOR}` : '';

  useEffect(() => {
    if (!segment) return;

    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const update = () => {
      const segmentWidth = measure.getBoundingClientRect().width;
      const containerWidth = container.getBoundingClientRect().width;
      if (segmentWidth <= 0 || containerWidth <= 0) return;

      setShiftPx(segmentWidth);

      // Always keep enough copies to cover the viewport while one segment scrolls out.
      const minCopies = Math.max(3, Math.ceil(containerWidth / segmentWidth) + 2);
      setCopyCount(minCopies);

      const pxPerSec = 48;
      setDurationSec(Math.max(14, segmentWidth / pxPerSec));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(container);
    if (measure) ro.observe(measure);

    return () => ro.disconnect();
  }, [segment]);

  if (!trimmed) return null;

  const trackStyle = {
    '--marquee-shift': `${shiftPx}px`,
    '--marquee-duration': `${durationSec}s`,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className={`catalog-research-marquee ${className}`.trim()}
      {...(decorative ? { 'aria-hidden': true } : { 'aria-label': trimmed })}
    >
      <span ref={measureRef} className="catalog-research-marquee-measure" aria-hidden>
        {segment}
      </span>
      <div
        className={`catalog-research-marquee-track${shiftPx > 0 ? ' catalog-research-marquee-track--ready' : ''}`}
        style={trackStyle}
      >
        {Array.from({ length: copyCount }).map((_, i) => (
          <span
            key={i}
            className="catalog-research-marquee-item"
            aria-hidden={decorative || i > 0 ? true : undefined}
          >
            {segment}
          </span>
        ))}
      </div>
    </div>
  );
}
