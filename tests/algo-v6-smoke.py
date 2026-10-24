from pathlib import Path
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
import re
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
scripts=re.findall(r'<script src="(assets/[^" ]+\.js)"',html)
styles=re.findall(r'<link rel="stylesheet" href="(assets/[^" ]+\.css)"',html)
clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)
def load(p):
    p.set_content(clean,wait_until='domcontentloaded')
    p.evaluate('''() => {window.__mem={};Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>window.__mem[k]=String(v),removeItem:k=>delete window.__mem[k]}})}''')
    for file in styles:p.add_style_tag(content=(root/file).read_text())
    for file in scripts:p.add_script_tag(content=(root/file).read_text())
    p.wait_for_timeout(60)
def go(p,path):
    p.evaluate('path=>{location.hash="#/"+path}',path)
    p.wait_for_timeout(80)
with sync_playwright() as pw:
 b=launch_browser(pw)
 p=b.new_page(viewport={'width':1390,'height':850})
 errors=[];p.on('pageerror',lambda ex:errors.append(str(ex)))
 load(p)
 assert p.evaluate('window.ALGO_COURSE.lessons.length')>=13
 assert p.evaluate('window.AlgorithmDepth.studies.length')==6
 assert p.evaluate('window.AlgorithmDepth._test.ds.at(-1).dist')=={'A':0,'B':3,'C':1,'D':4,'E':7}
 assert p.evaluate('window.AlgorithmDepth._test.mt.filter(x=>x.accept).at(-1).total')==13
 assert p.evaluate('window.AlgorithmDepth._test.sm.at(-1).at(-1)')==11
 assert p.evaluate('window.AlgorithmDepth._test.am.at(-1).at(-1)')==3
 assert abs(p.evaluate('window.AlgorithmDepth._test.nx.d')-(4.04**.5))<1e-8
 assert len(p.evaluate('window.AlgorithmDepth._test.matchSteps.at(-1)'))==3
 go(p,'course/algorithm-design');assert p.locator('.o-row').count()>=13,p.locator('.o-row').count()
 studies=p.evaluate('window.AlgorithmDepth.studies.map(s=>({id:s.id,ch:s.chapter,max:window.AlgorithmDepth._test.renderers[s.id].max}))')
 for s in studies:
    go(p,'algo-lab/'+s['id'])
    assert p.locator('.ad-head h1').count()==1,(s,'title')
    assert p.locator('.ad-topic').count()>=10,(s,'content')
    assert p.locator('.ad-canvas svg').count()==1
    assert p.locator('.ad-step').count()==2
    before=p.locator('.ad-canvas').inner_html()
    p.locator('[data-step="next"]').click()
    assert before!=p.locator('.ad-canvas').inner_html(),(s,'change')
    p.locator('#ad-range').fill(str(s['max']))
    assert p.locator('#ad-count').inner_text()==f"{s['max']} / {s['max']}"
    p.locator('#ad-proof').click(); assert p.locator('#ad-proof-text').is_visible()
    p.locator('#ad-answer').click(); assert p.locator('#ad-answer-text').is_visible()
    assert p.locator('[data-book-pdf="algo"]').count()>=1
    assert (root/'downloads/algorithm-labs'/('v6-'+s['id']+'.py')).exists()
    go(p,'course/algorithm-design/section-'+s['id'])
    assert p.locator('.quiz .q-opts button').count()==4,(s,'quiz')
    assert p.locator('.p-lab a[href="#/algo-lab/'+s['id']+'"]').count()==1,(s,'not linked')
    go(p,'book/algo/chapter/'+str(s['ch']))
    assert p.locator('.ad-card-row a[href="#/algo-lab/'+s['id']+'"]').count()==1,(s,'book guide')
 for x in ['book/algo/chapter/1','book/algo/chapter/4','course/statistical-learning','course/operating-systems','course/databases']:
    go(p,x);assert p.locator('#app h1').count()>0,x
 # screenshot of a live algorithm; capture the computed final stage
 go(p,'algo-lab/mst');p.locator('#ad-range').fill('8')
 (root/'tests/artifacts').mkdir(exist_ok=True)
 p.screenshot(path=str(root/'tests/artifacts/algo-v6-mst-desktop.png'),full_page=False)
 m=b.new_page(viewport={'width':390,'height':844})
 m.on('pageerror',lambda ex:errors.append('mobile: '+str(ex)))
 load(m)
 for x in ['algo-lab/closest-pair','algo-lab/subset-sum','course/algorithm-design/section-alignment']:
    go(m,x)
    sw,w=m.evaluate('[document.documentElement.scrollWidth,window.innerWidth]')
    assert sw<=w+3,(x,sw,w)
 go(m,'algo-lab/closest-pair')
 m.screenshot(path=str(root/'tests/artifacts/algo-v6-closest-mobile.png'))
 assert not errors,errors
 print('PASS: six standalone source-mapped lab routes, six in-course lessons, book links, interactions, numeric validations, mobile width and existing routes')
 b.close()
