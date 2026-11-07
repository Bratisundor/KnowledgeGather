@echo off
echo ========================================================
echo Starting ChatChase Next.js Frontend on http://localhost:3000
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Frontend encountered an error or stopped.
    pause
)
