import { describe, expect, test } from 'vitest';
import { fetchRawTabs, loadRawTabs, sheetCsvUrl } from '../../src/data/source';

const csv = (body: string, status = 200) =>
  new Response(body, { status, headers: { 'content-type': 'text/csv; charset=utf-8' } });

function stub(responder: (tab: string, call: number) => Response) {
  const calls: Record<string, number> = {};
  const impl = (async (url: string | URL) => {
    const tab = new URL(String(url)).searchParams.get('sheet')!;
    calls[tab] = (calls[tab] ?? 0) + 1;
    return responder(tab, calls[tab]);
  }) as typeof fetch;
  return { impl, calls };
}

describe('sheet source', () => {
  test('sheetCsvUrl uses the gviz CSV endpoint for a named tab', () => {
    expect(sheetCsvUrl('abc', 'People')).toBe(
      'https://docs.google.com/spreadsheets/d/abc/gviz/tq?tqx=out:csv&headers=1&sheet=People',
    );
  });

  test('fetchRawTabs returns the text of all three tabs', async () => {
    const { impl } = stub((tab) => csv(`tab,${tab}`));
    expect(await fetchRawTabs('abc', impl, 0)).toEqual({ people: 'tab,People', jobs: 'tab,Jobs', contact: 'tab,Contact' });
  });

  test('an HTML sign-in page is rejected as not shared', async () => {
    const { impl } = stub(() => new Response('<!DOCTYPE html><html>Sign in</html>', { status: 200, headers: { 'content-type': 'text/html' } }));
    await expect(fetchRawTabs('abc', impl, 0)).rejects.toThrow(/could not be read/);
  });

  test('transient errors are retried up to three times', async () => {
    const { impl, calls } = stub((tab, n) => (tab === 'People' && n < 3 ? csv('oops', 500) : csv('a,b')));
    await expect(fetchRawTabs('abc', impl, 0)).resolves.toBeTruthy();
    expect(calls.People).toBe(3);
  });

  test('production builds require SHEET_ID', async () => {
    await expect(loadRawTabs({ CONTEXT: 'production' })).rejects.toThrow('SHEET_ID is not set');
  });

  test('local builds without SHEET_ID use the default fixtures', async () => {
    const raw = await loadRawTabs({});
    expect(raw.people).toContain('Susan Woo');
  });

  test('SHEET_FIXTURE_DIR selects a fixture set', async () => {
    const raw = await loadRawTabs({ SHEET_FIXTURE_DIR: 'fixtures/no-jobs' });
    expect(raw.jobs.trim().split('\n')).toHaveLength(1);
  });
});
