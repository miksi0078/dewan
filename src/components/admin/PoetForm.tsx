'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AreaField, Notice, TextField, friendlyError } from './Fields';
import ImageUpload from './ImageUpload';

const empty = {
  name_ps: '', name_pr: '', name_en: '', born: '', died: '',
  bio_ps: '', bio_pr: '', bio_en: '', photo_url: '',
};

export default function PoetForm({ poet }: { poet?: any }) {
  const router = useRouter();
  const [v, setV] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = { ...empty };
    if (poet) Object.keys(empty).forEach((k) => (init[k] = poet[k] ?? ''));
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const set = (k: string) => (val: string) => setV((prev) => ({ ...prev, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const payload: Record<string, string | null> = {};
    Object.entries(v).forEach(([k, val]) => (payload[k] = val.trim() === '' ? null : val.trim()));

    if (!payload.name_ps && !payload.name_pr && !payload.name_en) {
      setMsg({ kind: 'error', text: 'Please enter the poet’s name in at least one language.' });
      return;
    }

    setBusy(true);
    const supabase = createClient();
    if (poet) {
      const { error } = await supabase.from('poets').update(payload).eq('id', poet.id);
      setBusy(false);
      if (error) return setMsg({ kind: 'error', text: friendlyError(error) });
      setMsg({ kind: 'ok', text: 'Saved.' });
      router.refresh();
    } else {
      const { data, error } = await supabase.from('poets').insert(payload).select('id').single();
      setBusy(false);
      if (error || !data) return setMsg({ kind: 'error', text: friendlyError(error) });
      router.push(`/admin/poets/${data.id}`);
      router.refresh();
    }
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <ImageUpload label="Profile picture" value={v.photo_url} onChange={set('photo_url')} folder="poets" />

      <div className="grid gap-4 md:grid-cols-3">
        <TextField label="Name (پښتو)" value={v.name_ps} onChange={set('name_ps')} rtl />
        <TextField label="Name (Roman Pashto)" value={v.name_pr} onChange={set('name_pr')} />
        <TextField label="Name (English)" value={v.name_en} onChange={set('name_en')} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Born" value={v.born} onChange={set('born')} placeholder="e.g. 1613 or c. 1650" maxLength={40} />
        <TextField label="Died" value={v.died} onChange={set('died')} placeholder="e.g. 1689" maxLength={40} />
      </div>

      <AreaField label="Biography (پښتو)" value={v.bio_ps} onChange={set('bio_ps')} rtl rows={6} />
      <AreaField label="Biography (Roman Pashto)" value={v.bio_pr} onChange={set('bio_pr')} rows={5} />
      <AreaField label="Biography (English)" value={v.bio_en} onChange={set('bio_en')} rows={5} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? 'Saving…' : poet ? 'Save changes' : 'Create poet'}
        </button>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      </div>
    </form>
  );
}
