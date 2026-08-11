import { useRef, useState } from 'react';

interface PhotoInputProps {
  previewUrl?: string;
  onSelect: (file: File) => void;
  onRemove: () => void;
}

export function PhotoInput({ previewUrl, onSelect, onRemove }: PhotoInputProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | undefined>(undefined);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    onSelect(file);
  };

  const preview = localPreview ?? previewUrl;

  if (preview) {
    return (
      <div className="relative w-40">
        <img src={preview} alt="Receipt preview" className="h-40 w-40 rounded-xl border border-slate-200 object-cover dark:border-slate-700" />
        <button
          type="button"
          onClick={() => {
            setLocalPreview(undefined);
            onRemove();
          }}
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:bg-slate-700 dark:ring-1 dark:ring-slate-600"
          aria-label="Remove photo"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        📷 Take Photo
      </button>
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        🖼️ Choose File
      </button>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
