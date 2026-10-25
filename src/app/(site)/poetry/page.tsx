import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { t } from '@/lib/i18n';
import { CATEGORIES, PAGE_SIZE, isCategory } from '@/lib/constants';
import { POET_SELECT } from '@/lib/data';
import { Pager, PoemCard } from '@/components/Cards';

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLang(), 'poetry.title') };
}

export default async function PoetryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const lang = await getLang();
  const sp = await searchParams;
  const category = isCategory(sp.category) ? sp.category : null;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  let query = supabase
    .from('poetry')
    .select(`id,category,title_ps,title_pr,title_en,text_ps,text_pr,text_en,poet:poets(${POET_SELECT})`)
    .order('created_at', { ascending: false })
    .range(from, from + PAGE_SIZE);
  if (category) query = query.eq('category', category);

  const { data } = await query;
  const rows = (data ?? []) as any[];
  const hasNext = rows.length > PAGE_SIZE;
  const poems = rows.slice(0, PAGE_SIZE);

  const tabClass = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
      active ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-200 bg-white text-brand-700 hover:bg-brand-50'
    }`;

  return (
    <div className="container-page py-12">
      <h1 className="section-title">{t(lang, 'poetry.title')}</h1>
      <p className="mt-2 text-ink/70">{t(lang, 'poetry.subtitle')}</p>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        <Link href="/poetry" className={tabClass(!category)}>
          {t(lang, 'common.all')}
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={`/poetry?category=${c}`} className={tabClass(category === c)}>
            {t(lang, `cat.${c}`)}
          </Link>
        ))}
      </div>

      {poems.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {poems.map((p) => (
            <PoemCard key={p.id} poem={p} lang={lang} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-ink/60">{t(lang, 'common.noData')}</p>
      )}

      <Pager
        page={page}
        hasNext={hasNext}
        hrefFor={(p) => `/poetry?${category ? `category=${category}&` : ''}page=${p}`}
        lang={lang}
      />
    </div>
  );
}
