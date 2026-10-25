'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { LANGS, dirOf, type Lang } from '@/lib/i18n';

export default function LanguageToggle({ current }: { current: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function choose(code: Lang) {
    if (code === current) return;
    document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.dir = dirOf(code);
    start(() => router.refresh());
  }

  return (
    <div
      className={`inline-flex rounded-full border border-brand-200 bg-white p-0.5 text-sm ${pending ? 'opacity-60' : ''}`}
      role="group"
      aria-label="Language"
      dir="ltr"
    >
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          onClick={() => choose(l.code)}
          aria-pressed={current === l.code}
          className={`rounded-full px-3 py-1 font-medium transition ${
            current === l.code ? 'bg-brand-600 text-white' : 'text-brand-700 hover:bg-brand-50'
          } ${l.code === 'ps' ? 'font-naskh' : ''}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
