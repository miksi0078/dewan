import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { t } from '@/lib/i18n';
import { POET_SELECT, cleanSearchTerm } from '@/lib/data';
import SearchBox from '@/components/SearchBox';
import { PoemCard, PoetCard } from '@/components/Cards';

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLang(), 'search.title'), robots: { index: false } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const term = cleanSearchTerm(sp.q || '');

  let poets: any[] = [];
  let poems: any[] = [];

  if (term) {
    const supabase = await createClient();
    const like = `*${term}*`;
    const [poetsRes, poemsRes] = await Promise.all([
      supabase
        .from('poets')
        .select('*')
        .or(`name_ps.ilike.${like},name_pr.ilike.${like},name_en.ilike.${like}`)
        .limit(24),
      supabase
        .from('poetry')
        .select(`id,category,title_ps,title_pr,title_en,text_ps,text_pr,text_en,poet:poets(${POET_SELECT})`)
        .or(
          [
            'title_ps', 'title_pr', 'title_en', 'text_ps', 'text_pr', 'text_en',
          ]
            .map((c) => `${c}.ilike.${like}`)
            .join(',')
        )
        .order('created_at', { ascending: false })
        .limit(40),
    ]);
    poets = (poetsRes.data ?? []) as any[];
    poems = (poemsRes.data ?? []) as any[];
  }

  return (
    <div className="container-page py-12">
      <h1 className="section-title mb-6">{t(lang, 'search.title')}</h1>
      <div className="max-w-2xl">
        <SearchBox lang={lang} defaultValue={term} large />
      </div>

      {!term && <p className="mt-8 text-ink/60">{t(lang, 'search.empty')}</p>}

      {term && (
        <div className="mt-10">
          <p className="mb-6 text-ink/70">
            {t(lang, 'search.results')} “{term}”
          </p>

          {poets.length === 0 && poems.length === 0 && <p className="text-ink/60">{t(lang, 'search.none')}</p>}

          {poets.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-4 font-serif text-2xl font-semibold text-brand-800">{t(lang, 'nav.poets')}</h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {poets.map((p) => (
                  <PoetCard key={p.id} poet={p} lang={lang} />
                ))}
              </div>
            </section>
          )}

          {poems.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-2xl font-semibold text-brand-800">{t(lang, 'nav.poetry')}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {poems.map((p) => (
                  <PoemCard key={p.id} poem={p} lang={lang} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
