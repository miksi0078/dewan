'use client';

import { useRef, useState } from 'react';
import { uploadFile } from '@/lib/upload';

/** Uploads a picture to Supabase Storage and reports the public address back. */
export default function ImageUpload({
  value,
  onChange,
  folder,
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  label: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { url } = await uploadFile(file, 'image', folder);
      onChange(url);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-4">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-24 w-24 rounded-full border border-brand-200 object-cover" />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-brand-300 text-xs text-ink/50">
            No photo
          </div>
        )}
        <div className="space-y-2">
          <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={onPick} disabled={busy} className="block text-sm" />
          {value && (
            <button type="button" onClick={() => onChange('')} className="text-sm text-red-600 hover:underline">
              Remove photo
            </button>
          )}
          {busy && <p className="text-sm text-ink/60">Uploading…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-ink/50">JPG, PNG or WebP, up to 50 MB (smaller is faster).</p>
        </div>
      </div>
    </div>
  );
}
