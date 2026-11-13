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
  const showArchived = route.name === 'dashboard' && route.archived === true;
  const activeEvents = events.filter((e) => !e.archived);
  const archivedEvents = events.filter((e) => e.archived);
  const visibleEvents = showArchived ? archivedEvents : activeEvents;

  const tabClasses = (selected: boolean) =>
    [
      'min-h-9 flex-1 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 sm:flex-none',
      selected
        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50'
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
    ].join(' ');

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

      <div
        role="tablist"
        aria-label="Event status"
        className="mt-3 flex gap-1 rounded-xl bg-slate-100 p-1 sm:inline-flex dark:bg-slate-800/70"
      >
        <button
          type="button"
          role="tab"
          aria-selected={!showArchived}
          onClick={() => navigate({ name: 'dashboard' })}
          className={tabClasses(!showArchived)}
        >
          Active ({activeEvents.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={showArchived}
          onClick={() => navigate({ name: 'dashboard', archived: true })}
          className={tabClasses(showArchived)}
        >
          Archived ({archivedEvents.length})
        </button>
      </div>

      {/* auto-fit (not a fixed column count) so a lone card stretches to use the
          available row width instead of being squeezed into one of several empty
          tracks — the bug this fixed: a 1-event dashboard on a wide screen showed
          a cramped, truncated card next to a large expanse of unused space. */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        {loading && <p className="text-sm text-slate-400 dark:text-slate-500">Loading…</p>}
        {!loading && visibleEvents.length === 0 && (
          <div>
            {showArchived ? (
              <EmptyState
                title="No archived events"
                description="Archive a finished event from its detail page to move it here."
              />
            ) : (
              <EmptyState
                title={archivedEvents.length > 0 ? 'No active events' : 'No events yet'}
                description="Create an event to start tracking a travel or seminar allowance."
              />
            )}
          </div>
        )}
        {visibleEvents.map((event) => {
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
