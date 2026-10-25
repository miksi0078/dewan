import './globals.css';
import type { Metadata, Viewport } from 'next';
import { getLang } from '@/lib/lang';
import { dirOf, htmlLang, t } from '@/lib/i18n';

function siteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
  } catch {
    return new URL('http://localhost:3000');
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const name = t(lang, 'site.name');
  return {
    metadataBase: siteUrl(),
    title: { default: `${name} — ${t(lang, 'site.tagline')}`, template: `%s | ${name}` },
    description: t(lang, 'site.description'),
    openGraph: {
      title: name,
      description: t(lang, 'site.description'),
      siteName: name,
      type: 'website',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#1F5D50',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={htmlLang(lang)} dir={dirOf(lang)}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
