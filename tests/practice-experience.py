"""End-to-end checks of the Practice hub in a real browser: hub, quiz list, a full quiz (perfect run and a run with a miss),
a coding lab graded by hidden tests in Pyodide (starter fails, wrong code fails, correct code passes), progress saved, phone width.
Needs: a static server for the project root (default http://localhost:8000), Playwright + Edge/Chrome, internet for Pyodide.
Run: PYTHONUTF8=1 python tests/practice-experience.py        (BASE_URL=... to use another server)"""
import os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from _browser import launch_browser

BASE = os.environ.get('BASE_URL', 'http://localhost:8000') + '/index.html'
ART = Path(__file__).resolve().parent / 'artifacts'
ART.mkdir(exist_ok=True)


def main():
    errors = []
    with sync_playwright() as p:
        b = launch_browser(p)
        ctx = b.new_context(viewport={'width': 1300, 'height': 900})
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errors.append(str(e)))
        pg.goto(BASE); pg.wait_for_timeout(600)
        pg.evaluate("localStorage.removeItem('learnai-practice-v1')")

        def go(h):
            pg.evaluate(f"location.hash='{h}'"); pg.wait_for_timeout(350)

        def txt(sel):
            return ' '.join(pg.locator(sel).first.inner_text().split())

        counts = pg.evaluate("[PRACTICE_QUIZZES.sets.map(s => s.lessons.length), PRACTICE_LABS.length, PRACTICE_SOURCES.sources.length]")
        assert counts == [[26, 24, 20], 27, 30], counts

        # ---------- hub ----------
        go('#/practice')
        assert 'Practice hub' in txt('h1') and pg.locator('.ph-card').count() == 4
        assert '421 questions' in txt('.ph-cards') and '27 labs' in txt('.ph-cards') and 'Sources' in txt('.ph-cards')
        assert 'MIT' in txt('.ph-credit') and 'Microsoft' in txt('.ph-credit')
        assert pg.locator('a[href="#/practice"]').count() >= 2, 'nav and footer links'
        print('PASS hub: three cards, counts, attribution, navigation')

        # ---------- quiz list and search ----------
        go('#/practice/quizzes')
        assert pg.locator('.ph-lesson').count() == 26 and pg.locator('.ph-tab').count() == 3
        pg.fill('#ph-q', 'clustering'); pg.wait_for_timeout(100)
        assert 0 < pg.locator('.ph-lesson').count() < 5, pg.locator('.ph-lesson').count()
        pg.fill('#ph-q', ''); pg.wait_for_timeout(100)
        assert pg.locator('.ph-lesson').count() == 26
        go('#/practice/quizzes/ai'); assert pg.locator('.ph-lesson').count() == 24 and 'AI Foundations' in txt('.ph-tab.on')
        go('#/practice/quizzes/ds'); assert pg.locator('.ph-lesson').count() == 20 and 'Data Science' in txt('.ph-tab.on')
        go('#/practice/quizzes/ml')

        # ---------- a perfect quiz run ----------
        go('#/practice/quiz/ml/introduction-to-machine-learning/pre')
        n = pg.evaluate("PRACTICE_QUIZZES.sets[0].lessons[0].quizzes.pre.questions.length")
        answers = pg.evaluate("Object.fromEntries(PRACTICE_QUIZZES.sets[0].lessons[0].quizzes.pre.questions.map(q => [q.q, q.options[q.answer]]))")
        for k in range(n):
            q = txt('.ph-qtext'); right = answers[q]
            assert f'Question {k + 1} of {n}' in txt('.ph-prog')
            pg.locator('.ph-opt', has_text=right).filter(has_text=right).first.click()
            pg.click('#ph-check'); assert 'Correct' in txt('#ph-fb'), (q, right)
            pg.click('#ph-check')
        assert f'Result: {n} of {n}' in txt('h2') and 'Perfect' in txt('.ph-q'), txt('.ph-q')
        stored = pg.evaluate("JSON.parse(localStorage.getItem('learnai-practice-v1')).quiz['ml/introduction-to-machine-learning'].pre")
        assert stored['best'] == n and stored['total'] == n, stored

        # ---------- a run with a miss shows the review, and the best score is kept ----------
        pg.click('#ph-retry'); pg.wait_for_timeout(200)
        for k in range(n):
            q = txt('.ph-qtext'); right = answers[q]
            if k == 0:
                pg.locator('.ph-opt').filter(has_not_text=right).first.click()
            else:
                pg.locator('.ph-opt', has_text=right).first.click()
            pg.click('#ph-check')
            if k == 0:
                assert 'Not quite' in txt('#ph-fb') and right in txt('#ph-fb')
            pg.click('#ph-check')
        assert f'Result: {n - 1} of {n}' in txt('h2') and pg.locator('.ph-review li').count() == 1
        stored = pg.evaluate("JSON.parse(localStorage.getItem('learnai-practice-v1')).quiz['ml/introduction-to-machine-learning'].pre")
        assert stored['best'] == n and stored['last'] == n - 1, stored
        go('#/practice/quizzes/ml')
        assert f'best {n}/{n}' in txt('.ph-lesson'), txt('.ph-lesson')
        print('PASS quiz: perfect run, miss with review, best score kept, list shows it')

        # ---------- unsafe text from the data is escaped, never executed ----------
        go('#/practice/quiz/ml/introduction-to-machine-learning/post')
        assert pg.evaluate("document.querySelectorAll('.ph-q script, .ph-q img').length") == 0
        go('#/practice/quiz/ml/does-not-exist/pre'); assert 'Quiz not found' in txt('h1')
        go('#/practice/quiz/nope/x/pre'); assert 'Quiz not found' in txt('h1')

        # ---------- a quiz of another set (AI Foundations) and the progress key of that set ----------
        go('#/practice/quiz/ai/introduction-to-ai/pre')
        ans = pg.evaluate("Object.fromEntries(PRACTICE_QUIZZES.sets[1].lessons[0].quizzes.pre.questions.map(q => [q.q, q.options[q.answer]]))")
        for k in range(len(ans)):
            right = ans[txt('.ph-qtext')]; pg.locator('.ph-opt', has_text=right).first.click(); pg.click('#ph-check'); pg.click('#ph-check')
        assert f'Result: {len(ans)} of {len(ans)}' in txt('h2'), txt('h2')
        assert pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('learnai-practice-v1')).quiz)").count('ai/introduction-to-ai') == 1

        # ---------- sources page ----------
        go('#/practice/sources')
        assert pg.locator('.ph-src').count() == 30 and pg.locator('.ph-src.imported').count() == 13
        pg.click('[data-f="linked"]'); pg.wait_for_timeout(100)
        assert pg.locator('.ph-src').count() == 17 and 'Why not copied' in txt('.ph-src')
        assert 'OSTEP source code' in pg.locator('#ph-srcs').inner_text() and 'No licence file' in pg.locator('#ph-srcs').inner_text()

        # ---------- notebooks and course texts ----------
        go('#/practice/notebooks')
        assert pg.locator('#ph-nbs .ph-nb').count() == 65 and pg.locator('#ph-txts .ph-nb').count() == 79
        assert '65 notebooks' in txt('#ph-nbcount')
        pg.click('[data-s="langchain-ai/langchain-academy"]'); pg.wait_for_timeout(100)
        assert pg.locator('#ph-nbs .ph-nb').count() == 28 and pg.locator('#ph-txts .ph-nb').count() == 0
        first = pg.locator('#ph-nbs .ph-nb').first
        assert first.locator('a:has-text("Open in Colab")').get_attribute('href').startswith('https://colab.research.google.com/github/langchain-ai/langchain-academy/blob/main/')
        assert first.locator('a:has-text("Download")').get_attribute('href').startswith('third_party/langchain-academy/')
        assert pg.evaluate("fetch(document.querySelector('#ph-nbs a[download]').getAttribute('href')).then(r => r.ok)"), 'the bundled notebook must be served'
        pg.click('[data-s="all"]'); pg.fill('#ph-nbq', 'backprop'); pg.wait_for_timeout(100)
        assert 0 < pg.locator('#ph-nbs .ph-nb').count() < 6
        pg.fill('#ph-nbq', ''); pg.check('#ph-nbbrowser'); pg.wait_for_timeout(100)
        assert pg.locator('#ph-nbs .ph-nb').count() == 10 and pg.locator('#ph-txts .ph-nb').count() == 0
        pg.uncheck('#ph-nbbrowser')
        pg.click('[data-s="huggingface/agents-course"]'); pg.wait_for_timeout(100)
        assert pg.locator('#ph-txts .ph-nb').count() == 77
        pg.locator('#ph-txts a.ph-txt').first.click(); pg.wait_for_function("document.querySelector('#ph-reader') && !document.querySelector('#ph-reader').innerText.startsWith('Loading')", timeout=20000)
        assert len(pg.locator('#ph-reader').inner_text()) > 200 and 'Apache-2.0' in txt('.ph-sub'), txt('.ph-sub')
        assert pg.evaluate("document.querySelectorAll('#ph-reader *').length") == 0, 'text is shown as text, never as markup'
        go('#/practice/text/nope'); assert 'Text not found' in txt('h1')
        print('PASS notebooks: 65 notebooks and 79 texts, source filter, search, browser filter, Colab and download links, text reader')

        # ---------- labs: list ----------
        go('#/practice/labs')
        assert pg.locator('.ph-lab').count() == 27
        pg.click('[data-track="Sorting"]'); pg.wait_for_timeout(100)
        assert pg.locator('.ph-lab').count() == pg.evaluate("PRACTICE_LABS.filter(l => l.track === 'Sorting').length") == 7

        # ---------- lab: starter fails, wrong code fails, right code passes ----------
        go('#/practice/lab/bubble-sort')
        assert 'Bubble sort' in txt('h1') and 'TODO' in pg.input_value('#ph-code')
        assert pg.locator('#ph-solution').is_hidden(), 'the solution stays hidden until a first attempt'
        pg.click('#ph-checkbtn')
        pg.wait_for_function("document.querySelector('#ph-out').innerText.includes('Not yet') || document.querySelector('#ph-out').innerText.includes('passed') || document.querySelector('#ph-out .err')", timeout=120000)
        assert 'Not yet' in txt('#ph-out'), txt('#ph-out')
        assert pg.locator('#ph-solution').is_visible()
        pg.fill('#ph-code', 'def bubble_sort(items):\n    return sorted(items)[::-1]\n')
        pg.click('#ph-checkbtn'); pg.wait_for_function("!document.querySelector('#ph-out').innerText.includes('Running')", timeout=60000)
        assert 'Not yet' in txt('#ph-out') and 'expected' in txt('#ph-out'), txt('#ph-out')
        pg.click('#ph-hint'); assert 'Hint 1/' in txt('#ph-hints')
        sol = pg.evaluate("PRACTICE_LABS.find(l => l.id === 'bubble-sort').solution")
        pg.fill('#ph-code', sol)
        pg.click('#ph-run'); pg.wait_for_function("!document.querySelector('#ph-out').innerText.includes('Running')", timeout=60000)
        pg.click('#ph-checkbtn'); pg.wait_for_function("document.querySelector('#ph-out').innerText.includes('passed') || document.querySelector('#ph-out').innerText.includes('Not yet')", timeout=60000)
        assert 'All tests passed' in txt('#ph-out'), txt('#ph-out')
        assert txt('h1').startswith('✓')
        saved = pg.evaluate("JSON.parse(localStorage.getItem('learnai-practice-v1')).labs['bubble-sort']")
        assert saved['passed'] is True and saved['attempts'] == 3, saved
        go('#/practice/labs'); assert pg.locator('.ph-lab.done').count() == 1
        print('PASS lab: starter fails, wrong code fails with a message, correct code passes in Pyodide, progress saved')

        # a second lab with a graph input, to exercise the runner on another test style
        go('#/practice/lab/dijkstra')
        pg.fill('#ph-code', pg.evaluate("PRACTICE_LABS.find(l => l.id === 'dijkstra').solution"))
        pg.click('#ph-checkbtn'); pg.wait_for_function("document.querySelector('#ph-out').innerText.includes('passed') || document.querySelector('#ph-out').innerText.includes('Not yet')", timeout=60000)
        assert 'All tests passed' in txt('#ph-out'), txt('#ph-out')
        # a link-only reference shows its licence and no local copy; an AI lab and the autograd class lab pass too
        go('#/practice/lab/kmeans-1d'); assert 'link only' in txt('.ph-ref') and 'local copy' not in txt('.ph-ref') and 'Apache-2.0' in txt('.ph-ref')
        go('#/practice/lab/fit-line'); assert 'local copy' in txt('.ph-ref') and 'Apache-2.0' in txt('.ph-ref') and 'link only' not in txt('.ph-ref')
        go('#/practice/lab/a-star-grid'); assert 'local copy' in txt('.ph-ref') and 'aima-python' in txt('.ph-ref')
        for lab_id in ('a-star-grid', 'autograd-value'):
            go('#/practice/lab/' + lab_id)
            pg.fill('#ph-code', pg.evaluate("PRACTICE_LABS.find(l => l.id === '" + lab_id + "').solution"))
            pg.click('#ph-checkbtn'); pg.wait_for_function("document.querySelector('#ph-out').innerText.includes('passed') || document.querySelector('#ph-out').innerText.includes('Not yet')", timeout=90000)
            assert 'All tests passed' in txt('#ph-out'), (lab_id, txt('#ph-out'))
        go('#/practice/lab/nope'); assert 'Lab not found' in txt('h1')

        # ---------- phone width ----------
        ctx2 = b.new_context(viewport={'width': 390, 'height': 800}, is_mobile=True)
        m = ctx2.new_page(); m.on('pageerror', lambda e: errors.append(str(e)))
        m.goto(BASE); m.wait_for_timeout(500)
        for h in ('#/practice', '#/practice/quizzes/ai', '#/practice/quiz/ai/introduction-to-ai/pre', '#/practice/labs', '#/practice/lab/merge-sort', '#/practice/sources', '#/practice/notebooks', '#/practice/text/agents-course-units-en-unit0-introduction'):
            m.evaluate(f"location.hash='{h}'"); m.wait_for_timeout(350)
            w = m.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
            assert w[0] <= w[1] + 1, (h, w)
        m.evaluate("location.hash='#/practice/lab/merge-sort'"); m.wait_for_timeout(300)
        m.screenshot(path=str(ART / 'practice_mobile.png'))
        print('PASS phone width: no horizontal overflow on hub, quizzes, labs and sources')
        b.close()
    assert not errors, errors
    print('PASS Practice hub experience: quizzes, labs graded in Pyodide, progress, mobile, zero JS exceptions')


if __name__ == '__main__':
    main()
