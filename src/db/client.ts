import { openDB, type IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, type ClaimTrackDB } from './schema';

let dbPromise: Promise<IDBPDatabase<ClaimTrackDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<ClaimTrackDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ClaimTrackDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const events = db.createObjectStore('events', { keyPath: 'id' });
        events.createIndex('by-startDate', 'startDate');

        const transactions = db.createObjectStore('transactions', { keyPath: 'id' });
        transactions.createIndex('by-eventId', 'eventId');
        transactions.createIndex('by-month', 'month');
        transactions.createIndex('by-kind', 'kind');

        db.createObjectStore('photos', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}
