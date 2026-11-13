import { AppShell } from '../components/layout/AppShell';
import { BalanceTable } from '../components/BalanceTable';
import { EmptyState } from '../components/EmptyState';
import { Money } from '../components/Money';
import { useEvent } from '../hooks/useEvent';
import { useToast } from '../hooks/useToast';
import { saveSettings } from '../db/repositories/settingsRepo';
import { formatDateDisplay, formatRM } from '../lib/date';
import { balanceRowsToCsv, downloadCsv, eventCsvFilename } from '../lib/csv';
import type { Route } from '../hooks/useHashRoute';
import type { ID } from '../types/models';

interface EventDetailProps {
  route: Route;
  eventId: ID;
  navigate: (route: Route) => void;
  back: () => void;
}

export function EventDetail({ route, eventId, navigate, back }: EventDetailProps) {
  const { event, balance, loading, setArchived } = useEvent(eventId);
  const toast = useToast();

  if (loading || !event || !balance) {
    return (
      <AppShell title="Event" route={route} navigate={navigate} onBack={back}>
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  const handleAddTransaction = () => {
    saveSettings({ lastUsedEventId: event.id });
    navigate({ name: 'transaction-form', eventId: event.id });
  };

  const handleExportCsv = () => {
    const csv = balanceRowsToCsv(balance.rows, balance.totals);
    downloadCsv(eventCsvFilename(event), csv);
  };

  const handleToggleArchive = async () => {
    if (event.archived) {
      await setArchived(false);
      toast.show('Event restored to active');
    } else {
      await setArchived(true);
      toast.show('Event archived');
      navigate({ name: 'dashboard' });
    }
  };

  return (
    <AppShell title={event.name} route={route} navigate={navigate} onBack={back}>
      {/* Stacked on mobile/tablet; on large screens the info+actions form a sticky
          sidebar beside the table instead of sitting above it. */}
      <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-6">
        <div className="lg:sticky lg:top-20 lg:col-span-1 lg:space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                {event.archived && (
                  <span className="mb-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Archived
                  </span>
                )}
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Balance Claim</p>
                <Money amount={balance.totals.finalBalance} bold className="text-3xl" />
              </div>
              <div className="pt-1 text-right text-xs text-slate-500 dark:text-slate-400">
                <p>Allowance: {formatRM(balance.totals.allowance)}</p>
                <p>Claimed: {formatRM(balance.totals.totalClaim)}</p>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500 dark:text-slate-400">Name Claim</dt>
                <dd className="min-w-0 text-right font-medium text-slate-900 dark:text-slate-100">{event.claimantName || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-slate-500 dark:text-slate-400">Tarikh</dt>
                <dd className="min-w-0 text-right font-medium text-slate-900 dark:text-slate-100">
                  {formatDateDisplay(event.startDate)}
                  {event.endDate ? ` – ${formatDateDisplay(event.endDate)}` : ''}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() => navigate({ name: 'event-form', eventId: event.id })}
              className="mt-3 rounded text-sm font-medium text-teal-700 transition hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400 dark:hover:text-teal-300"
            >
              Edit event details
            </button>
          </div>

          <div className="mt-4 flex gap-2 lg:mt-0 lg:flex-col">
            <button
              type="button"
              onClick={() => navigate({ name: 'print-view', eventId: event.id })}
              className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:flex-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              🖨️ Print / Export
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:flex-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              ⬇️ Export CSV
            </button>
          </div>

          <button
            type="button"
            onClick={handleToggleArchive}
            className="mt-2 min-h-11 w-full rounded-xl text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 lg:mt-0 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            {event.archived ? '↩️ Unarchive event' : '🗄️ Archive event'}
          </button>
        </div>

        <div className="mt-4 lg:col-span-2 lg:mt-0">
          {balance.rows.length <= 1 ? (
            <EmptyState
              title="No claims yet"
              description="Add your first receipt or claim against this allowance."
            />
          ) : (
            <BalanceTable
              rows={balance.rows}
              totals={balance.totals}
              onRowClick={(transactionId) => navigate({ name: 'transaction-form', eventId: event.id, transactionId })}
            />
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAddTransaction}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-2xl text-white shadow-lg transition hover:bg-teal-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 print:hidden md:bottom-6 dark:focus-visible:ring-offset-slate-950"
        aria-label="Add transaction"
      >
        +
      </button>
    </AppShell>
  );
}
