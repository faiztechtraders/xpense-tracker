import { usePhotoUrl } from '../hooks/usePhotoUrl';
import type { ID } from '../types/models';

interface PhotoThumbnailProps {
  photoId: ID;
  size?: 'sm' | 'lg';
  onClick?: () => void;
}

export function PhotoThumbnail({ photoId, size = 'sm', onClick }: PhotoThumbnailProps) {
  const url = usePhotoUrl(photoId);
  const dims = size === 'sm' ? 'h-12 w-12' : 'h-40 w-full';

  if (!url) {
    return <div className={`${dims} animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800`} />;
  }

  return (
    <img
      src={url}
      alt="Receipt"
      onClick={onClick}
      className={`${dims} rounded-lg border border-slate-200 object-cover dark:border-slate-700 ${onClick ? 'cursor-pointer' : ''}`}
    />
  );
}
