import { getDB } from '../client';
import { newId } from '../../lib/id';
import type { ID } from '../../types/models';

export async function savePhoto(blob: Blob, mimeType: string): Promise<ID> {
  const db = await getDB();
  const id = newId();
  await db.put('photos', { id, blob, mimeType, createdAt: new Date().toISOString() });
  return id;
}

export async function getPhotoBlob(id: ID): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get('photos', id);
  return record?.blob;
}

export async function deletePhoto(id: ID): Promise<void> {
  const db = await getDB();
  await db.delete('photos', id);
}
