// Regenerates docs/copy-review.md from the in-code copy and the default Sheet fixtures.
// Run: node scripts/copy-review.mts
import { readFileSync, writeFileSync } from 'node:fs';
import { runnerImport } from 'vite';

// Load the TypeScript sources through Vite so extensionless imports resolve as they do in the site.
const { module: zhMod } = await runnerImport<typeof import('../src/i18n/zh')>('./src/i18n/zh.ts');
const { module: enMod } = await runnerImport<typeof import('../src/i18n/en')>('./src/i18n/en.ts');
const { module: validateMod } = await runnerImport<typeof import('../src/data/validate')>('./src/data/validate.ts');
const { zh } = zhMod;
const { en } = enMod;
const { validateSheet } = validateMod;

const SECTIONS: [keyof typeof zh, string][] = [
  ['home', 'Home 首页'], ['services', 'Services 服务'], ['about', 'About 关于卓越'], ['people', 'People 团队'],
  ['contact', 'Contact 联系'], ['thanks', 'Thank-you page 提交成功页'], ['notFound', 'Not-found page 404'],
  ['nav', 'Navigation 导航'], ['brand', 'Brand 品牌'], ['footer', 'Footer 页脚'], ['meta', 'Search titles and descriptions 搜索标题与描述'],
];

function flatten(value: unknown, path: string, out: [string, string][]) {
  if (Array.isArray(value)) value.forEach((v, i) => flatten(v, `${path}[${i + 1}]`, out));
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) { if (k !== 'id') flatten(v, path ? `${path}.${k}` : k, out); }
  else out.push([path, String(value)]);
  return out;
}
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, '<br>');

const lines: string[] = [
  '# Website wording for review',
  '',
  'For Raymond. Each row shows the Chinese and English wording side by side, in the order it appears on the page. Please mark corrections directly in this file or in comments, in either language.',
  '',
  'The Chinese is written for Chinese readers, not translated word for word from the English, so the two columns may differ slightly in phrasing.',
  '',
];

for (const [key, title] of SECTIONS) {
  const z = flatten(zh[key], '', []);
  const e = new Map(flatten(en[key], '', []));
  lines.push(`## ${title}`, '', '| Where | 中文 | English |', '|---|---|---|');
  for (const [path, text] of z) lines.push(`| ${path || key} | ${cell(text)} | ${cell(e.get(path) ?? '')} |`);
  lines.push('');
}

const data = validateSheet({
  people: readFileSync('fixtures/default/people.csv', 'utf8'),
  jobs: readFileSync('fixtures/default/jobs.csv', 'utf8'),
  contact: readFileSync('fixtures/default/contact.csv', 'utf8'),
});
lines.push('## Team bios 团队简介', '', 'These will live in the Google Sheet, so they can also be corrected there later. Jia Xia\'s bio is in the Sheet but hidden; tell us if she should appear.', '');
for (const p of data.people) {
  lines.push(`### ${p.name.en}`, '', '| 中文 | English |', '|---|---|');
  lines.push(`| ${cell(p.title.zh)} | ${cell(p.title.en)} |`);
  const n = Math.max(p.bio.zh.length, p.bio.en.length);
  for (let i = 0; i < n; i++) lines.push(`| ${cell(p.bio.zh[i] ?? '')} | ${cell(p.bio.en[i] ?? '')} |`);
  lines.push('');
}

lines.push(
  '## Facts to confirm 需要确认的事实',
  '',
  '- [ ] "25+ years" of audit and accounting experience is Susan Woo\'s; is it right to present it as the firm\'s headline fact?',
  '- [ ] Every engagement is led by a U.S. Certified Public Accountant.',
  '- [ ] The quote on the home page is a paraphrase of Susan\'s bio, not something she said. Approve, reword, or remove.',
  '- [ ] Chinese firm name: 卓越世纪 (used throughout).',
  '- [ ] Office addresses and phone: 21660 E Copley Drive, Suite 268, Diamond Bar, CA 91765; 湖南省长沙市岳麓区金茂广场北塔写字楼 1309 室; +1 (909) 839-6788.',
  '- [ ] The English translation of the Changsha address.',
  '- [ ] Contact email shown on the site (placeholder: info@beyondcenturyllc.com).',
  '- [ ] Services: De-SPAC, SOX 404, interim CFO or controller work, and the filing types listed (S-1, F-1, 10-K, 10-Q, 20-F, 6-K) are all services the firm offers today.',
  '- [ ] Partner network: long-standing partners in audit, tax, law, investment advisory and private equity.',
  '- [ ] Raymond: "Co-founder, CPA, CGMA" and helping clients list on the NYSE and Nasdaq.',
  '- [ ] Miranda\'s surname: the bio says "Sun", the v2 photo file says "Suen".',
  '',
);

writeFileSync('docs/copy-review.md', lines.join('\n'));
console.log(`wrote docs/copy-review.md (${lines.length} lines)`);
