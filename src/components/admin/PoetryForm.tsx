'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CATEGORIES } from '@/lib/constants';
import { t } from '@/lib/i18n';
import { AreaField, Notice, TextField, friendlyError } from './Fields';

const fields = ['title_ps', 'title_pr', 'title_en', 'text_ps', 'text_pr', 'text_en'] as const;

export default function PoetryForm({ poem, poets }: { poem?: any; poets: any[] }) {
  const router = useRouter();
  const [poetId, setPoetId] = useState<string>(poem?.poet_id ?? '');
  const [category, setCategory] = useState<string>(poem?.category ?? 'ghazal');
  const [v, setV] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    fields.forEach((k) => (init[k] = poem?.[k] ?? ''));
    return init;
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const set = (k: string) => (val: string) => setV((prev) => ({ ...prev, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!poetId) return setMsg({ kind: 'error', text: 'Please choose a poet.' });

    const payload: Record<string, string | null> = { poet_id: poetId, category };
    fields.forEach((k) => (payload[k] = v[k].trim() === '' ? null : v[k].replace(/\r\n/g, '\n').trim()));

    if (!payload.title_ps && !payload.title_pr && !payload.title_en)
      return setMsg({ kind: 'error', text: 'Please enter a title in at least one language.' });
    if (!payload.text_ps && !payload.text_pr && !payload.text_en)
      return setMsg({ kind: 'error', text: 'Please enter the poem text in at least one language.' });

    setBusy(true);
    const supabase = createClient();
    if (poem) {
      const { error } = await supabase.from('poetry').update(payload).eq('id', poem.id);
      setBusy(false);
      if (error) return setMsg({ kind: 'error', text: friendlyError(error) });
      setMsg({ kind: 'ok', text: 'Saved.' });
      router.refresh();
    } else {
      const { data, error } = await supabase.from('poetry').insert(payload).select('id').single();
      setBusy(false);
      if (error || !data) return setMsg({ kind: 'error', text: friendlyError(error) });
      router.push(`/admin/poetry/${data.id}`);
      router.refresh();
    }
  }

  const poetName = (p: any) => p.name_en || p.name_pr || p.name_ps;
  const textHint = 'Write each line on its own line. Leave one empty line between couplets/stanzas.';

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">
            Poet <span className="text-red-600">*</span>
          </label>
          <select value={poetId} onChange={(e) => setPoetId(e.target.value)} className="input" required>
            <option value="">— choose a poet —</option>
            {poets.map((p) => (
              <option key={p.id} value={p.id}>
                {poetName(p)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Type</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t('en', `cat.${c}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <TextField label="Title (پښتو)" value={v.title_ps} onChange={set('title_ps')} rtl />
        <TextField label="Title (Roman Pashto)" value={v.title_pr} onChange={set('title_pr')} />
        <TextField label="Title (English)" value={v.title_en} onChange={set('title_en')} />
      </div>

      <AreaField label="Poem text (پښتو)" value={v.text_ps} onChange={set('text_ps')} rtl rows={12} hint={textHint} />
      <AreaField label="Poem text (Roman Pashto)" value={v.text_pr} onChange={set('text_pr')} rows={10} hint={textHint} />
      <AreaField label="Poem text / translation (English)" value={v.text_en} onChange={set('text_en')} rows={10} hint={textHint} />

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? 'Saving…' : poem ? 'Save changes' : 'Create poem'}
        </button>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      </div>
    </form>
  );
}
