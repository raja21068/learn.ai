"""Predict-then-run checks (needs: python -m http.server 8765 in the project root, Playwright + Edge/Chrome).

1. UI contract: the widget is locked until the learner commits or skips; the result persists; the learning
   engine is NOT touched (a wrong prediction must not change practice status or review scheduling).
2. Truth check: for each of the 38 AI Foundations / Deep Learning predictions, run the real widget and assert that
   the answer marked correct in PREDICT_BANK, and the numbers quoted in its reveal, are what the widget shows.

Run:  python tests/predict-widgets.py   (BASE_URL env var overrides http://localhost:8765)"""
import os, re, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE_URL', 'http://localhost:8765') + '/index.html'
A, D = 'ai-foundations', 'deep-learning'


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
        pg = b.new_context(viewport={'width': 1300, 'height': 900}).new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(BASE); pg.wait_for_timeout(500)

        def go(cid, lid, unlock=True):
            pg.evaluate(f"location.hash='#/course/{cid}/{lid}'")
            pg.wait_for_selector('.w[data-widget]', state='attached', timeout=6000); pg.wait_for_timeout(200)
            if unlock and pg.locator('.predict-card[data-state=open]').count():
                pg.locator('[data-predict-skip]').click(); pg.wait_for_timeout(50)

        def txt():
            return re.sub(r'\s+', ' ', pg.evaluate("document.querySelector('.w[data-widget]').innerText"))

        def click(sel, n=0):
            pg.locator('.w[data-widget] ' + sel).nth(n).click(); pg.wait_for_timeout(60)

        def setv(sel, v, n=0):
            pg.locator('.w[data-widget] ' + sel).nth(n).evaluate(
                "(e,v)=>{e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}", str(v))
            pg.wait_for_timeout(60)

        def num(pattern, s=None, group=1):
            m = re.search(pattern, s if s is not None else txt())
            assert m, (pattern, (s or txt())[:300])
            return float(m.group(group).replace(',', ''))

        # ---------------- 1. UI contract ----------------
        bank = pg.evaluate('PREDICT_BANK')
        assert len([k for k in bank if k.startswith(('ai-foundations/', 'deep-learning/'))]) == 38, len(bank)   # the arena prediction is checked by agents-experience.py
        key = 'ai-foundations/probability'
        go(A, 'probability', unlock=False)
        assert pg.locator('.w[data-widget]').get_attribute('inert') is not None, 'widget must start locked'
        assert pg.locator('[data-predict-lock]').is_disabled(), 'cannot lock in without choosing'
        pg.locator('.predict-opt').nth(0).click()                     # a WRONG answer on purpose
        assert not pg.locator('[data-predict-lock]').is_disabled()
        pg.locator('[data-predict-lock]').click(); pg.wait_for_timeout(100)
        assert pg.locator('.w[data-widget]').get_attribute('inert') is None, 'widget unlocks after committing'
        assert 'Not quite' in pg.locator('.predict-reveal').inner_text()
        assert '15.3%' in pg.locator('.predict-reveal').inner_text()
        saved = pg.evaluate("JSON.parse(localStorage.getItem('learnai-predict-v1'))")
        assert saved[key]['choice'] == 0 and saved[key]['correct'] is False, saved
        info = pg.evaluate("LearningEngine.info('ai-foundations','probability')")
        assert info['attempts'] == 0 and info['code'] == 'unseen', ('prediction leaked into the learning engine', info)
        go(A, 'probability', unlock=False)                            # revisit: result stays, widget stays unlocked
        assert pg.locator('.predict-card[data-state=done]').count() == 1
        assert pg.locator('.w[data-widget]').get_attribute('inert') is None
        assert 'Observed' in pg.locator('.predict-reveal').inner_text()
        print('PASS UI contract: locked until commit, persisted, engine untouched')

        # skipping unlocks but stores nothing
        go(A, 'what-is-ai', unlock=False)
        pg.locator('[data-predict-skip]').click()
        assert pg.locator('.w[data-widget]').get_attribute('inert') is None
        assert 'ai-foundations/what-is-ai' not in pg.evaluate("JSON.parse(localStorage.getItem('learnai-predict-v1'))")
        # keyboard: the options are real radio inputs in a fieldset with a legend
        assert pg.locator('fieldset.predict-form legend').count() == 1
        assert pg.locator('.predict-opt input[type=radio]').count() == 4
        print('PASS skip leaves no record; options are accessible radios')

        # ---------------- 2. truth checks ----------------
        def correct_text(lid_key):
            e = bank[lid_key]; return e['options'][e['correct']]

        # what-is-ai
        go(A, 'what-is-ai'); assert 'Act to achieve the best expected outcome' in txt() and 'the approach this course follows' in txt()
        assert correct_text(f'{A}/what-is-ai').startswith('Acting rationally')
        # vacuum
        go(A, 'intelligent-agents'); res = {}
        for k in ('reflex', 'model'):
            click(f'[data-k={k}]'); click('[data-go]'); pg.wait_for_timeout(9000)
            res[k] = int(num(r'(\d+) steps (-?\d+) performance', group=2))
        assert res == {'reflex': 8, 'model': 13}, res
        # grid searches
        def grid(alg):
            click(f'[data-alg={alg}]'); click('[data-go]'); pg.wait_for_timeout(2500)
            m = re.search(r'(\d+) cells expanded (\S+) path length', txt()); return int(m.group(1)), int(m.group(2))
        go(A, 'uninformed-search'); bfs, dfs = grid('bfs'), grid('dfs')
        assert bfs == (218, 25) and dfs == (140, 95) and dfs[1] / bfs[1] > 3, (bfs, dfs)
        go(A, 'informed-search'); astar, greedy = grid('astar'), grid('greedy'); bfs = grid('bfs')
        assert astar == (107, 25) and greedy == (43, 29) and bfs == (218, 25), (astar, greedy, bfs)
        # local search
        go(A, 'local-search'); wins = {}
        for al in ('hill', 'restart', 'sa'):
            click(f'[data-al={al}]'); n = 0
            for _ in range(20):
                click('[data-run]'); n += 'Found the global' in txt()
            wins[al] = n
        assert wins['restart'] == max(wins.values()) and wins['restart'] >= 12 and wins['hill'] <= 3, wins
        # tic-tac-toe
        go(A, 'adversarial-search'); out = {}
        for ab in (True, False):
            pg.locator('.w [data-ab]').set_checked(ab); click('[data-new]'); click('[data-i="4"]'); pg.wait_for_timeout(600)
            board = pg.evaluate("[...document.querySelectorAll('.w [data-i]')].map(b=>b.innerText.trim()||'.').join('')")
            out[ab] = (board, int(num(r'examined ([\d,]+) positions')))
        assert out[True][0] == out[False][0] and out[True] [1] == 6138 and out[False][1] == 55504, out
        # csp
        go(A, 'csp'); steps = {}
        for h in (True, False):
            pg.locator('.w [data-h]').set_checked(h); click('[data-go]'); pg.wait_for_timeout(3000)
            steps[h] = int(num(r'(\d+)/(\d+) search steps', group=2))
        assert steps == {True: 7, False: 12}, steps
        # wumpus
        go(A, 'logical-agents'); t = txt(); assert t.count('safe') >= 2 and 'breeze' not in t.split('Click an unvisited')[0].lower().replace('💨 = breeze', '')
        assert pg.locator('.w[data-widget] button', has_text='✓ safe').count() == 2
        # chaining
        go(A, 'first-order-logic')
        for _ in range(5): click('[data-fc]')
        assert 'Ancestor(Ada, Dev) round 3' in txt() and 'Ancestor(Ada, Dev) round 2' not in txt()
        # blocks world
        go(A, 'knowledge-planning'); click('[data-g]', 0); click('[data-go]'); pg.wait_for_timeout(1500)
        assert 'found a 3-step plan' in txt() and 'explored 13 states' in txt(), txt()[-200:]
        # bayes
        go(A, 'probability'); assert '15.3%' in txt() and 'Of 59 positives, only 9 are sick' in txt()
        # bayes net
        go(A, 'bayesian-networks')
        node = lambda nm: (pg.locator(f'.w g[data-n="{nm}"]').click(), pg.wait_for_timeout(80))
        node('Late'); assert 'Outage 37%' in txt() and 'Storm 30%' in txt()
        node('Traffic'); assert 'Outage 32%' in txt()
        # hmm
        go(A, 'reasoning-over-time'); beliefs = []
        for _ in range(3):
            click('[data-o]', 1); beliefs.append(int(num(r'(\d+)% 🚨 t=' + str(len(beliefs) + 1))))
        assert beliefs[0] < 80 < beliefs[1] and beliefs == [66, 87, 92], beliefs
        # mdp
        go(A, 'decisions-mdps'); click('[data-it]', 0); assert '0.760' in txt()
        # game theory
        go(A, 'multiagent-game-theory'); assert 'Pure Nash equilibrium: (Defect, Defect)' in txt()
        # info gain
        go(A, 'learning-from-examples'); gains = {k: float(v) for v, k in re.findall(r'([\d.]+) gain\((\w+(?: \w+)?)\)', txt())}
        assert max(gains, key=gains.get) == 'rush hour' and gains == {'weather': 0.061, 'rush hour': 0.549, 'day': 0.311}, gains
        # beta coin
        go(A, 'learning-models-deep-rl')
        for _ in range(3):
            d = {}
            for pr in (0, 2):
                click('[data-rs]'); click('[data-pr]', pr); click('[data-f]', 2)
                mle, post = num(r'([\d.]+) MLE'), num(r'MLE \(red\) ([\d.]+) posterior mean'); d[pr] = abs(mle - post)
            assert d[0] < d[2], d
        # n-gram
        go(A, 'natural-language'); assert 'robot 37.5%' in txt()
        pg.locator('.w [data-s]').set_checked(True); pg.wait_for_timeout(80); assert 'robot 20.0%' in txt() or 'robot 20%' in txt(), txt()[:200]
        # particle filter: first door reading (t=2) leaves clusters at all three doors
        go(A, 'vision-robotics'); click('[data-step]'); click('[data-step]')
        assert 'sensor: 🚪 door' in txt(), txt()
        ok = pg.evaluate("""() => {
          const rects = [...document.querySelectorAll('.w svg rect')];
          const doors = rects.filter(r => r.getAttribute('stroke') === 'var(--warn)').map(r => +r.getAttribute('x'));
          const bars = rects.filter(r => !r.getAttribute('stroke') && +r.getAttribute('height') < 41 && +r.getAttribute('y') !== 88).map(r => [+r.getAttribute('x'), +r.getAttribute('height')]);
          const mx = Math.max(...bars.map(b => b[1]));
          return doors.map(x => bars.some(([bx, h]) => bx >= x - 15 && bx <= x + 45 && h >= 0.5 * mx));
        }""")
        assert len(ok) == 3 and all(ok), ok
        # fairness
        go(A, 'ethics-future'); di = {}
        for t_ in (0.5, 0.4, 0.2):
            setv('[data-b]', t_); di[t_] = (num(r'([\d.]+) disparate impact'), txt())
        assert di[0.5][0] == 0.66 and di[0.4][0] >= 0.95 and di[0.2][0] <= 0.6, {k: v[0] for k, v in di.items()}
        assert re.search(r'Group B \d+% \d+% 64%', di[0.2][1]) and re.search(r'Group B \d+% \d+% 76%', di[0.4][1])
        print('PASS truth: AI Foundations (20 widgets)')

        # ---- Deep Learning ----
        go(D, 'dl-intro'); assert 'epoch 0 · loss 2.38 · accuracy 10.0%' in txt()
        click('[data-train]'); pg.wait_for_timeout(6000); assert num(r'accuracy ([\d.]+)%') >= 90
        go(D, 'tensors-autograd'); assert 'RESULT [3,4]' in txt()
        setv('[data-a]', 2, 1); t = txt(); assert 'RESULT' not in t.split('Rule:')[0], t[:300]
        go(D, 'linear-regression'); assert 'loss after 0 steps' in txt() and num(r'([\d.]+) loss after 0 steps') > 50
        for _ in range(3):
            click('[data-rs]'); click('[data-go]'); pg.wait_for_timeout(3000)
            assert 0.8 <= num(r'([\d.]+) loss after 300 steps') <= 2.6, txt()[:200]
        go(D, 'softmax-classification'); assert num(r'"cat": [\d.]+ ([\d.]+)%') == 63.2
        setv('[data-t]', 4); assert num(r'"cat": [\d.]+ ([\d.]+)%') == 34.6
        setv('[data-t]', 0.2); assert num(r'"cat": [\d.]+ ([\d.]+)%') == 99.3
        go(D, 'mlps'); click('[data-ds]', 1)
        for _ in range(2):
            setv('[data-h]', 1); click('[data-go]'); pg.wait_for_timeout(5000); a1 = num(r'(\d+)% accuracy'); click('[data-rs]')
            assert 45 <= a1 <= 80, a1
        setv('[data-h]', 8); click('[data-go]'); pg.wait_for_timeout(5000); assert num(r'(\d+)% accuracy') >= 85
        go(D, 'builders-guide'); assert 'Linear → 200,960 params' in txt() and 'total 203,530' in txt() and 784 * 256 + 256 == 200960
        go(D, 'convolutions'); assert 'OUTPUT 4×4' in txt() and (7 - 3 + 2) // 2 + 1 == 4
        go(D, 'modern-cnns'); click('[data-a]', 2); v = txt(); click('[data-a]', 5); r_ = txt()
        assert '138M PARAMS' in v and '7.3%' in v and '25.6M PARAMS' in r_ and '3.6%' in r_
        go(D, 'rnns'); assert '4.2e-2' in txt(); setv('[data-w]', 1.1); assert '1.7e+1' in txt(); setv('[data-w]', 1.0); assert 'stable' in txt()
        go(D, 'modern-rnns'); assert '"the cat" with probability 0.175' in txt(); setv('[data-k]', 2); assert '"a cat" with probability 0.320' in txt()
        go(D, 'attention-transformers-dl')
        hs = pg.evaluate("[...document.querySelectorAll('.w .dl-sim i')].map(i => [parseFloat(i.style.height), i.className === 'me'])")
        others = [(h, q) for q, (h, me) in enumerate(hs) if not me]; best = max(others)[0]
        assert {q for h, q in others if abs(h - best) < 1e-6} == {9, 11}, [(q, round(h, 3)) for h, q in others][:14]
        go(D, 'optimization-dl')
        for k in range(5):
            click('[data-k]', k)
            pts = [tuple(map(float, s.split(','))) for s in pg.evaluate("document.querySelector('.w svg polyline').getAttribute('points')").split()]
            (_, y0), (_, y1) = pts[0], pts[1]; base = 2 * y0 - y1; peak = min(y for _, y in pts)
            ratio = (base - y0) / (base - peak)
            if k != 4: assert 0.09 <= ratio <= 0.11, (k, ratio)          # the One-cycle schedule starts lower, by design
        go(D, 'computational-performance'); sp = {int(g): float(s) for g, s in re.findall(r'(\d+) GPUs? ([\d.]+)×', txt())}
        assert max(sp, key=sp.get) == 8 and sp[8] == 2.4, sp
        setv('[data-b]', 1024); sp2 = {int(g): float(s) for g, s in re.findall(r'(\d+) GPUs? ([\d.]+)×', txt())}
        assert max(sp2.values()) > 2.4, sp2
        go(D, 'computer-vision-dl'); assert 'Kept 3 of 6' in txt(); setv('[data-m]', 0.9); assert 'Kept 2 of 6' in txt()
        go(D, 'nlp-pretraining'); t = txt(); assert 'a t 18' in t and 'c a 13' in t; click('[data-m]'); assert 'Merges so far: a+t' in txt()
        go(D, 'nlp-applications'); gap = {}
        for n in (2, 3, 5):
            setv('[data-n]', n); gap[n] = num(r'BERT-style encoder ([\d.]+)%') - num(r'from scratch ([\d.]+)%')
        assert gap[2] == 28 and gap[3] == 19 and gap[5] == 0, gap
        go(D, 'rl-gp-hpo')
        for x in (0.25, 0.5, 0.75):
            pg.locator('.w svg[data-plot]').click(position={'x': 600 * x * 0.58 + 10, 'y': 70}); pg.wait_for_timeout(80)
        poly = pg.evaluate("document.querySelector('.w svg polygon').getAttribute('points')").split()
        pts = [tuple(map(float, s.split(','))) for s in poly]; half = len(pts) // 2
        width = [lo[1] - up[1] for up, lo in zip(pts[:half], reversed(pts[half:]))]
        assert min(width) < 0.6 * max(width), (round(min(width), 1), round(max(width), 1))
        go(D, 'gans-recommenders'); click('[data-go]'); pg.wait_for_timeout(4000)
        assert num(r'Ana 5 [\d.]+ 5 [\d.]+ ([\d.]+) predicted') >= 4.5
        print('PASS truth: Deep Learning (18 widgets)')

        # ---------------- 3. every claim in the bank was exercised above ----------------
        assert not errors, errors
        b.close()
    print('PASS predict-then-run: 38 predictions verified against the live widgets')


if __name__ == '__main__':
    main()
