import { beforeAll, describe, expect, test } from 'vitest';
import { buildSite, type BuiltSite } from './build';

const ORIGIN = 'https://www.beyondcenturyllc.com';
const NAV = {
  zh: ['首页', '服务', '关于卓越', '团队', '联系'],
  en: ['Home', 'Services', 'About', 'People', 'Contact'],
};
let site: BuiltSite;
beforeAll(async () => {
  site = await buildSite('fixtures/default');
});

describe.each(['zh', 'en'] as const)('page shell (%s)', (l) => {
  const home = () => site.page(`/${l}/`);

  test('html lang', () => {
    expect(home().querySelector('html')?.getAttribute('lang')).toBe(l === 'zh' ? 'zh-Hans' : 'en');
  });

  test('one h1, title, description, canonical', () => {
    const doc = home();
    expect(doc.querySelectorAll('h1')).toHaveLength(1);
    expect(doc.querySelector('title')?.text.trim()).not.toBe('');
    expect(doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim()).toBeTruthy();
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(`${ORIGIN}/${l}/`);
  });

  test('hreflang alternates', () => {
    const alts = home().querySelectorAll('link[rel="alternate"][hreflang]');
    const map = Object.fromEntries(alts.map((a) => [a.getAttribute('hreflang'), a.getAttribute('href')]));
    expect(Object.keys(map).sort()).toEqual(['en', 'x-default', 'zh-Hans']);
    expect(map['x-default']).toBe(map.en);
    expect(map.en).toBe(`${ORIGIN}/en/`);
    expect(map['zh-Hans']).toBe(`${ORIGIN}/zh/`);
  });

  test('header nav has the five links in order', () => {
    const links = home().querySelectorAll('header nav.primary a');
    expect(links.map((a) => a.text.trim())).toEqual(NAV[l]);
  });

  test('language switch links to the other locale', () => {
    const other = l === 'zh' ? '/en/' : '/zh/';
    expect(home().querySelector('header a.lang')?.getAttribute('href')).toBe(other);
  });

  test('footer has the current year and the careers link', () => {
    const footer = home().querySelector('footer')!;
    expect(footer.text).toContain(String(new Date().getFullYear()));
    expect(footer.querySelectorAll('a').some((a) => (a.getAttribute('href') ?? '').endsWith('/people/#join'))).toBe(true);
  });
});

describe('no third-party requests', () => {
  test('no Google Fonts, reCAPTCHA or analytics anywhere in the build', () => {
    for (const f of site.files().filter((f) => /\.(html|css|js)$/.test(f))) {
      expect(site.text(f), f).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com|recaptcha|google-analytics/);
    }
  });

  test('no cross-origin scripts', () => {
    for (const f of site.files().filter((f) => f.endsWith('.html'))) {
      for (const s of site.page(f).querySelectorAll('script[src]')) {
        expect(s.getAttribute('src'), f).toMatch(/^\//);
      }
    }
  });
});
