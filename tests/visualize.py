"""End-to-end checks of the Visualization lab in a real browser: all 8 interactive charts, all 9 diagrams plus the live editor with a syntax error,
the bundled TensorFlow Playground (and that it contacts no analytics service), and the diagram, chart and playground inside every one of the
70 guided textbook chapters. Needs a static server for the project root (default http://localhost:8000), Playwright + Edge/Chrome.
Run: PYTHONUTF8=1 python tests/visualize.py"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _browser import launch_browser

BASE = os.environ.get('BASE_URL', 'http://localhost:8000') + '/index.html'
ART = Path(__file__).resolve().parent / 'artifacts'
ART.mkdir(exist_ok=True)


def main():
    errors, requests, failed = [], [], []
    with sync_playwright() as p:
        b = launch_browser(p)
        ctx = b.new_context(viewport={'width': 1300, 'height': 900})
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.on('request', lambda r: requests.append(r.url))
        pg.on('requestfailed', lambda r: failed.append(r.url))
        pg.goto(BASE); pg.wait_for_timeout(600)

        def go(h, wait=350):
            pg.evaluate(f"location.hash='{h}'"); pg.wait_for_timeout(wait)

        def txt(sel):
            return ' '.join(pg.locator(sel).first.inner_text().split())

        # ---------- hub ----------
        go('#/visualize')
        assert 'Visualization lab' in txt('h1') and pg.locator('.vz-card').count() == 3
        assert pg.locator('a[href="#/visualize"]').count() >= 2, 'nav and footer links'
        print('PASS hub: three cards and navigation')

        # ---------- charts: each renders an SVG, shows a readout and reacts to its slider ----------
        ids = pg.evaluate("VisualizationLab.charts.map(c => c.id)")
        assert ids == ['regression', 'gradient', 'overfit', 'clt', 'complexity', 'softmax', 'bandit', 'queue'], ids
        for cid in ids:
            go('#/visualize/charts/' + cid, 200)
            pg.wait_for_selector('#vz-host .vz-chart svg', timeout=30000)
            before = txt('#vz-host [data-readout]')
            assert len(before) > 20, (cid, before)
            first = pg.locator('#vz-host input[type=range]').first
            lo, hi = float(first.get_attribute('min')), float(first.get_attribute('max'))
            first.evaluate(f"(el) => {{ el.value = {hi if float(first.input_value()) != hi else lo}; el.dispatchEvent(new Event('input')); }}")
            pg.wait_for_timeout(200)
            assert txt('#vz-host [data-readout]') != before, f'{cid}: the readout must change with the slider'
            assert pg.locator('#vz-host .vz-chart svg').count() >= 1 and 'Loading' not in txt('#vz-host .vz-chart')
        # chart facts that must hold (checked against the maths, not just that something drew)
        go('#/visualize/charts/queue'); pg.wait_for_selector('#vz-host .vz-chart svg')
        pg.locator('[data-c=u]').evaluate("(el) => { el.value = 90; el.dispatchEvent(new Event('input')); }")
        pg.locator('[data-c=s]').evaluate("(el) => { el.value = 5; el.dispatchEvent(new Event('input')); }"); pg.wait_for_timeout(150)
        assert '50.0 ms' in txt('#vz-host [data-readout]') and '10.0 times' in txt('#vz-host [data-readout]'), txt('#vz-host [data-readout]')
        go('#/visualize/charts/softmax'); pg.wait_for_selector('#vz-host .vz-chart svg')
        assert 'add up to 1.000' in txt('#vz-host [data-readout]')
        go('#/visualize/charts/gradient'); pg.wait_for_selector('#vz-host .vz-chart svg')
        pg.locator('[data-c=c]').evaluate("(el) => { el.value = 10; el.dispatchEvent(new Event('input')); }")
        pg.locator('[data-c=lr]').evaluate("(el) => { el.value = 1.1; el.dispatchEvent(new Event('input')); }"); pg.wait_for_timeout(150)
        assert 'Diverged' in txt('#vz-host [data-readout]'), 'a learning rate above 2/c must diverge'
        pg.locator('[data-c=lr]').evaluate("(el) => { el.value = 0.1; el.dispatchEvent(new Event('input')); }"); pg.wait_for_timeout(150)
        assert 'Diverged' not in txt('#vz-host [data-readout]')
        print('PASS charts: 8 charts render, react to sliders, and obey their formulas (queue 50 ms at 90%, softmax sums to 1, divergence above 2/c)')

        # ---------- diagrams and the live editor ----------
        go('#/visualize/diagrams')
        pg.wait_for_selector('#vz-diagram svg', timeout=90000)
        assert pg.locator('.vz-tab').count() == 9 and 'syntax error' not in txt('#vz-diagram')
        pg.fill('#vz-src', 'flowchart LR\n  A[Start] --> B[Finish]'); pg.wait_for_function("document.querySelector('#vz-diagram').innerText.includes('Finish')", timeout=15000)
        pg.fill('#vz-src', 'flowchart LR\n  A[Start --> ((('); pg.wait_for_function("document.querySelector('#vz-diagram').innerText.includes('syntax error')", timeout=15000)
        assert pg.locator('body > [id^="dvzm"]').count() == 0, 'a failed render must not leave debris in the page'
        pg.click('#vz-reset'); pg.wait_for_function("!document.querySelector('#vz-diagram').innerText.includes('syntax error') && document.querySelector('#vz-diagram svg')", timeout=15000)
        pg.fill('#vz-src', 'flowchart LR\n  A["<img src=x onerror=window.__pwned=1>"] --> B[x]'); pg.wait_for_timeout(1200)
        assert pg.evaluate("window.__pwned") is None, 'diagram text must never run script'
        print('PASS diagrams: 9 diagrams, live editor redraws, shows a syntax error and recovers, hostile text is inert')

        # ---------- the playground ----------
        go('#/visualize/playground', 800)
        frame = pg.frame_locator('iframe[title="TensorFlow Playground"]')
        frame.locator('#main-part').wait_for(timeout=30000)
        pg.wait_for_function("document.querySelector('iframe').contentDocument.querySelectorAll('canvas').length > 0", timeout=30000)
        assert frame.locator('#play-pause-button').count() == 1
        frame.locator('#play-pause-button').click(); pg.wait_for_timeout(1500)
        epoch = frame.locator('#iter-number').inner_text().replace(',', '').strip()
        assert epoch.isdigit() and int(epoch) > 0, 'training must advance: ' + epoch
        frame.locator('#play-pause-button').click()
        assert not [u for u in requests if 'google-analytics' in u or 'googletagmanager' in u], 'the playground must not contact an analytics service'
        pg.screenshot(path=str(ART / 'visualize_playground.png'))
        print('PASS playground: loads, trains (epoch advances), no analytics request')

        # ---------- inside every textbook chapter ----------
        books = {'db': 16, 'rl': 8, 'd2l': 6, 'os': 15, 'network': 8, 'islr': 10, 'algo': 7}
        charts_seen = playground_seen = 0
        for book, n in books.items():
            for ch in range(1, n + 1):
                go(f'#/book/{book}/chapter/{ch}', 250)
                sec = pg.locator('.vz-chapter')
                assert sec.count() == 1, (book, ch)
                sec.scroll_into_view_if_needed()
                pg.wait_for_selector('.vz-chapter .vz-diagram svg', timeout=60000)
                assert pg.locator('.vz-chapter .vz-err').count() == 0, (book, ch, txt('.vz-chapter .vz-err'))
                assert len(txt('.vz-chapter figcaption')) > 8
                chart_expected = pg.evaluate(f"!!CHAPTER_VIZ['{book}'][{ch}].c")
                if chart_expected:
                    pg.wait_for_selector('.vz-chapter .vz-inline .vz-chart svg', timeout=30000); charts_seen += 1
                    assert len(txt('.vz-chapter [data-readout]')) > 20
                if pg.evaluate(f"!!CHAPTER_VIZ['{book}'][{ch}].p"):
                    playground_seen += 1
                    pg.locator('.vz-playground summary').click(); pg.wait_for_function("document.querySelector('.vz-playground iframe').getAttribute('src')", timeout=5000)
        assert charts_seen >= 12 and playground_seen == 2, (charts_seen, playground_seen)
        # the chapter diagram text can be edited in place
        go('#/book/db/chapter/6'); pg.locator('.vz-chapter').scroll_into_view_if_needed(); pg.wait_for_selector('.vz-chapter .vz-diagram svg', timeout=60000)
        pg.locator('.vz-chapter .vz-details summary').first.click()
        pg.fill('.vz-chapter [data-vz-src]', 'flowchart LR\n  X[Raw table] --> Y[Clean design]'); pg.wait_for_function("document.querySelector('.vz-chapter .vz-diagram').innerText.includes('Clean design')", timeout=15000)
        print(f'PASS chapters: 70 of 70 chapters draw their diagram with Mermaid ({charts_seen} also have an interactive chart, {playground_seen} the playground), editable in place')

        # ---------- the existing chapter content is still there ----------
        go('#/book/db/chapter/11')
        for needle in ('Learning outcomes', 'Worked reasoning', 'Try it yourself', 'Source section map'):
            assert needle in pg.inner_text('body'), needle
        assert pg.locator('.vz-chapter').count() == 1 and pg.locator('.bm-figure').count() >= 1

        # ---------- phone width ----------
        ctx2 = b.new_context(viewport={'width': 390, 'height': 800}, is_mobile=True)
        m = ctx2.new_page(); m.on('pageerror', lambda e: errors.append(str(e)))
        m.goto(BASE); m.wait_for_timeout(500)
        for h in ('#/visualize', '#/visualize/charts/overfit', '#/visualize/diagrams/transformer', '#/visualize/playground', '#/book/db/chapter/11', '#/book/d2l/chapter/5'):
            m.evaluate(f"location.hash='{h}'"); m.wait_for_timeout(600)
            if 'book' in h:
                m.locator('.vz-chapter').scroll_into_view_if_needed(); m.wait_for_selector('.vz-chapter .vz-diagram svg', timeout=60000)
            if 'diagrams' in h:
                m.wait_for_selector('#vz-diagram svg', timeout=60000)
            if 'charts' in h:
                m.wait_for_selector('#vz-host .vz-chart svg', timeout=30000)
            w = m.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
            assert w[0] <= w[1] + 1, (h, w)
        m.evaluate("location.hash='#/book/db/chapter/11'"); m.wait_for_timeout(500)
        m.locator('.vz-chapter').scroll_into_view_if_needed(); m.wait_for_timeout(1500)
        m.locator('.vz-chapter').screenshot(path=str(ART / 'visualize_chapter_mobile.png'))
        print('PASS phone width: no horizontal overflow on the lab pages and on chapters with diagrams')
        b.close()
    ours = [u for u in failed if 'localhost' in u]
    assert not ours, ours
    assert not errors, errors
    print('PASS Visualization lab: charts, diagrams, playground and all 70 textbook chapters, zero JS exceptions')


if __name__ == '__main__':
    main()
