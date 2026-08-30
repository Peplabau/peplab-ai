import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type RevealOptions = {
  /** Play on mount instead of on scroll (hero, above-the-fold) */
  immediate?: boolean;
  /** Stagger between `.nl-reveal-item` / `.nl-reveal-text` elements */
  itemStagger?: number;
  /** ScrollTrigger start position */
  start?: string;
};

export function useNewLandingReveal(
  sectionRef: RefObject<HTMLElement | null>,
  options: RevealOptions = {},
) {
  const { immediate = false, itemStagger = 0.09, start = 'top 82%' } = options;

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      const eyebrow = section.querySelectorAll<HTMLElement>('.nl-reveal-eyebrow');
      const headings = section.querySelectorAll<HTMLElement>('.nl-reveal-heading');
      const words = section.querySelectorAll<HTMLElement>('.nl-reveal-word');
      const leads = section.querySelectorAll<HTMLElement>('.nl-reveal-lead');
      const items = section.querySelectorAll<HTMLElement>('.nl-reveal-item');
      const texts = section.querySelectorAll<HTMLElement>('.nl-reveal-text');

      const animated = [...eyebrow, ...headings, ...words, ...leads, ...items, ...texts];
      if (animated.length === 0) return;

      if (reducedMotion) {
        gsap.set(animated, { opacity: 1, y: 0, scale: 1, clearProps: 'transform' });
        return;
      }

      if (eyebrow.length) gsap.set(eyebrow, { y: 18, opacity: 0 });
      if (headings.length) gsap.set(headings, { y: 48, opacity: 0, scale: 0.97 });
      if (words.length) gsap.set(words, { yPercent: 110, opacity: 0 });
      if (leads.length) gsap.set(leads, { y: 32, opacity: 0 });
      if (texts.length) gsap.set(texts, { y: 28, opacity: 0 });
      if (items.length) gsap.set(items, { y: 40, opacity: 0, scale: 0.95 });

      const runTimeline = () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        if (eyebrow.length) {
          tl.to(eyebrow, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06 }, 0);
        }

        if (headings.length) {
          tl.to(
            headings,
            { y: 0, opacity: 1, scale: 1, duration: 0.95, stagger: 0.12, clearProps: 'transform' },
            0.06,
          );
        }

        if (words.length) {
          tl.to(
            words,
            { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.045, clearProps: 'transform' },
            0.12,
          );
        }

        if (leads.length) {
          tl.to(leads, { y: 0, opacity: 1, duration: 0.8, stagger: 0.08, clearProps: 'transform' }, 0.2);
        }

        if (texts.length) {
          tl.to(
            texts,
            { y: 0, opacity: 1, duration: 0.75, stagger: itemStagger, clearProps: 'transform' },
            0.28,
          );
        }

        if (items.length) {
          tl.to(
            items,
            { y: 0, opacity: 1, scale: 1, duration: 0.85, stagger: itemStagger, clearProps: 'transform' },
            immediate ? 0.18 : 0.22,
          );
        }

        return tl;
      };

      if (immediate) {
        runTimeline();
      } else {
        ScrollTrigger.create({
          trigger: section,
          start,
          once: true,
          onEnter: runTimeline,
        });
      }
    }, section);

    return () => ctx.revert();
  }, [sectionRef, immediate, itemStagger, start]);
}
