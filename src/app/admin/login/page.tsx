import { LoginForm } from '@/components/admin/AuthForms';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  return <LoginForm notice={sp.error} />;
}
