import { GRANULARITIES, GRANULARITY_CONFIG, periodLabel, shiftPeriod, type Granularity } from '../../lib/analytics';

interface PeriodFilterProps {
  granularity: Granularity;
  anchorKey: string;
  onGranularityChange: (g: Granularity) => void;
  onAnchorChange: (key: string) => void;
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12.5 15L7.5 10L12.5 5' : 'M7.5 15L12.5 10L7.5 5'}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const navButtonClasses =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-offset-slate-900';

export function PeriodFilter({ granularity, anchorKey, onGranularityChange, onAnchorChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-2 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {GRANULARITIES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onGranularityChange(g)}
            className={`min-h-9 flex-1 rounded-lg px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:flex-none ${
              g === granularity
                ? 'bg-white text-teal-700 shadow dark:bg-slate-700 dark:text-teal-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {GRANULARITY_CONFIG[g].label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 px-1 sm:justify-end">
        <button
          type="button"
          aria-label={`Previous ${granularity}`}
          onClick={() => onAnchorChange(shiftPeriod(anchorKey, granularity, -1))}
          className={navButtonClasses}
        >
          <ChevronIcon direction="left" />
        </button>
        <span className="min-w-0 truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
          {periodLabel(anchorKey, granularity)}
        </span>
        <button
          type="button"
          aria-label={`Next ${granularity}`}
          onClick={() => onAnchorChange(shiftPeriod(anchorKey, granularity, 1))}
          className={navButtonClasses}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </div>
  );
}
