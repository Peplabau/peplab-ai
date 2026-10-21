import { FlaskConical } from 'lucide-react';

const PALETTES = [
  ['#3B82F6', '#8B5CF6'],
  ['#8B5CF6', '#EC4899'],
  ['#2ED1B4', '#3B82F6'],
  ['#6366F1', '#2ED1B4'],
] as const;

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

type BlogCoverProps = {
  title: string;
  imageUrl?: string;
  className?: string;
  /** Larger fallback typography for featured / hero placements. */
  large?: boolean;
  eager?: boolean;
};

export default function BlogCover({ title, imageUrl, className = '', large = false, eager = false }: BlogCoverProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  const [from, to] = PALETTES[hashString(title) % PALETTES.length];

  return (
    <div
      aria-hidden="true"
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 0% 0%, ${from}55 0%, transparent 55%), radial-gradient(110% 90% at 100% 100%, ${to}50 0%, transparent 55%), #0B1020`,
      }}
    >
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'linear-gradient(rgba(244,246,250,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(244,246,250,0.05) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div
        className="absolute rounded-full blur-3xl"
        style={{ width: '45%', height: '70%', right: '8%', top: '-20%', background: `${to}33` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm ${large ? 'h-20 w-20' : 'h-12 w-12'}`}
        >
          <FlaskConical className={large ? 'h-9 w-9' : 'h-6 w-6'} style={{ color: to }} />
        </div>
      </div>
      <span className="absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
        PEPLAB · Research Notes
      </span>
    </div>
  );
}
