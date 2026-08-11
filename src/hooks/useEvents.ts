import { useCallback, useEffect, useState } from 'react';
import * as eventsRepo from '../db/repositories/eventsRepo';
import * as transactionsRepo from '../db/repositories/transactionsRepo';
import type { EventTransaction, ID, TravelEvent } from '../types/models';
import type { NewEventInput } from '../db/repositories/eventsRepo';

export function useEvents() {
  const [events, setEvents] = useState<TravelEvent[]>([]);
  const [transactionsByEvent, setTransactionsByEvent] = useState<Map<ID, EventTransaction[]>>(new Map());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [all, allTransactions] = await Promise.all([
      eventsRepo.listEvents(),
      transactionsRepo.listAllEventTransactions(),
    ]);
    const grouped = new Map<ID, EventTransaction[]>();
    for (const t of allTransactions) {
      const list = grouped.get(t.eventId) ?? [];
      list.push(t);
      grouped.set(t.eventId, list);
    }
    setEvents(all);
    setTransactionsByEvent(grouped);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEvent = useCallback(
    async (input: NewEventInput) => {
      const event = await eventsRepo.createEvent(input);
      await refresh();
      return event;
    },
    [refresh]
  );

  const updateEvent = useCallback(
    async (id: ID, patch: Partial<NewEventInput>) => {
      const event = await eventsRepo.updateEvent(id, patch);
      await refresh();
      return event;
    },
    [refresh]
  );

  const archiveEvent = useCallback(
    async (id: ID, archived = true) => {
      await eventsRepo.archiveEvent(id, archived);
      await refresh();
    },
    [refresh]
  );

  const deleteEvent = useCallback(
    async (id: ID) => {
      await eventsRepo.deleteEvent(id);
      await refresh();
    },
    [refresh]
  );

  return {
    events,
    transactionsByEvent,
    loading,
    refresh,
    createEvent,
    updateEvent,
    archiveEvent,
    deleteEvent,
  };
}
