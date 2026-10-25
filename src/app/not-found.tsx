import Link from 'next/link';
import { getLang } from '@/lib/lang';
import { t } from '@/lib/i18n';

export default async function NotFound() {
  const lang = await getLang();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-serif text-7xl text-gold-500">404</p>
      <h1 className="section-title">{t(lang, 'notfound.title')}</h1>
      <Link href="/" className="btn btn-primary">
        {t(lang, 'notfound.home')}
      </Link>
    </main>
  );
}
