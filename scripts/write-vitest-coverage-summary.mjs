#!/usr/bin/env node
/**
 * Appends Vitest v8 `coverage/coverage-summary.json` to GITHUB_STEP_SUMMARY (CI only).
 */
import { readFileSync, appendFileSync, existsSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (!summaryPath) {
  process.exit(0);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const jsonPath = join(root, 'coverage', 'coverage-summary.json');

if (!existsSync(jsonPath)) {
  appendFileSync(
    summaryPath,
    '## Vitest coverage\n\n_coverage/coverage-summary.json not found; run with `vitest run --coverage`._\n'
  );
  process.exit(0);
}

const data = JSON.parse(readFileSync(jsonPath, 'utf8'));
const t = data.total;
if (!t) {
  process.exit(0);
}

const lines = [
  '## Vitest coverage (v8)',
  '',
  '| Metric | % | Covered | Total |',
  '|---|---:|---:|---:|',
  `| Lines | ${t.lines.pct} | ${t.lines.covered} | ${t.lines.total} |`,
  `| Statements | ${t.statements.pct} | ${t.statements.covered} | ${t.statements.total} |`,
  `| Functions | ${t.functions.pct} | ${t.functions.covered} | ${t.functions.total} |`,
  `| Branches | ${t.branches.pct} | ${t.branches.covered} | ${t.branches.total} |`,
  '',
];

const files = Object.keys(data).filter((k) => k !== 'total');
if (files.length > 0) {
  lines.push('**Files in report** (executed in tests):');
  for (const f of files) {
    const segs = f.split(/[/\\]/).filter(Boolean);
    const name = segs.length >= 2 ? segs.slice(-2).join('/') : basename(f);
    const L = data[f].lines;
    lines.push(`- \`${name}\` — ${L.pct}% lines (${L.covered}/${L.total})`);
  }
  lines.push('');
}

appendFileSync(summaryPath, lines.join('\n'));
process.exit(0);
