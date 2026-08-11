import { formatRM } from '../lib/date';

interface MoneyProps {
  amount: number;
  className?: string;
  bold?: boolean;
}

export function Money({ amount, className = '', bold = false }: MoneyProps) {
  const negative = amount < 0;
  return (
    <span
      className={[
        negative ? 'balance-negative text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100',
        bold ? 'font-semibold' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {formatRM(amount)}
    </span>
  );
}
