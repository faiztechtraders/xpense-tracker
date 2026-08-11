import { useState } from 'react';
import { formatRM } from '../../lib/date';
import type { PeriodBucket } from '../../lib/analytics';

interface TrendBarChartProps {
  data: PeriodBucket[];
  periodNoun: string;
}

function niceMax(value: number): number {
  if (value <= 0) return 100;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const residual = value / magnitude;
  const niceResidual = residual <= 1 ? 1 : residual <= 2 ? 2 : residual <= 5 ? 5 : 10;
  return niceResidual * magnitude;
}

function formatAxisRM(amount: number): string {
  return `RM${Math.round(amount).toLocaleString('en-MY')}`;
}

const PLOT_HEIGHT = 200;

export function TrendBarChart({ data, periodNoun }: TrendBarChartProps) {
  const [activeIndex, setActiveIndex] = useState(data.length - 1);
  const [showTable, setShowTable] = useState(false);
  // Grouped (not stacked) bars — each bar's height must read directly against the axis,
  // so scale to the largest individual series value, not the combined total. Floor the
  // fallback at 0 (not 1) so an all-zero period hits niceMax's <=0 branch and gets a clean
  // 0/25/50/75/100 axis, instead of niceMax(1)=1 producing duplicate rounded "RM1" ticks.
  const max = niceMax(Math.max(...data.flatMap((d) => [d.personal, d.company]), 0));
  const gridSteps = [0, 0.25, 0.5, 0.75, 1];
  const active = data[activeIndex] ?? data[data.length - 1];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Spending trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personal vs company allowance, last {data.length} {periodNoun}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          className="shrink-0 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {/* Legend — text tokens, never colored text; identity carried by the swatch */}
      <div className="mt-3 flex gap-4 text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[color:var(--series-personal)]" aria-hidden="true" />
          Personal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-[color:var(--series-company)]" aria-hidden="true" />
          Company Allowance
        </span>
      </div>

      {showTable ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <th className="py-2 pr-2">Period</th>
                <th className="py-2 pr-2 text-right">Personal</th>
                <th className="py-2 pr-2 text-right">Company</th>
                <th className="py-2 pr-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.key} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2 pr-2 text-slate-700 dark:text-slate-300">{d.longLabel}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-slate-900 dark:text-slate-100">{formatRM(d.personal)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums text-slate-900 dark:text-slate-100">{formatRM(d.company)}</td>
                  <td className="py-2 pr-2 text-right tabular-nums font-semibold text-slate-900 dark:text-slate-100">{formatRM(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Active period readout — doubles as the "tooltip": always shows a value,
              updates on hover/focus so keyboard users get the same info as mouse users. */}
          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{active.longLabel}</p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-4 gap-y-0.5">
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Personal <strong className="font-semibold text-slate-900 dark:text-slate-50">{formatRM(active.personal)}</strong>
              </span>
              <span className="text-sm text-slate-700 dark:text-slate-200">
                Company <strong className="font-semibold text-slate-900 dark:text-slate-50">{formatRM(active.company)}</strong>
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Total <strong className="font-semibold text-slate-900 dark:text-slate-50">{formatRM(active.total)}</strong>
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400 sm:hidden dark:text-slate-500">↔ Swipe the chart sideways to see all {data.length} {periodNoun}</p>

          <div
            className="mt-2 flex gap-2 sm:mt-4 sm:gap-4"
            onMouseLeave={() => setActiveIndex(data.length - 1)}
          >
            {/* Y-axis labels — fixed outside the horizontal scroll below */}
            <div className="flex shrink-0 flex-col justify-between text-right text-[10px] text-slate-400 dark:text-slate-500" style={{ height: PLOT_HEIGHT }}>
              {[...gridSteps].reverse().map((step) => (
                <span key={step}>{formatAxisRM(max * step)}</span>
              ))}
            </div>

            {/* Plot area — scrolls horizontally on narrow screens instead of overflowing the
                card or squeezing labels (like "22–28 Jun") into illegible/overlapping text.
                A minimum per-column width guarantees every label has room to render cleanly. */}
            <div className="min-w-0 flex-1 overflow-x-auto">
              <div className="relative" style={{ minWidth: Math.max(data.length * 44, 100) }}>
                <div className="absolute inset-0 flex flex-col justify-between" style={{ height: PLOT_HEIGHT }} aria-hidden="true">
                  {gridSteps.map((step) => (
                    <div key={step} className="border-t border-slate-100 dark:border-slate-800" />
                  ))}
                </div>

                <div className="relative flex items-end justify-between gap-1" style={{ height: PLOT_HEIGHT }}>
                  {data.map((d, i) => {
                    const isActive = i === activeIndex;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onMouseEnter={() => setActiveIndex(i)}
                        onFocus={() => setActiveIndex(i)}
                        aria-label={`${d.longLabel}: Personal ${formatRM(d.personal)}, Company ${formatRM(d.company)}, Total ${formatRM(d.total)}`}
                        className="group flex flex-1 flex-col items-center focus-visible:outline-none"
                      >
                        {/* Fixed-height track matching the gridlines exactly — the label lives
                            outside this box so it never perturbs the bars' baseline alignment.
                            Personal and Company render as separate side-by-side bars (not
                            stacked) so each bar's own height reads directly against the axis. */}
                        <div className="flex w-full items-end justify-center gap-[3px]" style={{ height: PLOT_HEIGHT }}>
                          {d.total === 0 ? (
                            <div className="h-[2px] w-full max-w-7 rounded-full bg-slate-200 dark:bg-slate-700" />
                          ) : (
                            <>
                              <div
                                className={`w-3 rounded-t-[4px] transition-opacity ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
                                style={{
                                  height: d.personal > 0 ? `${Math.max((d.personal / max) * 100, 1)}%` : 0,
                                  backgroundColor: 'var(--series-personal)',
                                }}
                              />
                              <div
                                className={`w-3 rounded-t-[4px] transition-opacity ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}
                                style={{
                                  height: d.company > 0 ? `${Math.max((d.company / max) * 100, 1)}%` : 0,
                                  backgroundColor: 'var(--series-company)',
                                }}
                              />
                            </>
                          )}
                        </div>
                        <span
                          className={`mt-2 whitespace-nowrap text-[10px] ${isActive ? 'font-semibold text-slate-900 dark:text-slate-50' : 'text-slate-400 dark:text-slate-500'}`}
                        >
                          {d.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
