import { rmSync } from 'node:fs';
import path from 'node:path';

/** Clear cached builds once per test run so every run builds from current source. */
export default function setup() {
  rmSync(path.resolve(__dirname, '../../node_modules/.cache/site-tests'), { recursive: true, force: true });
}
