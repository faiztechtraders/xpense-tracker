import { AppShell } from '../components/layout/AppShell';
import { BalanceTable } from '../components/BalanceTable';
import { useEvent } from '../hooks/useEvent';
import { formatDateDisplay } from '../lib/date';
import { balanceRowsToCsv, downloadCsv, eventCsvFilename } from '../lib/csv';
import type { Route } from '../hooks/useHashRoute';
import type { ID } from '../types/models';

interface PrintViewProps {
  route: Route;
  eventId: ID;
  navigate: (route: Route) => void;
  back: () => void;
}

export function PrintView({ route, eventId, navigate, back }: PrintViewProps) {
  const { event, balance, loading } = useEvent(eventId);

  if (loading || !event || !balance) {
    return (
      <AppShell title="Print" route={route} navigate={navigate} onBack={back}>
        <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Print / Export" route={route} navigate={navigate} onBack={back}>
      <div className="mb-4 flex gap-2 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="min-h-11 flex-1 rounded-xl bg-teal-700 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          🖨️ Print / Save as PDF
        </button>
        <button
          type="button"
          onClick={() => downloadCsv(eventCsvFilename(event), balanceRowsToCsv(balance.rows, balance.totals))}
          className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          ⬇️ Export CSV
        </button>
      </div>

      <p className="mb-3 text-xs text-slate-400 print:hidden dark:text-slate-500">
        This preview always shows how the page will look on paper, regardless of your app theme.
      </p>

      {/* force-light: this subtree always renders as light "paper", independent of dark mode */}
      <div
        id="print-root"
        className="force-light rounded-2xl border border-slate-200 bg-white p-4 shadow-lg ring-1 ring-slate-900/5 sm:p-5 print:rounded-none print:border-0 print:p-0 print:shadow-none print:ring-0"
      >
        <h2 className="text-center text-base font-bold uppercase tracking-wide text-slate-900">
          Travelling Allowance Claim
        </h2>

        <div className="claim-header mt-4 flex overflow-hidden rounded-md border border-slate-900 text-sm">
          <div className="flex flex-col divide-y divide-slate-900 bg-slate-900 text-white">
            <span className="px-2 py-1.5 font-semibold whitespace-nowrap sm:px-3">Name Claim:</span>
            <span className="px-2 py-1.5 font-semibold whitespace-nowrap sm:px-3">Tujuan:</span>
            <span className="px-2 py-1.5 font-semibold whitespace-nowrap sm:px-3">Tarikh:</span>
          </div>
          <div className="flex flex-1 flex-col divide-y divide-slate-900 bg-orange-100">
            <span className="px-2 py-1.5 sm:px-3">{event.claimantName || ' '}</span>
            <span className="px-2 py-1.5 sm:px-3">{event.purpose || event.name}</span>
            <span className="px-2 py-1.5 sm:px-3">
              {formatDateDisplay(event.startDate)}
              {event.endDate ? ` – ${formatDateDisplay(event.endDate)}` : ''}
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-400 sm:hidden print:hidden">↔ Swipe the table sideways to see all columns</p>

        {/* Scrollable on small screens so the wide claim table never breaks the page layout;
            these screen-only constraints are cancelled under print: so the actual printed
            output is unaffected and laid out by print.css against the physical page width. */}
        <div className="mt-2 -mx-4 overflow-x-auto px-4 print:mx-0 print:overflow-visible print:px-0 sm:mx-0 sm:mt-4 sm:px-0">
          <div className="min-w-[560px] print:min-w-0">
            <BalanceTable rows={balance.rows} totals={balance.totals} variant="print" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
