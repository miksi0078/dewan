import { createClient } from '@/lib/supabase/server';
import SettingsForm from '@/components/admin/SettingsForm';

export default async function AdminSettings() {
  const supabase = await createClient();
  const [settingsRes, poetsRes, coupletsRes] = await Promise.all([
    supabase.from('settings').select('key,value'),
    supabase.from('poets').select('id,name_ps,name_pr,name_en').order('created_at', { ascending: true }),
    supabase.from('couplets').select('id,text_ps,text_pr,text_en').order('created_at', { ascending: false }).limit(500),
  ]);

  const initial: Record<string, string> = {};
  (settingsRes.data ?? []).forEach((r: any) => (initial[r.key] = r.value ?? ''));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand-800">Settings</h1>
      <SettingsForm initial={initial} poets={poetsRes.data ?? []} couplets={coupletsRes.data ?? []} />
    </div>
  );
}
