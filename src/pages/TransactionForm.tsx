import { useEffect, useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CurrencyInput } from '../components/CurrencyInput';
import { PhotoInput } from '../components/PhotoInput';
import { useToast } from '../hooks/useToast';
import { usePhotoUrl } from '../hooks/usePhotoUrl';
import * as transactionsRepo from '../db/repositories/transactionsRepo';
import * as photosRepo from '../db/repositories/photosRepo';
import { todayISO, monthOf } from '../lib/date';
import { CLAIM_CATEGORIES, EXPENSE_CATEGORY_SUGGESTIONS } from '../types/models';
import type { Route } from '../hooks/useHashRoute';
import type { ClaimCategory, ID, Transaction } from '../types/models';

interface TransactionFormProps {
  route: Route;
  kind: 'event' | 'general';
  eventId?: ID;
  transactionId?: ID;
  navigate: (route: Route) => void;
  back: () => void;
  onSaved: () => void;
}

const fieldClasses =
  'w-full min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-base text-slate-900 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-teal-500';
const dateFieldClasses = `${fieldClasses} dark:[color-scheme:dark]`;
const labelClasses = 'mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300';

export function TransactionForm({ route, kind, eventId, transactionId, navigate, back, onSaved }: TransactionFormProps) {
  const toast = useToast();
  const [existing, setExisting] = useState<Transaction | undefined>();
  const [date, setDate] = useState(todayISO());
  const [refNo, setRefNo] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORY_SUGGESTIONS[0]);
  const [claimCategory, setClaimCategory] = useState<ClaimCategory>('food');
  const [photoId, setPhotoId] = useState<ID | undefined>();
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | undefined>();
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const existingPhotoUrl = usePhotoUrl(existing?.photoId);

  useEffect(() => {
    if (!transactionId) return;
    transactionsRepo.getTransaction(transactionId).then((t) => {
      if (!t) return;
      setExisting(t);
      setDate(t.date);
      setRefNo(t.refNo);
      setDescription(t.description);
      setAmount(String(t.amount));
      setPhotoId(t.photoId);
      if (t.kind === 'general') setCategory(t.category);
      if (t.kind === 'event') setClaimCategory(t.claimCategory);
    });
  }, [transactionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!description.trim() || !amt || amt <= 0) return;
    setSaving(true);

    let finalPhotoId = photoId;
    if (pendingPhotoFile) {
      finalPhotoId = await photosRepo.savePhoto(pendingPhotoFile, pendingPhotoFile.type);
    }

    if (kind === 'event' && eventId) {
      if (existing && existing.kind === 'event') {
        await transactionsRepo.updateTransaction(existing.id, {
          date,
          month: monthOf(date),
          refNo: refNo.trim(),
          description: description.trim(),
          amount: amt,
          claimCategory,
          photoId: finalPhotoId,
        });
      } else {
        await transactionsRepo.createEventTransaction({
          eventId,
          claimCategory,
          date,
          month: monthOf(date),
          refNo: refNo.trim(),
          description: description.trim(),
          amount: amt,
          photoId: finalPhotoId,
        });
      }
      toast.show('Transaction saved');
      onSaved();
      navigate({ name: 'event-detail', eventId });
    } else {
      if (existing && existing.kind === 'general') {
        await transactionsRepo.updateTransaction(existing.id, {
          date,
          month: monthOf(date),
          refNo: refNo.trim(),
          description: description.trim(),
          amount: amt,
          category,
          photoId: finalPhotoId,
        });
      } else {
        await transactionsRepo.createGeneralTransaction({
          category,
          month: monthOf(date),
          date,
          refNo: refNo.trim(),
          description: description.trim(),
          amount: amt,
          photoId: finalPhotoId,
        });
      }
      toast.show('Expense saved');
      onSaved();
      navigate({ name: 'general-expenses' });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!existing) return;
    await transactionsRepo.deleteTransaction(existing.id);
    toast.show(kind === 'event' ? 'Transaction deleted' : 'Expense deleted');
    onSaved();
    if (kind === 'event' && eventId) {
      navigate({ name: 'event-detail', eventId });
    } else {
      navigate({ name: 'general-expenses' });
    }
  };

  return (
    <AppShell
      title={existing ? 'Edit Transaction' : 'Add Transaction'}
      route={route}
      navigate={navigate}
      onBack={back}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 lg:max-w-xl">
        {kind === 'event' && (
          <div>
            <label htmlFor="claimCategory" className={labelClasses}>
              Claim Category
            </label>
            <select
              id="claimCategory"
              value={claimCategory}
              onChange={(e) => setClaimCategory(e.target.value as ClaimCategory)}
              className={fieldClasses}
            >
              {CLAIM_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="date" className={labelClasses}>
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={dateFieldClasses}
          />
        </div>

        <div>
          <label htmlFor="refNo" className={labelClasses}>
            Ref. / Receipt No.
          </label>
          <input
            id="refNo"
            value={refNo}
            onChange={(e) => setRefNo(e.target.value)}
            placeholder="e.g. RCP-0012"
            className={fieldClasses}
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>
            Description
          </label>
          <input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={kind === 'event' ? 'Food@R&R Gurun' : 'Taxi to venue'}
            autoFocus
            required
            className={fieldClasses}
          />
        </div>

        {kind === 'general' && (
          <div>
            <label htmlFor="category" className={labelClasses}>
              Category
            </label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClasses}>
              {EXPENSE_CATEGORY_SUGGESTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="amount" className={labelClasses}>
            Amount
          </label>
          <CurrencyInput id="amount" value={amount} onChange={setAmount} required />
        </div>

        <div>
          <p className={labelClasses}>Receipt Photo</p>
          <PhotoInput
            previewUrl={existingPhotoUrl}
            onSelect={setPendingPhotoFile}
            onRemove={() => {
              setPendingPhotoFile(undefined);
              setPhotoId(undefined);
            }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-2 min-h-12 rounded-xl bg-teal-700 text-base font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
        >
          {saving ? 'Saving…' : 'Save Transaction'}
        </button>

        {existing && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="min-h-11 rounded-xl border border-red-200 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            Delete Transaction
          </button>
        )}
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this transaction?"
        description="This will also remove its attached receipt photo, if any."
        onCancel={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
      />
    </AppShell>
  );
}
