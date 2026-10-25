import type { Metadata } from 'next';

// Keep the admin area out of search engines.
export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Dewan Admin' },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div dir="ltr" className="font-sans">{children}</div>;
}
