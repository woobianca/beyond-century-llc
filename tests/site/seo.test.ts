import { readFileSync } from 'node:fs';
import { beforeAll, describe, expect, test } from 'vitest';
import { buildSite, type BuiltSite } from './build';

const ORIGIN = 'https://www.beyondcenturyllc.com';
const REDIRECTS = readFileSync('public/_redirects', 'utf8');
let site: BuiltSite;
beforeAll(async () => {
  site = await buildSite('fixtures/default');
});

function jsonLd(path: string, s = site): Record<string, unknown>[] {
  return s.page(path).querySelectorAll('script[type="application/ld+json"]').flatMap((el) => {
    const parsed = JSON.parse(el.text);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

describe('search setup', () => {
  test('sitemap lists the ten content pages and no thanks pages', () => {
    const xml = site.files().filter((f) => /^\/sitemap-\d+\.xml$/.test(f)).map((f) => site.text(f)).join('');
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]).sort();
    const expected = ['zh', 'en'].flatMap((l) => ['', 'services/', 'about/', 'people/', 'contact/'].map((p) => `${ORIGIN}/${l}/${p}`)).sort();
    expect(urls).toEqual(expected);
    expect(site.exists('/sitemap-index.xml')).toBe(true);
  });

  test('robots.txt allows all and points to the sitemap', () => {
    const robots = site.text('/robots.txt');
    expect(robots).toContain(`Sitemap: ${ORIGIN}/sitemap-index.xml`);
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
  });

  test('_redirects is published unchanged', () => {
    expect(site.text('/_redirects')).toBe(REDIRECTS);
    expect(REDIRECTS).toContain('/member   /en/people/     301');
  });

  test.each(['/zh/', '/en/', '/en/services/', '/zh/contact/'])('%s has organization data', (p) => {
    const org = jsonLd(p).find((o) => o['@type'] === 'AccountingService');
    expect(org).toBeTruthy();
    expect(JSON.stringify(org)).toContain('Diamond Bar');
  });

  test('people page describes each person and job', () => {
    const items = jsonLd('/en/people/');
    expect(items.filter((o) => o['@type'] === 'Person')).toHaveLength(3);
    expect(items.filter((o) => o['@type'] === 'JobPosting')).toHaveLength(1);
  });

  test('no job postings in structured data when there are no jobs', async () => {
    const noJobs = await buildSite('fixtures/no-jobs');
    expect(jsonLd('/en/people/', noJobs).filter((o) => o['@type'] === 'JobPosting')).toHaveLength(0);
  });

  test('a 404 page exists', () => {
    expect(site.exists('/404.html')).toBe(true);
  });
});
