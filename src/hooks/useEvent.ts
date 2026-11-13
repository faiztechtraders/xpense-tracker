import { useCallback, useEffect, useMemo, useState } from 'react';
import * as eventsRepo from '../db/repositories/eventsRepo';
import * as transactionsRepo from '../db/repositories/transactionsRepo';
import { computeEventBalance } from '../lib/balance';
import type { EventTransaction, ID, TravelEvent } from '../types/models';

export function useEvent(eventId: ID | undefined) {
  const [event, setEvent] = useState<TravelEvent | undefined>();
  const [transactions, setTransactions] = useState<EventTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!eventId) {
      setEvent(undefined);
      setTransactions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [ev, txs] = await Promise.all([
      eventsRepo.getEvent(eventId),
      transactionsRepo.listByEvent(eventId),
    ]);
    setEvent(ev);
    setTransactions(txs);
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const balance = useMemo(() => {
    if (!event) return undefined;
    return computeEventBalance(event, transactions);
  }, [event, transactions]);

  const deleteTransaction = useCallback(
    async (id: ID) => {
      await transactionsRepo.deleteTransaction(id);
      await refresh();
    },
    [refresh]
  );

  const setArchived = useCallback(
    async (archived: boolean) => {
      if (!eventId) return;
      await eventsRepo.archiveEvent(eventId, archived);
      await refresh();
    },
    [eventId, refresh]
  );

  return { event, transactions, balance, loading, refresh, deleteTransaction, setArchived };
}
