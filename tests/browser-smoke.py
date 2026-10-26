"""Chromium UI smoke tests without navigating local URLs (blocked in this runner).
Loads the real HTML/CSS/JS files in original script order into an isolated document.
External CDN engines are deliberately not exercised by this smoke test.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent
import os, sys
ARTIFACTS = Path(__file__).resolve().parent / 'artifacts'
ARTIFACTS.mkdir(exist_ok=True)

def launch(p):
    """Portable launcher: CHROMIUM_PATH env var, else system Chromium (Linux), else the installed Edge/Chrome."""
    path = os.environ.get('CHROMIUM_PATH') or ('/usr/bin/chromium' if os.path.exists('/usr/bin/chromium') else None)
    if path:
        return p.chromium.launch(headless=True, executable_path=path, args=['--no-sandbox'])
    for channel in ('msedge', 'chrome'):
        try:
            return p.chromium.launch(headless=True, channel=channel)
        except Exception:
            continue
    return p.chromium.launch(headless=True)

INDEX = (ROOT/'index.html').read_text(encoding='utf-8')
SCRIPTS = re.findall(r'<script src="(assets/[^\"]+\.js)"', INDEX)+[s for g in __import__('json').loads(re.search(r'<script type="application/json" id="lazy-scripts">(.*?)</script>',INDEX,re.S).group(1)).values() for s in g if s.startswith('assets/')]
CSS = re.findall(r'<link rel="stylesheet" href="(assets/[^\"]+\.css)"', INDEX)
CLEAN_HTML = re.sub(r'<script\b[^>]*>.*?</script>', '', INDEX, flags=re.I | re.S)

def load_site(page):
    page.set_content(CLEAN_HTML, wait_until='domcontentloaded')
    page.evaluate('''() => {
      if (!window.__fakeLocalStorageData) window.__fakeLocalStorageData = {};
      Object.defineProperty(window, 'localStorage', { configurable: true,
        value: {getItem: k => window.__fakeLocalStorageData[k] ?? null,
                setItem: (k,v) => { window.__fakeLocalStorageData[k] = String(v); },
                removeItem: k => { delete window.__fakeLocalStorageData[k]; }} });
      window.toggleTheme = () => {};
    }''')
    for name in CSS: page.add_style_tag(content=(ROOT/name).read_text(encoding='utf-8'))
    for name in SCRIPTS: page.add_script_tag(content=(ROOT/name).read_text(encoding='utf-8'))
    page.wait_for_timeout(30)

def go(page, fragment):
    page.evaluate('h => { location.hash = h; }', '#/' + fragment.strip('/'))
    page.wait_for_timeout(55)

with sync_playwright() as p:
    browser = launch(p)
    page = browser.new_page(viewport={'width': 1365, 'height': 900})
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.route('https://**', lambda route: route.abort())
    load_site(page)
    assert page.get_by_text('Explore courses').count() == 1
    assert page.get_by_text('AI Foundations', exact=True).count() >= 1
    assert page.evaluate('!!window.AI_COURSE && !!window.LearningEngine && !!window.LearningUI')
    print('PASS home + AI registration')

    go(page, 'course/ai-foundations')
    assert page.locator('.c-hero h1').inner_text().startswith('Artificial Intelligence')
    assert page.get_by_text('Take placement check').count() == 1
    page.screenshot(path=str(ARTIFACTS / 'phase1_course.png'), full_page=False)
    print('PASS AI Foundations course landing')

    go(page, 'diagnostic/ai-foundations')
    answers = page.evaluate('LearningUI.placementItems(AI_COURSE).map(x => x.l.quiz[x.qi].correct)')
    count = page.locator('fieldset.learn-diag-q').count()
    assert count == len(answers) and count >= 10, count   # one or two questions per part of the 7-part course
    page.locator('#submit-diagnostic').click()
    assert page.get_by_text('Answer all questions before submitting.').count() == 1
    for n, correct in enumerate(answers):
        page.locator(f'input[name="diag-{n}"][value="{correct}"]').check()
    page.locator('#submit-diagnostic').click()
    label = f'{count} / {count} correct'
    assert page.get_by_text(label).count() == 1
    assert page.locator('.learn-part-result').count() == 7
    go(page,'my-learning'); go(page,'diagnostic/ai-foundations')
    assert page.get_by_text(label).count() == 1
    print('PASS diagnostic validation, scoring, local persistence')

    go(page, 'course/ai-foundations/what-is-ai')
    assert page.locator('[data-widget="aiapproaches"] button').count() >= 4
    assert page.locator('#practice-challenge input[data-challenge-select]').count() == 4
    for n in [0,1,3]: page.locator(f'#practice-challenge input[value="{n}"]').check()
    page.locator('[data-challenge-check]').first.click()
    assert 'Correct.' in page.locator('.challenge-feedback').first.inner_text()
    qindex = page.evaluate('AI_COURSE.lessons[0].quiz[0].correct')
    page.locator('.q').first.locator(f'[data-opt="{qindex}"]').click()
    status = page.evaluate('LearningEngine.info("ai-foundations", "what-is-ai")')
    assert status['passed'] == 2 and status['nextReviewAt'], status
    assert page.locator('#skill-stage').inner_text() == 'Review scheduled'
    print('PASS AI widget, multi-select, quiz, review schedule')

    page.locator('#p-lab [data-hint]').click()
    assert 'hint 1/3' in page.locator('#out').inner_text()
    assert 'solution' not in page.locator('#out').inner_text().lower()
    page.locator('#p-lab [data-hint]').click()
    assert 'hint 2/3' in page.locator('#out').inner_text()
    page.locator('#p-lab [data-hint]').click()
    assert page.locator('[data-reveal]').count() == 1
    page.locator('[data-reveal]').click()
    assert 'Worked solution' in page.locator('#out').inner_text()
    assert page.locator('[data-use]').count() == 1
    print('PASS progressive Python hints before reveal')

    go(page, 'course/databases/why-databases')
    page.locator('#p-lab [data-hint]').click()
    assert 'hint 1/3' in page.locator('#out').inner_text()
    assert page.locator('[data-use]').count() == 0
    print('PASS progressive SQL hint')

    go(page, 'course/python/hello-variables')
    assert page.locator('.challenge-order li').count() == 3
    for pos in [1,2]: page.locator(f'[data-challenge-move="{pos}"][data-direction="up"]').click()
    page.locator('[data-challenge-check]').first.click()
    assert 'Correct' in page.locator('.challenge-feedback').first.inner_text()
    print('PASS ordering challenge')

    go(page, 'course/python/lists-loops')
    page.locator('.challenge-text').fill('len')
    page.locator('[data-challenge-check]').first.click()
    assert 'Correct' in page.locator('.challenge-feedback').first.inner_text()
    print('PASS short-answer challenge')

    # Every flagship lesson has two activities, and every lab task has a concept hint.
    gaps = page.evaluate('''() => {
      const C = [DB_COURSE, AGENTS_COURSE, ML_COURSE, LLM_COURSE, PROMPT_COURSE, AI_COURSE, DL_COURSE];
      const miss = []; let tasks = 0;
      C.forEach(c => c.lessons.forEach(l => {
        if ((LEARNING_CHALLENGES.activities[c.id + '/' + l.id] || []).length < 2) miss.push('activities ' + c.id + '/' + l.id);
        if (!LEARNING_CHALLENGES.reviews[c.id + '/' + l.id]) miss.push('review ' + c.id + '/' + l.id);
        ((l.lab && l.lab.tasks) || []).forEach((t, i) => { tasks++; if (!HINT_BANK[c.id + '/' + l.id + '#' + i]) miss.push('hint ' + c.id + '/' + l.id + '#' + i); });
      }));
      return { miss, tasks };
    }''')
    assert not gaps['miss'], gaps['miss'][:5]
    assert gaps['tasks'] >= 139, gaps['tasks']
    print('PASS 2 activities + review pool per flagship lesson;', gaps['tasks'], 'tasks with authored hints')

    go(page, 'my-learning')
    assert page.get_by_role('heading', name='My learning').count() == 1
    assert page.get_by_text('Reviews scheduled').count() >= 1
    print('PASS dashboard summary')

    # Move the browser's logical clock past the scheduled first review date.
    page.evaluate('''() => {
      const Native = window.Date;
      window.Date = class extends Native { static now() { return Native.now() + 2 * 86400000; } };
    }''')
    go(page, 'review')
    assert page.locator('.learn-panel h2').inner_text().endswith('skills due now')
    go(page, 'review/ai-foundations/what-is-ai')
    correct = page.evaluate('LEARNING_CHALLENGES.reviews["ai-foundations/what-is-ai"][0].correct')
    page.locator(f'[data-review-option="{correct}"]').click()
    assert page.get_by_text('Review scheduled with a longer interval.').count() == 1
    assert page.evaluate('LearningEngine.info("ai-foundations", "what-is-ai").reviews') == 1
    go(page,'review'); go(page,'review/ai-foundations/what-is-ai')
    assert 'not due' in page.locator('main').inner_text().lower()
    print('PASS due queue, alternate review question, review persistence')

    mobile = browser.new_page(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True)
    mobile.route('https://**', lambda route: route.abort())
    load_site(mobile)
    go(mobile, 'my-learning')
    assert mobile.get_by_role('heading', name='My learning').count() == 1
    assert mobile.locator('.learn-metrics').is_visible()
    mobile.screenshot(path=str(ARTIFACTS / 'phase1_mobile.png'), full_page=False)
    print('PASS narrow viewport')
    assert not errors, '\n'.join(errors)
    print('PASS no page JavaScript exceptions')
    browser.close()
