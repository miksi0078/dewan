'use client';

import { useState } from 'react';

type Labels = {
  name: string;
  email: string;
  message: string;
  anonymous: string;
  send: string;
  sending: string;
  success: string;
  error: string;
  tooMany: string;
};

export default function ContactForm({ labels }: { labels: Labels }) {
  const [anonymous, setAnonymous] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'error' | 'limited'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(fd.get('name') || ''),
          email: String(fd.get('email') || ''),
          message: String(fd.get('message') || ''),
          anonymous,
          website: String(fd.get('website') || ''), // hidden spam trap
        }),
      });
      if (res.status === 429) return setState('limited');
      if (!res.ok) return setState('error');
      form.reset();
      setAnonymous(false);
      setState('ok');
    } catch {
      setState('error');
    }
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6" noValidate>
      {/* Spam trap: real people never see or fill this */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {!anonymous && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="name">{labels.name}</label>
            <input id="name" name="name" type="text" maxLength={100} className="input" autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="email">{labels.email}</label>
            <input id="email" name="email" type="email" maxLength={200} className="input" autoComplete="email" dir="ltr" />
          </div>
        </div>
      )}

      <div>
        <label className="label" htmlFor="message">{labels.message}</label>
        <textarea id="message" name="message" required rows={6} maxLength={3000} className="input" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
          className="h-4 w-4 accent-brand-600"
        />
        {labels.anonymous}
      </label>

      <button type="submit" disabled={state === 'sending'} className="btn btn-primary">
        {state === 'sending' ? labels.sending : labels.send}
      </button>

      <div role="status" aria-live="polite">
        {state === 'ok' && <p className="rounded-lg bg-brand-50 p-3 text-brand-700">{labels.success}</p>}
        {state === 'error' && <p className="rounded-lg bg-red-50 p-3 text-red-700">{labels.error}</p>}
        {state === 'limited' && <p className="rounded-lg bg-amber-50 p-3 text-amber-800">{labels.tooMany}</p>}
      </div>
    </form>
  );
}
