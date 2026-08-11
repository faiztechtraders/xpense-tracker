import type { DBSchema } from 'idb';
import type { ID, PhotoRecord, Transaction, TravelEvent } from '../types/models';

export interface ClaimTrackDB extends DBSchema {
  events: {
    key: ID;
    value: TravelEvent;
    indexes: { 'by-startDate': string };
  };
  transactions: {
    key: ID;
    value: Transaction;
    indexes: {
      'by-eventId': ID;
      'by-month': string;
      'by-kind': string;
    };
  };
  photos: {
    key: ID;
    value: PhotoRecord;
  };
}

export const DB_NAME = 'claimtrack';
export const DB_VERSION = 1;
