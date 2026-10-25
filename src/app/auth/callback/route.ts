import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Only allow redirects to pages on this website. */
function safeNext(value: string | null, fallback = '/admin') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  return value;
}

// Supabase sends people here after they click the link in a "reset password" email.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL('/admin/login?error=link', origin));
}
