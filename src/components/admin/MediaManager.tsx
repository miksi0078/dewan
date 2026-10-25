'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { removeFile, uploadFile } from '@/lib/upload';
import { isValidHttpUrl, toEmbedUrl } from '@/lib/video';
import { Notice, friendlyError } from './Fields';

type Kind = 'audio' | 'image' | 'pdf' | 'video';
const ACCEPT: Record<string, string> = {
  audio: 'audio/mpeg,audio/mp4,audio/x-m4a,audio/aac,audio/ogg,audio/wav,audio/webm',
  image: 'image/jpeg,image/png,image/webp,image/gif',
  pdf: 'application/pdf',
};

/** Upload audio / image poetry / PDF books and paste video links for a poet or a poem. */
export default function MediaManager({
  poetId,
  poetryId,
  initial,
}: {
  poetId?: string;
  poetryId?: string;
  initial: any[];
}) {
  const [items, setItems] = useState<any[]>(initial);
  const [kind, setKind] = useState<Kind>('audio');
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const supabase = createClient();
    setBusy(true);
    try {
      let url = '';
      let storage_path: string | null = null;

      if (kind === 'video') {
        if (!isValidHttpUrl(link)) throw new Error('Please paste a full video link starting with https://');
        if (!toEmbedUrl(link))
          setMsg({ kind: 'ok', text: 'Note: only YouTube and Vimeo links play inside the page. Other links will show as a button.' });
        url = link.trim();
      } else {
        const file = fileInput.current?.files?.[0];
        if (!file) throw new Error('Please choose a file first.');
        const up = await uploadFile(file, kind, poetryId ? `poetry/${poetryId}` : `poets/${poetId}`);
        url = up.url;
        storage_path = up.path;
      }

      const { data, error } = await supabase
        .from('media')
        .insert({
          poet_id: poetryId ? null : poetId ?? null,
          poetry_id: poetryId ?? null,
          kind,
          title: title.trim() || null,
          url,
          storage_path,
        })
        .select('*')
        .single();
      if (error || !data) {
        if (storage_path) await removeFile(storage_path); // don't leave an orphan file behind
        throw new Error(friendlyError(error));
      }

      setItems((prev) => [...prev, data]);
      setTitle('');
      setLink('');
      if (fileInput.current) fileInput.current.value = '';
      setMsg((m) => m ?? { kind: 'ok', text: 'Added.' });
    } catch (err: any) {
      setMsg({ kind: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: any) {
    if (!window.confirm('Remove this item?')) return;
    const supabase = createClient();
    const { error } = await supabase.from('media').delete().eq('id', item.id);
    if (error) return setMsg({ kind: 'error', text: friendlyError(error) });
    await removeFile(item.storage_path);
    setItems((prev) => prev.filter((m) => m.id !== item.id));
  }

  return (
    <div className="space-y-6">
      {items.length > 0 ? (
        <ul className="divide-y divide-brand-100 rounded-xl border border-brand-100 bg-white">
          {items.map((m) => (
            <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <span className="badge me-2 uppercase">{m.kind}</span>
                <span className="text-sm font-medium">{m.title || '(no title)'}</span>
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-brand-600 hover:underline">
                  {m.url}
                </a>
              </div>
              <button type="button" onClick={() => remove(m)} className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink/60">Nothing added yet.</p>
      )}

      <form onSubmit={add} className="card space-y-4 p-4">
        <h4 className="font-semibold">Add media</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className="input">
              <option value="audio">Audio recitation (MP3, M4A…)</option>
              <option value="image">Image poetry (JPG, PNG)</option>
              <option value="pdf">PDF book</option>
              <option value="video">Video link (YouTube / Vimeo)</option>
            </select>
          </div>
          <div>
            <label className="label">Title (optional)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} className="input" />
          </div>
        </div>

        {kind === 'video' ? (
          <div>
            <label className="label">Video link</label>
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className="input"
              dir="ltr"
            />
          </div>
        ) : (
          <div>
            <label className="label">File (max 50 MB)</label>
            <input key={kind} ref={fileInput} type="file" accept={ACCEPT[kind]} className="block text-sm" />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? 'Working…' : 'Add'}
          </button>
          {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        </div>
      </form>
    </div>
  );
}
