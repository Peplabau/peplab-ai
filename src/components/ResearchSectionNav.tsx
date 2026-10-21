import { Link } from 'react-router-dom';
import { RESEARCH_PATH, RESEARCH_COMPOUNDS_PATH } from '@/lib/routes';

type ResearchSection = 'overview' | 'compounds';

const ENTRIES: { id: ResearchSection; label: string; to: string }[] = [
  { id: 'overview', label: 'Overview', to: RESEARCH_PATH },
  { id: 'compounds', label: 'Find Your Compound', to: RESEARCH_COMPOUNDS_PATH },
];

export function ResearchSectionNav({ active }: { active: ResearchSection }) {
  return (
    <nav
      aria-label="Research section"
      className="flex flex-wrap items-center justify-center gap-1 rounded-2xl border border-[rgba(244,246,250,0.08)] bg-[rgba(17,24,39,0.5)] p-1.5"
    >
      {ENTRIES.map((entry) => {
        const isActive = entry.id === active;
        return (
          <Link
            key={entry.id}
            to={entry.to}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[rgba(139,92,246,0.2)] text-[#F4F6FA] shadow-[inset_0_-2px_0_0_#8B5CF6]'
                : 'text-[#A9B3C7] hover:text-[#F4F6FA] hover:bg-[rgba(244,246,250,0.04)]'
            }`}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}
