import { formatMonthDisplay } from '../lib/date';

interface MonthPickerProps {
  month: string;
  onChange: (month: string) => void;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const date = new Date(y, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
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
  'flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-offset-slate-900';

export function MonthPicker({ month, onChange }: MonthPickerProps) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm sm:p-2 dark:border-slate-800 dark:bg-slate-900">
      <button type="button" aria-label="Previous month" onClick={() => onChange(shiftMonth(month, -1))} className={navButtonClasses}>
        <ChevronIcon direction="left" />
      </button>
      <span className="text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-50">{formatMonthDisplay(month)}</span>
      <button type="button" aria-label="Next month" onClick={() => onChange(shiftMonth(month, 1))} className={navButtonClasses}>
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}
