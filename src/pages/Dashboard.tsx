import { useEvents } from '../hooks/useEvents';
import { AppShell } from '../components/layout/AppShell';
import { EmptyState } from '../components/EmptyState';
import { Money } from '../components/Money';
import { computeEventBalance } from '../lib/balance';
import { formatDateDisplay } from '../lib/date';
import type { Route } from '../hooks/useHashRoute';

interface DashboardProps {
  route: Route;
  navigate: (route: Route) => void;
}

export function Dashboard({ route, navigate }: DashboardProps) {
  const { events, transactionsByEvent, loading } = useEvents();
  const activeEvents = events.filter((e) => !e.archived);

  return (
    <AppShell title="ClaimTrack" route={route} navigate={navigate}>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Events</h2>
        <button
          type="button"
          onClick={() => navigate({ name: 'event-form' })}
          className="min-h-9 rounded-full bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          + New Event
        </button>
      </div>

      {/* auto-fit (not a fixed column count) so a lone card stretches to use the
          available row width instead of being squeezed into one of several empty
          tracks — the bug this fixed: a 1-event dashboard on a wide screen showed
          a cramped, truncated card next to a large expanse of unused space. */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        {loading && <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>}
        {!loading && activeEvents.length === 0 && (
          <div>
            <EmptyState
              title="No events yet"
              description="Create an event to start tracking a travel or seminar allowance."
            />
          </div>
        )}
        {activeEvents.map((event) => {
          const { totals } = computeEventBalance(event, transactionsByEvent.get(event.id) ?? []);
          return (
            <button
              key={event.id}
              type="button"
              onClick={() => navigate({ name: 'event-detail', eventId: event.id })}
              className="flex w-full items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md active:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:active:bg-slate-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{event.name}</p>
                <p className="truncate text-sm text-slate-500 dark:text-slate-400">{event.purpose}</p>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {formatDateDisplay(event.startDate)}
                  {event.endDate ? ` – ${formatDateDisplay(event.endDate)}` : ''}
                </p>
              </div>
              <div className="shrink-0 pt-0.5 text-right">
                <p className="text-xs text-slate-400 dark:text-slate-500">Balance</p>
                <Money amount={totals.finalBalance} bold />
              </div>
            </button>
          );
        })}
      </div>
    </AppShell>
  );
}
