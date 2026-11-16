import { csvHeaders, parseCsv } from './csv';
import type { ContactFacts, Job, Person, RawTabs, SiteData } from './types';

export class SheetError extends Error {
  problems: string[];
  constructor(problems: string[]) {
    super(`The website content Sheet has problems:\n- ${problems.join('\n- ')}`);
    this.name = 'SheetError';
    this.problems = problems;
  }
}

const PEOPLE_COLUMNS = ['order', 'photo', 'name_zh', 'name_en', 'title_zh', 'title_en', 'bio_zh', 'bio_en', 'show'];
const JOB_COLUMNS = ['title_zh', 'title_en', 'location_zh', 'location_en', 'description_zh', 'description_en', 'how_to_apply_zh', 'how_to_apply_en', 'show'];
const CONTACT_COLUMNS = ['key', 'value_zh', 'value_en'];
const CONTACT_KEYS = { us_address: 'usAddress', cn_address: 'cnAddress', phone: 'phone', email: 'email' } as const;

type Row = { data: Record<string, string>; line: number };

/** Returns rows with spreadsheet row numbers, or null when required columns are missing. */
function readTab(tab: string, text: string, columns: string[], problems: string[]): Row[] | null {
  const headers = csvHeaders(text);
  const missing = columns.filter((c) => !headers.includes(c));
  missing.forEach((c) => problems.push(`${tab}: missing column "${c}"`));
  if (missing.length) return null;
  return parseCsv(text)
    .map((data, i) => ({ data, line: i + 2 }))
    .filter((r) => Object.values(r.data).some((v) => (v ?? '').trim() !== ''));
}

const isShown = (r: Row) => (r.data.show ?? '').trim().toLowerCase() === 'yes';

function paragraphs(value: string): string[] {
  return value
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function requireFields(tab: string, row: Row, columns: string[], problems: string[]): boolean {
  let ok = true;
  for (const c of columns) {
    if (!(row.data[c] ?? '').trim()) {
      problems.push(`${tab} row ${row.line}: "${c}" is empty`);
      ok = false;
    }
  }
  return ok;
}

export function validateSheet(raw: RawTabs): SiteData {
  const problems: string[] = [];

  const people: Person[] = [];
  const peopleRows = readTab('People', raw.people, PEOPLE_COLUMNS, problems);
  for (const row of (peopleRows ?? []).filter(isShown)) {
    const ok = requireFields('People', row, PEOPLE_COLUMNS.filter((c) => c !== 'photo' && c !== 'show'), problems);
    const order = Number(row.data.order);
    if (row.data.order && !Number.isFinite(order)) problems.push(`People row ${row.line}: "order" is not a number`);
    if (!ok || !Number.isFinite(order)) continue;
    const d = row.data;
    people.push({
      order,
      photo: d.photo ?? '',
      name: { zh: d.name_zh, en: d.name_en },
      title: { zh: d.title_zh, en: d.title_en },
      bio: { zh: paragraphs(d.bio_zh), en: paragraphs(d.bio_en) },
    });
  }
  if (peopleRows && !peopleRows.some(isShown)) problems.push('People: no rows have show = yes');
  people.sort((a, b) => a.order - b.order);

  const jobs: Job[] = [];
  const jobRows = readTab('Jobs', raw.jobs, JOB_COLUMNS, problems);
  for (const row of (jobRows ?? []).filter(isShown)) {
    if (!requireFields('Jobs', row, JOB_COLUMNS.filter((c) => c !== 'show'), problems)) continue;
    const d = row.data;
    jobs.push({
      title: { zh: d.title_zh, en: d.title_en },
      location: { zh: d.location_zh, en: d.location_en },
      description: { zh: paragraphs(d.description_zh), en: paragraphs(d.description_en) },
      howToApply: { zh: paragraphs(d.how_to_apply_zh), en: paragraphs(d.how_to_apply_en) },
    });
  }

  const contact = {} as ContactFacts;
  const contactRows = readTab('Contact', raw.contact, CONTACT_COLUMNS, problems);
  if (contactRows) {
    for (const [key, field] of Object.entries(CONTACT_KEYS)) {
      const row = contactRows.find((r) => (r.data.key ?? '').trim().toLowerCase() === key);
      if (!row) {
        problems.push(`Contact: missing key "${key}"`);
        continue;
      }
      if (requireFields('Contact', row, ['value_zh', 'value_en'], problems)) {
        contact[field] = { zh: row.data.value_zh, en: row.data.value_en };
      }
    }
  }

  if (problems.length) throw new SheetError(problems);
  return { people, jobs, contact };
}
