export type ID = string;

export interface TravelEvent {
  id: ID;
  name: string;
  purpose: string;
  claimantName: string;
  startDate: string;
  endDate?: string;
  allowanceBudget: number;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

export type TransactionKind = 'event' | 'general';

interface TransactionBase {
  id: ID;
  kind: TransactionKind;
  date: string;
  month: string;
  refNo: string;
  description: string;
  amount: number;
  photoId?: ID;
  createdAt: string;
  updatedAt: string;
}

export const CLAIM_CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
] as const;

export type ClaimCategory = (typeof CLAIM_CATEGORIES)[number]['value'];

export interface EventTransaction extends TransactionBase {
  kind: 'event';
  eventId: ID;
  claimCategory: ClaimCategory;
}

export const EXPENSE_CATEGORY_SUGGESTIONS = [
  'Food',
  'Transport',
  'Utilities',
  'Household',
  'Medical',
  'Entertainment',
  'Other',
] as const;

export interface GeneralTransaction extends TransactionBase {
  kind: 'general';
  category: string;
}

export type Transaction = EventTransaction | GeneralTransaction;

export interface PhotoRecord {
  id: ID;
  blob: Blob;
  mimeType: string;
  createdAt: string;
}

export type Theme = 'light' | 'dark';

export interface AppSettings {
  defaultClaimantName: string;
  currencySymbol: string;
  lastUsedEventId?: ID;
  theme?: Theme;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultClaimantName: '',
  currencySymbol: 'RM',
};
