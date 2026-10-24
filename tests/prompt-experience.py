"""End-to-end checks of the new Prompt Engineering learning experience in a real browser:
Prompt Lab + prediction, personalised explanations, evidence page (kept separate from the other courses), phone width.
Needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome.   Run: python tests/prompt-experience.py"""
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

        ids = pg.evaluate("PROMPT_COURSE.lessons.map(l => l.id)")
        assert len(ids) == 24 and ids[8] == 'prompt-lab' and ids[-1] == 'prompt-feature-project', ids

        # ---------- Prompt Lab ----------
        go('#/course/prompt-engineering/prompt-lab')
        pg.wait_for_selector('.w[data-widget=promptlab]', state='attached')
        assert pg.locator('.w[data-widget=promptlab]').get_attribute('inert') is not None, 'lab starts locked behind the prediction'
        pg.locator('.predict-opt').nth(2).click()                       # the correct prediction
        pg.locator('[data-predict-lock]').click(); pg.wait_for_timeout(100)
        assert 'matched' in txt('.predict-reveal') and pg.locator('.w[data-widget=promptlab]').get_attribute('inert') is None
        w = '.w[data-widget=promptlab] '

        def build(**cfg):
            for k in ('instruction', 'context', 'format', 'examples', 'temperature'):
                if k in cfg:
                    pg.locator(w + f'[data-s={k}]').select_option(cfg[k])
            for k in ('constraints', 'delimiters', 'reasoning', 'abstain'):
                if k in cfg:
                    pg.locator(w + f'[data-k={k}]').set_checked(cfg[k])

        def run():
            pg.locator(w + '[data-run]').click(); pg.wait_for_timeout(120)
            return txt(w + '.ar-stats')

        s0 = run()
        assert '1/8 tasks passed' in s0 and '57 prompt tokens' in s0, s0
        build(instruction='precise', context='full', format='schema', examples='none', constraints=True, delimiters=True, reasoning=True, abstain=True)
        s1 = run()
        assert '8/8 tasks passed' in s1 and '186 prompt tokens' in s1, s1
        assert 'Goal not met' in txt(w + '.w-status'), 'the complete prompt is too long for the goal'
        build(context='none')
        s2 = run()
        assert '7/8 tasks passed' in s2 and '106 prompt tokens' in s2 and 'Goal met' in txt(w + '.w-status'), s2
        build(examples='skewed')
        s3 = run()
        assert '6/8 tasks passed' in s3 and '166 prompt tokens' in s3, s3                                 # the prediction's claim
        assert 'mostly one label' in txt(w + '.pl-results'), txt(w + '.pl-results')
        assert pg.locator(w + '.pl-results li').count() == 8 and pg.locator(w + '.ar-log tbody tr').count() == 4
        print('PASS Prompt Lab: locked behind prediction, numbers match the engine, ablation, skewed examples, goal, log')

        # ---------- personalised explanations ----------
        go('#/course/prompt-engineering/how-llms-read-prompts')
        pg.wait_for_selector('details.coach', state='attached')
        pg.locator('details.coach summary').click(); pg.wait_for_timeout(100)
        assert 'No practice recorded' in txt('.coach-why') and pg.locator('[data-coach-mode=analogy]').inner_text().endswith('★')
        correct = pg.evaluate("PROMPT_COURSE.lessons.find(l => l.id === 'how-llms-read-prompts').quiz[0].correct")
        wrong = 0 if correct != 0 else 1
        pg.locator('.q[data-q="0"] [data-opt]').nth(wrong).click(); pg.wait_for_timeout(100)
        pg.locator('details.coach summary').click(); pg.locator('details.coach summary').click(); pg.wait_for_timeout(150)
        assert 'quiz question' in txt('.coach-why') and pg.locator('[data-coach-mode=mistake]').inner_text().endswith('★'), txt('.coach-why')
        pg.locator('[data-coach-mode=stretch]').click(); pg.wait_for_timeout(50)
        assert 'top-p' in txt('.coach-body')
        for lid in ids:
            go('#/course/prompt-engineering/' + lid)
            assert pg.locator('details.coach').count() == 1, lid
        go('#/course/ai-foundations/probability'); assert pg.locator('details.coach').count() == 0
        print('PASS coach: follows a wrong quiz answer, 24/24 Prompt lessons covered, other courses untouched')

        # ---------- evidence page ----------
        go('#/course/prompt-engineering'); pg.wait_for_selector('.learn-course-cta', state='attached')
        assert pg.locator('a[href="#/evidence/prompt-engineering"]').count() == 1
        go('#/evidence/prompt-engineering'); pg.wait_for_selector('.ev-page')
        assert pg.locator('.ev-table tbody tr').count() == 5 and pg.locator('fieldset.ev-item').count() == 8
        fs = pg.locator('fieldset[data-ev-t=p1]')
        fs.locator('input').nth(2).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # correct
        assert 'Correct.' in txt('fieldset[data-ev-t=p1] .ev-why')
        fs = pg.locator('fieldset[data-ev-t=p2]')
        fs.locator('input').nth(1).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)      # wrong
        assert 'Not this time' in txt('fieldset[data-ev-t=p2] .ev-why')
        assert '1/8' in txt('.learn-metrics'), txt('.learn-metrics')
        tb = pg.locator('[data-ev-teach="0"]')
        tb.locator('textarea').fill('Too short.'); tb.locator('[data-ev-submit]').click()
        assert 'at least 40' in txt('[data-ev-teach="0"] [data-ev-count]')
        answer = ('The role sets the persona and tone, the task and the context say what to do and what background to use, and the output format, such as a JSON schema, '
                  'makes the result usable by code, so a vague request leaves every decision to the model and it has to guess what you really wanted.')
        tb.locator('textarea').fill(answer); tb.locator('[data-ev-submit]').click(); pg.wait_for_timeout(100)
        assert 'Keyword check: 4 of 4' in txt('[data-ev-teach="0"] .ev-why')
        stored = pg.evaluate("JSON.parse(localStorage.getItem('learnai-evidence-v1')).teach")
        assert 'prompt-engineering:0' in stored and '0' not in stored, stored
        for other in ('ai-agents', 'machine-learning', 'llm-engineering'):
            go('#/evidence/' + other); pg.wait_for_selector('.ev-page')
            assert 'not written' in txt('.ev-table tbody tr:first-child'), other
        go('#/evidence/prompt-engineering'); pg.wait_for_selector('.ev-page')
        assert '4/4 ideas' in txt('.ev-table tbody tr:first-child') and pg.locator('[data-ev-teach="0"] textarea').get_attribute('readonly') is not None
        with pg.expect_download() as d:
            pg.locator('[data-ev-export]').click()
        data = json.loads(Path(d.value.path()).read_text(encoding='utf-8'))
        assert data['course'] == 'prompt-engineering' and set(data['transfer']) == {'p1', 'p2'} and list(data['written']) == ['prompt-engineering:0'] and len(data['summary']) == 5
        print('PASS evidence page: Prompt records stay separate from the other courses, export is scoped to the course')

        # ---------- phone width ----------
        pg.set_viewport_size({'width': 390, 'height': 800})
        for h in ('#/evidence/prompt-engineering', '#/course/prompt-engineering/prompt-lab', '#/course/prompt-engineering/prompt-feature-project'):
            go(h); pg.wait_for_timeout(300)
            over = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            main_over = pg.evaluate("(() => { const m = document.getElementById('p-main'); return m ? [m.scrollWidth, m.clientWidth] : null })()")
            assert over[0] <= over[1] + 1, (h, over)
            assert not main_over or main_over[0] <= main_over[1] + 1, (h, main_over)
        pg.screenshot(path=str(ART / 'prompt_mobile.png'))
        print('PASS phone width: no horizontal overflow on evidence, lab and project pages')

        assert not errors, errors
        b.close()
    print('PASS Prompt experience: lab, coach, evidence, mobile, zero JS exceptions')


if __name__ == '__main__':
    main()
