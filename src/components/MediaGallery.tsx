import { t, type Lang } from '@/lib/i18n';
import { toEmbedUrl } from '@/lib/video';

type Media = { id: string; kind: string; title: string | null; url: string };

function downloadUrl(url: string, title: string | null) {
  // Supabase public URLs support ?download=filename to force a download.
  if (!url.includes('/storage/v1/object/public/')) return url;
  const name = (title || 'book').replace(/[^\w؀-ۿ -]+/g, '').trim() || 'book';
  return `${url}?download=${encodeURIComponent(name + '.pdf')}`;
}

export default function MediaGallery({ media, lang }: { media: Media[]; lang: Lang }) {
  if (!media?.length) return null;
  const audio = media.filter((m) => m.kind === 'audio');
  const images = media.filter((m) => m.kind === 'image');
  const videos = media.filter((m) => m.kind === 'video');
  const pdfs = media.filter((m) => m.kind === 'pdf');

  return (
    <div className="space-y-10">
      {audio.length > 0 && (
        <section>
          <h3 className="mb-3 font-serif text-xl font-semibold text-brand-800">{t(lang, 'media.audio')}</h3>
          <div className="space-y-3">
            {audio.map((m) => (
              <div key={m.id} className="card p-4">
                {m.title && <p className="mb-2 text-sm font-medium">{m.title}</p>}
                <audio controls preload="none" src={m.url} className="w-full" dir="ltr" />
              </div>
            ))}
          </div>
        </section>
      )}

      {images.length > 0 && (
        <section>
          <h3 className="mb-3 font-serif text-xl font-semibold text-brand-800">{t(lang, 'media.image')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {images.map((m) => (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="card block overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.title || ''} loading="lazy" className="h-auto w-full" />
                {m.title && <p className="p-3 text-sm">{m.title}</p>}
              </a>
            ))}
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h3 className="mb-3 font-serif text-xl font-semibold text-brand-800">{t(lang, 'media.video')}</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {videos.map((m) => {
              const embed = toEmbedUrl(m.url);
              return (
                <div key={m.id} className="card overflow-hidden">
                  {embed ? (
                    <div className="aspect-video w-full bg-black">
                      <iframe
                        src={embed}
                        title={m.title || 'Video'}
                        loading="lazy"
                        className="h-full w-full"
                        allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                      />
                    </div>
                  ) : (
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline m-4">
                      {t(lang, 'media.openVideo')}
                    </a>
                  )}
                  {m.title && <p className="p-3 text-sm font-medium">{m.title}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pdfs.length > 0 && (
        <section>
          <h3 className="mb-3 font-serif text-xl font-semibold text-brand-800">{t(lang, 'media.pdf')}</h3>
          <ul className="space-y-3">
            {pdfs.map((m) => (
              <li key={m.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <span className="font-medium">{m.title || 'PDF'}</span>
                <a href={downloadUrl(m.url, m.title)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  {t(lang, 'media.download')}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
