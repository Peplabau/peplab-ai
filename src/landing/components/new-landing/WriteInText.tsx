import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

type WriteInTextProps = {
  text: string;
  delay?: number;
  charDelay?: number;
  className?: string;
  as?: 'span' | 'p';
};

export default function WriteInText({
  text,
  delay = 0,
  charDelay = 0.025,
  className,
  as: Tag = 'span',
}: WriteInTextProps) {
  const ref = useRef<HTMLSpanElement & HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    const chars = root.querySelectorAll<HTMLElement>('.nl-write-char');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set(chars, { opacity: 1, y: 0 });
      return;
    }

    gsap.set(chars, { opacity: 0, y: 8 });

    const ctx = gsap.context(() => {
      gsap.to(chars, {
        opacity: 1,
        y: 0,
        duration: 0.32,
        stagger: charDelay,
        delay,
        ease: 'power2.out',
        clearProps: 'transform',
      });
    }, root);

    return () => ctx.revert();
  }, [text, delay, charDelay]);

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {text.split('').map((char, i) => (
        <span
          key={`${i}-${char}`}
          className="nl-write-char inline-block"
          aria-hidden={char !== ' ' ? undefined : true}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </Tag>
  );
}
