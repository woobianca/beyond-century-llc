import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { RawTabs } from './types';

export type TabName = 'People' | 'Jobs' | 'Contact';
const TABS: [keyof RawTabs, TabName][] = [['people', 'People'], ['jobs', 'Jobs'], ['contact', 'Contact']];

/**
 * The single place that knows how a Sheet tab is downloaded. Note: gviz guesses a type per column
 * and can blank cells that do not match; if that shows up, switch to /export?format=csv&gid=<gid>.
 */
export function sheetCsvUrl(sheetId: string, tab: TabName): string {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?tqx=out:csv&headers=1&sheet=${tab}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchTab(sheetId: string, tab: TabName, fetchImpl: typeof fetch, retryDelayMs: number): Promise<string> {
  const notReadable = `Sheet tab "${tab}" could not be read. Is the Sheet shared as "Anyone with the link can view"?`;
  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (attempt > 1) await sleep(retryDelayMs);
    let res: Response;
    try {
      res = await fetchImpl(sheetCsvUrl(sheetId, tab));
    } catch (e) {
      lastError = (e as Error).message; // network error: retry
      continue;
    }
    const body = await res.text();
    if (!res.ok) {
      lastError = `HTTP ${res.status}`; // server error: retry
      continue;
    }
    const isCsv = (res.headers.get('content-type') ?? '').startsWith('text/csv') && !body.trimStart().startsWith('<');
    if (!isCsv) throw new Error(notReadable); // a sign-in page: retrying will not help
    return body;
  }
  throw new Error(`${notReadable} (${lastError})`);
}

export async function fetchRawTabs(sheetId: string, fetchImpl: typeof fetch = fetch, retryDelayMs = 1500): Promise<RawTabs> {
  const entries = await Promise.all(TABS.map(async ([key, tab]) => [key, await fetchTab(sheetId, tab, fetchImpl, retryDelayMs)] as const));
  return Object.fromEntries(entries) as RawTabs;
}

export async function readFixtureTabs(dir: string): Promise<RawTabs> {
  const read = (name: string) => readFile(path.resolve(dir, `${name}.csv`), 'utf8');
  const [people, jobs, contact] = await Promise.all([read('people'), read('jobs'), read('contact')]);
  return { people, jobs, contact };
}

export async function loadRawTabs(env: Record<string, string | undefined>, fetchImpl: typeof fetch = fetch): Promise<RawTabs> {
  if (env.SHEET_FIXTURE_DIR) return readFixtureTabs(env.SHEET_FIXTURE_DIR);
  if (env.SHEET_ID) return fetchRawTabs(env.SHEET_ID, fetchImpl);
  if (env.CONTEXT === 'production') throw new Error('SHEET_ID is not set. Add it in Netlify → Site configuration → Environment variables.');
  return readFixtureTabs('fixtures/default');
}
