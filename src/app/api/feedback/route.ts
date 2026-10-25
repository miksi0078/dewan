import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export const runtime = 'nodejs';

// Very small spam guard: max 5 messages per visitor per 10 minutes.
// (Memory is per server instance, so this is a best-effort protection.)
const hits = new Map<string, number[]>();
function isLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Hidden "website" field: bots fill it in, people never see it. Pretend success.
  if (typeof body?.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : '';
  const anonymous = body?.anonymous === true;
  let name = typeof body?.name === 'string' ? body.name.trim().slice(0, 100) : '';
  let email = typeof body?.email === 'string' ? body.email.trim().slice(0, 200) : '';

  if (message.length < 1 || message.length > 3000) {
    return NextResponse.json({ ok: false, error: 'Please write a message (max 3000 characters).' }, { status: 400 });
  }
  if (anonymous) {
    name = '';
    email = '';
  }
  if (email && !EMAIL_RE.test(email)) email = '';

  const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (isLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many messages.' }, { status: 429 });
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (e) {
    console.error('[feedback] Supabase is not configured:', e);
    return NextResponse.json({ ok: false, error: 'Server is not configured.' }, { status: 500 });
  }

  // 1) Save in the database (so nothing is ever lost)
  const { error: insertError } = await supabase
    .from('feedback')
    .insert({ name: name || null, email: email || null, message });
  if (insertError) {
    console.error('[feedback] insert failed:', insertError.message);
    return NextResponse.json({ ok: false, error: 'Could not save your message.' }, { status: 500 });
  }

  // 2) Email the admin (best effort: failure here never loses the message)
  try {
    const { data } = await supabase.from('settings').select('value').eq('key', 'feedback_email').maybeSingle();
    const to = (data?.value || '').trim();
    const apiKey = process.env.RESEND_API_KEY;
    if (to && apiKey) {
      const from = process.env.FEEDBACK_FROM_EMAIL || 'Dewan <onboarding@resend.dev>';
      const sender = name ? `${name}${email ? ` <${email}>` : ''}` : anonymous ? 'Anonymous' : email || 'Anonymous';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [to],
          ...(email ? { reply_to: email } : {}),
          subject: `New feedback on Dewan from ${name || 'a visitor'}`,
          text: `From: ${sender}\n\n${message}`,
          html: `<p><strong>From:</strong> ${escapeHtml(sender)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) console.error('[feedback] email failed:', res.status, await res.text());
    }
  } catch (e) {
    console.error('[feedback] email error:', e);
  }

  return NextResponse.json({ ok: true });
}
