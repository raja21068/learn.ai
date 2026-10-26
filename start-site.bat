@echo off
rem Starts learn/ai on http://localhost:8000 so that everything works (videos, readers, notebooks).
rem Do not double-click index.html: YouTube refuses to play embedded videos on pages opened as files (Error 153).
cd /d "%~dp0"
where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3 from https://www.python.org/downloads/ and run this file again.
  pause
  exit /b 1
)
echo Starting the site at http://localhost:8000 . Close the new "learn/ai server" window to stop it.
start "learn/ai server" python -m http.server 8000
timeout /t 2 /nobreak >nul
start "" http://localhost:8000
