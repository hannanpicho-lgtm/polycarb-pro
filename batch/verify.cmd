@echo off
REM 1) Static gate: check:all + next build (same as "npm run verify" from repo root)
setlocal
cd /d "%~dp0\.."
set HUSKY=0
set CI=true
call npm run verify
exit /b %errorlevel%
