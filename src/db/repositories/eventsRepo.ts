import { getDB } from '../client';
import { newId } from '../../lib/id';
import type { TravelEvent, ID } from '../../types/models';

export type NewEventInput = Pick<
  TravelEvent,
  'name' | 'purpose' | 'claimantName' | 'startDate' | 'endDate' | 'allowanceBudget'
>;

export async function listEvents(): Promise<TravelEvent[]> {
  const db = await getDB();
  const all = await db.getAll('events');
  return all.sort((a, b) => b.startDate.localeCompare(a.startDate));
}

export async function getEvent(id: ID): Promise<TravelEvent | undefined> {
  const db = await getDB();
  return db.get('events', id);
}

export async function createEvent(input: NewEventInput): Promise<TravelEvent> {
  const db = await getDB();
  const now = new Date().toISOString();
  const event: TravelEvent = {
    id: newId(),
    ...input,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };
  await db.put('events', event);
  return event;
}

export async function updateEvent(id: ID, patch: Partial<NewEventInput>): Promise<TravelEvent> {
  const db = await getDB();
  const existing = await db.get('events', id);
  if (!existing) throw new Error(`Event ${id} not found`);
  const updated: TravelEvent = { ...existing, ...patch, updatedAt: new Date().toISOString() };
  await db.put('events', updated);
  return updated;
}

export async function archiveEvent(id: ID, archived = true): Promise<void> {
  const db = await getDB();
  const existing = await db.get('events', id);
  if (!existing) return;
  await db.put('events', { ...existing, archived, updatedAt: new Date().toISOString() });
}

export async function deleteEvent(id: ID): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['events', 'transactions', 'photos'], 'readwrite');
  const txStore = tx.objectStore('transactions');
  const photoStore = tx.objectStore('photos');
  const related = await txStore.index('by-eventId').getAll(id);
  for (const t of related) {
    if (t.photoId) await photoStore.delete(t.photoId);
    await txStore.delete(t.id);
  }
  await tx.objectStore('events').delete(id);
  await tx.done;
}
