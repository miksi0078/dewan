import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import PoetryForm from '@/components/admin/PoetryForm';

export default async function NewPoem() {
  const supabase = await createClient();
  const { data } = await supabase.from('poets').select('id,name_ps,name_pr,name_en').order('created_at', { ascending: true });
  const poets = data ?? [];

  return (
    <div className="space-y-6">
      <Link href="/admin/poetry" className="text-sm text-brand-600 hover:underline">← All poetry</Link>
      <h1 className="text-2xl font-bold text-brand-800">New poem</h1>
      {poets.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          You need at least one poet first.{' '}
          <Link href="/admin/poets/new" className="font-semibold underline">Add a poet</Link>.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink/70">After you create the poem you can add audio, image poetry, videos and PDFs on the next page.</p>
          <PoetryForm poets={poets} />
        </>
      )}
    </div>
  );
}
