import { formatRM } from '../../lib/date';

interface StatTileProps {
  label: string;
  value: number;
  previousValue?: number;
  previousLabel?: string;
  accent?: 'personal' | 'company' | 'neutral';
}

function DeltaIndicator({ value, previousValue, previousLabel }: { value: number; previousValue: number; previousLabel: string }) {
  if (previousValue === 0) {
    if (value === 0) return <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">No activity {previousLabel}</p>;
    return <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">No spending {previousLabel}</p>;
  }
  const pct = ((value - previousValue) / previousValue) * 100;
  const rounded = Math.round(Math.abs(pct));
  const arrow = pct > 0 ? '↑' : pct < 0 ? '↓' : '→';
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
      <span aria-hidden="true">{arrow}</span>
      {rounded === 0 ? 'No change' : `${rounded}%`} vs {previousLabel}
    </p>
  );
}

const accentDot: Record<NonNullable<StatTileProps['accent']>, string> = {
  personal: 'bg-[color:var(--series-personal)]',
  company: 'bg-[color:var(--series-company)]',
  neutral: 'bg-slate-400 dark:bg-slate-500',
};

export function StatTile({ label, value, previousValue, previousLabel, accent = 'neutral' }: StatTileProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <span className={`h-2 w-2 shrink-0 rounded-full ${accentDot[accent]}`} aria-hidden="true" />
        {label}
      </span>
      <p className="mt-1 truncate text-2xl font-semibold text-slate-900 dark:text-slate-50">{formatRM(value)}</p>
      {previousValue !== undefined && previousLabel && (
        <DeltaIndicator value={value} previousValue={previousValue} previousLabel={previousLabel} />
      )}
    </div>
  );
}
