import { createClient } from '@/lib/supabase/server';
import FeedbackList from '@/components/admin/FeedbackList';

export default async function AdminFeedback() {
  const supabase = await createClient();
  const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(300);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-800">Visitor feedback</h1>
      <FeedbackList initial={data ?? []} />
    </div>
  );
}
