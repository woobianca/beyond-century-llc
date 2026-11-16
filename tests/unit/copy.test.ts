import { describe, expect, test } from 'vitest';
import { getCopy } from '../../src/i18n/copy';

function shape(value: unknown, path = ''): string[] {
  if (Array.isArray(value)) {
    return [`${path}[len=${value.length}]`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))];
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().flatMap((k) => shape((value as Record<string, unknown>)[k], `${path}.${k}`));
  }
  return [path];
}

function leaves(value: unknown): unknown[] {
  if (Array.isArray(value)) return value.flatMap(leaves);
  if (value && typeof value === 'object') return Object.values(value).flatMap(leaves);
  return [value];
}

describe('copy', () => {
  test('zh and en have identical shape', () => {
    expect(shape(getCopy('zh'))).toEqual(shape(getCopy('en')));
  });
  test('no empty strings in either language', () => {
    for (const l of ['zh', 'en'] as const) {
      for (const leaf of leaves(getCopy(l))) {
        expect(typeof leaf).toBe('string');
        expect((leaf as string).trim()).not.toBe('');
      }
    }
  });
  test('service ids are fixed and ordered', () => {
    for (const l of ['zh', 'en'] as const) {
      expect(getCopy(l).services.items.map((i) => i.id)).toEqual(['accounting', 'sec-reporting', 'ma', 'regulatory']);
    }
  });
});
