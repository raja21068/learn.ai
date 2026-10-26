#!/usr/bin/env sh
# Starts learn/ai on http://localhost:8000 so that everything works (videos, readers, notebooks).
# Do not open index.html as a file: YouTube refuses to play embedded videos on pages opened as files (Error 153).
cd "$(dirname "$0")" || exit 1
PY=$(command -v python3 || command -v python) || { echo "Python 3 was not found. Install it from https://www.python.org/downloads/"; exit 1; }
echo "Starting the site at http://localhost:8000 (press Ctrl+C to stop)"
( sleep 1; (command -v xdg-open >/dev/null && xdg-open http://localhost:8000) || (command -v open >/dev/null && open http://localhost:8000) ) >/dev/null 2>&1 &
exec "$PY" -m http.server 8000
