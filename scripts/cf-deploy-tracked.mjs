import { spawnSync } from 'node:child_process';

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...extraEnv },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function resolveCommitSha() {
  const envCommit =
    process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || process.env.GIT_COMMIT_SHA || '';
  if (envCommit.trim()) {
    return envCommit.trim();
  }

  const git = spawnSync('git', ['rev-parse', 'HEAD'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
  if (git.status === 0) {
    const sha = (git.stdout || '').trim();
    if (sha) return sha;
  }
  return 'local';
}

const now = new Date().toISOString();
const commit = resolveCommitSha();

const trackedEnv = {
  NEXT_PUBLIC_GIT_SHA: commit,
  NEXT_PUBLIC_BUILD_TIME: now,
};

run('npx', ['opennextjs-cloudflare', 'build'], trackedEnv);
run('npx', ['wrangler', 'deploy'], trackedEnv);
