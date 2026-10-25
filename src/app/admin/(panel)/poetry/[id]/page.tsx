import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PoetryForm from '@/components/admin/PoetryForm';
import MediaManager from '@/components/admin/MediaManager';
import DeleteButton from '@/components/admin/DeleteButton';

export default async function EditPoem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: poem } = await supabase.from('poetry').select('*').eq('id', id).maybeSingle();
  if (!poem) notFound();

  const [poetsRes, mediaRes] = await Promise.all([
    supabase.from('poets').select('id,name_ps,name_pr,name_en').order('created_at', { ascending: true }),
    supabase.from('media').select('*').eq('poetry_id', id).order('created_at', { ascending: true }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/poetry" className="text-sm text-brand-600 hover:underline">← All poetry</Link>
        <h1 className="mt-2 text-2xl font-bold text-brand-800">Edit poem</h1>
        <Link href={`/poetry/${id}`} target="_blank" className="text-sm text-brand-600 hover:underline">View on website ↗</Link>
      </div>

      <PoetryForm poem={poem} poets={poetsRes.data ?? []} />

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Audio, image poetry, videos and PDF books</h2>
        <MediaManager poetryId={id} initial={mediaRes.data ?? []} />
      </section>

      <section className="card space-y-3 border-red-200 p-5">
        <h2 className="text-lg font-bold text-red-700">Delete this poem</h2>
        <p className="text-sm text-ink/70">This also removes the files uploaded for this poem. It cannot be undone.</p>
        <DeleteButton
          table="poetry"
          id={id}
          ownerColumn="poetry_id"
          redirectTo="/admin/poetry"
          confirmText="Delete this poem permanently? This cannot be undone."
          label="Delete poem"
        />
      </section>
    </div>
  );
}
