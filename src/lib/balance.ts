import type { EventTransaction, ID, TravelEvent } from '../types/models';

export interface BalanceRow {
  transactionId: ID;
  date: string;
  refNo: string;
  description: string;
  allowance: number | null;
  totalClaim: number | null;
  balanceClaim: number;
  isNegative: boolean;
  isStarting: boolean;
}

export interface BalanceTotals {
  allowance: number;
  totalClaim: number;
  finalBalance: number;
}

export interface EventBalance {
  rows: BalanceRow[];
  totals: BalanceTotals;
}

// The allowance is a single fixed budget set on the event (no top-ups) — every
// EventTransaction is a claim against it, so balance is just a running subtraction.
export function computeEventBalance(
  event: TravelEvent,
  transactions: EventTransaction[]
): EventBalance {
  const sorted = [...transactions].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt)
  );

  let runningClaim = 0;

  const rows: BalanceRow[] = [
    {
      transactionId: '__starting__',
      date: event.startDate,
      refNo: '',
      description: 'Allowance received',
      allowance: event.allowanceBudget,
      totalClaim: null,
      balanceClaim: event.allowanceBudget,
      isNegative: event.allowanceBudget < 0,
      isStarting: true,
    },
  ];

  for (const t of sorted) {
    runningClaim += t.amount;
    const balance = event.allowanceBudget - runningClaim;
    rows.push({
      transactionId: t.id,
      date: t.date,
      refNo: t.refNo,
      description: t.description,
      allowance: null,
      totalClaim: t.amount,
      balanceClaim: balance,
      isNegative: balance < 0,
      isStarting: false,
    });
  }

  return {
    rows,
    totals: {
      allowance: event.allowanceBudget,
      totalClaim: runningClaim,
      finalBalance: event.allowanceBudget - runningClaim,
    },
  };
}
