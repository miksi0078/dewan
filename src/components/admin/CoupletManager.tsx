'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AreaField, Notice, friendlyError } from './Fields';

const nameOf = (p: any) => (p ? p.name_en || p.name_pr || p.name_ps : '');
const titleOf = (p: any) => p.title_en || p.title_pr || p.title_ps;
const previewOf = (c: any) => (c.text_ps || c.text_pr || c.text_en || '').split('\n').filter(Boolean).slice(0, 2).join(' / ');

export default function CoupletManager({
  couplets,
  poets,
  poems,
  overrideId,
}: {
  couplets: any[];
  poets: any[];
  poems: any[];
  overrideId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<any | null>(null);
  const [poetId, setPoetId] = useState('');
  const [poetryId, setPoetryId] = useState('');
  const [v, setV] = useState({ text_ps: '', text_pr: '', text_en: '' });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  const poetById = useMemo(() => Object.fromEntries(poets.map((p) => [p.id, p])), [poets]);
  const poemsForPoet = useMemo(() => poems.filter((p) => !poetId || p.poet_id === poetId), [poems, poetId]);

  function startEdit(c: any) {
    setEditing(c);
    setPoetId(c.poet_id ?? '');
    setPoetryId(c.poetry_id ?? '');
    setV({ text_ps: c.text_ps ?? '', text_pr: c.text_pr ?? '', text_en: c.text_en ?? '' });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function reset() {
    setEditing(null);
    setPoetId('');
    setPoetryId('');
    setV({ text_ps: '', text_pr: '', text_en: '' });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const payload = {
      poet_id: poetId || null,
      poetry_id: poetryId || null,
      text_ps: v.text_ps.trim() || null,
      text_pr: v.text_pr.trim() || null,
      text_en: v.text_en.trim() || null,
    };
    if (!payload.text_ps && !payload.text_pr && !payload.text_en)
      return setMsg({ kind: 'error', text: 'Please write the couplet in at least one language.' });

    setBusy(true);
    const supabase = createClient();
    const { error } = editing
      ? await supabase.from('couplets').update(payload).eq('id', editing.id)
      : await supabase.from('couplets').insert(payload);
    setBusy(false);
    if (error) return setMsg({ kind: 'error', text: friendlyError(error) });
    setMsg({ kind: 'ok', text: editing ? 'Couplet updated.' : 'Couplet added.' });
    reset();
    router.refresh();
  }

  async function setOverride(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('settings').upsert({ key: 'couplet_override_id', value: id, is_public: true });
    if (error) return setMsg({ kind: 'error', text: friendlyError(error) });
    setMsg({ kind: 'ok', text: id ? 'This couplet is now shown on the home page.' : 'Back to a different couplet every day.' });
    router.refresh();
  }

  async function remove(c: any) {
    if (!window.confirm('Delete this couplet?')) return;
    const supabase = createClient();
    if (c.id === overrideId) await supabase.from('settings').upsert({ key: 'couplet_override_id', value: '', is_public: true });
    const { error } = await supabase.from('couplets').delete().eq('id', c.id);
    if (error) return setMsg({ kind: 'error', text: friendlyError(error) });
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <form onSubmit={save} className="card space-y-4 p-5">
        <h2 className="text-lg font-bold">{editing ? 'Edit couplet' : 'Add a couplet'}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Poet (optional)</label>
            <select
              value={poetId}
              onChange={(e) => {
                setPoetId(e.target.value);
                setPoetryId('');
              }}
              className="input"
            >
              <option value="">— none —</option>
              {poets.map((p) => (
                <option key={p.id} value={p.id}>
                  {nameOf(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">From poem (optional, adds a “Read” button)</label>
            <select value={poetryId} onChange={(e) => setPoetryId(e.target.value)} className="input">
              <option value="">— none —</option>
              {poemsForPoet.map((p) => (
                <option key={p.id} value={p.id}>
                  {titleOf(p)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <AreaField label="Couplet (پښتو)" value={v.text_ps} onChange={(x) => setV({ ...v, text_ps: x })} rtl rows={3} hint="Two lines: one for each half of the couplet." />
        <AreaField label="Couplet (Roman Pashto)" value={v.text_pr} onChange={(x) => setV({ ...v, text_pr: x })} rows={3} />
        <AreaField label="Couplet (English translation)" value={v.text_en} onChange={(x) => setV({ ...v, text_en: x })} rows={3} />
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? 'Saving…' : editing ? 'Save changes' : 'Add couplet'}
          </button>
          {editing && (
            <button type="button" onClick={reset} className="btn btn-outline">
              Cancel
            </button>
          )}
          {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        </div>
      </form>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold">All couplets ({couplets.length})</h2>
          {overrideId && (
            <button type="button" onClick={() => setOverride('')} className="btn btn-outline">
              Stop manual feature (pick a new one daily)
            </button>
          )}
        </div>
        <p className="mb-4 text-sm text-ink/70">
          Without a manual choice, the home page shows a different couplet every day. Click “Feature on home page” to
          choose one yourself.
        </p>
        {couplets.length === 0 ? (
          <p className="text-ink/60">No couplets yet. Add your first one above.</p>
        ) : (
          <ul className="space-y-3">
            {couplets.map((c) => (
              <li key={c.id} className={`card flex flex-wrap items-center justify-between gap-3 p-4 ${c.id === overrideId ? 'border-gold-500 ring-1 ring-gold-400' : ''}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-naskh text-lg" dir="auto">{previewOf(c)}</p>
                  <p className="text-sm text-ink/60">
                    {nameOf(poetById[c.poet_id]) || 'No poet'}
                    {c.id === overrideId && <span className="badge ms-2">Featured now</span>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.id !== overrideId && (
                    <button type="button" onClick={() => setOverride(c.id)} className="btn btn-gold">
                      Feature on home page
                    </button>
                  )}
                  <button type="button" onClick={() => startEdit(c)} className="btn btn-outline">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(c)} className="btn btn-danger">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
