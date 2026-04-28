import { afterEach, describe, expect, it, vi } from 'vitest';
import packageJson from '@/package.json';

const BUILD_INFO_KEYS = [
  'NEXT_PUBLIC_APP_VERSION',
  'NEXT_PUBLIC_GIT_SHA',
  'GIT_COMMIT_SHA',
  'CF_PAGES_COMMIT_SHA',
  'NEXT_PUBLIC_BUILD_TIME',
] as const;

function clearBuildInfoEnv() {
  for (const k of BUILD_INFO_KEYS) {
    delete process.env[k];
  }
}

/** `build-info` reads env at import time; reset cache + env before each dynamic import. */
async function getBuildInfo() {
  return (await import('./build-info')).buildInfo;
}

describe('buildInfo', () => {
  afterEach(() => {
    clearBuildInfoEnv();
  });

  it('uses package version when NEXT_PUBLIC_APP_VERSION is not set', async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    const buildInfo = await getBuildInfo();
    expect(buildInfo.version).toBe(packageJson.version);
  });

  it('uses NEXT_PUBLIC_APP_VERSION when set', async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    process.env.NEXT_PUBLIC_APP_VERSION = '3.1.0';
    const buildInfo = await getBuildInfo();
    expect(buildInfo.version).toBe('3.1.0');
  });

  it("uses commit 'local' when no sha envs are set", async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    const buildInfo = await getBuildInfo();
    expect(buildInfo.commit).toBe('local');
  });

  it('takes first 12 hex chars of NEXT_PUBLIC_GIT_SHA when set', async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    process.env.NEXT_PUBLIC_GIT_SHA = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6';
    const buildInfo = await getBuildInfo();
    expect(buildInfo.commit).toBe('a1b2c3d4e5f6');
  });

  it('uses GIT_COMMIT_SHA when NEXT_PUBLIC_GIT_SHA is unset', async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    process.env.GIT_COMMIT_SHA = 'fedcba9876543210fedcba9876543210';
    const buildInfo = await getBuildInfo();
    expect(buildInfo.commit).toBe('fedcba987654');
  });

  it('uses CF_PAGES_COMMIT_SHA when the first two are unset', async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    process.env.CF_PAGES_COMMIT_SHA = '11111111111111111111111111111111';
    const buildInfo = await getBuildInfo();
    expect(buildInfo.commit).toBe('111111111111');
  });

  it("treats all-whitespace sha as 'local' after trim", async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    process.env.NEXT_PUBLIC_GIT_SHA = '   \t  ';
    const buildInfo = await getBuildInfo();
    expect(buildInfo.commit).toBe('local');
  });

  it("uses builtAt 'unknown' when NEXT_PUBLIC_BUILD_TIME is not set", async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    const buildInfo = await getBuildInfo();
    expect(buildInfo.builtAt).toBe('unknown');
  });

  it('uses NEXT_PUBLIC_BUILD_TIME when set', async () => {
    vi.resetModules();
    clearBuildInfoEnv();
    process.env.NEXT_PUBLIC_BUILD_TIME = '2025-12-25T00:00:00.000Z';
    const buildInfo = await getBuildInfo();
    expect(buildInfo.builtAt).toBe('2025-12-25T00:00:00.000Z');
  });
});
