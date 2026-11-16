import { describe, expect, test } from 'vitest';
import { resolvePhoto } from '../../src/data/photos';

describe('resolvePhoto', () => {
  test('exact file name resolves', () => {
    expect(resolvePhoto('susan.png')).not.toBeNull();
  });
  test('file name match ignores case', () => {
    expect(resolvePhoto('SUSAN.PNG')).not.toBeNull();
  });
  test('unknown file name gives null', () => {
    expect(resolvePhoto('nobody.png')).toBeNull();
  });
  test('blank file name gives null', () => {
    expect(resolvePhoto('')).toBeNull();
  });
});
