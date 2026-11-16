import { describe, expect, test } from 'vitest';
import { localePath, otherLocale, staticLocalePaths, HTML_LANG } from '../../src/i18n/locales';

describe('locale helpers', () => {
  test('localePath builds trailing-slash paths', () => {
    expect(localePath('zh', 'people')).toBe('/zh/people/');
    expect(localePath('en')).toBe('/en/');
    expect(localePath('en', '/about/')).toBe('/en/about/');
  });
  test('otherLocale flips', () => {
    expect(otherLocale('zh')).toBe('en');
    expect(otherLocale('en')).toBe('zh');
  });
  test('static paths cover both locales', () => {
    expect(staticLocalePaths()).toHaveLength(2);
  });
  test('html lang values', () => {
    expect(HTML_LANG).toEqual({ zh: 'zh-Hans', en: 'en' });
  });
});
