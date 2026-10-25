import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPoets() {
  const supabase = await createClient();
  const { data } = await supabase.from('poets').select('*').order('created_at', { ascending: false }).limit(500);
  const poets = (data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-800">Poets ({poets.length})</h1>
        <Link href="/admin/poets/new" className="btn btn-primary">
          + New poet
        </Link>
      </div>

      {poets.length === 0 ? (
        <p className="text-ink/60">No poets yet.</p>
      ) : (
        <ul className="divide-y divide-brand-100 rounded-2xl border border-brand-100 bg-white">
          {poets.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/poets/${p.id}`} className="flex items-center gap-4 p-4 hover:bg-brand-50">
                {p.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.photo_url} alt="" className="h-12 w-12 rounded-full object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">?</div>
                )}
                <div>
                  <p className="font-semibold">{p.name_en || p.name_pr || p.name_ps}</p>
                  {p.name_ps && <p className="font-naskh text-ink/60" dir="rtl">{p.name_ps}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
