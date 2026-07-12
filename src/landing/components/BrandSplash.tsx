import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const STORAGE_KEY = 'peplab_brand_splash_v1';

function isHomePath(): boolean {
  const path = window.location.pathname || '/';
  return path === '/' || path === '';
}

function computeInitialShow(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isHomePath()) return false;
  try {
    if (localStorage.getItem(STORAGE_KEY) === '1') return false;
  } catch {
    /* ignore */
  }
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      try {
        localStorage.setItem(STORAGE_KEY, '1');
      } catch {
        /* ignore */
      }
      return false;
    }
  } catch {
    /* ignore */
  }
  return true;
}

function finishSplash(setShow: (v: boolean) => void) {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* ignore */
  }
  setShow(false);
}

/**
 * One-time intro on first home landing: precise wordmark assembly, then clean reveal.
 * Cleared for retest: `localStorage.removeItem('peplab_brand_splash_v1')`
 */
export default function BrandSplash() {
  const [show, setShow] = useState(computeInitialShow);
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pepRef = useRef<HTMLSpanElement>(null);
  const dividerRef = useRef<HTMLSpanElement>(null);
  const labRef = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [show]);

  useLayoutEffect(() => {
    if (!show) return;

    const root = rootRef.current;
    const grid = gridRef.current;
    const ring = ringRef.current;
    const content = contentRef.current;
    const pep = pepRef.current;
    const divider = dividerRef.current;
    const lab = labRef.current;
    const underline = underlineRef.current;
    const tag = tagRef.current;
    if (!root || !grid || !ring || !content || !pep || !divider || !lab || !underline || !tag) return;

    const labStart = Math.min(window.innerWidth * 0.22, 140);

    const ctx = gsap.context(() => {
      gsap.set(grid, { opacity: 0 });
      gsap.set(ring, { scale: 0.72, opacity: 0, transformOrigin: 'center center' });
      gsap.set(content, { y: 0, opacity: 1 });
      gsap.set(pep, { scale: 2.35, opacity: 0, transformOrigin: 'right center' });
      gsap.set(lab, { x: labStart, opacity: 0 });
      gsap.set(divider, { scaleY: 0, opacity: 0, transformOrigin: 'center center' });
      gsap.set(underline, { scaleX: 0, opacity: 0, transformOrigin: 'center center' });
      gsap.set(tag, { y: 12, opacity: 0 });

      const tl = gsap.timeline({
        onComplete: () => finishSplash(setShow),
      });

      tl.to(grid, { opacity: 1, duration: 0.7, ease: 'power2.out' }, 0);

      tl.fromTo(
        pep,
        { scale: 2.35, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.95, ease: 'power4.out' },
        0.08,
      );

      tl.fromTo(
        lab,
        { x: labStart, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.78, ease: 'power3.out' },
        0.28,
      );

      tl.to(
        divider,
        { scaleY: 1, opacity: 1, duration: 0.38, ease: 'power2.out' },
        0.52,
      );

      tl.to(
        underline,
        { scaleX: 1, opacity: 1, duration: 0.55, ease: 'power2.inOut' },
        0.62,
      );

      tl.to(
        tag,
        { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out' },
        0.72,
      );

      tl.to(
        ring,
        { scale: 1, opacity: 0.55, duration: 0.28, ease: 'power2.out' },
        0.58,
      );
      tl.to(
        ring,
        { scale: 1.65, opacity: 0, duration: 0.62, ease: 'power2.in' },
        0.82,
      );

      tl.to(content, { y: -10, opacity: 0, duration: 0.38, ease: 'power2.in' }, 1.42);
      tl.to(root, { opacity: 0, duration: 0.42, ease: 'power2.in' }, 1.52);
    }, root);

    return () => {
      ctx.revert();
      gsap.set(root, { opacity: 1 });
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className="brand-splash"
      style={{ pointerEvents: 'auto' }}
      aria-hidden="true"
    >
      <div ref={gridRef} className="brand-splash-grid" />
      <div ref={ringRef} className="brand-splash-ring" />
      <div ref={contentRef} className="brand-splash-content">
        <div className="brand-splash-wordmark">
          <span ref={pepRef} className="brand-splash-pep">
            PEP
          </span>
          <span ref={dividerRef} className="brand-splash-divider" aria-hidden />
          <span ref={labRef} className="brand-splash-lab">
            LAB
          </span>
        </div>
        <div ref={underlineRef} className="brand-splash-underline" aria-hidden />
        <p ref={tagRef} className="brand-splash-tag">
          Research-grade peptides · Australia
        </p>
      </div>
    </div>
  );
}
