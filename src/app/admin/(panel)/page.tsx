import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

async function count(supabase: any, table: string, filter?: (q: any) => any) {
  let q = supabase.from(table).select('id', { count: 'exact', head: true });
  if (filter) q = filter(q);
  const { count } = await q;
  return count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const [poets, poems, couplets, media, unread] = await Promise.all([
    count(supabase, 'poets'),
    count(supabase, 'poetry'),
    count(supabase, 'couplets'),
    count(supabase, 'media'),
    count(supabase, 'feedback', (q) => q.eq('is_read', false)),
  ]);

  const stats = [
    { label: 'Poets', value: poets, href: '/admin/poets' },
    { label: 'Poems', value: poems, href: '/admin/poetry' },
    { label: 'Couplets', value: couplets, href: '/admin/couplets' },
    { label: 'Media files', value: media, href: '/admin/poetry' },
    { label: 'Unread feedback', value: unread, href: '/admin/feedback' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-brand-800">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 transition hover:shadow-md">
            <p className="text-3xl font-bold text-brand-700">{s.value}</p>
            <p className="text-sm text-ink/60">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="card space-y-3 p-6">
        <h2 className="text-lg font-bold">Quick start</h2>
        <ol className="list-decimal space-y-1 ps-5 text-ink/80">
          <li>
            <Link href="/admin/settings" className="text-brand-600 hover:underline">Settings</Link>: set the email address that receives feedback and write your “About the Developer” page.
          </li>
          <li>
            <Link href="/admin/poets/new" className="text-brand-600 hover:underline">Add a poet</Link> with a picture and biography.
          </li>
          <li>
            <Link href="/admin/poetry/new" className="text-brand-600 hover:underline">Add a poem</Link>, then attach audio, images, videos or a PDF book on the poem’s page.
          </li>
          <li>
            <Link href="/admin/couplets" className="text-brand-600 hover:underline">Add couplets</Link> for the “Couplet of the Day”.
          </li>
        </ol>
      </div>
    </div>
  );
}
