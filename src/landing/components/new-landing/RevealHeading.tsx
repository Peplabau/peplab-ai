type RevealHeadingProps = {
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
  id?: string;
  children: string;
};

/** Splits a heading into per-word reveal spans for GSAP */
export default function RevealHeading({
  as: Tag = 'h2',
  className = '',
  id,
  children,
}: RevealHeadingProps) {
  const words = children.split(/\s+/).filter(Boolean);

  return (
    <Tag id={id} className={`nl-reveal-heading ${className}`.trim()}>
      <span className="nl-reveal-heading-inner" aria-label={children}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="nl-reveal-word-wrap">
            <span className="nl-reveal-word">{word}</span>
            {i < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}
