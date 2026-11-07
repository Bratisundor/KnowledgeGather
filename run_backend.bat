@echo off
echo ========================================================
echo Starting ChatChase FastAPI Backend on http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0"
set PYTHONPATH=%CD%
.\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend encountered an error or stopped.
    pause
)
