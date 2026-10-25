import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { dirOf, pick, pickLang, t } from '@/lib/i18n';
import { CATEGORIES } from '@/lib/constants';
import { getCoupletOfDay, getFeaturedPoet, getPublicSettings, POET_SELECT } from '@/lib/data';
import Txt from '@/components/Txt';
import SearchBox from '@/components/SearchBox';
import CopyButton from '@/components/CopyButton';
import { PoemCard, PoetAvatar, PoetCard } from '@/components/Cards';

export default async function HomePage() {
  const lang = await getLang();
  const supabase = await createClient();
  const settings = await getPublicSettings(supabase);

  const [couplet, featured, poemsRes, poetsRes] = await Promise.all([
    getCoupletOfDay(supabase, settings.couplet_override_id),
    getFeaturedPoet(supabase, settings.featured_poet_id),
    supabase
      .from('poetry')
      .select(`id,category,title_ps,title_pr,title_en,text_ps,text_pr,text_en,poet:poets(${POET_SELECT})`)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('poets').select('*').order('created_at', { ascending: false }).limit(6),
  ]);

  const poems = (poemsRes.data ?? []) as any[];
  const poets = (poetsRes.data ?? []) as any[];

  const coupletText = couplet ? pick(couplet, 'text', lang) : '';
  const coupletLang = couplet ? pickLang(couplet, 'text', lang) : lang;
  const coupletLines = coupletText.replace(/\r\n/g, '\n').split('\n').map((l: string) => l.trim()).filter(Boolean);
  const coupletPoetName = couplet?.poet ? pick(couplet.poet, 'name', lang) : '';

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-800 text-paper">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #D2A653 0, transparent 40%), radial-gradient(circle at 85% 80%, #4F9783 0, transparent 45%)',
          }}
          aria-hidden="true"
        />
        <div className="container-page relative py-16 text-center sm:py-24">
          <p className="font-naskh text-6xl font-bold text-gold-400 sm:text-7xl">دیوان</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl" dir={dirOf(lang)}>
            {t(lang, 'site.tagline')}
          </h1>
          <div className="mx-auto mt-8 max-w-xl">
            <SearchBox lang={lang} large />
          </div>
        </div>
      </section>

      {/* Couplet of the Day */}
      <section className="container-page -mt-10 pb-4">
        <div className="card relative mx-auto max-w-3xl px-6 py-10 text-center shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-600">{t(lang, 'home.couplet')}</p>
          <div className="ornament">◆</div>
          {couplet && coupletLines.length > 0 ? (
            <>
              <div dir={dirOf(coupletLang)} className="py-2">
                {coupletLines.map((line: string, i: number) => (
                  <span key={i} className={`poem-line ${coupletLang === 'ps' ? 'rtl' : ''}`}>
                    {line}
                  </span>
                ))}
              </div>
              {couplet.poet && (
                <p className="mt-4 text-brand-700">
                  —{' '}
                  <Link href={`/poets/${couplet.poet.id}`} className="font-semibold underline-offset-4 hover:underline">
                    <Txt obj={couplet.poet} field="name" lang={lang} />
                  </Link>
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <CopyButton
                  text={`${coupletLines.join('\n')}${coupletPoetName ? `\n— ${coupletPoetName}` : ''}`}
                  label={t(lang, 'common.copy')}
                  copiedLabel={t(lang, 'common.copied')}
                />
                {couplet.poetry_id && (
                  <Link href={`/poetry/${couplet.poetry_id}`} className="btn btn-primary">
                    {t(lang, 'common.readMore')}
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p className="text-ink/60">{t(lang, 'common.noData')}</p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-16">
        <h2 className="section-title mb-6 text-center">{t(lang, 'home.categories')}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/poetry?category=${c}`}
              className="card px-4 py-5 text-center text-lg font-semibold text-brand-700 transition hover:border-gold-400 hover:bg-brand-50"
            >
              {t(lang, `cat.${c}`)}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured poet */}
      {featured && (
        <section className="container-page mt-16">
          <h2 className="section-title mb-6 text-center">{t(lang, 'home.featuredPoet')}</h2>
          <Link
            href={`/poets/${featured.id}`}
            className="card mx-auto flex max-w-3xl flex-col items-center gap-5 p-6 text-center transition hover:shadow-md sm:flex-row sm:text-start"
          >
            <PoetAvatar poet={featured} lang={lang} size="h-32 w-32" />
            <div>
              <Txt obj={featured} field="name" lang={lang} as="h3" className="text-2xl font-bold text-brand-800" />
              <Txt obj={featured} field="bio" lang={lang} as="p" className="mt-2 line-clamp-3 text-ink/70" />
            </div>
          </Link>
        </section>
      )}

      {/* Latest poetry */}
      <section className="container-page mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="section-title">{t(lang, 'home.latestPoetry')}</h2>
          <Link href="/poetry" className="text-sm font-semibold text-brand-600 hover:text-gold-600">
            {t(lang, 'common.viewAll')} →
          </Link>
        </div>
        {poems.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {poems.map((p) => (
              <PoemCard key={p.id} poem={p} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="text-ink/60">{t(lang, 'common.noData')}</p>
        )}
      </section>

      {/* Poets */}
      <section className="container-page mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="section-title">{t(lang, 'home.latestPoets')}</h2>
          <Link href="/poets" className="text-sm font-semibold text-brand-600 hover:text-gold-600">
            {t(lang, 'common.viewAll')} →
          </Link>
        </div>
        {poets.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {poets.map((p) => (
              <PoetCard key={p.id} poet={p} lang={lang} />
            ))}
          </div>
        ) : (
          <p className="text-ink/60">{t(lang, 'common.noData')}</p>
        )}
      </section>
    </>
  );
}
