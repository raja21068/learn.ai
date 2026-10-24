"""Runs the labs of the two new LLM Engineering lessons in the real in-browser Python (Pyodide) runner:
every worked solution must pass its hidden test and every starter must fail it.
Needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome, network access for Pyodide.
Run: python tests/agents-labs.py   (BASE_URL overrides http://localhost:8765)"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://localhost:8765') + '/index.html'
LESSONS = ['llm-service-lab', 'llm-gateway-project']


def launch(p):
    path = os.environ.get('CHROMIUM_PATH')
    if path:
        return p.chromium.launch(headless=True, executable_path=path, args=['--no-sandbox'])
    for channel in ('msedge', 'chrome'):
        try:
            return p.chromium.launch(headless=True, channel=channel)
        except Exception:
            continue
    return p.chromium.launch(headless=True)


with sync_playwright() as p:
    b = launch(p)
    pg = b.new_page()
    errors = []
    pg.on('pageerror', lambda e: errors.append(str(e)))
    pg.goto(BASE)
    pg.wait_for_timeout(600)
    n = 0
    for lid in LESSONS:
        tasks = pg.evaluate("lid => LLM_COURSE.lessons.find(l => l.id === lid).lab.tasks.map(t => ({starter: t.starter, solution: t.solution, test: t.test}))", lid)
        for i, t in enumerate(tasks):
            sol = pg.evaluate("t => window.__runPython(t.solution, t.test)", t)
            assert sol['ok'], (lid, i, 'solution fails', sol)
            st = pg.evaluate("t => window.__runPython(t.starter, t.test)", t)
            assert not st['ok'], (lid, i, 'starter must fail the hidden test')
            n += 1
    assert not errors, errors
    b.close()
print(f'PASS LLM labs: {n} tasks, every solution passes and every starter fails (real Pyodide)')
