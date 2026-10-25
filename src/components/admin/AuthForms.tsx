'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Notice } from './Fields';

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-brand-900 px-4 py-10">
      <div className="card w-full max-w-md space-y-5 p-8">
        <div className="text-center">
          <p className="font-naskh text-4xl font-bold text-brand-700">دیوان</p>
          <h1 className="mt-1 text-xl font-bold">{title}</h1>
        </div>
        {children}
      </div>
    </main>
  );
}

export function LoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setBusy(false);
      setError('Incorrect email or password.');
      return;
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <Shell title="Admin login">
      {notice === 'link' && <Notice kind="info">That link has expired or was already used. Please request a new one.</Notice>}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
        </div>
        {error && <Notice kind="error">{error}</Notice>}
        <button type="submit" disabled={busy} className="btn btn-primary w-full">
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-center text-sm">
        <Link href="/admin/forgot-password" className="text-brand-600 hover:underline">
          Forgot password?
        </Link>
      </p>
    </Shell>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset-password`,
    });
    setBusy(false);
    setDone(true); // always show the same message so strangers can't test which emails exist
  }

  return (
    <Shell title="Reset your password">
      {done ? (
        <Notice kind="ok">If that email belongs to an admin account, a reset link is on its way. Check your inbox (and spam folder).</Notice>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <p className="text-sm text-ink/70">Enter your admin email and we will send you a link to choose a new password.</p>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" autoComplete="email" />
          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="text-center text-sm">
        <Link href="/admin/login" className="text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </Shell>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState<'checking' | 'yes' | 'no'>('checking');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setReady(data.user ? 'yes' : 'no'));
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (pw.length < 10) return setError('Please use at least 10 characters.');
    if (pw !== pw2) return setError('The two passwords do not match.');
    setBusy(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    router.replace('/admin');
    router.refresh();
  }

  return (
    <Shell title="Choose a new password">
      {ready === 'checking' && <p className="text-center text-sm text-ink/60">Checking your link…</p>}
      {ready === 'no' && (
        <>
          <Notice kind="info">This reset link is not valid any more. Please request a new one.</Notice>
          <p className="text-center text-sm">
            <Link href="/admin/forgot-password" className="text-brand-600 hover:underline">
              Request a new link
            </Link>
          </p>
        </>
      )}
      {ready === 'yes' && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="pw">New password</label>
            <input id="pw" type="password" required minLength={10} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="pw2">Repeat new password</label>
            <input id="pw2" type="password" required minLength={10} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="input" />
          </div>
          {error && <Notice kind="error">{error}</Notice>}
          <button type="submit" disabled={busy} className="btn btn-primary w-full">
            {busy ? 'Saving…' : 'Save new password'}
          </button>
        </form>
      )}
    </Shell>
  );
}
