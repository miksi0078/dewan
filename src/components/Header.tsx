import Link from 'next/link';
import { t, type Lang } from '@/lib/i18n';
import LanguageToggle from './LanguageToggle';

export default function Header({ lang }: { lang: Lang }) {
  const links = [
    { href: '/', label: t(lang, 'nav.home') },
    { href: '/poets', label: t(lang, 'nav.poets') },
    { href: '/poetry', label: t(lang, 'nav.poetry') },
    { href: '/about', label: t(lang, 'nav.about') },
    { href: '/contact', label: t(lang, 'nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-paper/90 backdrop-blur">
      <div className="container-page flex items-center justify-between gap-4 py-3">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-naskh text-3xl font-bold text-brand-700">دیوان</span>
          <span className="font-serif text-xl font-semibold tracking-wide text-gold-600" dir="ltr">
            Dewan
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-semibold text-brand-800 hover:text-gold-600">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/search" aria-label={t(lang, 'search.button')} className="rounded-full p-2 text-brand-700 hover:bg-brand-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          </Link>
          <LanguageToggle current={lang} />
        </div>
      </div>

      {/* Mobile navigation: scrolls sideways, no JavaScript needed */}
      <nav className="container-page flex gap-5 overflow-x-auto pb-2 md:hidden" aria-label="Main (mobile)">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap text-sm font-semibold text-brand-800">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
