from pathlib import Path
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
import re
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
scripts=re.findall(r'<script src="(assets/[^" ]+\.js)"',html)+[s for g in __import__('json').loads(re.search(r'<script type="application/json" id="lazy-scripts">(.*?)</script>',html,re.S).group(1)).values() for s in g if s.startswith('assets/')]
styles=re.findall(r'<link rel="stylesheet" href="(assets/[^" ]+\.css)"',html)
clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)
def load(page):
    page.set_content(clean,wait_until='domcontentloaded')
    page.evaluate("""() => {window.__mem={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>window.__mem[k]=String(v),removeItem:k=>delete window.__mem[k]}})}""")
    for f in styles:page.add_style_tag(content=(root/f).read_text())
    for f in scripts:page.add_script_tag(content=(root/f).read_text())
    page.wait_for_timeout(70)
def go(page,route):
    page.evaluate('p=>{location.hash="#/"+p}',route);page.wait_for_timeout(110)
with sync_playwright() as pw:
    b=launch_browser(pw)
    p=b.new_page(viewport={'width':1365,'height':850})
    errors=[];p.on('pageerror',lambda e:errors.append(str(e)))
    load(p)
    assert p.evaluate('window.AlgorithmV7.studies.length')==8
    assert p.evaluate('window.AlgorithmDepth.studies.length')==6
    assert p.evaluate('window.ALGO_COURSE.lessons.length')==21
    # Algorithmic invariants computed in the browser (independent Python labs also run).
    assert p.evaluate('window.AlgorithmV7._test.computations.lateness.at(-1).L')==1
    assert p.evaluate('window.AlgorithmV7._test.computations.caching.at(-1).misses')==4
    assert p.evaluate('window.AlgorithmV7._test.computations.huffman.at(-1).total')==71
    assert p.evaluate('window.AlgorithmV7._test.computations.karatsuba.at(-1).vars.result')==408
    assert p.evaluate('window.AlgorithmV7._test.computations.segmented.at(-1).cost')==6
    assert p.evaluate('window.AlgorithmV7._test.computations.project.best.net')==4
    assert p.evaluate('window.AlgorithmV7._test.computations.rna.dp[0][9]')>=0
    assert p.evaluate('window.AlgorithmV7._test.computations.fft[0][0]')==10
    go(p,'course/algorithm-design');assert p.locator('.o-row').count()==21
    for i,s in enumerate(p.evaluate('window.AlgorithmV7.studies.map(v=>({id:v.id,chapter:v.chapter,pdf:v.pdf}))')):
        go(p,'algo-lab/'+s['id'])
        assert p.locator('.ad-head h1').count()==1,s
        assert p.locator('.ad-topic').count()>=10,s
        assert p.locator('#v7-figure svg').count()==1,s
        assert p.locator('[data-book-pdf="algo"]').count()>=1,s
        assert p.locator('.ad-main p').count()>8,s
        old=p.locator('#v7-figure').inner_html()
        p.locator('[data-v7="next"]').click()
        assert p.locator('#v7-figure').inner_html()!=old,s
        last=p.evaluate(f'window.AlgorithmV7._test.maxSteps("{s["id"]}")')
        p.locator('#v7-range').fill(str(last))
        assert p.locator('#v7-count').inner_text()==f'{last} / {last}'
        p.locator('#v7-proof').click(); assert p.locator('#v7-proof-content').is_visible()
        p.locator('#v7-answer').click();assert p.locator('#v7-answer-content').is_visible()
        assert (root/'downloads/algorithm-labs'/('v7-'+s['id']+'.py')).exists()
        go(p,'course/algorithm-design/section-'+s['id'])
        assert p.locator('.quiz .q-opts button').count()==4,s
        assert p.locator('.p-lab a[href="#/algo-lab/'+s['id']+'"]').count()==1,s
        go(p,'book/algo/chapter/'+str(s['chapter']))
        assert p.locator('a[href="#/algo-lab/'+s['id']+'"]').count()>=1,s
    # representative unaffected routes and v6 lab
    for x in ['algo-lab/mst','course/statistical-learning','course/operating-systems','course/databases','book/algo/chapter/1']:
        go(p,x);assert p.locator('#app h1').count()>0,x
    go(p,'algo-lab/huffman');p.locator('#v7-range').fill('3')
    (root/'tests/artifacts').mkdir(parents=True,exist_ok=True)
    p.screenshot(path=str(root/'tests/artifacts/algo-v7-huffman-desktop.png'),full_page=False)
    m=b.new_page(viewport={'width':390,'height':844})
    m.on('pageerror',lambda e:errors.append('mobile: '+str(e)))
    load(m)
    for x in ['algo-lab/fft','algo-lab/rna','algo-lab/project','course/algorithm-design/section-segmented']:
        go(m,x)
        scroll,width=m.evaluate('[document.documentElement.scrollWidth,window.innerWidth]')
        assert scroll<=width+3,(x,scroll,width)
    go(m,'algo-lab/rna');m.locator('#v7-range').fill('9');m.screenshot(path=str(root/'tests/artifacts/algo-v7-rna-mobile.png'))
    assert not errors,errors
    print('PASS: 8 v7 interactive routes, 8 in-course lessons, chapter cross-links, quizzes, visual states, mobile widths, preserved earlier routes')
    b.close()
