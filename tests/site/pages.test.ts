import { beforeAll, describe, expect, test } from 'vitest';
import { buildSite, type BuiltSite } from './build';

const IDS = ['accounting', 'sec-reporting', 'ma', 'regulatory'];
let site: BuiltSite;
beforeAll(async () => {
  site = await buildSite('fixtures/default');
});

describe.each(['zh', 'en'] as const)('content pages (%s)', (l) => {
  test('services and about exist with one h1', () => {
    for (const p of ['services', 'about']) {
      expect(site.exists(`/${l}/${p}/`)).toBe(true);
      expect(site.page(`/${l}/${p}/`).querySelectorAll('h1')).toHaveLength(1);
    }
  });

  test('services page has the four anchored sections in order', () => {
    const ids = site.page(`/${l}/services/`).querySelectorAll('section[id]').map((s) => s.getAttribute('id'));
    expect(ids).toEqual(IDS);
  });

  test('home links each service to its anchor', () => {
    const hrefs = site.page(`/${l}/`).querySelectorAll('main a').map((a) => a.getAttribute('href') ?? '');
    for (const id of IDS) expect(hrefs).toContain(`/${l}/services/#${id}`);
  });

  test('home primary button goes to contact', () => {
    expect(site.page(`/${l}/`).querySelector('main a.btn')?.getAttribute('href')).toBe(`/${l}/contact/`);
  });

  test('every image has alt text and no page leaks undefined', () => {
    for (const p of ['', 'services/', 'about/']) {
      const doc = site.page(`/${l}/${p}`);
      for (const img of doc.querySelectorAll('img')) expect(img.getAttribute('alt')?.trim()).toBeTruthy();
      expect(doc.querySelector('body')!.text).not.toMatch(/undefined|\[object Object\]/);
    }
  });
});
