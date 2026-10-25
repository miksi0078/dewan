import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PoetForm from '@/components/admin/PoetForm';
import MediaManager from '@/components/admin/MediaManager';
import DeleteButton from '@/components/admin/DeleteButton';

export default async function EditPoet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: poet } = await supabase.from('poets').select('*').eq('id', id).maybeSingle();
  if (!poet) notFound();

  const [mediaRes, poemsRes] = await Promise.all([
    supabase.from('media').select('*').eq('poet_id', id).order('created_at', { ascending: true }),
    supabase.from('poetry').select('id,title_ps,title_pr,title_en').eq('poet_id', id),
  ]);
  const poemCount = (poemsRes.data ?? []).length;

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/poets" className="text-sm text-brand-600 hover:underline">← All poets</Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-800">Edit poet</h1>
        <Link href={`/poets/${id}`} target="_blank" className="text-sm text-brand-600 hover:underline">View on website ↗</Link>
      </div>

      <PoetForm poet={poet} />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Audio, PDF books and videos about this poet</h2>
        <MediaManager poetId={id} initial={mediaRes.data ?? []} />
      </section>

      <section className="card space-y-3 border-red-200 p-5">
        <h2 className="text-lg font-bold text-red-700">Delete this poet</h2>
        {poemCount > 0 ? (
          <p className="text-sm text-ink/70">
            This poet still has {poemCount} poem{poemCount === 1 ? '' : 's'}. For safety, delete or move those poems first
            (the database refuses to delete a poet who still has poems).
          </p>
        ) : (
          <p className="text-sm text-ink/70">This also removes the poet’s uploaded files. It cannot be undone.</p>
        )}
        <DeleteButton
          table="poets"
          id={id}
          ownerColumn="poet_id"
          redirectTo="/admin/poets"
          confirmText="Delete this poet permanently? This cannot be undone."
          label="Delete poet"
        />
      </section>
    </div>
  );
}
