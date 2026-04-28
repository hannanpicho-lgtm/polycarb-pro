import { spawnSync } from 'node:child_process';

function exec(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
    ...options,
  });

  if (result.error) {
    throw result.error;
  }

  return result;
}

function run(command, args, options = {}) {
  const result = exec(command, args, options);
  if (result.status !== 0) {
    const stderr = (result.stderr || '').trim();
    const stdout = (result.stdout || '').trim();
    const details = stderr || stdout || `${command} exited with ${result.status}`;
    throw new Error(details);
  }
  return (result.stdout || '').trim();
}

function getActiveBranch() {
  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch || branch === 'HEAD') {
    throw new Error('Detached HEAD is not supported for production contract push.');
  }
  return branch;
}

function hasChanges() {
  return run('git', ['status', '--porcelain']).length > 0;
}

function main() {
  const branch = getActiveBranch();
  const startSha = run('git', ['rev-parse', 'HEAD']);

  const result = {
    branch,
    hasChanges: hasChanges(),
    commitHash: startSha,
    pushSuccess: false,
    deployTriggerConditionMet: branch === 'main',
  };

  if (result.hasChanges) {
    run('git', ['add', '-A']);
    const staged = exec('git', ['diff', '--cached', '--quiet']);
    if (staged.status === 0) {
      throw new Error('Contract failed: changes detected, but nothing staged for commit.');
    }

    run('git', ['commit', '-m', 'chore: enforce commit-push-deploy contract']);
    result.commitHash = run('git', ['rev-parse', 'HEAD']);
    run('git', ['push', '-u', 'origin', `HEAD:${branch}`]);
    result.pushSuccess = true;
  } else {
    result.pushSuccess = true;
  }

  if (result.hasChanges && !result.pushSuccess) {
    throw new Error('Contract failed: changes existed but commit/push did not complete.');
  }

  if (!result.deployTriggerConditionMet) {
    throw new Error(
      `Contract failed: active branch is '${branch}', not 'main'; production deploy trigger condition is not met.`
    );
  }

  console.log('Production contract check:');
  console.log(`- branch: ${result.branch}`);
  console.log(`- changes_detected: ${result.hasChanges}`);
  console.log(`- commit_hash: ${result.commitHash}`);
  console.log(`- push_success: ${result.pushSuccess}`);
  console.log(`- deploy_trigger_condition_met: ${result.deployTriggerConditionMet}`);
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
}
