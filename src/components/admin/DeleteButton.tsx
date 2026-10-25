'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { STORAGE_BUCKET } from '@/lib/constants';
import { friendlyError } from './Fields';

/**
 * Deletes one row after asking "Are you sure?".
 * If ownerColumn is given (poet_id / poetry_id), the uploaded files that belong
 * to the row are removed from storage too, so nothing is left behind.
 */
export default function DeleteButton({
  table,
  id,
  confirmText,
  redirectTo,
  ownerColumn,
  label = 'Delete',
}: {
  table: string;
  id: string;
  confirmText: string;
  redirectTo?: string;
  ownerColumn?: 'poet_id' | 'poetry_id';
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onClick() {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError('');
    const supabase = createClient();

    let paths: string[] = [];
    if (ownerColumn) {
      const { data } = await supabase.from('media').select('storage_path').eq(ownerColumn, id);
      paths = (data ?? []).map((m: any) => m.storage_path).filter(Boolean);
    }

    const { error: delError } = await supabase.from(table).delete().eq('id', id);
    if (delError) {
      setError(friendlyError(delError));
      setBusy(false);
      return;
    }
    if (paths.length) await supabase.storage.from(STORAGE_BUCKET).remove(paths);

    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={onClick} disabled={busy} className="btn btn-danger">
        {busy ? 'Deleting…' : label}
      </button>
      {error && <span className="text-sm text-red-600">{error}</span>}
    </span>
  );
}
