import { useState } from 'react';
import { formatRM } from '../../lib/date';
import { CATEGORY_COLOR_VAR, type CategoryTotal } from '../../lib/analytics';
import { EmptyState } from '../EmptyState';

interface CategoryBarChartProps {
  data: CategoryTotal[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">By category</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personal and company spending combined</p>
        </div>
        {data.length > 0 && (
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {showTable ? 'Show chart' : 'Show table'}
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No spending yet" description="Nothing to break down for this period." />
        </div>
      ) : showTable ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-2">Category</th>
                <th className="py-2 pr-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.category} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-2 text-slate-700 dark:text-slate-300">{d.category}</td>
                  <td className="py-2 pr-2 text-right tabular-nums font-medium text-slate-900 dark:text-slate-100">
                    {formatRM(d.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-3">
          {data.map((d) => (
            <div key={d.category}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ backgroundColor: CATEGORY_COLOR_VAR[d.category] ?? 'var(--cat-7)' }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{d.category}</span>
                </span>
                <span className="shrink-0 tabular-nums font-semibold text-slate-900 dark:text-slate-50">{formatRM(d.amount)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.max((d.amount / max) * 100, 2)}%`,
                    backgroundColor: CATEGORY_COLOR_VAR[d.category] ?? 'var(--cat-7)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
