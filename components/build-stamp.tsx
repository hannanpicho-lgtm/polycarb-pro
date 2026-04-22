import { buildInfo } from '@/lib/build-info';

export function BuildStamp() {
  const parsedBuiltAt =
    buildInfo.builtAt === 'unknown' ? Number.NaN : new Date(buildInfo.builtAt).getTime();
  const builtAtLabel = Number.isNaN(parsedBuiltAt)
    ? 'build time unknown'
    : new Date(parsedBuiltAt).toISOString().slice(0, 16).replace('T', ' ');

  return (
    <span className="text-[11px] text-white/40" title={`Built at ${buildInfo.builtAt}`}>
      v{buildInfo.version} · {buildInfo.commit} · {builtAtLabel} UTC
    </span>
  );
}

