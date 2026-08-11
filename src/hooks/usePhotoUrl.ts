import { useEffect, useState } from 'react';
import { getPhotoBlob } from '../db/repositories/photosRepo';
import type { ID } from '../types/models';

export function usePhotoUrl(photoId: ID | undefined) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let cancelled = false;

    if (!photoId) {
      setUrl(undefined);
      return;
    }

    getPhotoBlob(photoId).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);

  return url;
}
