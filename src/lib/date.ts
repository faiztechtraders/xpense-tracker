export function todayISO(): string {
  const d = new Date();
  const tzOffsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffsetMs).toISOString().slice(0, 10);
}

export function currentMonth(): string {
  return todayISO().slice(0, 7);
}

export function monthOf(dateISO: string): string {
  return dateISO.slice(0, 7);
}

export function formatDateDisplay(dateISO: string): string {
  if (!dateISO) return '';
  const [y, m, d] = dateISO.split('-');
  return `${d}/${m}/${y}`;
}

export function formatMonthDisplay(monthISO: string): string {
  const [y, m] = monthISO.split('-').map(Number);
  const date = new Date(y, m - 1, 1);
  return date.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' });
}

export function formatRM(amount: number, symbol = 'RM'): string {
  const sign = amount < 0 ? '-' : '';
  const abs = Math.abs(amount);
  return `${sign}${symbol}${abs.toFixed(2)}`;
}
