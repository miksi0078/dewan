import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { pick, t } from '@/lib/i18n';
import Txt from '@/components/Txt';
import MediaGallery from '@/components/MediaGallery';
import { PoemCard, PoetAvatar } from '@/components/Cards';

const getPoet = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase.from('poets').select('*').eq('id', id).maybeSingle();
  return data as any;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const lang = await getLang();
  const poet = await getPoet(id);
  if (!poet) return {};
  return { title: pick(poet, 'name', lang), description: pick(poet, 'bio', lang).slice(0, 160) || undefined };
}

export default async function PoetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await getLang();
  const poet = await getPoet(id);
  if (!poet) notFound();

  const supabase = await createClient();
  const [poemsRes, mediaRes] = await Promise.all([
    supabase
      .from('poetry')
      .select('id,category,title_ps,title_pr,title_en,text_ps,text_pr,text_en')
      .eq('poet_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('media').select('id,kind,title,url').eq('poet_id', id).order('created_at', { ascending: true }),
  ]);
  const poems = (poemsRes.data ?? []) as any[];
  const media = (mediaRes.data ?? []) as any[];

  return (
    <div className="container-page py-12">
      <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-start">
        <PoetAvatar poet={poet} lang={lang} size="h-40 w-40" />
        <div>
          <Txt obj={poet} field="name" lang={lang} as="h1" className="section-title" />
          {(poet.born || poet.died) && (
            <p className="mt-2 text-ink/60" dir="ltr">
              {poet.born ? `${t(lang, 'common.born')}: ${poet.born}` : ''}
              {poet.born && poet.died ? '  ·  ' : ''}
              {poet.died ? `${t(lang, 'common.died')}: ${poet.died}` : ''}
            </p>
          )}
          {pick(poet, 'bio', lang) && (
            <div className="mt-5 max-w-3xl">
              <h2 className="mb-2 font-serif text-xl font-semibold text-gold-600">{t(lang, 'poet.biography')}</h2>
              <Txt obj={poet} field="bio" lang={lang} as="p" className="whitespace-pre-line text-lg leading-relaxed text-ink/80" />
            </div>
          )}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="section-title mb-6">{t(lang, 'poet.poetry')}</h2>
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

      {media.length > 0 && (
        <section className="mt-14">
          <h2 className="section-title mb-6">{t(lang, 'poet.media')}</h2>
          <MediaGallery media={media} lang={lang} />
        </section>
      )}
    </div>
  );
}
