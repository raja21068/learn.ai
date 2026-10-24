"""End-to-end checks of the new Databases learning experience in a real browser:
Index Lab on the real in-browser SQLite + prediction, personalised explanations, evidence page (separate from the other courses), phone width.
Needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome, network access for sql.js.   Run: python tests/db-experience.py"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://localhost:8765') + '/index.html'
ART = Path(__file__).resolve().parent / 'artifacts'
ART.mkdir(exist_ok=True)


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


def main():
    errors = []
    with sync_playwright() as p:
        b = launch(p)
        ctx = b.new_context(viewport={'width': 1300, 'height': 900}, accept_downloads=True)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(BASE); pg.wait_for_timeout(500)

        def go(hash_):
            pg.evaluate(f"location.hash='{hash_}'"); pg.wait_for_timeout(350)

        def txt(sel):
            return ' '.join(pg.locator(sel).first.inner_text().split())

        ids = pg.evaluate("DB_COURSE.lessons.map(l => l.id)")
        assert len(ids) == 20 and ids[13] == 'index-lab' and ids[-1] == 'gym-booking-project', ids

        # ---------- Index Lab (real SQLite) ----------
        go('#/course/databases/index-lab')
        pg.wait_for_selector('.w[data-widget=indexlab]', state='attached')
        assert pg.locator('.w[data-widget=indexlab]').get_attribute('inert') is not None, 'lab starts locked behind the prediction'
        pg.locator('.predict-opt').nth(2).click()                       # the correct prediction
        pg.locator('[data-predict-lock]').click(); pg.wait_for_timeout(100)
        assert 'matched' in txt('.predict-reveal') and pg.locator('.w[data-widget=indexlab]').get_attribute('inert') is None
        w = '.w[data-widget=indexlab] '
        pg.wait_for_selector(w + '.il-queries', timeout=60000)             # SQLite has loaded and the no-index baseline is shown
        assert '8 queries scan all of orders' in txt(w + '.ar-stats') and '1 queries sort' in txt(w + '.ar-stats'), txt(w + '.ar-stats')

        def pick(*ids_):
            for ix in 'ABCDEFGH':
                box = pg.locator(w + f'[data-ix={ix}]')
                if box.is_checked() != (ix in ids_):
                    box.set_checked(ix in ids_)
            pg.wait_for_timeout(250)

        q = lambda n: txt(w + f'.il-queries > li:nth-child({n})')

        pick('E')                                                           # the prediction's claim: index used, rows still sorted
        assert 'SEARCH orders USING INDEX idx_status_region (status=? AND region=?)' in q(5) and 'USE TEMP B-TREE FOR ORDER BY' in q(5), q(5)
        pick('D')
        assert 'idx_region_status_created (region=? AND status=?)' in q(5) and 'TEMP B-TREE' not in q(5), q(5)
        pick('A', 'C', 'D')
        assert 'Goal met' in txt(w + '.w-status') and '3 queries scan all of orders' in txt(w + '.ar-stats') and '0 queries sort' in txt(w + '.ar-stats'), txt(w + '.ar-stats')
        assert 'SCAN orders' in q(4) and 'full scan' in q(4), 'a function on the column cannot use the index'
        assert 'SCAN orders' in q(6), 'a leading wildcard cannot use the index'
        assert 'returns 1,000 rows (25.0% of the orders table)' in q(2), q(2)
        pg.locator(w + '[data-log]').click(); pg.wait_for_timeout(100)
        pick('A', 'C', 'D', 'F')
        assert 'Goal not met' in txt(w + '.w-status') and '4 indexes created' in txt(w + '.ar-stats'), 'a fourth index breaks the budget'
        pick('F', 'C', 'D')
        assert 'Goal met' in txt(w + '.w-status') and '2 answered from the index alone' in txt(w + '.ar-stats') and 'COVERING INDEX' in q(7), txt(w + '.ar-stats')
        pg.locator(w + '[data-log]').click(); pg.wait_for_timeout(100)
        pick('C')
        assert 'scans the whole index' in q(5) or 'USE TEMP B-TREE' in q(5) or 'SCAN' in q(5), q(5)
        assert pg.locator(w + '.ar-log tbody tr').count() == 2, 'two designs are in the log'
        print('PASS Index Lab: locked behind prediction, real plans, composite order, sargability, goal, covering index, log')

        # ---------- personalised explanations ----------
        go('#/course/databases/why-databases')
        pg.wait_for_selector('details.coach', state='attached')
        pg.locator('details.coach summary').click(); pg.wait_for_timeout(100)
        assert 'No practice recorded' in txt('.coach-why') and pg.locator('[data-coach-mode=analogy]').inner_text().endswith('★')
        correct = pg.evaluate("DB_COURSE.lessons.find(l => l.id === 'why-databases').quiz[0].correct")
        wrong = 0 if correct != 0 else 1
        pg.locator('.q[data-q="0"] [data-opt]').nth(wrong).click(); pg.wait_for_timeout(100)
        pg.locator('details.coach summary').click(); pg.locator('details.coach summary').click(); pg.wait_for_timeout(150)
        assert 'quiz question' in txt('.coach-why') and pg.locator('[data-coach-mode=mistake]').inner_text().endswith('★'), txt('.coach-why')
        pg.locator('[data-coach-mode=stretch]').click(); pg.wait_for_timeout(50)
        assert 'three facts' in txt('.coach-body')
        for lid in ids:
            go('#/course/databases/' + lid)
            assert pg.locator('details.coach').count() == 1, lid
        go('#/course/ai-foundations/probability'); assert pg.locator('details.coach').count() == 0
        print('PASS coach: follows a wrong quiz answer, 20/20 Databases lessons covered, other courses untouched')

        # ---------- evidence page ----------
        go('#/course/databases'); pg.wait_for_selector('.learn-course-cta', state='attached')
        assert pg.locator('a[href="#/evidence/databases"]').count() == 1
        go('#/evidence/databases'); pg.wait_for_selector('.ev-page')
        assert pg.locator('.ev-table tbody tr').count() == 6 and pg.locator('fieldset.ev-item').count() == 8
        fs = pg.locator('fieldset[data-ev-t=d1]')
        fs.locator('input').nth(2).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # correct
        assert 'Correct.' in txt('fieldset[data-ev-t=d1] .ev-why')
        fs = pg.locator('fieldset[data-ev-t=d2]')
        fs.locator('input').nth(1).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # wrong
        assert 'Not this time' in txt('fieldset[data-ev-t=d2] .ev-why')
        assert '1/8' in txt('.learn-metrics'), txt('.learn-metrics')
        tb = pg.locator('[data-ev-teach="0"]')
        tb.locator('textarea').fill('Too short.'); tb.locator('[data-ev-submit]').click()
        assert 'at least 40' in txt('[data-ev-teach="0"] [data-ev-count]')
        answer = ('A company should use a database because separate files hold the same data in many places, which creates redundancy and then inconsistency when one copy is changed '
                  'and the others are not. A database stores shared data once for every application and can enforce integrity rules such as constraints, which a plain file cannot do.')
        tb.locator('textarea').fill(answer); tb.locator('[data-ev-submit]').click(); pg.wait_for_timeout(100)
        assert 'Keyword check: 4 of 4' in txt('[data-ev-teach="0"] .ev-why')
        stored = pg.evaluate("JSON.parse(localStorage.getItem('learnai-evidence-v1')).teach")
        assert 'databases:0' in stored and '0' not in stored, stored
        for other in ('ai-agents', 'machine-learning', 'llm-engineering', 'prompt-engineering'):
            go('#/evidence/' + other); pg.wait_for_selector('.ev-page')
            assert 'not written' in txt('.ev-table tbody tr:first-child'), other
        go('#/evidence/databases'); pg.wait_for_selector('.ev-page')
        assert '4/4 ideas' in txt('.ev-table tbody tr:first-child') and pg.locator('[data-ev-teach="0"] textarea').get_attribute('readonly') is not None
        with pg.expect_download() as d:
            pg.locator('[data-ev-export]').click()
        data = json.loads(Path(d.value.path()).read_text(encoding='utf-8'))
        assert data['course'] == 'databases' and set(data['transfer']) == {'d1', 'd2'} and list(data['written']) == ['databases:0'] and len(data['summary']) == 6
        print('PASS evidence page: Databases records stay separate from the other courses, export is scoped to the course')

        # ---------- phone width ----------
        pg.set_viewport_size({'width': 390, 'height': 800})
        for h in ('#/evidence/databases', '#/course/databases/index-lab', '#/course/databases/gym-booking-project'):
            go(h); pg.wait_for_timeout(500)
            over = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            main_over = pg.evaluate("(() => { const m = document.getElementById('p-main'); return m ? [m.scrollWidth, m.clientWidth] : null })()")
            assert over[0] <= over[1] + 1, (h, over)
            assert not main_over or main_over[0] <= main_over[1] + 1, (h, main_over)
        pg.screenshot(path=str(ART / 'db_mobile.png'))
        print('PASS phone width: no horizontal overflow on evidence, lab and project pages')

        assert not errors, errors
        b.close()
    print('PASS Databases experience: lab, coach, evidence, mobile, zero JS exceptions')


if __name__ == '__main__':
    main()
