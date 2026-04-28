@echo off
REM 3) Full go-readiness: runs verify, npm audit (JSON), repo checks, writes reports\prod-go-readiness.json
REM    This is the batch to run to assess production readiness in one go.
setlocal
cd /d "%~dp0\.."
set HUSKY=0
set CI=true
node scripts\go-readiness.mjs
exit /b %errorlevel%
