
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
    <header className="sticky top-0 z-30 border-b border-brand-100 bg-paper/95 backdrop-blur">

      {/* Main header */}
      <div className="container-page flex items-center justify-between gap-3 py-3">

        {/* Brand */}
        <Link
          href="/"
          className="flex min-w-0 items-baseline gap-2 whitespace-nowrap"
        >
          <span className="font-naskh text-3xl font-bold text-brand-700">
            دیوان
          </span>

          <span className="font-serif text-xl font-semibold text-gold-600">
            Dewan
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-4 lg:flex"
          aria-label="Main navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-brand-800 transition-colors hover:text-gold-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Search and desktop language selector */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/search"
            aria-label={t(lang, 'search.button')}
            className="rounded-full p-2 text-brand-700 transition-colors hover:bg-brand-50"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
          </Link>

          <div className="hidden lg:block">
            <LanguageToggle current={lang} />
          </div>
        </div>
      </div>

      {/* Responsive mobile navigation */}
      <div className="container-page flex flex-wrap items-center justify-between gap-3 pb-3 lg:hidden">

        <LanguageToggle current={lang} />

        <details className="group relative z-40">

          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 [&::-webkit-details-marker]:hidden">

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>

            {t(lang, 'nav.menu')}
          </summary>

          <nav
            aria-label="Mobile navigation"
            className="absolute end-0 top-full z-50 mt-2 flex w-56 flex-col gap-1 rounded-xl border border-brand-100 bg-paper p-2 shadow-xl"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-4 py-3 text-start text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 hover:text-gold-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

        </details>
      </div>
    </header>
  );
}
