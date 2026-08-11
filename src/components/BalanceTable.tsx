import type { BalanceRow, BalanceTotals } from '../lib/balance';
import { formatDateDisplay, formatRM } from '../lib/date';
import { Money } from './Money';

interface BalanceTableProps {
  rows: BalanceRow[];
  totals: BalanceTotals;
  variant?: 'screen' | 'print';
  onRowClick?: (transactionId: string) => void;
}

export function BalanceTable({ rows, totals, variant = 'screen', onRowClick }: BalanceTableProps) {
  if (variant === 'print') {
    return <PrintTable rows={rows} totals={totals} />;
  }

  // On-screen view: a plain amount-per-item list, not a running-balance ledger — the
  // running balance already lives in the big Balance Claim figure above this list.
  // Same card style at every breakpoint (mobile and desktop), matching the list
  // pattern used elsewhere in the app instead of a spreadsheet-style table.
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => {
        const clickable = !r.isStarting && !!onRowClick;
        const Wrapper = clickable ? 'button' : 'div';
        const amount = r.allowance ?? r.totalClaim ?? 0;
        return (
          <Wrapper
            key={r.transactionId}
            type={clickable ? 'button' : undefined}
            onClick={clickable ? () => onRowClick?.(r.transactionId) : undefined}
            className={`w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition dark:border-slate-800 dark:bg-slate-900 ${
              clickable
                ? 'hover:border-slate-300 hover:shadow-md active:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:border-slate-700 dark:active:bg-slate-800'
                : ''
            } ${r.isStarting ? 'font-medium' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{r.description}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {formatDateDisplay(r.date)}
                  {r.refNo ? ` · ${r.refNo}` : ''}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatRM(amount)}</span>
            </div>
          </Wrapper>
        );
      })}
    </div>
  );
}

// Exact claim-sheet layout — Date / Ref. No. / Description / Allowance / Total Claim /
// Balance Claim with a totals footer — used for print output and, unstyled by dark mode
// (force-light), the on-screen "what will print" preview. Never used for normal browsing.
function PrintTable({ rows, totals }: { rows: BalanceRow[]; totals: BalanceTotals }) {
  return (
    <table className="claim-table w-full border-collapse text-sm">
      <thead>
        <tr className="border-b border-slate-300 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <th className="py-2 pr-2">Date</th>
          <th className="py-2 pr-2">Ref. No.</th>
          <th className="py-2 pr-2">Description</th>
          <th className="py-2 pr-2 text-right">Allowance</th>
          <th className="py-2 pr-2 text-right">Total Claim</th>
          <th className="py-2 pr-2 text-right">Balance Claim</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.transactionId} className={`border-b border-slate-100 ${r.isStarting ? 'font-medium' : ''}`}>
            <td className="py-2 pr-2 align-top">{formatDateDisplay(r.date)}</td>
            <td className="py-2 pr-2 align-top">{r.refNo || '—'}</td>
            <td className="py-2 pr-2 align-top">{r.description}</td>
            <td className="py-2 pr-2 text-right align-top">{r.allowance != null ? formatRM(r.allowance) : ''}</td>
            <td className="py-2 pr-2 text-right align-top">{r.totalClaim != null ? formatRM(r.totalClaim) : ''}</td>
            <td className="py-2 pr-2 text-right align-top">
              <Money amount={r.balanceClaim} bold />
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t-2 border-slate-400 font-semibold">
          <td className="py-2 pr-2" colSpan={3}>
            Total:
          </td>
          <td className="py-2 pr-2 text-right">{formatRM(totals.allowance)}</td>
          <td className="py-2 pr-2 text-right">{formatRM(totals.totalClaim)}</td>
          <td className="py-2 pr-2 text-right">
            <Money amount={totals.finalBalance} bold />
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
