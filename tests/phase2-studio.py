"""Chromium interaction tests for Phase 2; loads local assets in isolated page.
External CDNs are deliberately not required for these simulations.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re
ROOT=Path(__file__).resolve().parent.parent
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

HTML=(ROOT/'index.html').read_text(encoding='utf-8')
SCRIPTS=re.findall(r'<script src="(assets/[^"]+\.js)"',HTML)+[s for g in __import__('json').loads(re.search(r'<script type="application/json" id="lazy-scripts">(.*?)</script>',HTML,re.S).group(1)).values() for s in g if s.startswith('assets/')]
CSS=re.findall(r'<link rel="stylesheet" href="(assets/[^"]+\.css)"',HTML)
CLEAN=re.sub(r'<script\b[^>]*>.*?</script>','',HTML,flags=re.S|re.I)

def setup(page):
    page.route('https://**',lambda route: route.abort())
    page.set_content(CLEAN,wait_until='domcontentloaded')
    page.evaluate('''() => {let map={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>map[k]??null,setItem:(k,v)=>{map[k]=String(v)},removeItem:k=>delete map[k]}});window.toggleTheme=()=>{}}''')
    for css in CSS:page.add_style_tag(content=(ROOT/css).read_text(encoding='utf-8'))
    for js in SCRIPTS:page.add_script_tag(content=(ROOT/js).read_text(encoding='utf-8'))

def go(page,id):
    page.evaluate('h=>{location.hash=h}', '#/'+id)
    page.wait_for_timeout(75)

with sync_playwright() as p:
    browser=launch(p)
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[];page.on('pageerror',lambda error: errors.append(str(error)))
    setup(page)
    assert page.locator('.nav a[href="#/studio"]').count()==1
    go(page,'studio')
    assert page.locator('.studio-card').count()==3
    print('PASS lab hub and navigation')

    go(page,'studio/python')
    assert page.locator('textarea#studio-python-code').count()==1
    assert page.locator('.studio-code-list div.current').count()==0
    page.locator('#studio-py-guess').fill('0')
    page.locator('[data-py-action="predict"]').click()
    assert 'Correct prediction' in page.locator('.studio-result').inner_text()
    page.locator('#studio-py-guess').fill('2')
    page.locator('[data-py-action="predict"]').click()
    assert 'Checkpoint passed' in page.locator('[data-studio-progress]').inner_text()
    assert page.evaluate('LearningEngine.info("python","lists-loops").passed')==1
    page.locator('[data-py-action="run"]').click()
    assert '12' in page.locator('.studio-console').inner_text()
    page.locator('[data-py-action="preset"][data-preset="1"]').click()
    page.locator('[data-py-action="run"]').click()
    assert '30' in page.locator('.studio-console').inner_text()
    page.locator('#studio-python-code').fill('x = [1, 2]\nx.append(3)\nprint(len(x))')
    page.locator('[data-py-action="compile"]').click()
    page.locator('[data-py-action="run"]').click()
    assert page.locator('.studio-console').inner_text().strip()=='3'
    page.locator('#studio-python-code').fill('import os')
    page.locator('[data-py-action="compile"]').click()
    assert 'Trace error:' in page.locator('.studio-result').inner_text()
    print('PASS live Python stepping, two predictions, alternate examples, safe parser errors')

    go(page,'studio/neural')
    page.locator('#net-width').select_option('0')
    page.locator('[data-neural="train"][data-epochs="500"]').click()
    assert page.locator('.studio-loss polyline').count()==1
    loss_linear=float(page.locator('.studio-stat-grid b').nth(2).inner_text())
    assert loss_linear>0.65,loss_linear
    page.locator('#net-width').select_option('4')
    page.locator('[data-neural="train"][data-epochs="500"]').click()
    loss_hidden=float(page.locator('.studio-stat-grid b').nth(2).inner_text())
    assert loss_hidden<loss_linear/2,(loss_linear,loss_hidden)
    page.locator('[data-neural="answer"][data-answer="no"]').click()
    assert 'Checkpoint passed' in page.locator('[data-studio-progress]').inner_text()
    assert page.evaluate('LearningEngine.info("machine-learning","neural-networks").passed')==1
    print('PASS real neural training, nonlinear XOR comparison and concept check')

    go(page,'studio/er')
    page.locator('#er-bridge').select_option('Student')
    page.locator('[data-er-check]').click()
    assert page.locator('.studio-criterion.retry').count()>=1
    page.locator('#er-bridge').select_option('Enrollment')
    page.locator('#er-key').select_option('composite')
    page.locator('#er-studentLink').select_option('one-to-many')
    page.locator('#er-courseLink').select_option('one-to-many')
    page.locator('[data-er-check]').click()
    assert page.locator('.studio-sql').first.inner_text().startswith('CREATE TABLE Student')
    assert 'Checkpoint passed' in page.locator('[data-studio-progress]').inner_text()
    page.locator('#er-join').select_option('left')
    assert page.locator('.studio-table').last.get_by_text('Leila').count()==1
    assert page.locator('.studio-table').last.get_by_text('NULL').count()==1
    print('PASS ER feedback, DDL, SQL left join demonstration')

    go(page,'course/python/lists-loops')
    assert page.locator('.studio-lesson-launch a[href="#/studio/python"]').count()==1
    go(page,'course/machine-learning/neural-networks')
    assert page.locator('.studio-lesson-launch a[href="#/studio/neural"]').count()==1
    go(page,'course/databases/er-modeling')
    assert page.locator('.studio-lesson-launch a[href="#/studio/er"]').count()==1
    go(page,'studio/neural');go(page,'studio');go(page,'studio/neural')
    page.locator('[data-neural="train"][data-epochs="100"]').click()
    assert page.locator('.studio-stat-grid b').first.inner_text()=='100', 'Revisiting must not accumulate click handlers'
    print('PASS existing course links and route repeat safety')

    go(page,'studio')
    page.screenshot(path='/mnt/data/learningai_phase2_work/studio_hub.png')
    go(page,'studio/neural')
    page.screenshot(path='/mnt/data/learningai_phase2_work/studio_neural.png')
    print('BEGIN mobile stage',flush=True)
    mobile=browser.new_page(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    mobile.on('pageerror', lambda err: errors.append('mobile: '+str(err)))
    print('BEGIN setup mobile',flush=True)
    setup(mobile)
    print('END setup mobile',flush=True)
    for slug in ['studio','studio/python','studio/neural','studio/er']:
        print('mobile route',slug,flush=True)
        go(mobile,slug)
        overflow=mobile.evaluate('document.documentElement.scrollWidth - innerWidth')
        assert overflow < 8,(slug,overflow)
    print('BEGIN mobile screenshot',flush=True)
    mobile.screenshot(path='/mnt/data/learningai_phase2_work/studio_mobile.png',timeout=5000)
    print('END mobile screenshot',flush=True)
    assert not errors, errors
    print('PASS mobile view, no overflow, zero uncaught JS exceptions',flush=True)
    browser.close()
