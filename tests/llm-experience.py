"""End-to-end checks of the new LLM Engineering learning experience in a real browser:
LLM Service Lab + prediction, personalised explanations, evidence page (kept separate from the other courses), phone width.
Needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome.   Run: python tests/llm-experience.py"""
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

        ids = pg.evaluate("LLM_COURSE.lessons.map(l => l.id)")
        assert len(ids) == 16 and ids[11] == 'llm-service-lab' and ids[-1] == 'llm-gateway-project', ids

        # ---------- LLM Service Lab ----------
        go('#/course/llm-engineering/llm-service-lab')
        pg.wait_for_selector('.w[data-widget=llmlab]', state='attached')
        assert pg.locator('.w[data-widget=llmlab]').get_attribute('inert') is not None, 'lab starts locked behind the prediction'
        pg.locator('.predict-opt').nth(2).click()                       # the correct prediction
        pg.locator('[data-predict-lock]').click(); pg.wait_for_timeout(100)
        assert 'matched' in txt('.predict-reveal') and pg.locator('.w[data-widget=llmlab]').get_attribute('inert') is None
        w = '.w[data-widget=llmlab] '

        def serve(model='small', quant='fp16', cache=False, cascade=False):
            pg.locator(w + '[data-k=cascade]').set_checked(cascade)
            pg.locator(w + '[data-k=cache]').set_checked(cache)
            if not cascade:
                pg.locator(w + '[data-s=model]').select_option(model)
            pg.locator(w + '[data-s=quant]').select_option(quant)
            pg.locator(w + '[data-run]').click(); pg.wait_for_timeout(120)
            return txt(w + '.ar-stats')

        med = serve('medium')
        assert '92.5% correct answers' in med and '1298 ms p95 latency' in med and '$0.0148 total cost' in med, med
        assert 'Goal met' in txt(w + '.w-status')
        casc = serve(cascade=True)
        assert '92.5% correct answers' in casc and '3535 ms p95 latency' in casc and '$0.0755 total cost' in casc and '19 escalated to large' in casc, casc   # the prediction's claim
        assert 'Goal not met' in txt(w + '.w-status')
        pg.locator(w + '.ar-dot').nth(11).click(); pg.wait_for_timeout(50)                                # request 12, an overconfident one
        assert 'confident but WRONG' in txt(w + '.ar-detail'), txt(w + '.ar-detail')
        cached = serve('medium', cache=True)
        assert '12 cache hits' in cached and '1298 ms p95 latency' in cached, cached                       # the cache changes cost, not tail latency
        small8 = serve('small', 'int8')
        assert '45.0% correct answers' in small8, small8
        assert pg.locator(w + '.ar-dot').count() == 40
        assert pg.locator(w + '.ar-log tbody tr').count() == 4, 'the four runs accumulate in the experiment log'
        print('PASS LLM lab: locked behind prediction, numbers match the engine, cascade misses, cache vs p95, quantization, log')

        # ---------- personalised explanations ----------
        go('#/course/llm-engineering/ai-twin-architecture')
        pg.wait_for_selector('details.coach', state='attached')
        pg.locator('details.coach summary').click(); pg.wait_for_timeout(100)
        assert 'No practice recorded' in txt('.coach-why') and pg.locator('[data-coach-mode=analogy]').inner_text().endswith('★')
        correct = pg.evaluate("LLM_COURSE.lessons.find(l => l.id === 'ai-twin-architecture').quiz[0].correct")
        wrong = 0 if correct != 0 else 1
        pg.locator('.q[data-q="0"] [data-opt]').nth(wrong).click(); pg.wait_for_timeout(100)
        pg.locator('details.coach summary').click(); pg.locator('details.coach summary').click(); pg.wait_for_timeout(150)
        assert 'quiz question' in txt('.coach-why') and pg.locator('[data-coach-mode=mistake]').inner_text().endswith('★'), txt('.coach-why')
        pg.locator('[data-coach-mode=stretch]').click(); pg.wait_for_timeout(50)
        assert 'fail for an hour' in txt('.coach-body')
        for lid in ids:
            go('#/course/llm-engineering/' + lid)
            assert pg.locator('details.coach').count() == 1, lid
        go('#/course/ai-foundations/probability'); assert pg.locator('details.coach').count() == 0
        print('PASS coach: follows a wrong quiz answer, 16/16 LLM lessons covered, other courses untouched')

        # ---------- evidence page ----------
        go('#/course/llm-engineering'); pg.wait_for_selector('.learn-course-cta', state='attached')
        assert pg.locator('a[href="#/evidence/llm-engineering"]').count() == 1
        go('#/evidence/llm-engineering'); pg.wait_for_selector('.ev-page')
        assert pg.locator('.ev-table tbody tr').count() == 6 and pg.locator('fieldset.ev-item').count() == 8
        fs = pg.locator('fieldset[data-ev-t=l1]')
        fs.locator('input').nth(2).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # correct
        assert 'Correct.' in txt('fieldset[data-ev-t=l1] .ev-why')
        fs = pg.locator('fieldset[data-ev-t=l2]')
        fs.locator('input').nth(1).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # wrong
        assert 'Not this time' in txt('fieldset[data-ev-t=l2] .ev-why')
        assert '1/8' in txt('.learn-metrics'), txt('.learn-metrics')
        tb = pg.locator('[data-ev-teach="0"]')
        tb.locator('textarea').fill('Too short.'); tb.locator('[data-ev-submit]').click()
        assert 'at least 40' in txt('[data-ev-teach="0"] [data-ev-count]')
        answer = ('The three pipelines stay independent and decoupled, which lets me rerun, scale or replace one of them without touching the others. '
                  'The feature store holds the data and features, the registry stores each model version, and inference loads the latest version, so I can reproduce results.')
        tb.locator('textarea').fill(answer); tb.locator('[data-ev-submit]').click(); pg.wait_for_timeout(100)
        assert 'Keyword check: 4 of 4' in txt('[data-ev-teach="0"] .ev-why')
        stored = pg.evaluate("JSON.parse(localStorage.getItem('learnai-evidence-v1')).teach")
        assert 'llm-engineering:0' in stored and '0' not in stored, stored
        go('#/evidence/ai-agents'); pg.wait_for_selector('.ev-page')
        assert 'not written' in txt('.ev-table tbody tr:first-child')
        go('#/evidence/machine-learning'); pg.wait_for_selector('.ev-page')
        assert 'not written' in txt('.ev-table tbody tr:first-child')
        go('#/evidence/llm-engineering'); pg.wait_for_selector('.ev-page')
        assert '4/4 ideas' in txt('.ev-table tbody tr:first-child') and pg.locator('[data-ev-teach="0"] textarea').get_attribute('readonly') is not None
        with pg.expect_download() as d:
            pg.locator('[data-ev-export]').click()
        data = json.loads(Path(d.value.path()).read_text(encoding='utf-8'))
        assert data['course'] == 'llm-engineering' and set(data['transfer']) == {'l1', 'l2'} and list(data['written']) == ['llm-engineering:0'] and len(data['summary']) == 6
        print('PASS evidence page: LLM records stay separate from the other courses, export is scoped to the course')

        # ---------- phone width ----------
        pg.set_viewport_size({'width': 390, 'height': 800})
        for h in ('#/evidence/llm-engineering', '#/course/llm-engineering/llm-service-lab', '#/course/llm-engineering/llm-gateway-project'):
            go(h); pg.wait_for_timeout(300)
            over = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            main_over = pg.evaluate("(() => { const m = document.getElementById('p-main'); return m ? [m.scrollWidth, m.clientWidth] : null })()")
            assert over[0] <= over[1] + 1, (h, over)
            assert not main_over or main_over[0] <= main_over[1] + 1, (h, main_over)
        pg.screenshot(path=str(ART / 'llm_mobile.png'))
        print('PASS phone width: no horizontal overflow on evidence, lab and project pages')

        assert not errors, errors
        b.close()
    print('PASS LLM experience: lab, coach, evidence, mobile, zero JS exceptions')


if __name__ == '__main__':
    main()
