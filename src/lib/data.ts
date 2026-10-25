// Small helpers that load data from Supabase for the public pages.
import type { SupabaseClient } from '@supabase/supabase-js';

const POET_FIELDS = 'id,name_ps,name_pr,name_en,photo_url';

export async function getPublicSettings(supabase: SupabaseClient): Promise<Record<string, string>> {
  const { data } = await supabase.from('settings').select('key,value').eq('is_public', true);
  const out: Record<string, string> = {};
  (data ?? []).forEach((row: any) => (out[row.key] = row.value ?? ''));
  return out;
}

/** Couplet of the Day: the admin's choice if set, otherwise a different couplet every day. */
export async function getCoupletOfDay(supabase: SupabaseClient, overrideId?: string) {
  const select = `*, poet:poets(${POET_FIELDS})`;

  if (overrideId) {
    const { data } = await supabase.from('couplets').select(select).eq('id', overrideId).maybeSingle();
    if (data) return data as any;
  }

  const { count } = await supabase.from('couplets').select('id', { count: 'exact', head: true });
  if (!count) return null;

  const dayNumber = Math.floor(Date.now() / 86_400_000);
  const index = dayNumber % count;
  const { data } = await supabase
    .from('couplets')
    .select(select)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .range(index, index)
    .maybeSingle();
  return (data as any) ?? null;
}

/** Featured poet: the admin's choice if set, otherwise one poet per day. */
export async function getFeaturedPoet(supabase: SupabaseClient, featuredId?: string) {
  if (featuredId) {
    const { data } = await supabase.from('poets').select('*').eq('id', featuredId).maybeSingle();
    if (data) return data as any;
  }
  const { count } = await supabase.from('poets').select('id', { count: 'exact', head: true });
  if (!count) return null;
  const index = Math.floor(Date.now() / 86_400_000) % count;
  const { data } = await supabase
    .from('poets')
    .select('*')
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .range(index, index)
    .maybeSingle();
  return (data as any) ?? null;
}

/** Removes characters that could break a search filter. */
export function cleanSearchTerm(raw: string): string {
  return raw.replace(/[%*,()\\"'`;:]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export const POET_SELECT = POET_FIELDS;
