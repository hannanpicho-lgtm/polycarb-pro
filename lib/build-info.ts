import packageJson from '@/package.json';

const rawCommit =
  process.env.NEXT_PUBLIC_GIT_SHA ??
  process.env.GIT_COMMIT_SHA ??
  process.env.CF_PAGES_COMMIT_SHA ??
  '';

const normalizedCommit = rawCommit.trim();

export const buildInfo = {
  version: process.env.NEXT_PUBLIC_APP_VERSION ?? packageJson.version,
  commit: normalizedCommit ? normalizedCommit.slice(0, 12) : 'local',
  builtAt: process.env.NEXT_PUBLIC_BUILD_TIME ?? 'unknown',
} as const;

