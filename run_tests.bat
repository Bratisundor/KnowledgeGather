@echo off
echo ========================================================
echo Running ChatChase Automated Test Suite
echo ========================================================
.\venv\Scripts\python.exe -m unittest discover -s backend/tests -v

