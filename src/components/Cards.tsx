import Link from 'next/link';
import { dirOf, pick, pickLang, t, type Lang } from '@/lib/i18n';
import Txt from './Txt';

export function firstLines(poem: any, lang: Lang, count = 2) {
  const text = pick(poem, 'text', lang);
  const l = pickLang(poem, 'text', lang);
  const lines = text.replace(/\r\n/g, '\n').split('\n').map((s: string) => s.trim()).filter(Boolean).slice(0, count);
  return { lines, lang: l };
}

export function PoetAvatar({ poet, lang, size = 'h-24 w-24' }: { poet: any; lang: Lang; size?: string }) {
  const name = pick(poet, 'name', lang);
  if (poet?.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={poet.photo_url} alt={name} loading="lazy" className={`${size} rounded-full border-2 border-gold-400/60 object-cover`} />;
  }
  return (
    <div className={`${size} flex items-center justify-center rounded-full border-2 border-gold-400/60 bg-brand-50 font-naskh text-3xl text-brand-600`}>
      {name.trim().charAt(0)}
    </div>
  );
}

export function PoetCard({ poet, lang }: { poet: any; lang: Lang }) {
  return (
    <Link href={`/poets/${poet.id}`} className="card flex flex-col items-center gap-3 p-6 text-center transition hover:-translate-y-0.5 hover:shadow-md">
      <PoetAvatar poet={poet} lang={lang} />
      <Txt obj={poet} field="name" lang={lang} as="h3" className="text-lg font-semibold text-brand-800" />
      {(poet.born || poet.died) && (
        <p className="text-sm text-ink/60" dir="ltr">
          {poet.born || '?'} – {poet.died || ''}
        </p>
      )}
    </Link>
  );
}

export function PoemCard({ poem, lang }: { poem: any; lang: Lang }) {
  const snippet = firstLines(poem, lang);
  return (
    <Link href={`/poetry/${poem.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="badge">{t(lang, `cat.${poem.category}`)}</span>
        {poem.poet && <Txt obj={poem.poet} field="name" lang={lang} className="text-sm text-ink/60" />}
      </div>
      <Txt obj={poem} field="title" lang={lang} as="h3" className="mb-2 text-lg font-semibold text-brand-800" />
      {snippet.lines.length > 0 && (
        <p dir={dirOf(snippet.lang)} className={`line-clamp-2 text-ink/70 ${snippet.lang === 'ps' ? 'font-naskh' : ''}`}>
          {snippet.lines.join(' ⁄ ')}
        </p>
      )}
    </Link>
  );
}

export function Pager({
  page,
  hasNext,
  hrefFor,
  lang,
}: {
  page: number;
  hasNext: boolean;
  hrefFor: (p: number) => string;
  lang: Lang;
}) {
  if (page <= 1 && !hasNext) return null;
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      {page > 1 && (
        <Link href={hrefFor(page - 1)} className="btn btn-outline">
          {t(lang, 'common.prev')}
        </Link>
      )}
      <span className="text-sm text-ink/60">{page}</span>
      {hasNext && (
        <Link href={hrefFor(page + 1)} className="btn btn-outline">
          {t(lang, 'common.next')}
        </Link>
      )}
    </div>
  );
}
