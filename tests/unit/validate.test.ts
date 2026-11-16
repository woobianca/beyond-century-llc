import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { SheetError, validateSheet } from '../../src/data/validate';
import type { RawTabs } from '../../src/data/types';

const read = (dir: string): RawTabs => ({
  people: readFileSync(`fixtures/${dir}/people.csv`, 'utf8'),
  jobs: readFileSync(`fixtures/${dir}/jobs.csv`, 'utf8'),
  contact: readFileSync(`fixtures/${dir}/contact.csv`, 'utf8'),
});
const base = read('default');
const PEOPLE_HEAD = 'order,photo,name_zh,name_en,title_zh,title_en,bio_zh,bio_en,show';
const person = (order: string, bioEn: string, show: string) =>
  `${order},p.png,甲,A,职,Title,中文,${bioEn},${show}`;

function problems(raw: RawTabs): string[] {
  try {
    validateSheet(raw);
  } catch (e) {
    expect(e).toBeInstanceOf(SheetError);
    return (e as SheetError).problems;
  }
  throw new Error('expected validateSheet to throw');
}

describe('validateSheet', () => {
  test('default fixtures: shown people sorted, one job, contact facts', () => {
    const data = validateSheet(base);
    expect(data.people.map((p) => p.name.en)).toEqual(['Susan Woo, CPA', 'Miranda Sun, CPA', 'Raymond Choy, CPA, CGMA']);
    expect(data.jobs).toHaveLength(1);
    expect(data.contact.phone.en).toContain('909');
  });

  test('no-jobs fixtures give an empty job list', () => {
    expect(validateSheet(read('no-jobs')).jobs).toEqual([]);
  });

  test('broken fixtures report the missing column', () => {
    expect(problems(read('broken'))).toContain('People: missing column "bio_en"');
  });

  test('shown person with empty bio_en is reported by spreadsheet row', () => {
    const people = [PEOPLE_HEAD, person('1', 'ok', 'yes'), person('2', '', 'yes')].join('\n');
    expect(problems({ ...base, people })).toContain('People row 3: "bio_en" is empty');
  });

  test('hidden rows are not validated', () => {
    const people = [PEOPLE_HEAD, person('1', 'ok', 'yes'), person('2', '', 'no')].join('\n');
    expect(validateSheet({ ...base, people }).people).toHaveLength(1);
  });

  test('show is trimmed and case-insensitive; blank means no', () => {
    const people = [PEOPLE_HEAD, person('1', 'a', 'Yes'), person('2', 'b', ' YES '), person('3', 'c', 'yes'), person('4', 'd', ''), person('5', 'e', 'no')].join('\n');
    expect(validateSheet({ ...base, people }).people.map((p) => p.order)).toEqual([1, 2, 3]);
  });

  test('fully blank rows are skipped', () => {
    const people = [PEOPLE_HEAD, person('2', 'b', 'yes'), ',,,,,,,,', person('1', 'a', 'yes')].join('\n');
    expect(validateSheet({ ...base, people }).people.map((p) => p.order)).toEqual([1, 2]);
  });

  test('multi-paragraph cells split on blank lines', () => {
    const people = [PEOPLE_HEAD, person('1', '"a\r\n\r\nb\n\n\n c "', 'yes')].join('\n');
    expect(validateSheet({ ...base, people }).people[0].bio.en).toEqual(['a', 'b', 'c']);
  });

  test('wrong tab content is caught by header check', () => {
    expect(problems({ ...base, jobs: base.people })).toContain('Jobs: missing column "location_zh"');
  });

  test('missing contact key is reported', () => {
    const contact = base.contact.split('\n').filter((l) => !l.startsWith('email')).join('\n');
    expect(problems({ ...base, contact })).toContain('Contact: missing key "email"');
  });

  test('order must be a number', () => {
    const people = [PEOPLE_HEAD, person('first', 'a', 'yes')].join('\n');
    expect(problems({ ...base, people })).toContain('People row 2: "order" is not a number');
  });

  test('all problems are reported together', () => {
    const contact = base.contact.split('\n').filter((l) => !l.startsWith('email')).join('\n');
    const p = problems({ ...read('broken'), contact });
    expect(p).toContain('People: missing column "bio_en"');
    expect(p).toContain('Contact: missing key "email"');
  });
});
