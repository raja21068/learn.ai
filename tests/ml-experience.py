"""End-to-end checks of the new Machine Learning learning experience in a real browser:
ML Lab experiment + prediction, personalised explanations, evidence page (kept separate from AI Agents), phone width.
Needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome.   Run: python tests/ml-experience.py"""
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

        ids = pg.evaluate("ML_COURSE.lessons.map(l => l.id)")
        assert len(ids) == 18 and ids[4] == 'model-lab' and ids[-1] == 'churn-project', ids

        # ---------- ML Lab ----------
        go('#/course/machine-learning/model-lab')
        pg.wait_for_selector('.w[data-widget=mllab]', state='attached')
        assert pg.locator('.w[data-widget=mllab]').get_attribute('inert') is not None, 'lab starts locked behind the prediction'
        pg.locator('.predict-opt').nth(3).click()                       # the correct prediction
        pg.locator('[data-predict-lock]').click(); pg.wait_for_timeout(100)
        assert 'matched' in txt('.predict-reveal') and pg.locator('.w[data-widget=mllab]').get_attribute('inert') is None
        w = '.w[data-widget=mllab] '

        def setn(name, v):
            pg.locator(w + f'[data-n={name}]').evaluate("(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}", str(v))

        def run():
            pg.locator(w + '[data-run]').click(); pg.wait_for_timeout(120)
            return txt(w + '.ar-stats')

        s3 = run()
        assert '0.26 training RMSE' in s3 and '0.41 validation RMSE' in s3 and '0.37 deployment RMSE' in s3, s3
        setn('degree', 9)
        s9 = run()
        assert '0.16 training RMSE' in s9 and '2.60 validation RMSE' in s9, s9                     # the prediction's claim
        assert 'Goal not met' in txt(w + '.w-status')
        setn('degree', 3); setn('n', 60)
        s60 = run()
        assert 'Goal met' in txt(w + '.w-status') and '0.33 deployment RMSE' in s60, s60
        pg.locator(w + '[data-leak]').set_checked(True); setn('n', 20)
        sl = run()
        assert '0.06 validation RMSE' in sl and '0.80 deployment RMSE' in sl and 'Goal not met' in txt(w + '.w-status'), sl
        pg.locator(w + '[data-sweep]').click(); pg.wait_for_timeout(100)
        assert pg.locator(w + 'table.ar-log').first.locator('tbody tr').count() == 12 and 'best on validation' in txt(w + 'table.ar-log')
        assert pg.locator(w + 'table.ar-log').nth(1).locator('tbody tr').count() >= 4, 'runs accumulate in the experiment log'
        print('PASS ML lab: locked behind prediction, numbers match the engine, leak red flag, goal, sweep, log')

        # ---------- personalised explanations ----------
        go('#/course/machine-learning/ml-landscape')
        pg.wait_for_selector('details.coach', state='attached')
        pg.locator('details.coach summary').click(); pg.wait_for_timeout(100)
        assert 'No practice recorded' in txt('.coach-why') and pg.locator('[data-coach-mode=analogy]').inner_text().endswith('★')
        correct = pg.evaluate("ML_COURSE.lessons.find(l => l.id === 'ml-landscape').quiz[0].correct")
        wrong = 0 if correct != 0 else 1
        pg.locator('.q[data-q="0"] [data-opt]').nth(wrong).click(); pg.wait_for_timeout(100)
        pg.locator('details.coach summary').click(); pg.locator('details.coach summary').click(); pg.wait_for_timeout(150)
        assert 'quiz question' in txt('.coach-why') and pg.locator('[data-coach-mode=mistake]').inner_text().endswith('★'), txt('.coach-why')
        pg.locator('[data-coach-mode=stretch]').click(); pg.wait_for_timeout(50)
        assert 'task you know' in txt('.coach-body')
        for lid in ids:
            go('#/course/machine-learning/' + lid)
            assert pg.locator('details.coach').count() == 1, lid
        go('#/course/ai-foundations/probability'); assert pg.locator('details.coach').count() == 0
        print('PASS coach: follows a wrong quiz answer, 18/18 ML lessons covered, other courses untouched')

        # ---------- evidence page ----------
        go('#/course/machine-learning'); pg.wait_for_selector('.learn-course-cta', state='attached')
        assert pg.locator('a[href="#/evidence/machine-learning"]').count() == 1
        go('#/evidence/machine-learning'); pg.wait_for_selector('.ev-page')
        assert pg.locator('.ev-table tbody tr').count() == 6 and pg.locator('fieldset.ev-item').count() == 8
        fs = pg.locator('fieldset[data-ev-t=m1]')
        fs.locator('input').nth(2).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # correct
        assert 'Correct.' in txt('fieldset[data-ev-t=m1] .ev-why')
        fs = pg.locator('fieldset[data-ev-t=m2]')
        fs.locator('input').nth(1).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # wrong
        assert 'Not this time' in txt('fieldset[data-ev-t=m2] .ev-why')
        assert '1/8' in txt('.learn-metrics'), txt('.learn-metrics')
        tb = pg.locator('[data-ev-teach="0"]')
        tb.locator('textarea').fill('Too short.'); tb.locator('[data-ev-submit]').click()
        assert 'at least 40' in txt('[data-ev-teach="0"] [data-ev-count]')
        answer = ('A training score only measures how well the model fits data it has seen and can memorise. I need held-out validation data to detect overfitting, '
                  'and when a result looks suspiciously too good I look for leakage before I trust it, because training numbers alone say nothing about deployment.')
        tb.locator('textarea').fill(answer); tb.locator('[data-ev-submit]').click(); pg.wait_for_timeout(100)
        assert 'Keyword check: 4 of 4' in txt('[data-ev-teach="0"] .ev-why')
        stored = pg.evaluate("JSON.parse(localStorage.getItem('learnai-evidence-v1')).teach")
        assert 'machine-learning:0' in stored and '0' not in stored, stored          # separate keys from the AI Agents numeric ones
        # the AI Agents page must not show the ML records
        go('#/evidence/ai-agents'); pg.wait_for_selector('.ev-page')
        assert 'not written' in txt('.ev-table tbody tr:first-child') and pg.locator('fieldset[data-ev-t=t1] input').first.is_disabled() is False
        go('#/evidence/machine-learning'); pg.wait_for_selector('.ev-page')
        assert '4/4 ideas' in txt('.ev-table tbody tr:first-child') and pg.locator('[data-ev-teach="0"] textarea').get_attribute('readonly') is not None
        with pg.expect_download() as d:
            pg.locator('[data-ev-export]').click()
        data = json.loads(Path(d.value.path()).read_text(encoding='utf-8'))
        assert data['course'] == 'machine-learning' and set(data['transfer']) == {'m1', 'm2'} and list(data['written']) == ['machine-learning:0'] and len(data['summary']) == 6
        go('#/evidence/ai-foundations'); assert pg.locator('.ev-page').count() == 0, 'unsupported courses have no evidence page'
        print('PASS evidence page: ML records stay separate from AI Agents, export is scoped to the course')

        # ---------- phone width ----------
        pg.set_viewport_size({'width': 390, 'height': 800})
        for h in ('#/evidence/machine-learning', '#/course/machine-learning/model-lab', '#/course/machine-learning/churn-project'):
            go(h); pg.wait_for_timeout(300)
            over = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            main_over = pg.evaluate("(() => { const m = document.getElementById('p-main'); return m ? [m.scrollWidth, m.clientWidth] : null })()")
            assert over[0] <= over[1] + 1, (h, over)
            assert not main_over or main_over[0] <= main_over[1] + 1, (h, main_over)
        pg.screenshot(path=str(ART / 'ml_mobile.png'))
        print('PASS phone width: no horizontal overflow on evidence, lab and project pages')

        assert not errors, errors
        b.close()
    print('PASS ML experience: lab, coach, evidence, mobile, zero JS exceptions')


if __name__ == '__main__':
    main()
