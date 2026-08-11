import { useCallback, useEffect, useMemo, useState } from 'react';
import * as transactionsRepo from '../db/repositories/transactionsRepo';
import * as eventsRepo from '../db/repositories/eventsRepo';
import { CLAIM_CATEGORIES } from '../types/models';
import type { ID } from '../types/models';

const CLAIM_CATEGORY_LABELS = Object.fromEntries(CLAIM_CATEGORIES.map((c) => [c.value, c.label]));

export interface MonthlyItem {
  id: ID;
  source: 'personal' | 'company';
  date: string;
  refNo: string;
  description: string;
  amount: number;
  category: string;
  createdAt: string;
  eventId?: ID;
  eventName?: string;
}

export function useMonthlyActivity(month: string) {
  const [items, setItems] = useState<MonthlyItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [transactions, events] = await Promise.all([
      transactionsRepo.listByMonth(month),
      eventsRepo.listEvents(),
    ]);
    const eventNameById = new Map(events.map((e) => [e.id, e.name]));

    const combined: MonthlyItem[] = transactions
      .map((t) => {
        if (t.kind === 'general') {
          return {
            id: t.id,
            source: 'personal',
            date: t.date,
            refNo: t.refNo,
            description: t.description,
            amount: t.amount,
            category: t.category,
            createdAt: t.createdAt,
          } satisfies MonthlyItem;
        }
        return {
          id: t.id,
          source: 'company',
          date: t.date,
          refNo: t.refNo,
          description: t.description,
          amount: t.amount,
          category: CLAIM_CATEGORY_LABELS[t.claimCategory],
          createdAt: t.createdAt,
          eventId: t.eventId,
          eventName: eventNameById.get(t.eventId) ?? 'Event',
        } satisfies MonthlyItem;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

    setItems(combined);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const categoryTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of items) {
      totals.set(item.category, (totals.get(item.category) ?? 0) + item.amount);
    }
    return Array.from(totals.entries())
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [items]);

  const personalTotal = useMemo(
    () => items.filter((i) => i.source === 'personal').reduce((sum, i) => sum + i.amount, 0),
    [items]
  );
  const companyTotal = useMemo(
    () => items.filter((i) => i.source === 'company').reduce((sum, i) => sum + i.amount, 0),
    [items]
  );
  const monthTotal = personalTotal + companyTotal;

  const deleteItem = useCallback(
    async (id: ID) => {
      await transactionsRepo.deleteTransaction(id);
      await refresh();
    },
    [refresh]
  );

  return {
    items,
    categoryTotals,
    personalTotal,
    companyTotal,
    monthTotal,
    loading,
    refresh,
    deleteItem,
  };
}
