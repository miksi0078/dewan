import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/lang';
import { dirOf, pick, pickLang, t } from '@/lib/i18n';
import { getPublicSettings } from '@/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLang(), 'about.title') };
}

export default async function AboutPage() {
  const lang = await getLang();
  const supabase = await createClient();
  const s = await getPublicSettings(supabase);

  // Settings are stored as dev_name_ps, dev_name_pr ... so build a lookup object
  const obj = {
    name_ps: s.dev_name_ps, name_pr: s.dev_name_pr, name_en: s.dev_name_en,
    bio_ps: s.dev_bio_ps, bio_pr: s.dev_bio_pr, bio_en: s.dev_bio_en,
  };
  const name = pick(obj, 'name', lang);
  const bio = pick(obj, 'bio', lang);
  const nameLang = pickLang(obj, 'name', lang);
  const bioLang = pickLang(obj, 'bio', lang);
  const photo = s.dev_photo_url;

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="section-title text-center">{t(lang, 'about.title')}</h1>
      <div className="ornament">◆</div>

      {name || bio || photo ? (
        <div className="card mt-8 flex flex-col items-center gap-6 p-8 text-center">
          {photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="h-44 w-44 rounded-full border-4 border-gold-400/60 object-cover shadow" />
          )}
          {name && (
            <h2 dir={dirOf(nameLang)} className={`text-3xl font-bold text-brand-800 ${nameLang === 'ps' ? 'font-naskh' : 'font-serif'}`}>
              {name}
            </h2>
          )}
          {bio && (
            <p dir={dirOf(bioLang)} className={`whitespace-pre-line text-start text-lg leading-loose text-ink/80 ${bioLang === 'ps' ? 'font-naskh' : ''}`}>
              {bio}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-8 text-center text-ink/60">{t(lang, 'about.empty')}</p>
      )}
    </div>
  );
}
