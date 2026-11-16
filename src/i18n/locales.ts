export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export type Localized<T = string> = Record<Locale, T>;

export const HTML_LANG: Record<Locale, string> = { zh: 'zh-Hans', en: 'en' };

export function otherLocale(l: Locale): Locale {
  return l === 'zh' ? 'en' : 'zh';
}

export function localePath(l: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  return clean ? `/${l}/${clean}/` : `/${l}/`;
}

export function staticLocalePaths(): { params: { locale: Locale } }[] {
  return LOCALES.map((locale) => ({ params: { locale } }));
}
