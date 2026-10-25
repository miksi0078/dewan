import { t, type Lang } from '@/lib/i18n';

export default function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-20 border-t border-brand-100 bg-brand-900 text-brand-100">
      <div className="container-page flex flex-col items-center gap-2 py-10 text-center">
        <p className="font-naskh text-3xl text-gold-400">دیوان</p>
        <p className="text-sm opacity-80">{t(lang, 'site.tagline')}</p>
        <p className="mt-2 text-xs opacity-60">
          © {new Date().getFullYear()} {t(lang, 'site.name')}. {t(lang, 'footer.rights')}
        </p>
      </div>
    </footer>
  );
}
