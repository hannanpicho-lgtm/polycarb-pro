@echo off
REM Same as go-readiness.cmd, but the build step is verify:opennext (cf:build) — full parity with GitHub PR CI.
setlocal
cd /d "%~dp0\.."
set HUSKY=0
set CI=true
set READINESS_OPENNEXT=1
node scripts\go-readiness.mjs
exit /b %errorlevel%
