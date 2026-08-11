import { useEffect, useMemo, useState } from 'react';
import * as transactionsRepo from '../db/repositories/transactionsRepo';
import {
  GRANULARITY_CONFIG,
  buildTrendSeries,
  categoryBreakdown,
  filterByPeriod,
  shiftPeriod,
  splitTotals,
  type Granularity,
} from '../lib/analytics';
import type { Transaction } from '../types/models';

export function useAnalytics(granularity: Granularity, anchorKey: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    transactionsRepo.listAll().then((all) => {
      if (cancelled) return;
      setTransactions(all);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const trend = useMemo(
    () => buildTrendSeries(transactions, granularity, anchorKey, GRANULARITY_CONFIG[granularity].trendCount),
    [transactions, granularity, anchorKey]
  );

  const periodTransactions = useMemo(
    () => filterByPeriod(transactions, granularity, anchorKey),
    [transactions, granularity, anchorKey]
  );

  const totals = useMemo(() => splitTotals(periodTransactions), [periodTransactions]);

  const previousTotals = useMemo(() => {
    const prevKey = shiftPeriod(anchorKey, granularity, -1);
    return splitTotals(filterByPeriod(transactions, granularity, prevKey));
  }, [transactions, granularity, anchorKey]);

  const categories = useMemo(() => categoryBreakdown(periodTransactions), [periodTransactions]);

  return { loading, trend, totals, previousTotals, categories };
}
