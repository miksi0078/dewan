import type { Metadata } from 'next';
import { getLang } from '@/lib/lang';
import { t } from '@/lib/i18n';
import ContactForm from '@/components/ContactForm';

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLang(), 'contact.title') };
}

export default async function ContactPage() {
  const lang = await getLang();
  return (
    <div className="container-page max-w-2xl py-12">
      <h1 className="section-title">{t(lang, 'contact.title')}</h1>
      <p className="mt-2 text-ink/70">{t(lang, 'contact.subtitle')}</p>
      <div className="ornament !justify-start">◆</div>
      <div className="mt-6">
        <ContactForm
          labels={{
            name: t(lang, 'contact.name'),
            email: t(lang, 'contact.email'),
            message: t(lang, 'contact.message'),
            anonymous: t(lang, 'contact.anonymous'),
            send: t(lang, 'contact.send'),
            sending: t(lang, 'contact.sending'),
            success: t(lang, 'contact.success'),
            error: t(lang, 'contact.error'),
            tooMany: t(lang, 'contact.tooMany'),
          }}
        />
      </div>
    </div>
  );
}
