import { beforeAll, describe, expect, test } from 'vitest';
import { gzipSync } from 'node:zlib';
import { buildSite, type BuiltSite } from './build';

let site: BuiltSite;
beforeAll(async () => {
  site = await buildSite('fixtures/default');
});

describe('font and CSS weight', () => {
  test.each(['/zh/', '/en/people/'])('CSS linked from %s is under 40 KB gzipped', (p) => {
    const hrefs = site.page(p).querySelectorAll('link[rel="stylesheet"]').map((l) => l.getAttribute('href')!);
    const inline = site.page(p).querySelectorAll('style').map((el) => el.text).join('');
    const total = hrefs.reduce((n, h) => n + gzipSync(site.text(h)).length, gzipSync(inline).length);
    expect(total).toBeLessThan(40_000);
  });

  test('no Cyrillic, Greek or Vietnamese font subsets are shipped', () => {
    const css = site.files().filter((f) => f.endsWith('.css')).map((f) => site.text(f)).join('');
    expect(css).not.toMatch(/U\+0301,\s*U\+0400|U\+0370|U\+1EA0/i);
  });
});

describe('line breaks inside Sheet cells', () => {
  test('bios and job text keep single line breaks', () => {
    // Small stylesheets are inlined by Astro, so look in both the CSS files and the page's <style> tags.
    const css = site.files().filter((f) => f.endsWith('.css')).map((f) => site.text(f)).join('')
      + site.page('/en/people/').querySelectorAll('style').map((el) => el.text).join('');
    expect(css).toMatch(/white-space:\s*pre-line/);
    const job = site.page('/en/people/').querySelector('#join .job .prose p')!;
    expect(job.classList.contains('cell')).toBe(true);
    const bio = site.page('/en/people/').querySelector('.person .bio p')!;
    expect(bio.classList.contains('cell')).toBe(true);
  });
});
