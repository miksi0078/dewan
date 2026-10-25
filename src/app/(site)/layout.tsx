import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getLang } from '@/lib/lang';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <>
      <Header lang={lang} />
      <main className="min-h-[60vh]">{children}</main>
      <Footer lang={lang} />
    </>
  );
}
