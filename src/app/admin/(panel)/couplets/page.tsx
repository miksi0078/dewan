import { createClient } from '@/lib/supabase/server';
import CoupletManager from '@/components/admin/CoupletManager';

export default async function AdminCouplets() {
  const supabase = await createClient();
  const [coupletsRes, poetsRes, poemsRes, overrideRes] = await Promise.all([
    supabase.from('couplets').select('*').order('created_at', { ascending: false }).limit(1000),
    supabase.from('poets').select('id,name_ps,name_pr,name_en').order('created_at', { ascending: true }),
    supabase.from('poetry').select('id,poet_id,title_ps,title_pr,title_en').order('created_at', { ascending: false }).limit(1000),
    supabase.from('settings').select('value').eq('key', 'couplet_override_id').maybeSingle(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-800">Couplets &amp; Couplet of the Day</h1>
      <CoupletManager
        couplets={coupletsRes.data ?? []}
        poets={poetsRes.data ?? []}
        poems={poemsRes.data ?? []}
        overrideId={overrideRes.data?.value ?? ''}
      />
    </div>
  );
}
