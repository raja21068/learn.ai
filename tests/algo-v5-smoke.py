from pathlib import Path
import re
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
scripts=re.findall(r'<script src="(assets/[^\"]+\.js)"',html)+[s for g in __import__('json').loads(re.search(r'<script type="application/json" id="lazy-scripts">(.*?)</script>',html,re.S).group(1)).values() for s in g if s.startswith('assets/')]
styles=re.findall(r'<link rel="stylesheet" href="(assets/[^\"]+\.css)"',html)
clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)
def load(p):
    p.set_content(clean,wait_until='domcontentloaded')
    p.evaluate('''() => {window.__mem={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>window.__mem[k]=String(v),removeItem:k=>delete window.__mem[k]}})}''')
    for file in styles:p.add_style_tag(content=(root/file).read_text())
    for file in scripts:p.add_script_tag(content=(root/file).read_text())
    p.wait_for_timeout(80)
def go(p,path):
    p.evaluate('path=>{location.hash="#/"+path}',path)
    p.wait_for_timeout(90)
with sync_playwright() as pw:
    b=launch_browser(pw)
    p=b.new_page(viewport={'width':1350,'height':875})
    errors=[];p.on('pageerror',lambda ex:errors.append(str(ex)))
    load(p)
    assert p.evaluate('window.ALGO_COURSE.lessons.length')>=7
    assert p.evaluate('window.BOOK_SOURCE_MAP.algo.length')==13
    assert p.evaluate('window.BOOK_SOURCE_MAP.algo.reduce((acc,item)=>acc+item.sections.length,0)')==98
    go(p,'course/algorithm-design');assert p.locator('.o-row').count()>=7
    go(p,'book/algo');assert p.locator('.bm-book-toc-grid a').count()==7
    for n in range(1,8):
        go(p,f'book/algo/chapter/{n}')
        assert p.locator('.bm-unit').count()>=8,(n,'concept units')
        assert p.locator('.bm-sidebar li').count()>0,(n,'source map')
        assert p.locator('.algo-code').count()==1
        assert p.locator('.bm-render svg').count()==1
        assert p.locator('.bm-open-pdf').count()>0
        f=p.locator('[data-book-figure^="algo-"]')
        assert f.count()==1
        before=p.locator('.bm-render').inner_html()
        f.fill('100')
        assert before!=p.locator('.bm-render').inner_html(),(n,'visual unchanged')
        p.locator('#bm-reveal').click(); assert p.locator('#bm-answer').is_visible()
        assert 'Download executable Python lab' in p.locator('.bm-article').inner_text()
        lab=list((root/'downloads/algorithm-labs').glob(f'ch{n:02d}-*.py'))
        assert len(lab)==1,(n,lab)
        go(p,f'course/algorithm-design/chapter-{n}')
        assert p.locator('.bm-inline').count()==1
        assert p.locator('.quiz .q-opts button').count()==4
        p.locator('.bm-inline summary').click()
        assert p.locator('.bm-inline .bm-render svg').count()==1
    # match visual outcomes and independent calculations against the corresponding Python lab
    assert p.evaluate('window.AlgorithmVisuals._test.stableStates.at(-1).held')=={'X':'B','Y':'C','Z':'A'}
    assert p.evaluate('window.AlgorithmVisuals._test.intervalSelect("finish").join(",")')=='B,C,D,F'
    assert p.evaluate('window.AlgorithmVisuals._test.dp.M.join(",")')=='0,5,6,10,14,15'
    assert p.evaluate('window.AlgorithmVisuals._test.flowStep[3]["s:a"]')==3
    assert p.evaluate('window.AlgorithmVisuals._test.order("BFS").join(",")')=='A,B,C,D,E,F'
    assert p.evaluate('window.AlgorithmVisuals._test.order("DFS").length')==6
    go(p,'book/algo/chapter/6')
    (root/'tests/artifacts').mkdir(exist_ok=True)
    p.screenshot(path=str(root/'tests/artifacts/algo-v5-dp-desktop.png'))
    m=b.new_page(viewport={'width':393,'height':844});m.on('pageerror',lambda ex:errors.append('mobile: '+str(ex)));load(m)
    go(m,'book/algo/chapter/1')
    m.screenshot(path=str(root/'tests/artifacts/algo-v5-matching-mobile.png'))
    sw,w=m.evaluate('[document.documentElement.scrollWidth,window.innerWidth]')
    assert sw<=w+2,(sw,w)
    assert not errors, errors
    print('PASS 7 algorithm guides, in-course lessons, interactive SVGs, proofs, quizzes, labs, mobile width, source map')
    b.close()
