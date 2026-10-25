import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { t } from '@/lib/i18n';
import { PAGE_SIZE } from '@/lib/constants';
import { Pager, PoetCard } from '@/components/Cards';

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLang(), 'poets.title') };
}

export default async function PoetsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const lang = await getLang();
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const from = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const { data } = await supabase
    .from('poets')
    .select('*')
    .order('created_at', { ascending: true })
    .range(from, from + PAGE_SIZE); // one extra row tells us if there is a next page

  const rows = (data ?? []) as any[];
  const hasNext = rows.length > PAGE_SIZE;
  const poets = rows.slice(0, PAGE_SIZE);

  return (
    <div className="container-page py-12">
      <h1 className="section-title">{t(lang, 'poets.title')}</h1>
      <p className="mt-2 text-ink/70">{t(lang, 'poets.subtitle')}</p>
      <div className="ornament !justify-start">◆</div>

      {poets.length ? (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {poets.map((p) => (
            <PoetCard key={p.id} poet={p} lang={lang} />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-ink/60">{t(lang, 'common.noData')}</p>
      )}

      <Pager page={page} hasNext={hasNext} hrefFor={(p) => `/poets?page=${p}`} lang={lang} />
    </div>
  );
}
