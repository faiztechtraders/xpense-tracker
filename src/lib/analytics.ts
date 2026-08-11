import { todayISO } from './date';
import type { Transaction } from '../types/models';

export type Granularity = 'week' | 'month' | 'year';

// Scalable by design: adding a new granularity (e.g. 'quarter') means one entry
// here plus one case in each switch below — nothing else in the analytics layer
// or UI needs to change.
export const GRANULARITY_CONFIG: Record<Granularity, { label: string; trendCount: number }> = {
  week: { label: 'Week', trendCount: 8 },
  month: { label: 'Month', trendCount: 6 },
  year: { label: 'Year', trendCount: 5 },
};

export const GRANULARITIES: Granularity[] = ['week', 'month', 'year'];

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isoFromUTC(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

function parseISODateUTC(dateISO: string): Date {
  const [y, m, d] = dateISO.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function isoWeekInfo(date: Date): { isoYear: number; week: number } {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { isoYear: d.getUTCFullYear(), week };
}

function isoWeekStart(isoYear: number, week: number): Date {
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  return start;
}

export function periodKey(dateISO: string, granularity: Granularity): string {
  switch (granularity) {
    case 'week': {
      const { isoYear, week } = isoWeekInfo(parseISODateUTC(dateISO));
      return `${isoYear}-W${pad2(week)}`;
    }
    case 'month':
      return dateISO.slice(0, 7);
    case 'year':
      return dateISO.slice(0, 4);
  }
}

export function periodStart(key: string, granularity: Granularity): Date {
  switch (granularity) {
    case 'week': {
      const [y, w] = key.split('-W').map(Number);
      return isoWeekStart(y, w);
    }
    case 'month': {
      const [y, m] = key.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, 1));
    }
    case 'year':
      return new Date(Date.UTC(Number(key), 0, 1));
  }
}

export function periodEnd(key: string, granularity: Granularity): Date {
  const end = new Date(periodStart(key, granularity));
  switch (granularity) {
    case 'week':
      end.setUTCDate(end.getUTCDate() + 6);
      return end;
    case 'month':
      end.setUTCMonth(end.getUTCMonth() + 1);
      end.setUTCDate(end.getUTCDate() - 1);
      return end;
    case 'year':
      end.setUTCFullYear(end.getUTCFullYear() + 1);
      end.setUTCDate(end.getUTCDate() - 1);
      return end;
  }
}

export function shiftPeriod(key: string, granularity: Granularity, delta: number): string {
  const d = new Date(periodStart(key, granularity));
  switch (granularity) {
    case 'week':
      d.setUTCDate(d.getUTCDate() + delta * 7);
      break;
    case 'month':
      d.setUTCMonth(d.getUTCMonth() + delta);
      break;
    case 'year':
      d.setUTCFullYear(d.getUTCFullYear() + delta);
      break;
  }
  return periodKey(isoFromUTC(d), granularity);
}

export function currentPeriodKey(granularity: Granularity): string {
  return periodKey(todayISO(), granularity);
}

export function periodLabel(key: string, granularity: Granularity, style: 'short' | 'long' = 'long'): string {
  switch (granularity) {
    case 'week': {
      const start = periodStart(key, granularity);
      const end = periodEnd(key, granularity);
      const fmt = (d: Date) => `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]}`;
      // Short form must read as a *range*, not a single day — a bare "13 Jul" under a
      // trend-chart bar looks like one specific date, which misleads when the actual
      // transaction landed anywhere else in that Mon–Sun week (a real bug: a user saw a
      // bar labeled "13 Jul" and assumed data existed on that exact day).
      return style === 'short' ? `${start.getUTCDate()}–${end.getUTCDate()} ${MONTH_NAMES[end.getUTCMonth()]}` : `${fmt(start)} – ${fmt(end)} ${end.getUTCFullYear()}`;
    }
    case 'month': {
      const [y, m] = key.split('-').map(Number);
      return style === 'short' ? MONTH_NAMES[m - 1] : `${MONTH_NAMES[m - 1]} ${y}`;
    }
    case 'year':
      return key;
  }
}

export interface PeriodBucket {
  key: string;
  /** Compact axis label — a range for weeks ("13–19 Jul"), never a bare single day. */
  label: string;
  /** Full descriptive label for the active-period readout, e.g. "13 Jul – 19 Jul 2026". */
  longLabel: string;
  personal: number;
  company: number;
  total: number;
}

export function buildTrendSeries(
  transactions: Transaction[],
  granularity: Granularity,
  anchorKey: string,
  count: number
): PeriodBucket[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(shiftPeriod(anchorKey, granularity, -i));
  }

  const buckets = new Map<string, { personal: number; company: number }>();
  for (const key of keys) buckets.set(key, { personal: 0, company: 0 });

  for (const t of transactions) {
    const bucket = buckets.get(periodKey(t.date, granularity));
    if (!bucket) continue;
    if (t.kind === 'general') bucket.personal += t.amount;
    else bucket.company += t.amount;
  }

  return keys.map((key) => {
    const b = buckets.get(key)!;
    return {
      key,
      label: periodLabel(key, granularity, 'short'),
      longLabel: periodLabel(key, granularity, 'long'),
      personal: b.personal,
      company: b.company,
      total: b.personal + b.company,
    };
  });
}

export function filterByPeriod(transactions: Transaction[], granularity: Granularity, key: string): Transaction[] {
  return transactions.filter((t) => periodKey(t.date, granularity) === key);
}

// Claim categories fold into the same buckets as general expense categories
// (e.g. a company-paid "Food" claim and a personal "Food" expense both count
// toward the "Food" total) so the breakdown answers "how much did I spend on
// X", not "how much did I personally pay for X".
const CLAIM_CATEGORY_TO_LABEL: Record<string, string> = {
  food: 'Food',
  transport: 'Transport',
};

export interface CategoryTotal {
  category: string;
  amount: number;
}

export function categoryBreakdown(transactions: Transaction[]): CategoryTotal[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    const category = t.kind === 'general' ? t.category : (CLAIM_CATEGORY_TO_LABEL[t.claimCategory] ?? 'Other');
    totals.set(category, (totals.get(category) ?? 0) + t.amount);
  }
  return Array.from(totals.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export interface SplitTotals {
  personal: number;
  company: number;
  total: number;
}

export function splitTotals(transactions: Transaction[]): SplitTotals {
  let personal = 0;
  let company = 0;
  for (const t of transactions) {
    if (t.kind === 'general') personal += t.amount;
    else company += t.amount;
  }
  return { personal, company, total: personal + company };
}

// Fixed order matching EXPENSE_CATEGORY_SUGGESTIONS — kept in sync with the
// validated 7-slot categorical palette in styles/index.css (--cat-1..7).
export const CATEGORY_COLOR_VAR: Record<string, string> = {
  Food: 'var(--cat-1)',
  Transport: 'var(--cat-2)',
  Utilities: 'var(--cat-3)',
  Household: 'var(--cat-4)',
  Medical: 'var(--cat-5)',
  Entertainment: 'var(--cat-6)',
  Other: 'var(--cat-7)',
};
