import { describe, expect, test } from 'vitest';
import { buildSite } from './build';

describe('people page with default data', () => {
  test.each(['zh', 'en'] as const)('three person cards in order (%s)', async (l) => {
    const doc = (await buildSite('fixtures/default')).page(`/${l}/people/`);
    const names = doc.querySelectorAll('.person h2').map((h) => h.text.trim());
    expect(names).toHaveLength(3);
    expect(names[0]).toContain('Susan Woo');
    expect(names[2]).toContain('Raymond Choy');
  });

  test('english page shows the english bio only', async () => {
    const text = (await buildSite('fixtures/default')).page('/en/people/').querySelector('main')!.text;
    expect(text).toContain('Susan Woo is a U.S. Certified Public Accountant');
    expect(text).not.toContain('Susan Woo 是美国注册会计师');
  });

  test.each([['zh', '高级会计师'], ['en', 'Senior Accountant']] as const)('join section lists the job (%s)', async (l, title) => {
    const join = (await buildSite('fixtures/default')).page(`/${l}/people/`).querySelector('section#join');
    expect(join).not.toBeNull();
    expect(join!.text).toContain(title);
  });
});

describe('people page without jobs', () => {
  test('no join section and no careers link anywhere', async () => {
    const site = await buildSite('fixtures/no-jobs');
    for (const l of ['zh', 'en']) expect(site.page(`/${l}/people/`).querySelector('#join')).toBeNull();
    for (const f of site.files().filter((f) => f.endsWith('.html'))) {
      const hrefs = site.page(f).querySelectorAll('a').map((a) => a.getAttribute('href') ?? '');
      expect(hrefs.some((h) => h.endsWith('#join')), f).toBe(false);
    }
  });
});

describe('people page with hostile Sheet input', () => {
  test('markup in a bio is shown as text, not run', async () => {
    const doc = (await buildSite('fixtures/hostile')).page('/en/people/');
    const first = doc.querySelectorAll('.person')[0];
    expect(first.text).toContain('Tom & Jerry <script>alert(1)</script> <b>bold</b>');
    expect(doc.querySelectorAll('script').some((s) => s.text.includes('alert(1)'))).toBe(false);
    expect(first.querySelector('b')).toBeNull();
  });

  test('unknown photo shows a placeholder tile', async () => {
    const second = (await buildSite('fixtures/hostile')).page('/en/people/').querySelectorAll('.person')[1];
    expect(second.querySelector('img')).toBeNull();
    expect(second.querySelector('.placeholder')).not.toBeNull();
  });
});

describe('people page with a broken Sheet', () => {
  test('the build fails and names the problem', async () => {
    await expect(buildSite('fixtures/broken')).rejects.toThrow('People: missing column "bio_en"');
  });
});
