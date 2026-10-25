import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client that uses the SECRET service-role key.
 * It bypasses all security rules, so it must ONLY be used inside server code
 * (API routes). Never import this file from a component with 'use client'.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase service-role environment variables.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
