'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Notice, friendlyError } from './Fields';

export default function FeedbackList({ initial }: { initial: any[] }) {
  const [items, setItems] = useState(initial);
  const [error, setError] = useState('');

  async function toggleRead(item: any) {
    const { error } = await createClient().from('feedback').update({ is_read: !item.is_read }).eq('id', item.id);
    if (error) return setError(friendlyError(error));
    setItems((prev) => prev.map((f) => (f.id === item.id ? { ...f, is_read: !f.is_read } : f)));
  }

  async function remove(item: any) {
    if (!window.confirm('Delete this message permanently?')) return;
    const { error } = await createClient().from('feedback').delete().eq('id', item.id);
    if (error) return setError(friendlyError(error));
    setItems((prev) => prev.filter((f) => f.id !== item.id));
  }

  if (items.length === 0) return <p className="text-ink/60">No feedback yet.</p>;

  return (
    <div className="space-y-4">
      {error && <Notice kind="error">{error}</Notice>}
      {items.map((f) => (
        <article key={f.id} className={`card p-5 ${f.is_read ? 'opacity-70' : 'border-gold-400'}`}>
          <header className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-ink/60">
            <span>
              <strong className="text-ink">{f.name || 'Anonymous'}</strong>
              {f.email && (
                <>
                  {' · '}
                  <a href={`mailto:${f.email}`} className="text-brand-600 hover:underline">
                    {f.email}
                  </a>
                </>
              )}
            </span>
            <time dateTime={f.created_at}>{new Date(f.created_at).toLocaleString()}</time>
          </header>
          <p className="whitespace-pre-wrap" dir="auto">{f.message}</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => toggleRead(f)} className="btn btn-outline">
              {f.is_read ? 'Mark as unread' : 'Mark as read'}
            </button>
            <button onClick={() => remove(f)} className="btn btn-danger">
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
