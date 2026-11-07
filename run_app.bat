@echo off
echo ========================================================
echo Launching ChatChase: Multi-Agent Chat Intelligence Platform
echo ========================================================
cd /d "%~dp0"

echo Starting FastAPI Backend (Port 8000)...
start "ChatChase Backend" cmd /c "run_backend.bat"

echo Starting Next.js Frontend (Port 3000)...
start "ChatChase Frontend" cmd /c "run_frontend.bat"

echo.
echo Both services launched!
echo Opening browser at http://localhost:3000 in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo Press any key to exit this launcher window.
echo (The backend and frontend server windows will stay active in the background.)
pause >nul
