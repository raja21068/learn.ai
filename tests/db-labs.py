"""Runs the SQL labs of the two new Databases lessons on the site's own in-browser SQLite (sql.js), using the same grading
rules as the lab: every statement runs on a fresh copy of DB_SEED, the result of `check` (or of the last statement) is
normalised, and rows are compared (in order only when the task says so). Each worked solution must produce a non-empty
result, and each starter must NOT match it.
Needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome, network access for sql.js.
Run: python tests/db-labs.py   (BASE_URL overrides http://localhost:8765)"""
import os
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://localhost:8765') + '/index.html'
LESSONS = ['index-lab', 'gym-booking-project']

JS = """
async (lid) => {
  const SQL = await window.loadSQL();
  const tasks = DB_COURSE.lessons.find(l => l.id === lid).lab.tasks;
  const exec = (code, check) => { const d = new SQL.Database(); d.exec(window.DB_SEED); try { const r = d.exec(code); return check ? d.exec(check) : r; } finally { d.close(); } };
  const norm = res => { const rs = res && res.length ? res[res.length - 1] : { columns: [], values: [] }; return { n: rs.columns.length, rows: rs.values.map(r => r.map(v => typeof v === 'number' ? Math.round(v * 100) / 100 : v === null ? null : String(v).trim())) }; };
  const same = (a, b, ordered) => { if (a.n !== b.n || a.rows.length !== b.rows.length) return false; const s = x => x.map(r => JSON.stringify(r)); const A = s(a.rows), B = s(b.rows); if (!ordered) { A.sort(); B.sort(); } return A.every((v, i) => v === B[i]); };
  return tasks.map((t, i) => {
    const sol = norm(exec(t.solution, t.check));
    let st, stErr = null; try { st = norm(exec(t.starter, t.check)); } catch (e) { st = null; stErr = e.message; }
    return { i, solRows: sol.rows.length, solCols: sol.n, starterMatches: st ? same(sol, st, t.ordered) : false, starterError: stErr, first: sol.rows[0] };
  });
}
"""


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
        for r in pg.evaluate(JS, lid):
            assert r['solRows'] > 0 and r['solCols'] > 0, (lid, r, 'the worked solution must produce a result')
            assert not r['starterMatches'], (lid, r, 'the starter must not pass')
            n += 1
    assert not errors, errors
    b.close()
print(f'PASS database labs: {n} SQL tasks on the real in-browser SQLite, every solution produces a result and no starter passes')
