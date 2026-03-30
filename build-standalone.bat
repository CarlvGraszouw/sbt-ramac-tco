@echo off
cd /d "%~dp0"
node scripts\build-standalone.mjs
if errorlevel 1 exit /b 1
echo.
echo Done. Standalone HTML files updated in this folder.
pause
