import { useCallback, useEffect, useState } from 'react';
import type { ID } from '../types/models';

export type Route =
  | { name: 'dashboard'; archived?: boolean }
  | { name: 'event-detail'; eventId: ID }
  | { name: 'event-form'; eventId?: ID }
  | { name: 'transaction-form'; eventId: ID; transactionId?: ID }
  | { name: 'general-expenses' }
  | { name: 'transaction-form-general'; transactionId?: ID }
  | { name: 'print-view'; eventId: ID }
  | { name: 'analytics' };

function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [seg0, seg1, seg2] = parts;

  switch (seg0) {
    case 'event':
      if (seg2 === 'edit') return { name: 'event-form', eventId: seg1 };
      if (seg2 === 'add-transaction') return { name: 'transaction-form', eventId: seg1 };
      if (seg2 === 'transaction') return { name: 'transaction-form', eventId: seg1, transactionId: parts[3] };
      if (seg2 === 'print') return { name: 'print-view', eventId: seg1 };
      return { name: 'event-detail', eventId: seg1 };
    case 'event-new':
      return { name: 'event-form' };
    case 'general':
      if (seg1 === 'add') return { name: 'transaction-form-general' };
      if (seg1 === 'edit') return { name: 'transaction-form-general', transactionId: seg2 };
      return { name: 'general-expenses' };
    case 'analytics':
      return { name: 'analytics' };
    case 'archived':
      return { name: 'dashboard', archived: true };
    default:
      return { name: 'dashboard' };
  }
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'dashboard':
      return route.archived ? '#/archived' : '#/';
    case 'event-detail':
      return `#/event/${route.eventId}`;
    case 'event-form':
      return route.eventId ? `#/event/${route.eventId}/edit` : '#/event-new';
    case 'transaction-form':
      return route.transactionId
        ? `#/event/${route.eventId}/transaction/${route.transactionId}`
        : `#/event/${route.eventId}/add-transaction`;
    case 'general-expenses':
      return '#/general';
    case 'transaction-form-general':
      return route.transactionId ? `#/general/edit/${route.transactionId}` : '#/general/add';
    case 'print-view':
      return `#/event/${route.eventId}/print`;
    case 'analytics':
      return '#/analytics';
  }
}

export function useHashRoute(): [Route, (route: Route) => void, () => void] {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: Route) => {
    window.location.hash = routeToHash(next);
  }, []);

  const back = useCallback(() => {
    window.history.back();
  }, []);

  return [route, navigate, back];
}
