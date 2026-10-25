import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { LANGS, pick, t } from '@/lib/i18n';
import { POET_SELECT } from '@/lib/data';
import Txt from '@/components/Txt';
import PoemText, { type Version } from '@/components/PoemText';
import MediaGallery from '@/components/MediaGallery';
import { PoemCard } from '@/components/Cards';

const getPoem = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('poetry')
    .select(`*, poet:poets(${POET_SELECT})`)
    .eq('id', id)
    .maybeSingle();
  return data as any;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const lang = await getLang();
  const poem = await getPoem(id);
  if (!poem) return {};
  const poet = pick(poem.poet, 'name', lang);
  return {
    title: `${pick(poem, 'title', lang)}${poet ? ` — ${poet}` : ''}`,
    description: pick(poem, 'text', lang).split('\n').filter(Boolean).slice(0, 2).join(' / ').slice(0, 160),
  };
}

export default async function PoemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const poem = await getPoem(id);
  if (!poem) notFound();

  const supabase = await createClient();
  const [mediaRes, moreRes] = await Promise.all([
    supabase.from('media').select('id,kind,title,url').eq('poetry_id', id).order('created_at', { ascending: true }),
    supabase
      .from('poetry')
      .select(`id,category,title_ps,title_pr,title_en,text_ps,text_pr,text_en,poet:poets(${POET_SELECT})`)
      .eq('poet_id', poem.poet_id)
      .neq('id', id)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);
  const media = (mediaRes.data ?? []) as any[];
  const more = (moreRes.data ?? []) as any[];

  const versions: Version[] = LANGS.filter((l) => (poem[`text_${l.code}`] || '').trim() !== '').map((l) => ({
    lang: l.code,
    label: l.label,
    text: poem[`text_${l.code}`],
  }));

  const heading = `${pick(poem, 'title', lang)}${poem.poet ? ` — ${pick(poem.poet, 'name', lang)}` : ''}`;

  return (
    <article className="container-page max-w-3xl py-12">
      <div className="text-center">
        <span className="badge">{t(lang, `cat.${poem.category}`)}</span>
        <Txt obj={poem} field="title" lang={lang} as="h1" className="section-title mt-3 block" />
        {poem.poet && (
          <p className="mt-2 text-lg text-brand-700">
            <Link href={`/poets/${poem.poet.id}`} className="font-semibold underline-offset-4 hover:underline">
              <Txt obj={poem.poet} field="name" lang={lang} />
            </Link>
          </p>
        )}
        <div className="ornament">◆</div>
      </div>

      <PoemText
        versions={versions}
        initial={lang}
        heading={heading}
        copyLabel={t(lang, 'common.copy')}
        copiedLabel={t(lang, 'common.copied')}
      />

      {media.length > 0 && (
        <section className="mt-12">
          <h2 className="section-title mb-6">{t(lang, 'poem.media')}</h2>
          <MediaGallery media={media} lang={lang} />
        </section>
      )}

      {more.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 font-serif text-2xl font-semibold text-brand-800">{t(lang, 'poem.moreBy')}</h2>
          <div className="grid gap-4">
            {more.map((p) => (
              <PoemCard key={p.id} poem={p} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
