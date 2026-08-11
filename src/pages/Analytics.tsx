import { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { PeriodFilter } from '../components/charts/PeriodFilter';
import { StatTile } from '../components/charts/StatTile';
import { TrendBarChart } from '../components/charts/TrendBarChart';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { useAnalytics } from '../hooks/useAnalytics';
import { currentPeriodKey, type Granularity } from '../lib/analytics';
import type { Route } from '../hooks/useHashRoute';

interface AnalyticsProps {
  route: Route;
  navigate: (route: Route) => void;
}

const PERIOD_NOUN_PLURAL: Record<Granularity, string> = {
  week: 'weeks',
  month: 'months',
  year: 'years',
};

const PREVIOUS_LABEL: Record<Granularity, string> = {
  week: 'last week',
  month: 'last month',
  year: 'last year',
};

export function Analytics({ route, navigate }: AnalyticsProps) {
  const [granularity, setGranularity] = useState<Granularity>('month');
  const [anchorKey, setAnchorKey] = useState(() => currentPeriodKey('month'));
  const { loading, trend, totals, previousTotals, categories } = useAnalytics(granularity, anchorKey);

  const handleGranularityChange = (g: Granularity) => {
    setGranularity(g);
    setAnchorKey(currentPeriodKey(g));
  };

  return (
    <AppShell title="Analytics" route={route} navigate={navigate}>
      <PeriodFilter
        granularity={granularity}
        anchorKey={anchorKey}
        onGranularityChange={handleGranularityChange}
        onAnchorChange={setAnchorKey}
      />

      {loading ? (
        <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">Loading…</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile
              label="Total spending"
              value={totals.total}
              previousValue={previousTotals.total}
              previousLabel={PREVIOUS_LABEL[granularity]}
            />
            <StatTile
              label="Personal"
              value={totals.personal}
              previousValue={previousTotals.personal}
              previousLabel={PREVIOUS_LABEL[granularity]}
              accent="personal"
            />
            <StatTile
              label="Company allowance"
              value={totals.company}
              previousValue={previousTotals.company}
              previousLabel={PREVIOUS_LABEL[granularity]}
              accent="company"
            />
          </div>

          {/* Stacked on mobile/tablet; side by side on large screens where there's
              room for both without cramping either chart. */}
          <div className="mt-4 lg:grid lg:grid-cols-5 lg:items-start lg:gap-4">
            <div className="lg:col-span-3">
              <TrendBarChart data={trend} periodNoun={PERIOD_NOUN_PLURAL[granularity]} />
            </div>
            <div className="mt-4 lg:col-span-2 lg:mt-0">
              <CategoryBarChart data={categories} />
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
