'use client';

import { createBrowserClient } from '@supabase/ssr';

/** Supabase client for the browser (admin forms, uploads, login). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
