interface CurrencyInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  required?: boolean;
}

export function CurrencyInput({ id, value, onChange, placeholder, autoFocus, required }: CurrencyInputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500 dark:text-slate-400">
        RM
      </span>
      <input
        id={id}
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        value={value}
        placeholder={placeholder ?? '0.00'}
        autoFocus={autoFocus}
        required={required}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9.]/g, '');
          onChange(next);
        }}
        className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-lg font-medium text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-500"
      />
    </div>
  );
}
