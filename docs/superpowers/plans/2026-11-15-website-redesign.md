# Beyond Century Website v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the v2 Vue site with a bilingual static site in the "A · Ledger" design whose bios, job postings and contact facts are edited in a Google Sheet.

**Architecture:** An Astro static site renders every page for `zh` and `en` from typed copy files in the repository. At build time a small data module downloads three tabs of a Google Sheet as CSV, validates them, and hands typed data to the People and Contact pages; a failed validation fails the build so Netlify keeps the previous deploy. A Google Apps Script menu in the Sheet calls a Netlify build hook to publish.

**Tech Stack:** Astro 7.4.x (static output, no client framework), TypeScript, plain CSS custom properties, Fontsource self-hosted fonts, `csv-parse`, `@astrojs/sitemap`, Vitest 5, `node-html-parser` (tests only), Netlify (hosting, Forms, build hooks), Google Apps Script.

**Spec:** `docs/superpowers/specs/2026-11-15-website-redesign-design.md`. Approved visual reference: `.superpowers/brainstorm/27897-1794799547/content/design-directions.html`, tab A. Read both before starting any task.

## Global Constraints

- Node `>=22.23.4` (Astro 7.4.12 requires it; the machine currently defaults to Node 20.20.0). Pin with `.nvmrc` containing `22` and `NODE_VERSION = "22"` in `netlify.toml`.
- Astro 7 is newer than most reference material. Before using any Astro API (config, `astro:assets`, sitemap integration), check the current docs at docs.astro.build; do not rely on memory.
- Locales are exactly `zh` and `en`. Every page exists at `/zh/<path>/` and `/en/<path>/`. HTML `lang` is `zh-Hans` or `en`.
- Production origin: `https://www.beyondcenturyllc.com`.
- No third-party requests at runtime: no Google Fonts, no reCAPTCHA, no analytics, no external scripts.
- Every page shows its full content with JavaScript disabled. No client framework; no `<script>` is needed for content or navigation.
- Color tokens, verbatim: paper `#f6f2ea`, paper-2 `#ece5d6`, ink `#14213a`, mute `#5d6577`, rule `#cfc6b3`, accent `#96652f`.
- Type: Noto Serif SC 600 (Chinese headings), Newsreader 400 (English headings), Inter + Noto Sans SC (UI text). Square corners; no shadows, gradients or carousels.
- Single column below 860px; no horizontal scroll at 360px.
- Firm names: `卓越咨询` (zh wordmark), `Beyond Century` (en wordmark), legal name `Beyond Century Consulting, LLC`.
- Navigation labels: 首页 / 服务 / 关于卓越 / 团队 / 联系 and Home / Services / About / People / Contact.
- Only two files may contain host-specific behavior: `src/components/ContactForm.astro` (Netlify Forms attributes) and `sheet/Code.gs` (build hook call). `netlify.toml` and `public/_redirects` are host config.
- The v2 source is reference material only, extracted at `<scratchpad>/v2-source` (re-extract from `~/Downloads/source-683e73b7e0503100086a27a7-f18106b674d32117.zip` if missing). Never copy its credentials, `router/`, or `app.js`.
- Git: work on branch `v3` of `https://github.com/woobianca/beyond-century-llc` (its `master` holds an unrelated 2019 site; leave it untouched). Commit after every task. Do not push or change the default branch without the owner's go-ahead.

## Review Focus

1. **Renamed or missing Sheet tab.** Google's CSV endpoint silently returns the first tab when the named tab does not exist. Expected: the build fails naming the tab, never publishes People data as Jobs. (Task 3 header check, Task 4.)
2. **Sheet not link-shared.** Google answers 200 with an HTML sign-in page. Expected: the build fails with "Sheet is not shared for viewing", not a CSV parse of HTML. (Task 4.)
3. **Sloppy cell input.** `Yes`, ` YES `, blank `show`, trailing spaces, fully blank rows, Windows line endings in bios. Expected: trimmed, case-insensitive, blank rows skipped, blank `show` treated as `no`. (Task 3.)
4. **Markup in cells.** A bio containing `<script>`, `&`, or `<b>`. Expected: shown as literal text, never interpreted. (Task 7.)
5. **Photo file name that matches nothing** (typo, wrong case, new hire). Expected: neutral placeholder tile, build succeeds, one warning in the build log. (Task 7.)

---

## File Structure

```
.nvmrc  .gitignore  package.json  astro.config.mjs  tsconfig.json  netlify.toml  vitest.config.ts
public/_redirects  public/robots.txt  public/favicon.svg
sheet/Code.gs                      Apps Script source (pasted into the Sheet)
sheet/README.md                    How the Sheet is set up
fixtures/default/{people,jobs,contact}.csv     3 people, 1 job
fixtures/no-jobs/{people,jobs,contact}.csv     jobs.csv has headers only
fixtures/broken/{people,jobs,contact}.csv      people.csv lacks bio_en column
src/i18n/locales.ts                locale list and path helpers
src/i18n/copy.ts                   Copy type + getCopy()
src/i18n/zh.ts  src/i18n/en.ts     all in-code wording
src/data/types.ts                  SiteData types
src/data/csv.ts                    CSV text -> rows
src/data/validate.ts               rows -> SiteData, or SheetError
src/data/source.ts                 fixture or Google download
src/data/site-data.ts              loadSiteData() (memoized)
src/data/photos.ts                 photo file name -> image import
src/assets/people/*.png            portraits copied from v2
src/styles/tokens.css  src/styles/global.css
src/layouts/Base.astro             <html>, head, header, footer
src/components/{Seo,JsonLd,Header,Footer,LangSwitch,Hero,FactColumn,ServiceRows,QuoteBand,PersonCard,JoinUs,ContactForm,Offices}.astro
src/pages/[locale]/{index,services,about,people,contact,thanks}.astro
src/pages/404.astro
tests/unit/*.test.ts               pure-function tests
tests/site/*.test.ts               assertions on built dist/ HTML
tests/site/build.ts                helper: build with a fixture dir, load pages
docs/copy-review.md                side-by-side wording for Raymond
```

---

### Task 1: Repository and toolchain

**Files:** Create `.nvmrc`, `.gitignore`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `netlify.toml`, `vitest.config.ts`, `src/pages/index.astro` (temporary placeholder), `tests/unit/smoke.test.ts`.

**Interfaces:**
- Produces: npm scripts `dev`, `build` (`astro build`), `test` (`vitest run tests/unit`), `test:site` (`vitest run tests/site`), `check` (`astro check`). `astro.config.mjs` sets `site: 'https://www.beyondcenturyllc.com'`, `output: 'static'`, `trailingSlash: 'always'`, `build.format: 'directory'`.

- [ ] **Step 1:** In the project folder run `git init -b v3`, `git remote add origin https://github.com/woobianca/beyond-century-llc`. Write `.gitignore` with `node_modules/`, `dist/`, `.astro/`, `.env`, `.superpowers/`, `.DS_Store`.
- [ ] **Step 2:** Write `.nvmrc` (`22`); run `nvm install 22 && nvm use 22`; confirm `node -v` is `>= 22.23.4`.
- [ ] **Step 3:** Install: `astro@^7.4.12`, `@astrojs/sitemap`, `@astrojs/check`, `typescript`, `csv-parse`; dev: `vitest@^5`, `node-html-parser`. Use exact versions npm resolves and commit `package-lock.json`.
- [ ] **Step 4:** Write `netlify.toml`: `[build] command = "npm run build"`, `publish = "dist"`, `[build.environment] NODE_VERSION = "22"`.
- [ ] **Step 5:** Write `tests/unit/smoke.test.ts` asserting `1 + 1 === 2`; write the placeholder page with `<h1>Beyond Century</h1>`.
- [ ] **Step 6:** Run `npm test` (PASS, 1 test) and `npm run build` (exit 0, `dist/index.html` exists).
- [ ] **Step 7:** Commit: `chore: scaffold Astro 7 project on Node 22`. The commit includes `docs/`.

### Task 2: Locales and copy structure

**Files:** Create `src/i18n/locales.ts`, `src/i18n/copy.ts`, `src/i18n/zh.ts`, `src/i18n/en.ts`, `tests/unit/locales.test.ts`, `tests/unit/copy.test.ts`.

**Interfaces — Produces:**

```ts
// locales.ts
export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const HTML_LANG: Record<Locale, string>;      // { zh: 'zh-Hans', en: 'en' }
export function otherLocale(l: Locale): Locale;
export function localePath(l: Locale, path?: string): string;  // ('zh','people') -> '/zh/people/', ('en') -> '/en/'
export function staticLocalePaths(): { params: { locale: Locale } }[];  // for getStaticPaths
export type Localized<T = string> = Record<Locale, T>;

// copy.ts
export interface Copy {
  meta: Record<'home'|'services'|'about'|'people'|'contact'|'thanks'|'notFound', { title: string; description: string }>;
  nav: { home: string; services: string; about: string; people: string; contact: string; menu: string; careers: string };
  brand: { wordmark: string; wordmarkSub: string; legalName: string };
  home: { eyebrow: string; headline: string; lede: string; ctaPrimary: string; ctaSecondary: string;
          facts: { value: string; label: string }[]; servicesHeading: string; servicesSub: string;
          quote: string; quoteName: string; quoteTitle: string; contactPrompt: string };
  services: { heading: string; intro: string;
              items: { id: 'accounting'|'sec-reporting'|'ma'|'regulatory'; title: string; summary: string; body: string[] }[] };
  about: { heading: string; sections: { heading: string; body: string[] }[] };
  people: { heading: string; intro: string; joinHeading: string; joinIntro: string; location: string; howToApply: string };
  contact: { heading: string; intro: string;
             form: { name: string; phone: string; email: string; message: string; submit: string };
             offices: { us: string; cn: string; phone: string; email: string } };
  thanks: { heading: string; body: string; back: string };
  notFound: { heading: string; body: string };
  footer: { rights: string };
}
export function getCopy(l: Locale): Copy;
```

- [ ] **Step 1:** Write `locales.test.ts`: `localePath('zh','people') === '/zh/people/'`; `localePath('en') === '/en/'`; `localePath('en','/about/') === '/en/about/'`; `otherLocale('zh') === 'en'`; `staticLocalePaths()` has length 2.
- [ ] **Step 2:** Write `copy.test.ts`: a recursive helper `shape(obj)` returns sorted key paths with array lengths; assert `shape(getCopy('zh'))` deep-equals `shape(getCopy('en'))`; assert no string leaf in either is empty; assert `services.items` ids are exactly `['accounting','sec-reporting','ma','regulatory']` in both.
- [ ] **Step 3:** Run `npm test`; expect FAIL (modules missing).
- [ ] **Step 4:** Implement `locales.ts` and `copy.ts`. Fill `zh.ts` and `en.ts` with working-draft wording: start from the mockup's tab A text and from v2's `src/lang/zh-CN/index.js` and `src/lang/en/index.js` (the source of the About and service body text). Wording is finalized in Task 10; here it must be complete and sensible, not final.
- [ ] **Step 5:** Run `npm test`; expect PASS. Commit: `feat: locale helpers and bilingual copy structure`.

### Task 3: Sheet data parsing and validation

**Files:** Create `src/data/types.ts`, `src/data/csv.ts`, `src/data/validate.ts`, `fixtures/default/*.csv`, `fixtures/no-jobs/*.csv`, `fixtures/broken/*.csv`, `tests/unit/validate.test.ts`.

**Interfaces — Produces:**

```ts
// types.ts
import type { Localized } from '../i18n/locales';
export interface Person { order: number; photo: string; name: Localized; title: Localized; bio: Localized<string[]> }
export interface Job { title: Localized; location: Localized; description: Localized<string[]>; howToApply: Localized<string[]> }
export interface ContactFacts { usAddress: Localized; cnAddress: Localized; phone: Localized; email: Localized }
export interface SiteData { people: Person[]; jobs: Job[]; contact: ContactFacts }
export type RawTabs = { people: string; jobs: string; contact: string };   // CSV text per tab

// csv.ts
export function parseCsv(text: string): Record<string, string>[];  // header row -> keys; all values trimmed

// validate.ts
export class SheetError extends Error { problems: string[] }
export function validateSheet(raw: RawTabs): SiteData;   // throws SheetError listing every problem
```

Exact column headers (lower-case, validated as a set per tab):
- People: `order, photo, name_zh, name_en, title_zh, title_en, bio_zh, bio_en, show`
- Jobs: `title_zh, title_en, location_zh, location_en, description_zh, description_en, how_to_apply_zh, how_to_apply_en, show`
- Contact: `key, value_zh, value_en` with required keys `us_address, cn_address, phone, email`

Rules: a row whose cells are all blank is skipped. `show` is `yes` only when the trimmed, lower-cased value is `yes`; rows not shown are dropped **before** validation. For shown rows every column except `photo` is required in both languages. `order` must parse as a number; people are sorted ascending. Multi-paragraph cells split on one or more blank lines after normalizing `\r\n`; empty paragraphs dropped. Problem messages read `<Tab> row <n>: "<column>" is empty` (n is the spreadsheet row number, header = 1) or `<Tab>: missing column "<column>"` or `Contact: missing key "<key>"`.

Fixture content: `default` people are Susan Woo (CPA, Partner; bio from v2 lang files), Miranda Suen and Raymond Choy (titles and bios from v2 lang files), photos `susan.png`, `miranda-suen.png`, `raymond-choy.png`; one job (a plausible "Senior Accountant / 高级会计师" in Diamond Bar, clearly sample text); contact uses the addresses and phone from the v2 Contact page and `info@beyondcenturyllc.com` as a placeholder email.

- [ ] **Step 1:** Write the three fixture sets.
- [ ] **Step 2:** Write `validate.test.ts` with these cases:
  - default fixtures → 3 people sorted by `order`, 1 job, `contact.phone.en` contains `909`.
  - `no-jobs` → `jobs` is `[]`, no throw.
  - `broken` → throws `SheetError` whose `problems` includes `People: missing column "bio_en"`.
  - shown person with empty `bio_en` → problem `People row 3: "bio_en" is empty`.
  - same row with `show` = `no` → no throw, person absent.
  - `show` values `Yes`, ` YES `, `yes` are shown; blank and `no` are not.
  - a fully blank row between two people is ignored.
  - bio `"a\r\n\r\nb\n\n\n c "` → `['a','b','c']`.
  - Jobs tab given the People CSV (wrong tab) → problem `Jobs: missing column "location_zh"`.
  - Contact without the `email` row → `Contact: missing key "email"`.
  - two separate problems are both reported in one throw.
- [ ] **Step 3:** Run `npm test`; expect FAIL. Implement `parseCsv` with `csv-parse/sync` (`columns: true`, `bom: true`, `skip_empty_lines: true`, `trim: true`) and `validateSheet`. Run; expect PASS.
- [ ] **Step 4:** Commit: `feat: validate Sheet tabs into typed site data`.

### Task 4: Loading data at build time

**Files:** Create `src/data/source.ts`, `src/data/site-data.ts`, `tests/unit/source.test.ts`.

**Interfaces:**
- Consumes: `RawTabs`, `validateSheet`, `SiteData` (Task 3).
- Produces:

```ts
// source.ts
export function sheetCsvUrl(sheetId: string, tab: 'People'|'Jobs'|'Contact'): string;
// -> https://docs.google.com/spreadsheets/d/<id>/gviz/tq?tqx=out:csv&headers=1&sheet=<Tab>
export async function fetchRawTabs(sheetId: string, fetchImpl?: typeof fetch): Promise<RawTabs>;
export async function readFixtureTabs(dir: string): Promise<RawTabs>;
export async function loadRawTabs(env: Record<string, string | undefined>, fetchImpl?: typeof fetch): Promise<RawTabs>;

// site-data.ts
export function loadSiteData(): Promise<SiteData>;   // memoized per build; uses process.env
```

Environment rules for `loadRawTabs`: if `SHEET_FIXTURE_DIR` is set, read that directory (tests). Else if `SHEET_ID` is set, download. Else if `CONTEXT === 'production'` (Netlify's variable) throw `SHEET_ID is not set`. Else read `fixtures/default`.

`fetchRawTabs`: each tab is fetched up to 3 times with a short pause; a non-200 status, or a body that starts with `<` (after trimming), or a `content-type` that is not `text/csv`, throws `Sheet tab "<Tab>" could not be read. Is the Sheet shared as "Anyone with the link can view"?`.

Known hazard: Google's `gviz` CSV output guesses a type per column and can blank cells that do not match (for example text in a mostly numeric column). `sheetCsvUrl` is the single place that knows the URL shape; if Task 11 Step 6 shows missing cells, switch it to `/export?format=csv&gid=<gid>` with per-tab gid environment variables and update this test.

- [ ] **Step 1:** Write `source.test.ts` with a stub `fetchImpl`: URL for `('abc','People')` equals the string above with `abc` and `People`; three CSV responses → three tab texts; an HTML body with status 200 → rejects with a message containing `could not be read`; status 500 twice then 200 → resolves and the stub was called 3 times for that tab; `loadRawTabs({ CONTEXT: 'production' })` rejects with `SHEET_ID is not set`; `loadRawTabs({})` returns the default fixtures; `loadRawTabs({ SHEET_FIXTURE_DIR: 'fixtures/no-jobs' })` returns a jobs tab with one line.
- [ ] **Step 2:** Run; expect FAIL. Implement. Run; expect PASS.
- [ ] **Step 3:** Commit: `feat: load Sheet data from Google or fixtures at build time`.

### Task 5: Design system, layout and page shell

**Files:** Create `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/{Seo,Header,Footer,LangSwitch}.astro`, `public/favicon.svg`, `src/pages/[locale]/index.astro` (shell only), `tests/site/build.ts`, `tests/site/shell.test.ts`. Delete the placeholder `src/pages/index.astro`.

**Interfaces:**
- Consumes: Task 2 exports; `loadSiteData()` (Footer needs `contact` and `jobs.length`).
- Produces:
  - `Base.astro` props: `{ locale: Locale; page: keyof Copy['meta']; path: string }` where `path` is the locale-less path (`''`, `'services'`, …). It renders `<html lang>`, `Seo`, `Header`, `<main><slot/></main>`, `Footer`.
  - `Seo.astro`: title, meta description, canonical, `hreflang` links for `zh-Hans`, `en`, and `x-default` (→ en), Open Graph title/description/url/locale.
  - `tests/site/build.ts`: `buildSite(fixtureDir: string): Promise<{ page(path: string): HTMLElement; exists(path: string): boolean; files(): string[] }>` — runs `astro build` with `SHEET_FIXTURE_DIR` set and `--outDir` in a temp folder, caches per fixture dir.
- Install Fontsource packages: `@fontsource/noto-serif-sc`, `@fontsource/noto-sans-sc`, `@fontsource/newsreader`, `@fontsource/inter`. Import only the weights in Global Constraints plus 400/500 for UI text. `font-display: swap`; fallback stacks end in `"Songti SC", SimSun, Georgia, serif` and `system-ui, sans-serif`.

Design notes: port tab A's header, hairlines, buttons, eyebrow and footer styles from the mockup into tokens and global classes; headings switch family by `:lang(zh-Hans)` / `:lang(en)`. Mobile navigation is a `<details>` menu (no JavaScript). The header wordmark is text (`brand.wordmark` + `brand.wordmarkSub`), not an image. Motion is limited to hover and focus transitions, disabled under `prefers-reduced-motion: reduce`. Footer shows both offices, phone, email from `SiteData.contact`, `LangSwitch`, `© <build year> Beyond Century Consulting, LLC`, and the Careers link (→ `localePath(l,'people') + '#join'`) only when `jobs.length > 0`. `LangSwitch` links to the same `path` in the other locale.

- [ ] **Step 1:** Write `tests/site/build.ts`, then `shell.test.ts` against `buildSite('fixtures/default')`:
  - `/zh/index.html` has `html[lang="zh-Hans"]`; `/en/index.html` has `html[lang="en"]`.
  - each has exactly one `<h1>`, a non-empty `<title>` and meta description, and a canonical equal to `https://www.beyondcenturyllc.com/<locale>/`.
  - each has three `link[rel=alternate][hreflang]`: `zh-Hans`, `en`, `x-default`, with the x-default href equal to the en href.
  - header nav has exactly 5 links with the labels from Global Constraints, in order.
  - the language switch on `/zh/` links to `/en/` and vice versa.
  - no file in `dist` contains `fonts.googleapis.com`, `fonts.gstatic.com`, `recaptcha`, or `google-analytics`.
  - no `<script src>` pointing to another origin on any page.
  - footer contains the current year and, with default fixtures, a link ending `/people/#join`.
- [ ] **Step 2:** Run `npm run test:site`; expect FAIL. Implement. Run; expect PASS.
- [ ] **Step 3:** Run `npm run dev`; in a browser compare header, footer and type against mockup tab A at 1280px and 375px in both languages; check no horizontal scroll at 360px and that the menu opens with JavaScript disabled.
- [ ] **Step 4:** Commit: `feat: Ledger design tokens, layout, header and footer`.

### Task 6: Home, Services and About pages

**Files:** Create `src/components/{Hero,FactColumn,ServiceRows,QuoteBand}.astro`, `src/pages/[locale]/{services,about}.astro`; complete `src/pages/[locale]/index.astro`; copy `susan.png` to `src/assets/people/`; create `tests/site/pages.test.ts`.

**Interfaces:**
- Consumes: `Base.astro`, `getCopy`, `localePath`, `staticLocalePaths`.
- Produces: service anchors `#accounting`, `#sec-reporting`, `#ma`, `#regulatory` on the Services page (ids from `Copy.services.items[].id`).

Page content: Home = Hero (eyebrow, headline, lede, primary button → Contact, text link → Services) with FactColumn; ServiceRows (01–04, each row links to its Services anchor); QuoteBand (portrait, quote, name, title); contact prompt. Services = heading, intro, one `<section id>` per item with title and body paragraphs. About = heading and sections. All styling follows mockup tab A; Services and About reuse its heading, hairline and two-column patterns.

- [ ] **Step 1:** Write `pages.test.ts` (default fixtures), for both locales: `/services/index.html` and `/about/index.html` exist with one `<h1>`; Services has four `section[id]` with the ids above, in order; Home has four service links whose hrefs end `/services/#<id>`; Home's primary button href is `localePath(locale,'contact')`; every `<img>` has non-empty `alt`; no page contains `undefined` or `[object Object]` in its text.
- [ ] **Step 2:** Run; expect FAIL. Implement. Run; expect PASS.
- [ ] **Step 3:** Browser check of the three pages against the mockup at 1280px and 375px, both languages.
- [ ] **Step 4:** Commit: `feat: home, services and about pages`.

### Task 7: People page with Sheet bios and job postings

**Files:** Create `src/data/photos.ts`, `src/components/{PersonCard,JoinUs}.astro`, `src/pages/[locale]/people.astro`, `src/assets/people/{miranda-suen,raymond-choy}.png`, `fixtures/hostile/*.csv`, `tests/unit/photos.test.ts`, `tests/site/people.test.ts`.

**Interfaces:**
- Consumes: `loadSiteData()`, `Person`, `Job`.
- Produces: `resolvePhoto(fileName: string): ImageMetadata | null` in `photos.ts` — looks up `src/assets/people/*` via `import.meta.glob` (eager), exact match first, then case-insensitive; returns `null` and logs `console.warn('People photo not found: <name>')` once per name.

Copy the two portraits from `<v2-source>/src/assets/headerImg/` (`Miranda-Suen.png`, `Raymond-Choy.png`), renaming to lower case. Render portraits with `astro:assets` at 4:5. A `null` photo renders a paper-2 tile with the person's initials. `JoinUs` renders `<section id="join">` only when `jobs.length > 0`. Sheet text is output through normal Astro expressions (escaped); never `set:html`.

`fixtures/hostile`: default fixtures, except person 1's `bio_en` is `Tom & Jerry <script>alert(1)</script> <b>bold</b>` and person 2's `photo` is `Nobody.PNG`.

- [ ] **Step 1:** Write `photos.test.ts`: `resolvePhoto('susan.png')` is non-null; `resolvePhoto('SUSAN.PNG')` is non-null; `resolvePhoto('nobody.png')` is `null`.
- [ ] **Step 2:** Write `people.test.ts`:
  - default: `/zh/people/` and `/en/people/` each show 3 person cards in `order`; the en page contains Susan Woo's en bio first paragraph and not her zh bio; `section#join` exists with the job title for that locale.
  - `no-jobs`: no element with id `join` on either People page; no footer link ending `#join` on any page.
  - `hostile`: en People page text contains the literal `<script>alert(1)</script>`; the page has no `script` element containing `alert(1)` and no `<b>` inside the bio; person 2's card has no `<img>` and shows a placeholder tile; build exit code is 0.
  - `broken`: `buildSite('fixtures/broken')` rejects, and the error output contains `People: missing column "bio_en"`.
- [ ] **Step 3:** Run both suites; expect FAIL. Implement. Run; expect PASS.
- [ ] **Step 4:** Browser check at 1280px and 375px, both languages, with default and `no-jobs` fixtures (`SHEET_FIXTURE_DIR=fixtures/no-jobs npm run dev`).
- [ ] **Step 5:** Commit: `feat: people page with Sheet-driven bios and job postings`.

### Task 8: Contact page and form

**Files:** Create `src/components/{ContactForm,Offices}.astro`, `src/pages/[locale]/{contact,thanks}.astro`, `tests/site/contact.test.ts`.

**Interfaces:**
- Consumes: `SiteData.contact`, `Copy.contact`, `Copy.thanks`.
- Produces: one Netlify form named `contact`, identical field names in both locales so submissions land in one form: `name`, `phone`, `email`, `message`, plus hidden `form-name=contact`, hidden `locale`, and honeypot `company-site`.

`ContactForm.astro` is the only place with Netlify attributes: `<form name="contact" method="POST" data-netlify="true" netlify-honeypot="company-site" action={localePath(locale,'thanks')}>`. `name`, `email`, `message` are `required`; `email` is `type="email"`; every input has a visible `<label>`. The honeypot field is visually hidden and `tabindex="-1"`, `autocomplete="off"`. `Offices` lists US office, China office, phone (as a `tel:` link built from digits), and email (as `mailto:`), in the page's language. `thanks` has `<meta name="robots" content="noindex">`.

- [ ] **Step 1:** Write `contact.test.ts` for both locales: exactly one `form[name="contact"][data-netlify="true"][method="POST"]`; its `action` is `/<locale>/thanks/`; inputs named `name`, `phone`, `email`, `message`, `form-name`, `locale`, `company-site` all present; every visible input/textarea has a `label[for]` matching its id; the page shows `contact.usAddress[locale]` and `contact.cnAddress[locale]` from the default fixtures; a `tel:` and a `mailto:` link exist; `/thanks/index.html` exists and has the noindex meta.
- [ ] **Step 2:** Run; expect FAIL. Implement. Run; expect PASS.
- [ ] **Step 3:** Browser check at 1280px and 375px; tab through the form with the keyboard and confirm the ink focus ring.
- [ ] **Step 4:** Commit: `feat: contact page with Netlify form`.

### Task 9: Search, redirects and structured data

**Files:** Create `src/components/JsonLd.astro`, `public/_redirects`, `public/robots.txt`, `src/pages/404.astro`, `tests/site/seo.test.ts`; modify `astro.config.mjs` (sitemap integration), `src/layouts/Base.astro` (JsonLd slot), `src/pages/[locale]/people.astro`.

**Interfaces:**
- Consumes: `SiteData`, `Copy`, `localePath`.
- Produces: `JsonLd.astro` props `{ data: object | object[] }` rendering one `<script type="application/ld+json">` per object.

Structured data: every page gets an `AccountingService` object (name, legal name, url, telephone, two `PostalAddress` entries from `SiteData.contact`, `areaServed` US and CN, `knowsLanguage` zh and en). People page adds one `Person` per shown person (name, jobTitle, `worksFor`) and one `JobPosting` per job (title, description, `hiringOrganization`, `jobLocation`, `datePosted` = build date).

`public/_redirects`, in this order:

```
/         /zh/            302  Language=zh
/         /en/            302
/about    /en/about/      301
/member   /en/people/     301
/contact  /en/contact/    301
```

`robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://www.beyondcenturyllc.com/sitemap-index.xml`. Confirm the sitemap file name against the current `@astrojs/sitemap` docs and exclude `/thanks/` pages and `404`. `404.astro` is bilingual on one page with links to both home pages.

- [ ] **Step 1:** Write `seo.test.ts`: the sitemap output lists all 10 content URLs (5 pages × 2 locales) and no `thanks` URL; `robots.txt` contains the `Sitemap:` line and no `Disallow: /`; `_redirects` is copied to `dist` byte-identical to the block above; each page's JSON-LD parses as JSON and includes an object with `@type` `AccountingService`; default-fixture People page has 3 `Person` objects and 1 `JobPosting`; `no-jobs` People page has 0 `JobPosting`; `404.html` exists.
- [ ] **Step 2:** Run; expect FAIL. Implement. Run; expect PASS.
- [ ] **Step 3:** Run the whole suite: `npm test && npm run test:site && npm run check`; all pass.
- [ ] **Step 4:** Commit: `feat: sitemap, redirects, robots and structured data`.

### Task 10: Final wording and review document

**Files:** Modify `src/i18n/zh.ts`, `src/i18n/en.ts`, `fixtures/default/people.csv`; create `docs/copy-review.md`.

Rewrite all in-code wording and the three bios for the primary reader in the spec (section 1). Rules: the Chinese is written as Chinese, not translated from the English, and vice versa; plain, specific statements over slogans; drop "Starting from the details…" style lines; no claims the v2 text and bios do not support (no client counts, deal values, or named clients); services are described by what the firm does for a company preparing for or maintaining a U.S. listing. Keep each service `body` to 2–3 short paragraphs.

- [ ] **Step 1:** Rewrite `zh.ts` and `en.ts`. Run `npm test` (copy parity test must still pass).
- [ ] **Step 2:** Rewrite the three bios in `fixtures/default/people.csv` in both languages from the v2 text.
- [ ] **Step 3:** Generate `docs/copy-review.md`: one section per page, a two-column table (中文 | English) with every string in page order, then the bios, then a short list of factual claims for Raymond to confirm (years of experience, credentials, office details).
- [ ] **Step 4:** Read every page in the browser in both languages for overflow or awkward line breaks at 1280px and 375px; fix.
- [ ] **Step 5:** Commit: `content: redraft site wording in Chinese and English`. Hand `docs/copy-review.md` to the owner for Raymond; apply his corrections as a follow-up commit when they arrive. Launch (Task 12) waits for his sign-off.

### Task 11: Google Sheet and Publish menu

**Files:** Create `sheet/Code.gs`, `sheet/README.md`.

**Interfaces:**
- Consumes: column headers and keys from Task 3; a Netlify build hook URL (created in Task 12 Step 2).
- Produces: Apps Script functions `onOpen()` (adds menu `Website` with items `Publish · 发布` → `publishSite`, and `Set up · 设置` → `setBuildHook`), `setBuildHook()` (prompts for the hook URL and saves it to Script Properties as `NETLIFY_BUILD_HOOK`), `publishSite()` (confirms, then `UrlFetchApp.fetch(hook, { method: 'post', muteHttpExceptions: true })`; shows a bilingual alert: success → "Publishing started. The site updates in about two minutes. / 已开始发布，网站约两分钟后更新。"; no hook or non-2xx → a bilingual failure message naming who to contact).

This task needs the owner's Google account; do the steps with the owner or hand them `sheet/README.md`.

- [ ] **Step 1:** Write `sheet/Code.gs` and `sheet/README.md` (setup steps below, plus the tab and column reference from Task 3).
- [ ] **Step 2:** Owner creates a spreadsheet named `Beyond Century website content` in their Google account with tabs `People`, `Jobs`, `Contact`, `Read me`, and imports `fixtures/default/*.csv` into the first three. Set bio and description columns to wrap, width ~480px, top-aligned.
- [ ] **Step 3:** Protect row 1 of each data tab and the `key` column of `Contact` (owner-only). Add list validation `yes, no` to both `show` columns. Fill `Read me` in both languages: what each tab controls, that edits go live only after Website → Publish, that both languages must be filled, that new photos need a developer.
- [ ] **Step 4:** Share as "Anyone with the link: Viewer". Record the Sheet ID.
- [ ] **Step 5:** Extensions → Apps Script: paste `Code.gs`, save, reload the Sheet, approve the permission prompt.
- [ ] **Step 6:** Verify locally: `SHEET_ID=<id> npm run build` exits 0 and `dist/en/people/index.html` shows the Sheet's bios.
- [ ] **Step 7:** Commit: `feat: Apps Script publish menu and Sheet setup guide`.

### Task 12: Netlify project, verification and launch

No code files. Needs the owner for account actions; each step that changes something outside the repository is confirmed with the owner first.

- [ ] **Step 1:** With the owner's go-ahead, `git push -u origin v3`. In Netlify, create a **new** project from the GitHub repository, branch `v3`. Leave the v2 project (`marvelous-brigadeiros-523787`) and the domain untouched.
- [ ] **Step 2:** In the new project set environment variable `SHEET_ID`; create a build hook named `Google Sheet publish`; in the Sheet run Website → Set up and paste the hook URL.
- [ ] **Step 3:** Enable form detection; after the first deploy confirm the `contact` form appears; add an email notification to the enquiry address the owner chooses (open item in the spec).
- [ ] **Step 4:** Verify on the Netlify preview URL, both languages:
  - all five pages load with JavaScript disabled and show full content;
  - `/` redirects to `/zh/` with a Chinese browser language and `/en/` otherwise; `/member` redirects to `/en/people/`;
  - submit the contact form once; the thanks page appears and the notification email arrives;
  - edit a bio in the Sheet, Website → Publish, and see the change live within a few minutes;
  - add a Jobs row with `show` = yes → "Join us" and the footer Careers link appear after publishing; set it to `no` → both disappear;
  - temporarily rename the `bio_en` header → the deploy fails and the live preview is unchanged; restore the header and publish again;
  - run a Lighthouse check on Home and People (mobile): performance, accessibility and SEO each ≥ 95, or note why not.
- [ ] **Step 5:** Launch gate, all required: Raymond's wording sign-off applied; the owner confirms the enquiry email; the exposed Google credentials from v2 have been revoked by the Gmail account owner.
- [ ] **Step 6:** With the owner: move the domain `www.beyondcenturyllc.com` (and apex) from the v2 project to the new project; confirm HTTPS; re-run the Step 4 redirect and form checks on the real domain. Keep the v2 project as a rollback for two weeks.
- [ ] **Step 7:** Ask the Changsha office to load the site and report load time; record the result in the spec's open items. Set the repository's default branch to `v3` if the owner wants.
