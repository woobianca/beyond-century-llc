import { beforeAll, describe, expect, test } from 'vitest';
import { buildSite, type BuiltSite } from './build';
import { validateSheet } from '../../src/data/validate';
import { readFixtureTabs } from '../../src/data/source';
import type { SiteData } from '../../src/data/types';

let site: BuiltSite;
let data: SiteData;
beforeAll(async () => {
  site = await buildSite('fixtures/default');
  data = validateSheet(await readFixtureTabs('fixtures/default'));
});

describe.each(['zh', 'en'] as const)('contact page (%s)', (l) => {
  const doc = () => site.page(`/${l}/contact/`);

  test('one Netlify form posting to the thanks page', () => {
    const forms = doc().querySelectorAll('form[name="contact"][data-netlify="true"]');
    expect(forms).toHaveLength(1);
    expect(forms[0].getAttribute('method')?.toUpperCase()).toBe('POST');
    expect(forms[0].getAttribute('action')).toBe(`/${l}/thanks/`);
  });

  test('form has the agreed field names', () => {
    const names = doc().querySelectorAll('form[name="contact"] [name]').map((e) => e.getAttribute('name'));
    for (const n of ['name', 'phone', 'email', 'message', 'form-name', 'locale', 'company-site']) expect(names).toContain(n);
    expect(doc().querySelector('input[name="form-name"]')?.getAttribute('value')).toBe('contact');
    expect(doc().querySelector('input[name="locale"]')?.getAttribute('value')).toBe(l);
  });

  test('required fields and email type', () => {
    for (const n of ['name', 'email', 'message']) {
      expect(doc().querySelector(`[name="${n}"]`)?.hasAttribute('required'), n).toBe(true);
    }
    expect(doc().querySelector('input[name="email"]')?.getAttribute('type')).toBe('email');
  });

  test('every visible field has a matching label', () => {
    for (const n of ['name', 'phone', 'email', 'message']) {
      const id = doc().querySelector(`[name="${n}"]`)?.getAttribute('id');
      expect(id, n).toBeTruthy();
      expect(doc().querySelector(`label[for="${id}"]`), n).not.toBeNull();
    }
  });

  test('offices from the Sheet, with phone and email links', () => {
    const text = doc().querySelector('main')!.text;
    expect(text).toContain(data.contact.usAddress[l]);
    expect(text).toContain(data.contact.cnAddress[l]);
    expect(doc().querySelector('main a[href^="tel:"]')).not.toBeNull();
    expect(doc().querySelector('main a[href^="mailto:"]')).not.toBeNull();
  });

  test('thanks page exists and is not indexed', () => {
    expect(site.exists(`/${l}/thanks/`)).toBe(true);
    expect(site.page(`/${l}/thanks/`).querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });
});
