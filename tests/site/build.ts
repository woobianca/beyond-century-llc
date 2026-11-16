import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';

const ROOT = path.resolve(__dirname, '../..');
const CACHE = path.join(ROOT, 'node_modules/.cache/site-tests');

export interface BuiltSite {
  outDir: string;
  /** Parsed HTML for a site path like '/en/people/' or '/404.html'. */
  page(sitePath: string): HTMLElement;
  /** Raw text of any built file by site path. */
  text(sitePath: string): string;
  exists(sitePath: string): boolean;
  /** All built files as site paths ('/en/index.html', ...). */
  files(): string[];
}

function fileFor(outDir: string, sitePath: string): string {
  const rel = sitePath.endsWith('/') ? `${sitePath}index.html` : sitePath;
  return path.join(outDir, rel);
}

function walk(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full, base) : ['/' + path.relative(base, full).split(path.sep).join('/')];
  });
}

const built = new Map<string, BuiltSite>();

/** Build the site with a fixture directory (relative to the project root). Throws with build output on failure. */
export async function buildSite(fixtureDir: string): Promise<BuiltSite> {
  const cachedSite = built.get(fixtureDir);
  if (cachedSite) return cachedSite;
  const outDir = path.join(CACHE, fixtureDir.replace(/[^a-z0-9-]/gi, '_'));
  if (!existsSync(path.join(outDir, '.complete'))) {
    try {
      execFileSync(path.join(ROOT, 'node_modules/.bin/astro'), ['build', '--outDir', outDir], {
        cwd: ROOT,
        env: { ...process.env, SHEET_FIXTURE_DIR: fixtureDir, SHEET_ID: '', CONTEXT: '' },
        stdio: 'pipe',
        encoding: 'utf8',
      });
    } catch (e) {
      const err = e as { stdout?: string; stderr?: string };
      throw new Error(`astro build failed for ${fixtureDir}:\n${err.stdout ?? ''}\n${err.stderr ?? ''}`);
    }
    execFileSync('touch', [path.join(outDir, '.complete')]);
  }
  const site: BuiltSite = {
    outDir,
    text: (p) => readFileSync(fileFor(outDir, p), 'utf8'),
    page: (p) => parse(readFileSync(fileFor(outDir, p), 'utf8')),
    exists: (p) => existsSync(fileFor(outDir, p)),
    files: () => walk(outDir).filter((f) => f !== '/.complete'),
  };
  built.set(fixtureDir, site);
  return site;
}
