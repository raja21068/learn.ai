from pathlib import Path
import re
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
scripts=re.findall(r'<script src="(assets/[^\"]+\.js)"',html)
styles=re.findall(r'<link rel="stylesheet" href="(assets/[^\"]+\.css)"',html)
clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)

def load(page):
    page.set_content(clean,wait_until='domcontentloaded')
    page.evaluate('''() => {window.__mem={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>{window.__mem[k]=String(v)},removeItem:k=>{delete window.__mem[k]}}});window.toggleTheme=()=>{};}''')
    for p in styles:page.add_style_tag(content=(root/p).read_text())
    for p in scripts:page.add_script_tag(content=(root/p).read_text())
    page.wait_for_timeout(50)
def go(page,path):
    page.evaluate('x=>{location.hash="#/"+x}',path)
    page.wait_for_timeout(85)

with sync_playwright() as p:
    b=launch_browser(p)
    page=b.new_page(viewport={'width':1440,'height':920})
    errors=[];page.on('pageerror',lambda ex:errors.append(str(ex)))
    load(page)
    print('ISLR book guides:',page.evaluate('window.BookMasterclass.data.islr.length'))
    assert page.evaluate('window.BookMasterclass.data.islr.length')==10
    assert page.evaluate('window.BOOK_SOURCE_MAP.islr.reduce((s,c)=>s+c.sections.length,0)')==180
    for n in range(1,11):
        go(page,f'book/islr/chapter/{n}')
        assert page.locator('.bm-unit').count()>=5,(n,'missing concepts')
        assert page.locator('.bm-sidebar li').count()>0,(n,'no source sections')
        assert page.locator('.bm-render svg').count()==1,(n,'no figures')
        assert page.locator('[data-book-figure^="islr-"]').count()==1,(n,'no interactive control')
        assert page.locator('#bm-answer').is_hidden()
        slider=page.locator('[data-book-figure^="islr-"]')
        before=page.locator('.bm-render').first.inner_html()
        slider.fill('0' if n==1 else '90')
        assert page.locator('.bm-render').first.inner_html()!=before,(n,'chart does not change')
        page.locator('#bm-reveal').click();assert page.locator('#bm-answer').is_visible()
        assert 'Read the entire original chapter' in page.locator('.bm-hero').inner_text()
    print('PASS: ten book guides, original SVG charts, sliders, answer reveals')
    go(page,'book/islr');assert page.locator('.bm-book-toc-grid a').count()==10
    go(page,'course/statistical-learning')
    assert page.locator('.bm-course-strip').count()==1
    for n in range(1,11):
        go(page,f'course/statistical-learning/chapter-{n}')
        assert page.locator('.bm-inline').count()==1,(n,'not integrated into course')
        assert page.locator('.quiz .q-opts button').count()==4,(n,'quiz options')
        page.locator('.bm-inline summary').click()
        assert page.locator('.bm-inline .bm-render svg').count()==1
        assert page.locator('.bm-inline [data-book-figure^="islr-"]').count()==1
        assert (root/f'downloads/r-labs/islr-ch{n:02d}.R').exists()
    print('PASS: ten in-course lessons, quiz options, embedded source charts, downloadable R scripts')
    go(page,'book/islr/chapter/5');page.screenshot(path=str(root/'tests/artifacts/islr-v4-cv-desktop.png'),full_page=False)
    mob=b.new_page(viewport={'width':393,'height':844},device_scale_factor=1)
    load(mob);go(mob,'book/islr/chapter/2')
    mob.screenshot(path=str(root/'tests/artifacts/islr-v4-bias-mobile.png'),full_page=False)
    dims=mob.evaluate('[document.documentElement.scrollWidth,window.innerWidth]')
    print('mobile width',dims)
    assert dims[0] <= dims[1]+2
    assert not errors,errors[:8]
    print('PASS: no browser errors, responsive page')
    b.close()
