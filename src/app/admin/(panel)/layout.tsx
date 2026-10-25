import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AdminNav from '@/components/admin/AdminNav';

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  // Gate #2 (the middleware is gate #1): the server re-checks who is logged in.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/admin/login');

  // Gate #3: being logged in is not enough, the account must be on the admin list.
  const { data: isAdmin } = await supabase.rpc('is_admin');
  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-md space-y-4 p-8 text-center">
          <h1 className="text-xl font-bold">Not an admin account</h1>
          <p className="text-ink/70">
            You are signed in as <strong>{user.email}</strong>, but this account has not been given admin rights yet.
            See Part 3 of the README (“Make yourself the admin”).
          </p>
          <form action="/auth/signout" method="post">
            <button className="btn btn-primary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </main>
    );
  }

  const { count } = await supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('is_read', false);

  return (
    <div className="min-h-screen bg-paper">
      <AdminNav unread={count ?? 0} />
      <div className="container-page py-8">{children}</div>
    </div>
  );
}
