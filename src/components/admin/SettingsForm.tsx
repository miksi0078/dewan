'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { AreaField, Notice, TextField, friendlyError } from './Fields';
import ImageUpload from './ImageUpload';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const nameOf = (p: any) => p.name_en || p.name_pr || p.name_ps;
const preview = (c: any) => (c.text_ps || c.text_pr || c.text_en || '').split('\n').filter(Boolean)[0] || '';

export default function SettingsForm({
  initial,
  poets,
  couplets,
}: {
  initial: Record<string, string>;
  poets: any[];
  couplets: any[];
}) {
  const router = useRouter();
  const [s, setS] = useState<Record<string, string>>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const set = (k: string) => (val: string) => setS((prev) => ({ ...prev, [k]: val }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const email = (s.feedback_email || '').trim();
    if (email && !EMAIL_RE.test(email)) return setMsg({ kind: 'error', text: 'That email address does not look right.' });

    const publicKeys = [
      'dev_name_ps', 'dev_name_pr', 'dev_name_en',
      'dev_bio_ps', 'dev_bio_pr', 'dev_bio_en',
      'dev_photo_url', 'couplet_override_id', 'featured_poet_id',
    ];
    const rows = [
      ...publicKeys.map((key) => ({ key, value: (s[key] || '').trim(), is_public: true })),
      { key: 'feedback_email', value: email, is_public: false }, // private: never shown to visitors
    ];

    setBusy(true);
    const { error } = await createClient().from('settings').upsert(rows);
    setBusy(false);
    if (error) return setMsg({ kind: 'error', text: friendlyError(error) });
    setMsg({ kind: 'ok', text: 'Settings saved.' });
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-lg font-bold">Feedback email</h2>
        <TextField
          label="Send visitor feedback to this email address"
          type="email"
          value={s.feedback_email || ''}
          onChange={set('feedback_email')}
          placeholder="you@example.com"
          hint="Visitors never see this address. Feedback is also always saved under “Feedback” in this admin panel."
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">Home page</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="label">Featured poet</label>
            <select value={s.featured_poet_id || ''} onChange={(e) => set('featured_poet_id')(e.target.value)} className="input">
              <option value="">Automatic (a different poet each day)</option>
              {poets.map((p) => (
                <option key={p.id} value={p.id}>
                  {nameOf(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Couplet of the Day</label>
            <select value={s.couplet_override_id || ''} onChange={(e) => set('couplet_override_id')(e.target.value)} className="input">
              <option value="">Automatic (a different couplet each day)</option>
              {couplets.map((c) => (
                <option key={c.id} value={c.id}>
                  {preview(c).slice(0, 60)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold">“About the Developer” page</h2>
        <ImageUpload label="Your photo" value={s.dev_photo_url || ''} onChange={set('dev_photo_url')} folder="developer" />
        <div className="grid gap-4 md:grid-cols-3">
          <TextField label="Name (پښتو)" value={s.dev_name_ps || ''} onChange={set('dev_name_ps')} rtl />
          <TextField label="Name (Roman Pashto)" value={s.dev_name_pr || ''} onChange={set('dev_name_pr')} />
          <TextField label="Name (English)" value={s.dev_name_en || ''} onChange={set('dev_name_en')} />
        </div>
        <AreaField label="Bio (پښتو)" value={s.dev_bio_ps || ''} onChange={set('dev_bio_ps')} rtl rows={6} />
        <AreaField label="Bio (Roman Pashto)" value={s.dev_bio_pr || ''} onChange={set('dev_bio_pr')} rows={5} />
        <AreaField label="Bio (English)" value={s.dev_bio_en || ''} onChange={set('dev_bio_en')} rows={5} />
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="btn btn-primary">
          {busy ? 'Saving…' : 'Save settings'}
        </button>
        {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      </div>
    </form>
  );
}
