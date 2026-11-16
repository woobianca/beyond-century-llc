# Website content Sheet

The site reads three tabs of one Google Sheet each time it is built. Edits appear on the site only after **Website → Publish**.

## One-time setup (owner)

1. Create a Google Sheet named **Beyond Century website content** with four tabs, named exactly: `People`, `Jobs`, `Contact`, `Read me`.
2. Import `fixtures/default/people.csv`, `jobs.csv` and `contact.csv` into the first three tabs (File → Import → Upload → *Replace current sheet*). Delete the sample job row in `Jobs` if there is no real opening.
3. In `People` and `Jobs`, set the bio and description columns to **Wrap**, about 480px wide, top-aligned.
4. Protect row 1 of each data tab, and column A (`key`) of `Contact`, so only the owner can change them (Data → Protect sheets and ranges).
5. Add a dropdown with `yes, no` to both `show` columns (Data → Data validation).
6. Fill in `Read me` in both languages (text below).
7. Share → General access → **Anyone with the link: Viewer**. Editors are added by name.
8. Copy the Sheet ID: the long part of the address between `/d/` and `/edit`.
9. Extensions → Apps Script → paste `sheet/Code.gs` → Save. Reload the Sheet; a **Website** menu appears. Run **Website → Set up** once, approve the permission prompt, and paste the Netlify build hook URL.

## Tabs and columns

Column names in row 1 must stay exactly as below.

**People** — one row per person: `order, photo, name_zh, name_en, title_zh, title_en, bio_zh, bio_en, show`
- `order`: a number; lower numbers appear first.
- `photo`: the file name of a portrait already in the website (for example `susan.png`). New photos must be added by a developer. A name that matches nothing shows a plain tile with initials.
- `show`: `yes` to show the person; anything else hides them.

**Jobs** — one row per open role: `title_zh, title_en, location_zh, location_en, description_zh, description_en, how_to_apply_zh, how_to_apply_en, show`
- With no rows set to `show = yes`, the "Join us" section and the footer Careers link disappear.

**Contact** — fixed rows `key, value_zh, value_en` with keys `us_address`, `cn_address`, `phone`, `email`.

Long text: press Ctrl+Enter (Cmd+Enter on Mac) for a new line inside a cell; a blank line starts a new paragraph. No other formatting is supported.

Format the `Contact` value columns as **plain text** (Format → Number → Plain text) so a phone number is never treated as a number.

## If a publish fails

The site checks the Sheet before publishing. If a column is renamed, a required cell is empty in either language, or the Sheet is no longer shared, the publish stops, the site keeps showing the previous version, and the reason appears in the Netlify deploy log.

## Text for the "Read me" tab

> **How this Sheet works / 使用说明**
>
> This Sheet controls the team bios, job openings and contact details on www.beyondcenturyllc.com.
> 本表格控制网站上的团队简介、招聘职位和联系方式。
>
> 1. Edit the text in the People, Jobs or Contact tab. Fill in **both** Chinese and English. 编辑内容时，中文和英文都必须填写。
> 2. To show or hide a person or job, set `show` to yes or no. 将 show 设为 yes 或 no 以显示或隐藏。
> 3. Do not rename tabs or change row 1. 请勿修改标签页名称或第一行。
> 4. When ready, choose **Website → Publish**. The site updates in about two minutes. 完成后点击“Website → Publish · 发布”，网站约两分钟后更新。
> 5. New photos need the website administrator. 新照片需要联系网站管理员添加。
