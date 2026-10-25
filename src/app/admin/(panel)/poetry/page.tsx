import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { t } from '@/lib/i18n';

export default async function AdminPoetry() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('poetry')
    .select('id,category,title_ps,title_pr,title_en,poet:poets(name_ps,name_pr,name_en)')
    .order('created_at', { ascending: false })
    .limit(500);
  const poems = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-800">Poetry ({poems.length})</h1>
        <Link href="/admin/poetry/new" className="btn btn-primary">
          + New poem
        </Link>
      </div>

      {poems.length === 0 ? (
        <p className="text-ink/60">No poems yet. Add a poet first, then add a poem.</p>
      ) : (
        <ul className="divide-y divide-brand-100 rounded-2xl border border-brand-100 bg-white">
          {poems.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/poetry/${p.id}`} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-brand-50">
                <div>
                  <p className="font-semibold">{p.title_en || p.title_pr || p.title_ps}</p>
                  <p className="text-sm text-ink/60">{p.poet?.name_en || p.poet?.name_pr || p.poet?.name_ps}</p>
                </div>
                <span className="badge">{t('en', `cat.${p.category}`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
