import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { todayISO } from '../lib/date';

// A custom date picker replacing <input type="date">. The browser's native popup
// can't be restyled or enlarged (Chrome draws it itself), and on desktop/Windows it's
// small and fiddly to tap — so this renders its own calendar: a bottom sheet on
// phones, a centered dialog from `sm:` up. Values are plain 'YYYY-MM-DD' strings,
// same as the native input, and all date math is done on local y/m/d integers so
// timezones never shift a day.

interface DateFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Optional fields get a "Clear" button and may be empty. */
  optional?: boolean;
  /** Earliest selectable date ('YYYY-MM-DD'); earlier days are disabled. */
  min?: string;
  placeholder?: string;
  className?: string;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const pad = (n: number) => String(n).padStart(2, '0');
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m: m - 1, d };
};
const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();

/** Shift an ISO date by whole days (local calendar, no DST drift). */
function addDays(iso: string, delta: number): string {
  const { y, m, d } = parseISO(iso);
  const dt = new Date(y, m, d + delta);
  return toISO(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

function formatTrigger(iso: string): string {
  const { y, m, d } = parseISO(iso);
  return `${d} ${MONTHS_SHORT[m]} ${y}`;
}

export function DateField({ id, value, onChange, optional = false, min, placeholder = 'Select date', className = '' }: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        id={id}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={[
          'flex w-full min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-left text-base text-slate-900 transition hover:border-slate-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-teal-500',
          className,
        ].join(' ')}
      >
        <CalendarIcon />
        <span className={`min-w-0 flex-1 truncate ${value ? '' : 'text-slate-400 dark:text-slate-500'}`}>
          {value ? formatTrigger(value) : placeholder}
        </span>
      </button>
      {open && (
        <CalendarDialog
          value={value}
          min={min}
          optional={optional}
          onSelect={(v) => {
            onChange(v);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

interface CalendarDialogProps {
  value: string;
  min?: string;
  optional: boolean;
  onSelect: (value: string) => void;
  onClose: () => void;
}

function CalendarDialog({ value, min, optional, onSelect, onClose }: CalendarDialogProps) {
  const today = todayISO();
  const initial = value || (min && min > today ? min : today);
  const [focused, setFocused] = useState(initial);
  const [view, setView] = useState<'days' | 'months'>('days');
  const { y: viewYear, m: viewMonth } = parseISO(focused);
  const [monthPickerYear, setMonthPickerYear] = useState(viewYear);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Keep keyboard focus on the focused day as it moves (arrow keys / month change).
  useEffect(() => {
    if (view !== 'days') return;
    gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)?.focus();
  }, [focused, view]);

  const isDisabled = (iso: string) => !!min && iso < min;

  const shiftMonth = (delta: number) => {
    const dt = new Date(viewYear, viewMonth + delta, 1);
    const y = dt.getFullYear();
    const m = dt.getMonth();
    const { d } = parseISO(focused);
    setFocused(toISO(y, m, Math.min(d, daysInMonth(y, m))));
  };

  const handleGridKey = (e: React.KeyboardEvent) => {
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in deltas) {
      e.preventDefault();
      setFocused(addDays(focused, deltas[e.key]));
    } else if (e.key === 'PageUp' || e.key === 'PageDown') {
      e.preventDefault();
      shiftMonth(e.key === 'PageUp' ? -1 : 1);
    }
  };

  // 6 rows x 7 columns starting on the Sunday on/before the 1st, so the grid height
  // never jumps between months.
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const gridStart = addDays(toISO(viewYear, viewMonth, 1), -firstWeekday);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  const navBtn =
    'flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-slate-300 dark:hover:bg-slate-800';
  const footerBtn =
    'min-h-11 rounded-xl px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500';

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose date"
        className="w-full max-w-sm rounded-t-3xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-xl sm:rounded-3xl sm:p-5 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab handle — visual cue on phones that this is a sheet */}
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden dark:bg-slate-700" />

        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (view === 'days') setMonthPickerYear(viewYear);
              setView(view === 'days' ? 'months' : 'days');
            }}
            className="flex min-h-11 items-center gap-1 rounded-xl px-2 text-lg font-semibold text-slate-900 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-slate-50 dark:hover:bg-slate-800"
            aria-label={view === 'days' ? 'Choose month and year' : 'Back to days'}
          >
            {view === 'days' ? `${MONTHS_LONG[viewMonth]} ${viewYear}` : monthPickerYear}
            <span className={`text-sm text-slate-400 transition ${view === 'months' ? 'rotate-180' : ''}`}>▾</span>
          </button>
          <div className="flex gap-1">
            <button
              type="button"
              className={navBtn}
              aria-label={view === 'days' ? 'Previous month' : 'Previous year'}
              onClick={() => (view === 'days' ? shiftMonth(-1) : setMonthPickerYear(monthPickerYear - 1))}
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              className={navBtn}
              aria-label={view === 'days' ? 'Next month' : 'Next year'}
              onClick={() => (view === 'days' ? shiftMonth(1) : setMonthPickerYear(monthPickerYear + 1))}
            >
              <Chevron dir="right" />
            </button>
          </div>
        </div>

        {view === 'days' ? (
          <>
            <div className="grid grid-cols-7 text-center text-xs font-semibold uppercase text-slate-400 dark:text-slate-500">
              {WEEKDAYS.map((w, i) => (
                <div key={i} className="py-2">
                  {w}
                </div>
              ))}
            </div>
            <div ref={gridRef} role="grid" className="grid grid-cols-7 gap-1" onKeyDown={handleGridKey}>
              {cells.map((iso) => {
                const { m, d } = parseISO(iso);
                const inMonth = m === viewMonth;
                const selected = iso === value;
                const isToday = iso === today;
                const disabled = isDisabled(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    data-date={iso}
                    tabIndex={iso === focused ? 0 : -1}
                    disabled={disabled}
                    aria-pressed={selected}
                    aria-label={`${d} ${MONTHS_LONG[m]} ${parseISO(iso).y}${isToday ? ' (today)' : ''}`}
                    onClick={() => onSelect(iso)}
                    className={[
                      'flex aspect-square min-h-11 items-center justify-center rounded-full text-base transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                      selected
                        ? 'bg-teal-700 font-semibold text-white hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500'
                        : isToday
                          ? 'font-semibold text-teal-700 ring-1 ring-inset ring-teal-600 hover:bg-teal-50 dark:text-teal-300 dark:ring-teal-500 dark:hover:bg-teal-950/50'
                          : inMonth
                            ? 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800'
                            : 'text-slate-300 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-slate-800/60',
                      disabled ? 'cursor-not-allowed opacity-30 hover:bg-transparent dark:hover:bg-transparent' : '',
                    ].join(' ')}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-2 py-2">
            {MONTHS_SHORT.map((label, m) => {
              const active = m === viewMonth && monthPickerYear === viewYear;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    const { d } = parseISO(focused);
                    setFocused(toISO(monthPickerYear, m, Math.min(d, daysInMonth(monthPickerYear, m))));
                    setView('days');
                  }}
                  className={[
                    'min-h-14 rounded-2xl text-base font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500',
                    active
                      ? 'bg-teal-700 text-white dark:bg-teal-600'
                      : 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          {optional && (
            <button
              type="button"
              onClick={() => onSelect('')}
              className={`${footerBtn} text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800`}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className={`${footerBtn} ml-auto text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800`}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDisabled(today)}
            onClick={() => onSelect(today)}
            className={`${footerBtn} bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-40 dark:bg-teal-600 dark:hover:bg-teal-500`}
          >
            Today
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" aria-hidden="true">
      <rect x="3" y="4.5" width="14" height="12.5" rx="2" />
      <path d="M3 8.5h14M7 2.5v3.5M13 2.5v3.5" strokeLinecap="round" />
    </svg>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
      <path d={dir === 'left' ? 'M12.5 4.5 7 10l5.5 5.5' : 'M7.5 4.5 13 10l-5.5 5.5'} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
