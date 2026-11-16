# Beyond Century Consulting website redesign (v3) — design

Date: 2026-11-15
Status: draft for approval

Items marked **(decided)** were stated or approved by the owner. Items marked **(my call)** were chosen by the designer and can be overruled. Section 10 lists what is still open.

## 1. Intent

Beyond Century Consulting, LLC (卓越) advises Chinese companies on listing and reporting in the United States: SEC financial reporting, accounting, M&A and financial regulatory work. The current site (v2, contractor-built, live at www.beyondcenturyllc.com) looks dated and unprofessional, carries almost no content, and is a JavaScript-only Vue app that search engines and AI bots see as a nearly empty page.

v3 replaces it with a site that makes the firm look established and credible within seconds to its most important reader, and that staff with no development skills can keep current.

**Primary reader (decided):** a finance lead or founder at a Chinese company considering a U.S. listing, most likely reading the Chinese version first.

## 2. Goals

1. **(decided)** A new visual design: direction "A · Ledger" (section 5).
2. **(decided)** Every page fully readable by search crawlers and AI bots without running JavaScript.
3. **(decided)** Chinese and English versions, both first-class.
4. **(decided)** Non-developers can edit a small set of content in Google Sheets: team bios, job postings, and contact facts. No paid service.
5. **(decided)** All wording redrafted in both languages by the builder; Raymond reviews and signs off both languages.

## 3. Non-goals

- **(decided)** Making all text editable. Headings, service descriptions, slogans and page structure live in code.
- **(decided)** Fetching images or any other assets from Google. Images live in the repository.
- **(decided)** A separate Careers page or navigation item.
- **(decided)** Expanding content substantially. New content is welcome where it helps but is not a goal.
- **(my call)** A blog or news section, analytics, a client login, or a paid CMS. The structure should not block adding these later.

## 4. Anti-goals

- Chinese that reads like a translation of the English, or the reverse.
- Stock imagery (the ocean hero, generic office illustrations).
- An editing setup where a mistake in the Sheet can take the site down or show broken or empty sections.
- Any page section that is visibly empty (for example, a careers area with no roles).
- Dependence on third-party services that are blocked or slow in mainland China (Google Fonts, reCAPTCHA, Google Analytics).

## 5. Visual design: "A · Ledger" (decided)

Reads like a private bank or law firm: quiet, established, senior. Approved reference mockup: `.superpowers/brainstorm/27897-1794799547/content/design-directions.html` (tab A). The mockup's copy is placeholder.

**Color tokens**

| Token | Value | Use |
|---|---|---|
| paper | `#f6f2ea` | page background |
| paper-2 | `#ece5d6` | alternate bands (partner quote, footer) |
| ink | `#14213a` | text, primary buttons, heavy rules |
| mute | `#5d6577` | secondary text |
| rule | `#cfc6b3` | hairlines |
| accent | `#96652f` | eyebrows, numerals, small highlights only |

**Type**

- Chinese display and headings: Noto Serif SC, weight 600.
- English display and headings: Newsreader, weight 400, tight tracking.
- Body copy in long passages: the serif pair. UI text, labels, captions, form fields: Inter with Noto Sans SC.
- Eyebrows: small, uppercase, wide letter-spacing, accent color.
- **(my call)** Fonts are self-hosted and subsetted (Fontsource or equivalent), `font-display: swap`, with system serif fallbacks (Songti SC, SimSun, Georgia). No requests to Google Fonts.

**Components**

- Header: wordmark (卓越咨询 + Beyond Century), five links, language switch pill. Hairline below.
- Hero: eyebrow, large serif headline, lede, one solid ink button plus one underlined text link; a fact column to the right under a 2px ink rule.
- Numbered list rows (01–04) separated by hairlines, used for services.
- Quote band on paper-2 with portrait.
- Person card: portrait, name, title, bio.
- Job posting block (section 6).
- Form fields: hairline borders, square corners, ink focus ring.
- Footer: both offices, phone, email, language switch, copyright with the current year generated at build.

Corners are square throughout. No shadows, gradients or carousels. Motion is limited to subtle hover and focus states and respects reduced-motion settings.

**Responsive:** single column below about 860px; navigation collapses to a menu. No horizontal scrolling at 360px.

**Imagery:** **(my call)** reuse the existing team portraits (Susan Woo, Miranda Suen, Raymond Choy) from the v2 site; no stock photos. The logo is redrawn as a text wordmark unless the firm supplies a vector logo.

## 6. Site structure

Five navigation items **(decided after removing Careers)**. Every page exists at `/zh/...` and `/en/...`.

| Page | Path | Content | From the Sheet |
|---|---|---|---|
| Home | `/` | Hero, four services (linking to Services), key facts, partner quote, contact prompt | — |
| Services | `/services/` | One section per service with an anchor: accounting advisory, SEC financial reporting, M&A advisory, financial regulatory advisory | — |
| About | `/about/` | Who the firm is, the China–U.S. focus, how it works with clients | — |
| People | `/people/` | Person cards; "Join us" section at the bottom when roles are open | bios, job postings |
| Contact | `/contact/` | Enquiry form, both offices, phone, email | contact facts |

- **(my call)** Services is a single page. It can be split into four pages later without a redesign.
- **(decided)** Job postings: shown as a "Join us" section at the bottom of People. With no postings the section is not rendered at all. **(my call)** A small "Careers" link appears in the footer only while at least one role is open.
- **(my call)** Navigation labels: 首页 / 服务 / 关于卓越 / 团队 / 联系 and Home / Services / About / People / Contact.

**Languages and URLs (my call)**

- `/zh/` and `/en/` trees. `/` redirects by browser language (Chinese to `/zh/`, everything else to `/en/`) using Netlify's language-based redirect rules.
- The language switch links to the same page in the other language.
- v2 paths redirect permanently: `/about` → `/en/about/`, `/member` → `/en/people/`, `/contact` → `/en/contact/`.

## 7. Content editing with Google Sheets

**Principle (decided):** the Sheet holds only content that may change "once in a blue moon". Everything else is in code.

**One spreadsheet, three tabs (my call on exact shape):**

- **People** — one row per person: `order`, `photo` (file name of an image already in the repository), `name_zh`, `name_en`, `title_zh`, `title_en`, `bio_zh`, `bio_en`, `show` (yes/no).
- **Jobs** — one row per open role: `title_zh`, `title_en`, `location_zh`, `location_en`, `description_zh`, `description_en`, `how_to_apply_zh`, `how_to_apply_en`, `show` (yes/no). No rows, or no rows with `show = yes`, means the section is hidden.
- **Contact** — fixed rows with `key`, `value_zh`, `value_en`: U.S. office address, China office address, phone, email.

Multi-paragraph cells (bios, job descriptions) use line breaks; a blank line starts a new paragraph. No other formatting is supported.

**Guard rails**

- Header rows and the `key` column are protected; data validation on `show`.
- A "Read me" tab explains in both languages what each tab does and how to publish.
- The build validates the Sheet. If a required column or a required value is missing, the build fails, Netlify keeps serving the previous version, and the failure is visible in Netlify. A missing translation in one language fails the build rather than publishing a blank.
- A new person's photo must be added to the repository by a developer; the Sheet only references it. If the file name does not match, the card shows a neutral placeholder.

**Publishing (my call)**

- The Sheet has a custom menu, "Website → Publish", implemented with Google Apps Script bound to the Sheet. It calls a Netlify build hook; the site updates in a minute or two.
- The site reads the Sheet at build time through Google's CSV export of each tab. The Sheet is shared as "anyone with the link can view" (its content is public on the site anyway); only named editors can edit. No API keys are needed. The Sheet ID is a Netlify environment variable.
- Edits never appear on the site until someone publishes.

## 8. Search and AI visibility (decided as a goal; details are my call)

- Static HTML for every page, generated at build. Pages work with JavaScript disabled.
- Per page and per language: unique title and meta description, canonical URL, `hreflang` pairs (`zh-Hans`, `en`, `x-default` → English), Open Graph tags, correct `lang` attribute.
- `sitemap.xml` covering both languages; `robots.txt` allowing all crawlers including AI crawlers.
- Structured data (JSON-LD): the organization with both offices, each person on People, and a job posting entry for each open role.
- Semantic headings, one `h1` per page, alt text on images.
- Fast by construction: no client framework, optimized images, subsetted fonts.

## 9. Technology (my call throughout)

- **Astro** static site with its built-in i18n routing; TypeScript; plain CSS with the tokens in section 5 as custom properties. No client-side framework.
- UI strings and page copy in per-language files in the repository.
- **Netlify** hosting, on the existing account and free tier. **Netlify Forms** for the contact form, with a honeypot field for spam (no reCAPTCHA), emailing submissions to the firm.
- **GitHub** repository connected to Netlify for continuous deployment and deploy previews.
- No third-party scripts.

**Left to the builder:** component breakdown, file layout, image pipeline, the exact validation rules and error messages, the Apps Script code, the test approach, and the final copy drafts for Raymond's review.

## 10. Open items

Answered:

- **(decided)** The Sheet is owned by the site owner's personal Google account for now; more editors can be added later.
- **(decided)** The code goes in the existing GitHub repository `woobianca/beyond-century-llc`. The firm has no GitHub account.

- **(decided)** Hosting: launch on Netlify. Measure load times from mainland China after launch (the Changsha office can test) and move to a Hong Kong edge host only if they are poor.

Still to be answered by the owner (neither blocks the build; both are needed before launch):

1. Which email address should receive contact form enquiries? (v2 was coded to send to a QQ mailbox; see section 12.)
2. Should v3 replace v2 on the same Netlify project and domain at launch (with v2 kept as a rollback), or launch as a new project and switch the domain over?

**Hosting portability (my call):** because mainland China performance is uncertain on any host without a mainland licence, the site must not depend on host-specific features in a way that is hard to move. The contact form handler and the publish hook are the only two host-specific pieces and must each be isolated behind a single small module or config file.

## 12. Findings from the v2 source code

Source reviewed: the Netlify deploy download of v2 (Vue 2, vue-i18n, a small Express mail server that was never deployed).

- **The v2 contact form has never worked in production.** It posts to `http://localhost:8090`, a mail server that only existed on the contractor's machine. Enquiries submitted through the live site were not delivered.
- **Google credentials are exposed publicly.** A Google OAuth client secret and refresh token for the firm's sending Gmail account are embedded in the browser code served by the live site. They must be revoked by the account owner regardless of the v3 timeline. v3 uses no such credentials.
- **v2 holds more copy than the pages display.** `src/lang/en/index.js` and `src/lang/zh-CN/index.js` contain the full existing wording in both languages and are the starting material for the redraft.

## 11. Done means

- All five pages live in both languages on the production domain in the Ledger design.
- With JavaScript disabled, every page shows its full content.
- An editor changes a bio in the Sheet, chooses Website → Publish, and sees the change live within a few minutes without help.
- Adding a row to Jobs makes "Join us" appear on People; removing it makes the section and the footer link disappear.
- A deliberately broken Sheet (deleted column) does not change the live site.
- Raymond has approved the wording in both languages.
