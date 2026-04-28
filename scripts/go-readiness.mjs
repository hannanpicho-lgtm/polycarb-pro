#!/usr/bin/env node
/**
 * Production go-readiness: runs `verify` (or `verify:opennext` with --opennext), then
 * `test:ci` (matches CI `test` job), then `npm audit`, repo hygiene checks, and
 * `reports/prod-go-readiness.json`
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const reports = join(root, 'reports');
const HUSKY = { ...process.env, HUSKY: '0', CI: 'true' };

/**
 * `tsc`, `next build` (and opennext) can OOM on Windows if the Node heap is too small.
 * For the verify child we set `--max-old-space-size` (default READINESS_HEAP_MB=8192) and
 * strip any existing `--max-old-space-size=…` from NODE_OPTIONS first so a tiny inherited
 * limit (e.g. 512 MB) cannot override readiness. Override: READINESS_NODE_OPTIONS, or
 * READINESS_HEAP_OFF=1 to keep your environment unchanged.
 */
function stripMaxOldSpaceFlags(nodeOptions) {
  return String(nodeOptions || '')
    .replace(/\s*--max-old-space-size=\d+\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function envForVerifyBuild() {
  const base = { ...HUSKY };
  if (process.env.READINESS_HEAP_OFF === '1' || process.env.READINESS_HEAP_OFF === 'true') {
    return { env: base, heapApplied: null, heapMb: null };
  }
  const custom = (process.env.READINESS_NODE_OPTIONS || '').trim();
  if (custom) {
    return {
      env: {
        ...base,
        NODE_OPTIONS: mergeNodeOptions(stripMaxOldSpaceFlags(base.NODE_OPTIONS), custom),
      },
      heapApplied: 'READINESS_NODE_OPTIONS',
      heapMb: null,
    };
  }
  const mbRaw = process.env.READINESS_HEAP_MB;
  const mb =
    mbRaw !== undefined && mbRaw !== '' ? Math.max(0, Number.parseInt(String(mbRaw), 10)) : 8192;
  if (!Number.isFinite(mb) || mb <= 0) {
    return { env: base, heapApplied: null, heapMb: null };
  }
  const existing = stripMaxOldSpaceFlags(base.NODE_OPTIONS || process.env.NODE_OPTIONS || '');
  const flag = `--max-old-space-size=${mb}`;
  return {
    env: { ...base, NODE_OPTIONS: existing ? `${existing} ${flag}`.trim() : flag },
    heapApplied: 'READINESS_HEAP_MB',
    heapMb: mb,
  };
}

function mergeNodeOptions(before, add) {
  const a = (before || '').trim();
  const b = (add || '').trim();
  if (!a) return b;
  if (!b) return a;
  return `${a} ${b}`;
}

const useOpenNext =
  process.argv.includes('--opennext') ||
  process.env.READINESS_OPENNEXT === '1' ||
  process.env.READINESS_OPENNEXT === 'true';

const verifyNpmScript = useOpenNext ? 'verify:opennext' : 'verify';
const verifyDescription = useOpenNext
  ? 'npm run verify:opennext (check:all + opennextjs-cloudflare build, matches CI verify job build step)'
  : 'npm run verify (check:all + next build)';

const report = {
  generatedAt: new Date().toISOString(),
  root,
  checks: {
    verify: {
      ok: false,
      exitCode: null,
      durationMs: null,
      mode: useOpenNext ? 'opennext' : 'next',
      detail: verifyDescription,
      /** How Node heap was set for the verify child (if any), e.g. `READINESS_HEAP_MB=8192` */
      nodeHeap: null,
    },
    unitTests: {
      ok: false,
      skipped: true,
      exitCode: null,
      durationMs: null,
      detail: 'npm run test:ci (not run if verify failed)',
    },
    audit: {
      ok: true,
      exitCode: 0,
      metadata: null,
      highPlus: 0,
      detail: 'npm audit (full JSON, advisory for triage)',
    },
    repo: {},
  },
  recommendation: 'error',
  summary: [],
};

function fileOk(rel) {
  return existsSync(join(root, ...rel.split('/')));
}

report.checks.repo = {
  hasGithubCi: fileOk('.github/workflows/ci.yml'),
  hasGithubDeploy: fileOk('.github/workflows/deploy.yml'),
  hasDependabot: fileOk('.github/dependabot.yml'),
  hasEnvExample: fileOk('.env.example'),
  hasNvmrc: fileOk('.nvmrc'),
  hasPrettierrc: fileOk('.prettierrc'),
  hasEslintFlat: fileOk('eslint.config.mjs'),
  hasHuskyPrecommit: fileOk('.husky/pre-commit'),
  hasHuskyPrepush: fileOk('.husky/pre-push'),
  /** Liveness route used by deploy + scheduled health smoke (see /api/version for build id). */
  hasHealthApi: fileOk('app/api/health/route.ts'),
};

const { env: verifyEnv, heapApplied, heapMb } = envForVerifyBuild();
report.checks.verify.nodeHeap =
  heapApplied == null
    ? null
    : heapMb != null
      ? `${heapApplied} → --max-old-space-size=${heapMb} (MB); prior max-old-space-size flags stripped so this applies to tsc/next and test:ci`
      : `${heapApplied} (merged into NODE_OPTIONS for verify + test:ci)`;

const t0 = Date.now();
const v = spawnSync('npm', ['run', verifyNpmScript], {
  cwd: root,
  env: verifyEnv,
  stdio: 'inherit',
  shell: true,
});
report.checks.verify.durationMs = Date.now() - t0;
report.checks.verify.exitCode = v.status ?? 0;
report.checks.verify.ok = (v.status ?? 0) === 0;

if (report.checks.verify.ok) {
  const t1 = Date.now();
  const u = spawnSync('npm', ['run', 'test:ci'], {
    cwd: root,
    env: verifyEnv,
    stdio: 'inherit',
    shell: true,
  });
  report.checks.unitTests = {
    ok: (u.status ?? 0) === 0,
    skipped: false,
    exitCode: u.status ?? 0,
    durationMs: Date.now() - t1,
    detail:
      'npm run test:ci (Vitest, same as GitHub `test` job; same NODE_OPTIONS as verify when readiness sets heap)',
  };
}

function parseAuditBuffer(buf) {
  if (!buf || !String(buf).trim()) {
    return { metadata: null, highPlus: 0, parseError: 'empty' };
  }
  try {
    const j = JSON.parse(buf);
    const vuln = j.metadata?.vulnerabilities;
    if (vuln) {
      const h = (vuln.high || 0) + (vuln.critical || 0) + (vuln.moderate || 0) + (vuln.low || 0);
      return {
        metadata: j.metadata,
        highPlus: (vuln.high || 0) + (vuln.critical || 0),
        moderate: vuln.moderate || 0,
        low: vuln.low || 0,
        total: vuln.total ?? h,
      };
    }
    return { metadata: j.metadata || null, highPlus: 0, parseError: 'no_vuln_metadata' };
  } catch (e) {
    return { metadata: null, highPlus: 0, parseError: e.message };
  }
}

const auditProc = spawnSync('npm', ['audit', '--json'], {
  cwd: root,
  env: HUSKY,
  shell: true,
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});
const auditJsonText = (auditProc.stdout || '') + (auditProc.stderr || '');
const auditCode = typeof auditProc.status === 'number' ? auditProc.status : 1;
const auditSlice =
  auditJsonText.indexOf('{') >= 0 ? auditJsonText.slice(auditJsonText.indexOf('{')) : auditJsonText;
const auditOut = parseAuditBuffer(auditSlice);

report.checks.audit = {
  ...report.checks.audit,
  exitCode: auditCode,
  ...auditOut,
  ok: auditCode === 0,
};

const repoList = report.checks.repo;
const allRepoFlags = [
  'hasGithubCi',
  'hasGithubDeploy',
  'hasDependabot',
  'hasEnvExample',
  'hasNvmrc',
  'hasPrettierrc',
  'hasEslintFlat',
  'hasHuskyPrecommit',
  'hasHuskyPrepush',
  'hasHealthApi',
].every((k) => repoList[k] === true);

if (!allRepoFlags) {
  const missing = Object.entries(repoList)
    .filter(([, val]) => !val)
    .map(([k]) => k);
  report.summary.push(`Repo hygiene: missing or unreadable: ${missing.join(', ')}`);
} else {
  report.summary.push('Repo hygiene: expected pipeline and config files are present');
}

if (report.checks.verify.ok) {
  report.summary.push(
    `${verifyNpmScript}: passed (${((report.checks.verify.durationMs || 0) / 1000).toFixed(1)}s)`
  );
} else {
  report.summary.push(`${verifyNpmScript}: FAILED (exit ${report.checks.verify.exitCode})`);
  report.summary.push(
    'If the log shows bad_alloc / out of memory / exit 134: default verify heap is now 8192 MB (READINESS_HEAP_MB); raise further (e.g. 12288) or set READINESS_NODE_OPTIONS. If your shell had a small --max-old-space-size in NODE_OPTIONS, remove it or set READINESS_HEAP_OFF=1 only if you intend to manage heap yourself.'
  );
}

if (report.checks.verify.ok) {
  if (report.checks.unitTests.ok) {
    report.summary.push(
      `test:ci: passed (${((report.checks.unitTests.durationMs || 0) / 1000).toFixed(1)}s)`
    );
  } else {
    report.summary.push(
      `test:ci: FAILED (exit ${report.checks.unitTests.exitCode}) — same as GitHub "Unit tests" job`
    );
  }
}

if (report.checks.audit.ok) {
  report.summary.push('npm audit: no reported vulnerabilities in dependency tree (exit 0)');
} else {
  const hpi = report.checks.audit.highPlus ?? 0;
  const modC = report.checks.audit.moderate ?? 0;
  report.summary.push(
    `npm audit: exit code ${auditCode} (npm exits non-zero if any advisories exist); high/critical: ${hpi}, moderate: ${modC} — use severity for triage, not the exit code alone`
  );
}

const mod = report.checks.audit.moderate ?? 0;
const highCrit = report.checks.audit.highPlus ?? 0;
const tot = report.checks.audit.total ?? 0;

if (!report.checks.verify.ok) {
  report.recommendation = 'no_go_verify';
} else if (!report.checks.unitTests.ok) {
  report.recommendation = 'no_go_unit_tests';
  report.summary.push('Overall: fix unit tests before production — `npm run test:ci` must pass');
} else if (!allRepoFlags) {
  report.recommendation = 'no_go_incomplete_hygiene';
} else if (highCrit > 0) {
  report.recommendation = 'go_with_risk';
  report.summary.push(
    'Overall: CONDITIONAL for production — address high/critical advisories in `npm audit` or accept business risk; build and hygiene gates are green'
  );
} else if (mod > 0 || tot > 0) {
  report.recommendation = 'go_with_dep_audit_triage';
  report.summary.push(
    'Overall: GO for the static, build, and test gates; plan dependency triage (moderate/low) via Dependabot or `npm audit fix` where safe'
  );
} else {
  report.recommendation = 'go';
  report.summary.push(
    `Overall: GO — no reported vulnerabilities, ${verifyNpmScript}, unit tests, and repo hygiene gates are green`
  );
}

if (!existsSync(reports)) {
  mkdirSync(reports, { recursive: true });
}
const outPath = join(reports, 'prod-go-readiness.json');
writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');

// Use basename so narrow terminals do not wrap "prod-go-readiness.json" into "…js" + "on" (looks like a .js file).
const outLabel = outPath.replace(/\\/g, '/');
console.log(`\n[go-readiness] Wrote report: ${outLabel}\n`);
console.log(JSON.stringify(report, null, 2));

if (!report.checks.verify.ok) {
  process.exit(1);
}
if (report.checks.verify.ok && !report.checks.unitTests.ok) {
  process.exit(1);
}
process.exit(0);
