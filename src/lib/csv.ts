import type { BalanceRow, BalanceTotals } from './balance';
import type { TravelEvent } from '../types/models';

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function balanceRowsToCsv(rows: BalanceRow[], totals: BalanceTotals): string {
  const header = ['Date', 'Ref. No.', 'Description', 'Allowance', 'Total Claim', 'Balance Claim'];
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      [
        r.date,
        escapeCsv(r.refNo),
        escapeCsv(r.description),
        r.allowance != null ? r.allowance.toFixed(2) : '',
        r.totalClaim != null ? r.totalClaim.toFixed(2) : '',
        r.balanceClaim.toFixed(2),
      ].join(',')
    ),
    ['', '', 'TOTAL', totals.allowance.toFixed(2), totals.totalClaim.toFixed(2), totals.finalBalance.toFixed(2)].join(
      ','
    ),
  ];
  return lines.join('\r\n');
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function eventCsvFilename(event: TravelEvent): string {
  const slug = event.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '');
  return `${slug || 'event'}-claim-${event.startDate}.csv`;
}
