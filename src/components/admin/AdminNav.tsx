'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/poets', label: 'Poets' },
  { href: '/admin/poetry', label: 'Poetry' },
  { href: '/admin/couplets', label: 'Couplets' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/settings', label: 'Settings' },
];

export default function AdminNav({ unread }: { unread: number }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-brand-100 bg-brand-900 text-white">
      <div className="container-page flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/admin" className="flex items-baseline gap-2">
          <span className="font-naskh text-2xl font-bold text-gold-400">دیوان</span>
          <span className="text-sm font-semibold tracking-wide opacity-80">Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" target="_blank" className="text-sm opacity-80 hover:opacity-100">
            View site ↗
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold hover:bg-white/20">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <nav className="container-page flex gap-1 overflow-x-auto pb-2" aria-label="Admin">
        {links.map((l) => {
          const active = l.exact ? pathname === l.href : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold ${
                active ? 'bg-white text-brand-800' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              {l.label}
              {l.href === '/admin/feedback' && unread > 0 && (
                <span className="ms-1.5 rounded-full bg-gold-500 px-1.5 text-xs text-white">{unread}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
