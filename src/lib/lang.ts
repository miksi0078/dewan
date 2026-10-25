import { cookies } from 'next/headers';
import { DEFAULT_LANG, isLang, type Lang } from './i18n';

/** Reads the visitor's chosen language from a cookie (server side). */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get('lang')?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}
