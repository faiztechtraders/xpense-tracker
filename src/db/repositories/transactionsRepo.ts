import { getDB } from '../client';
import { newId } from '../../lib/id';
import { deletePhoto } from './photosRepo';
import type { EventTransaction, GeneralTransaction, ID, Transaction } from '../../types/models';

export type NewEventTransactionInput = Pick<
  EventTransaction,
  'eventId' | 'claimCategory' | 'date' | 'month' | 'refNo' | 'description' | 'amount' | 'photoId'
>;

export type NewGeneralTransactionInput = Pick<
  GeneralTransaction,
  'category' | 'month' | 'date' | 'refNo' | 'description' | 'amount' | 'photoId'
>;

export async function listByEvent(eventId: ID): Promise<EventTransaction[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('transactions', 'by-eventId', eventId);
  return all as EventTransaction[];
}

export async function listAllEventTransactions(): Promise<EventTransaction[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex('transactions', 'by-kind', 'event');
  return all as EventTransaction[];
}

export async function listByMonth(month: string): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAllFromIndex('transactions', 'by-month', month);
}

export async function listAll(): Promise<Transaction[]> {
  const db = await getDB();
  return db.getAll('transactions');
}

export async function getTransaction(id: ID): Promise<Transaction | undefined> {
  const db = await getDB();
  return db.get('transactions', id);
}

export async function createEventTransaction(
  input: NewEventTransactionInput
): Promise<EventTransaction> {
  const db = await getDB();
  const now = new Date().toISOString();
  const transaction: EventTransaction = {
    id: newId(),
    kind: 'event',
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('transactions', transaction);
  return transaction;
}

export async function createGeneralTransaction(
  input: NewGeneralTransactionInput
): Promise<GeneralTransaction> {
  const db = await getDB();
  const now = new Date().toISOString();
  const transaction: GeneralTransaction = {
    id: newId(),
    kind: 'general',
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('transactions', transaction);
  return transaction;
}

export async function updateTransaction(
  id: ID,
  patch: Partial<NewEventTransactionInput & NewGeneralTransactionInput>
): Promise<Transaction> {
  const db = await getDB();
  const existing = await db.get('transactions', id);
  if (!existing) throw new Error(`Transaction ${id} not found`);
  const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() } as Transaction;
  await db.put('transactions', updated);
  return updated;
}

export async function deleteTransaction(id: ID): Promise<void> {
  const db = await getDB();
  const existing = await db.get('transactions', id);
  if (!existing) return;
  await db.delete('transactions', id);
  if (existing.photoId) await deletePhoto(existing.photoId);
}
