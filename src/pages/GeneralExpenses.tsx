import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/EmptyState';
import { Money } from '../components/Money';
import { MonthPicker } from '../components/MonthPicker';
import { useMonthlyActivity } from '../hooks/useMonthlyActivity';
import { currentMonth, formatDateDisplay, formatRM } from '../lib/date';
import type { Route } from '../hooks/useHashRoute';

interface GeneralExpensesProps {
  route: Route;
  navigate: (route: Route) => void;
}

export function GeneralExpenses({ route, navigate }: GeneralExpensesProps) {
  const [month, setMonth] = useState(currentMonth());
  const { items, categoryTotals, personalTotal, companyTotal, monthTotal, loading } = useMonthlyActivity(month);

  return (
    <AppShell title="Monthly Activity" route={route} navigate={navigate}>
      {/* Stacked on mobile/tablet; on large screens the picker+summary form a sticky
          sidebar beside the activity list instead of sitting above it. */}
      <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        <div className="lg:sticky lg:top-20 lg:col-span-1 lg:space-y-4">
          <MonthPicker month={month} onChange={setMonth} />

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:mt-0 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Total spending this month</p>
            <Money amount={monthTotal} bold className="text-3xl" />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-slate-400 dark:bg-slate-500" />
                  Personal
                </span>
                <p className="mt-1 truncate text-base font-semibold text-slate-900 dark:text-slate-100">{formatRM(personalTotal)}</p>
              </div>
              <div className="rounded-xl bg-teal-50 p-3 dark:bg-teal-500/10">
                <span className="flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-400">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400" />
                  Company Allowance
                </span>
                <p className="mt-1 truncate text-base font-semibold text-teal-900 dark:text-teal-300">{formatRM(companyTotal)}</p>
              </div>
            </div>

            {categoryTotals.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                {categoryTotals.map((c) => (
                  <span
                    key={c.category}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {c.category} · {formatRM(c.total)}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:col-span-2 lg:mt-0">
          {loading && <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>}
          {!loading && items.length === 0 && (
            <EmptyState title="No activity this month" description="Add your first expense for this month." />
          )}
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                item.source === 'company' && item.eventId
                  ? navigate({ name: 'transaction-form', eventId: item.eventId, transactionId: item.id })
                  : navigate({ name: 'transaction-form-general', transactionId: item.id })
              }
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md active:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:active:bg-slate-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{item.description}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {formatDateDisplay(item.date)} · {item.category}
                  {item.refNo ? ` · ${item.refNo}` : ''}
                </p>
                {item.source === 'company' && (
                  <span className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-700 dark:bg-teal-500/10 dark:text-teal-400">
                    <span aria-hidden="true">🎫</span>
                    <span className="truncate">{item.eventName}</span>
                  </span>
                )}
              </div>
              <Money amount={item.amount} bold className="shrink-0 pt-0.5 text-right" />
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate({ name: 'transaction-form-general' })}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-2xl text-white shadow-lg transition hover:bg-teal-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 print:hidden md:bottom-6 dark:focus-visible:ring-offset-slate-950"
        aria-label="Add expense"
      >
        +
      </button>
    </AppShell>
  );
}
