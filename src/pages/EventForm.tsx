import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { CurrencyInput } from '../components/CurrencyInput';
import { DateField } from '../components/DateField';
import { useEvents } from '../hooks/useEvents';
import { getSettings, saveSettings } from '../db/repositories/settingsRepo';
import { todayISO } from '../lib/date';
import { useToast } from '../hooks/useToast';
import type { Route } from '../hooks/useHashRoute';

interface EventFormProps {
  route: Route;
  eventId?: string;
  navigate: (route: Route) => void;
  back: () => void;
}

const baseInputClasses =
  'w-full min-h-11 rounded-xl border border-slate-300 bg-white text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-500';
const inputClasses = `${baseInputClasses} px-4`;
const labelClasses = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300';

export function EventForm({ eventId, route, navigate, back }: EventFormProps) {
  const { events, createEvent, updateEvent } = useEvents();
  const toast = useToast();
  const existing = eventId ? events.find((e) => e.id === eventId) : undefined;

  const [name, setName] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState('');
  const [allowance, setAllowance] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setClaimantName(existing.claimantName);
      setStartDate(existing.startDate);
      setEndDate(existing.endDate ?? '');
      setAllowance(String(existing.allowanceBudget));
    } else {
      setClaimantName(getSettings().defaultClaimantName);
    }
  }, [existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const input = {
      name: name.trim(),
      claimantName: claimantName.trim(),
      startDate,
      endDate: endDate || undefined,
      allowanceBudget: Number(allowance) || 0,
    };
    if (!input.name || !startDate) return;

    saveSettings({ defaultClaimantName: input.claimantName });

    if (existing) {
      await updateEvent(existing.id, input);
      toast.show('Event updated');
      navigate({ name: 'event-detail', eventId: existing.id });
    } else {
      const created = await createEvent(input);
      toast.show('Event created');
      navigate({ name: 'event-detail', eventId: created.id });
    }
  };

  return (
    <AppShell title={existing ? 'Edit Event' : 'New Event'} route={route} navigate={navigate} onBack={back}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:max-w-xl">
        <div>
          <label htmlFor="name" className={labelClasses}>
            Event / Project Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seminar Xpress Saham"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="claimant" className={labelClasses}>
            Your Name
          </label>
          <input
            id="claimant"
            value={claimantName}
            onChange={(e) => setClaimantName(e.target.value)}
            placeholder="Your full name"
            className={inputClasses}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className={labelClasses}>
              Tarikh Mula
            </label>
            <DateField
              id="startDate"
              value={startDate}
              onChange={(v) => {
                setStartDate(v);
                // An end date before the new start date is no longer valid — drop it.
                if (endDate && endDate < v) setEndDate('');
              }}
            />
          </div>
          <div>
            <label htmlFor="endDate" className={labelClasses}>
              Tarikh Akhir (optional)
            </label>
            <DateField
              id="endDate"
              value={endDate}
              onChange={setEndDate}
              optional
              min={startDate}
              placeholder="No end date"
            />
          </div>
        </div>

        <div>
          <label htmlFor="allowance" className={labelClasses}>
            Starting Allowance Budget
          </label>
          <CurrencyInput id="allowance" value={allowance} onChange={setAllowance} placeholder="100.00" required />
        </div>

        <button
          type="submit"
          className="mt-2 min-h-12 rounded-xl bg-teal-700 text-base font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          {existing ? 'Save Changes' : 'Create Event'}
        </button>
      </form>
    </AppShell>
  );
}
