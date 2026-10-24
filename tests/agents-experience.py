"""End-to-end checks of the new AI Agents learning experience in a real browser:
arena experiment + prediction, personalised explanations, evidence page, phone-width layout, no JS errors.
Needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome.   Run: python tests/agents-experience.py"""
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

        # ---------- arena lesson: course structure ----------
        info = pg.evaluate("AGENTS_COURSE.lessons.map(l => l.id)")
        assert 'agent-arena' in info and info[-1] == 'support-desk-project' and len(info) == 21, info
        go('#/course/ai-agents/agent-arena')
        pg.wait_for_selector('.w[data-widget=arena]', state='attached')
        assert pg.locator('.w[data-widget=arena]').get_attribute('inert') is not None, 'arena starts locked behind the prediction'
        assert pg.locator('.predict-card').count() == 1
        pg.locator('.predict-opt').nth(0).click()                 # the correct prediction
        pg.locator('[data-predict-lock]').click(); pg.wait_for_timeout(100)
        assert 'matched' in txt('.predict-reveal') and pg.locator('.w[data-widget=arena]').get_attribute('inert') is None
        w = '.w[data-widget=arena] '

        def run_cfg(**cfg):
            for k in ('validate', 'filter', 'approval', 'fallback', 'loopGuard'):
                box = pg.locator(w + f'[data-k={k}]')
                if box.is_checked() != bool(cfg.get(k)):
                    box.set_checked(bool(cfg.get(k)))
            for k in ('retries', 'budget'):
                pg.locator(w + f'[data-n={k}]').evaluate("(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}", str(cfg.get(k, 0 if k == 'retries' else 6)))
            pg.locator(w + '[data-run]').click(); pg.wait_for_timeout(100)
            return txt(w + '.ar-stats')

        base = run_cfg()
        assert '4 harmful actions' in base and '5 silently wrong' in base and '86 cost' in base, base
        only_filter = run_cfg(filter=True)
        assert '0 harmful actions' in only_filter and '5 silently wrong' in only_filter, only_filter    # the prediction's claim
        assert pg.locator(w + '.ar-dot').count() == 26
        pg.locator(w + '.ar-dot').nth(15).click(); pg.wait_for_timeout(50)                              # ticket 16 = injection
        assert 'injected instruction detected and ignored' in txt(w + '.ar-detail'), txt(w + '.ar-detail')
        assert 'Goal not met yet' in txt(w + '.w-status')
        run_cfg(retries=3, budget=9, validate=True, filter=True, fallback=True, loopGuard=True)
        assert 'Goal met' in txt(w + '.w-status') and '98 cost' in txt(w + '.ar-stats'), txt(w + '.ar-stats')
        assert pg.locator(w + '.ar-log tbody tr').count() >= 3, 'runs accumulate in the experiment log'
        print('PASS arena: locked behind prediction, ablation claims match the UI, ticket detail, goal, experiment log')

        # ---------- personalised explanations ----------
        go('#/course/ai-agents/tool-calling')
        pg.wait_for_selector('details.coach', state='attached')
        pg.locator('details.coach summary').click(); pg.wait_for_timeout(100)
        assert 'No practice recorded' in txt('.coach-why')
        assert pg.locator('[data-coach-mode=analogy]').inner_text().endswith('★')
        # answer quiz Q1 wrongly, then reopen the panel: the recommendation must follow the evidence
        correct = pg.evaluate("AGENTS_COURSE.lessons.find(l => l.id === 'tool-calling').quiz[0].correct")
        wrong = 0 if correct != 0 else 1
        pg.locator('.q[data-q="0"] [data-opt]').nth(wrong).click(); pg.wait_for_timeout(100)
        pg.locator('details.coach summary').click(); pg.locator('details.coach summary').click(); pg.wait_for_timeout(150)
        assert pg.locator('details.coach').get_attribute('open') is not None
        assert 'quiz question' in txt('.coach-why') and pg.locator('[data-coach-mode=mistake]').inner_text().endswith('★'), txt('.coach-why')
        pg.locator('[data-coach-mode=stretch]').click(); pg.wait_for_timeout(50)
        assert 'refund tool' in txt('.coach-body')
        # every Agents lesson has the panel; other courses do not
        for lid in pg.evaluate("AGENTS_COURSE.lessons.map(l => l.id)"):
            go('#/course/ai-agents/' + lid)
            assert pg.locator('details.coach').count() == 1, lid
        go('#/course/ai-foundations/probability'); assert pg.locator('details.coach').count() == 0
        print('PASS coach: recommendation follows a wrong quiz answer, 21/21 lessons covered')

        # ---------- evidence page ----------
        go('#/course/ai-agents'); pg.wait_for_selector('.learn-course-cta', state='attached')
        assert pg.locator('a[href="#/evidence/ai-agents"]').count() == 1
        go('#/course/ai-foundations'); assert pg.locator('a[href="#/evidence/ai-foundations"]').count() == 0
        go('#/evidence/ai-agents'); pg.wait_for_selector('.ev-page')
        assert pg.locator('.ev-table tbody tr').count() == 8 and pg.locator('fieldset.ev-item').count() == 10
        assert 'not a grade' in txt('.ev-page .learn-head') and 'does not show' in txt('.ev-limits')
        # new situation t1: choose the wrong answer, then see the explanation
        fs = pg.locator('fieldset[data-ev-t=t1]')
        fs.locator('input').nth(0).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)
        assert 'Not this time' in txt('fieldset[data-ev-t=t1] .ev-why') and pg.locator('fieldset[data-ev-t=t1] input').first.is_disabled()
        fs = pg.locator('fieldset[data-ev-t=t2]')
        fs.locator('input').nth(0).check(); fs.locator('[data-ev-answer]').click(); pg.wait_for_timeout(100)          # t2 correct = option 0
        assert 'Correct.' in txt('fieldset[data-ev-t=t2] .ev-why')
        assert '1/10' in txt('.learn-metrics'), txt('.learn-metrics')
        # teach-back: too short is refused, a real answer is checked
        tb = pg.locator('[data-ev-teach="0"]')
        tb.locator('textarea').fill('It loops.'); tb.locator('[data-ev-submit]').click()
        assert 'at least 40' in txt('[data-ev-teach="0"] [data-ev-count]') and pg.evaluate("JSON.parse(localStorage.getItem('learnai-evidence-v1')).teach[0]") is None
        answer = ('An agent works toward a goal and keeps going in a loop. It decides its next step, reads the observation that the tool returns, '
                  'and repeats until the goal is met or it runs out of budget, which is different from a chatbot that answers once and waits for the next message.')
        tb.locator('textarea').fill(answer); tb.locator('[data-ev-submit]').click(); pg.wait_for_timeout(100)
        assert 'Keyword check: 4 of 4' in txt('[data-ev-teach="0"] .ev-why') and 'looks for words' in txt('[data-ev-teach="0"] .ev-why')
        assert '4/4 ideas' in txt('.ev-table tbody tr:first-child')
        # the record survives a reload and is exported
        go('#/'); go('#/evidence/ai-agents'); pg.wait_for_selector('.ev-page')
        assert 'Not this time' in txt('fieldset[data-ev-t=t1] .ev-why') and pg.locator('[data-ev-teach="0"] textarea').get_attribute('readonly') is not None
        with pg.expect_download() as d:
            pg.locator('[data-ev-export]').click()
        data = json.loads(Path(d.value.path()).read_text(encoding='utf-8'))
        assert data['course'] == 'ai-agents' and 'Not a certificate' in data['note'] and data['transfer']['t2']['correct'] is True and len(data['summary']) == 8
        # evidence from the lesson attempts shows up in the table (the wrong quiz answer above)
        row = txt('.ev-table tbody tr:nth-child(2)')
        assert row.startswith('2.'), row
        print('PASS evidence page: transfer answers, teach-back check, persistence, JSON export')

        # ---------- phone width ----------
        pg.set_viewport_size({'width': 390, 'height': 800})
        for h in ('#/evidence/ai-agents', '#/course/ai-agents/agent-arena', '#/course/ai-agents/support-desk-project'):
            go(h); pg.wait_for_timeout(300)
            over = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            main_over = pg.evaluate("(() => { const m = document.getElementById('p-main'); return m ? [m.scrollWidth, m.clientWidth] : null })()")
            assert over[0] <= over[1] + 1, (h, over)
            assert not main_over or main_over[0] <= main_over[1] + 1, (h, main_over)
        pg.screenshot(path=str(ART / 'agents_mobile.png'))
        print('PASS phone width: no horizontal overflow on evidence, arena and project pages')

        assert not errors, errors
        b.close()
    print('PASS agents experience: arena, coach, evidence, mobile, zero JS exceptions')


if __name__ == '__main__':
    main()
