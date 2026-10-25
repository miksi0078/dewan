import { dirOf, pick, pickLang, type Lang } from '@/lib/i18n';

/**
 * Shows one translatable database field (for example name_ps / name_pr / name_en)
 * in the visitor's language, with the correct text direction and font.
 */
export default function Txt({
  obj,
  field,
  lang,
  as: Tag = 'span',
  className = '',
}: {
  obj: any;
  field: string;
  lang: Lang;
  as?: any;
  className?: string;
}) {
  const value = pick(obj, field, lang);
  if (!value) return null;
  const l = pickLang(obj, field, lang);
  return (
    <Tag dir={dirOf(l)} className={`${l === 'ps' ? 'font-naskh' : ''} ${className}`}>
      {value}
    </Tag>
  );
}
