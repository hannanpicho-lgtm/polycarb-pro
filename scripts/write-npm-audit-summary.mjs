#!/usr/bin/env node
/**
 * Appends a markdown table of `npm audit --json` metadata to GITHUB_STEP_SUMMARY
 * (used in GitHub Actions). Always exits 0; parsing failures are ignored.
 */
import { spawnSync } from 'node:child_process';
import { appendFileSync } from 'node:fs';

const summaryPath = process.env.GITHUB_STEP_SUMMARY;
if (!summaryPath) {
  process.exit(0);
}

const p = spawnSync('npm', ['audit', '--json'], {
  shell: true,
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});
const out = (p.stdout || '') + (p.stderr || '');
const start = out.indexOf('{');
if (start < 0) {
  process.exit(0);
}

let meta;
try {
  meta = JSON.parse(out.slice(start)).metadata;
} catch {
  process.exit(0);
}

const vuln = meta?.vulnerabilities;
if (!vuln) {
  process.exit(0);
}

const rows = [
  '## npm audit (full dependency tree)',
  '',
  '| Severity | Count |',
  '|---|---|',
  ...Object.entries(vuln).map(([k, v]) => `| ${k} | ${v} |`),
  '',
];

if (meta.dependencies) {
  const d = meta.dependencies;
  rows.push('### Dependency graph (counts)', '', '| kind | count |', '|---|---|');
  for (const [k, v] of Object.entries(d)) {
    rows.push(`| ${k} | ${v} |`);
  }
  rows.push('');
}

try {
  appendFileSync(summaryPath, rows.join('\n'));
} catch {
  /* e.g. local run without GITHUB_STEP_SUMMARY */
}
process.exit(0);
