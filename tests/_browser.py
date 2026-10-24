"""Portable Chromium launcher for the browser tests: CHROMIUM_PATH, else /usr/bin/chromium (Linux), else the installed Edge or Chrome.
Run the Python tests with PYTHONUTF8=1 on Windows (several read UTF-8 files with the default encoding)."""
import os

def launch_browser(p, **kw):
    path = os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if os.path.exists('/usr/bin/chromium') else None)
    if path:
        return p.chromium.launch(headless=True, executable_path=path, args=['--no-sandbox', '--disable-dev-shm-usage'])
    for channel in ('msedge', 'chrome'):
        try:
            return p.chromium.launch(headless=True, channel=channel)
        except Exception:
            continue
    return p.chromium.launch(headless=True)
