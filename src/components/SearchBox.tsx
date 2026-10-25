import { t, type Lang } from '@/lib/i18n';

export default function SearchBox({
  lang,
  defaultValue = '',
  large = false,
}: {
  lang: Lang;
  defaultValue?: string;
  large?: boolean;
}) {
  return (
    <form action="/search" method="get" role="search" className="flex w-full gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        maxLength={80}
        placeholder={t(lang, 'search.placeholder')}
        aria-label={t(lang, 'search.button')}
        className={`input ${large ? 'py-3 text-lg' : ''}`}
      />
      <button type="submit" className={`btn btn-gold ${large ? 'px-6 text-base' : ''}`}>
        {t(lang, 'search.button')}
      </button>
    </form>
  );
}
