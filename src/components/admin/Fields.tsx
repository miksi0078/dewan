'use client';

import type { ReactNode } from 'react';

export function TextField({
  label,
  value,
  onChange,
  rtl = false,
  required = false,
  placeholder,
  hint,
  type = 'text',
  maxLength = 300,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rtl?: boolean;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="label">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        dir={rtl ? 'rtl' : 'ltr'}
        className={`input ${rtl ? 'font-naskh text-lg' : ''}`}
      />
      {hint && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
    </div>
  );
}

export function AreaField({
  label,
  value,
  onChange,
  rtl = false,
  rows = 6,
  hint,
  maxLength = 20000,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rtl?: boolean;
  rows?: number;
  hint?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        maxLength={maxLength}
        dir={rtl ? 'rtl' : 'ltr'}
        className={`input ${rtl ? 'font-naskh text-lg leading-loose' : ''}`}
      />
      {hint && <p className="mt-1 text-xs text-ink/60">{hint}</p>}
    </div>
  );
}

export function Notice({ kind, children }: { kind: 'ok' | 'error' | 'info'; children: ReactNode }) {
  const styles =
    kind === 'ok'
      ? 'bg-brand-50 text-brand-800 border-brand-200'
      : kind === 'error'
      ? 'bg-red-50 text-red-800 border-red-200'
      : 'bg-amber-50 text-amber-900 border-amber-200';
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function friendlyError(error: { message?: string; code?: string } | null | undefined): string {
  if (!error) return 'Unknown error.';
  if (error.code === '23503') return 'This item is still used by other records (for example, a poet who still has poems). Remove those first.';
  if (error.code === '42501' || /row-level security|permission denied/i.test(error.message || ''))
    return 'Permission denied. Make sure your account was added as an admin (README, Part 3).';
  if (error.code === '23514') return 'Please fill in at least a name/title and text in one language.';
  return error.message || 'Something went wrong.';
}
