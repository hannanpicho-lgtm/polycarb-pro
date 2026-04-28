@echo off
REM 2) npm audit with high+ severity gate (fails the script if any high or critical)
setlocal
cd /d "%~dp0\.."
call npm audit --audit-level=high
exit /b %errorlevel%
