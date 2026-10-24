import re
from pathlib import Path
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text(); scripts=re.findall(r'<script src="(assets/[^"]+\.js)"',html); styles=re.findall(r'<link rel="stylesheet" href="(assets/[^"]+\.css)"',html); clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)
def load_site(page):
 page.set_content(clean,wait_until='domcontentloaded');page.evaluate('''() => {window.__mem={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>{window.__mem[k]=String(v)},removeItem:k=>{delete window.__mem[k]}}});window.toggleTheme=()=>{};}''')
 for path in styles:page.add_style_tag(content=(root/path).read_text())
 for path in scripts:page.add_script_tag(content=(root/path).read_text())
 page.wait_for_timeout(60)
def go(page,frag):
 page.evaluate('(x) => {location.hash="#/"+x}',frag);page.wait_for_timeout(100)
with sync_playwright() as p:
 b=launch_browser(p)
 page=b.new_page(viewport={'width':1320,'height':900});errs=[]
 page.on('pageerror',lambda e:errs.append(str(e)))
 load_site(page);go(page,'books')
 page.wait_for_selector('.tb-book',timeout=12000)
 assert page.locator('.tb-book').count()==15
 assert 'Textbook companion library' in page.locator('h1').inner_text()
 page.locator('#tb-search').fill('virtual memory')
 assert page.locator('.tb-book').count()==1
 page.locator('#tb-search').fill('')
 go(page,'book/rl')
 page.wait_for_selector('[data-tb-fig="td"]')
 assert page.locator('.tb-ch-row').count()==17
 figure=page.locator('[data-tb-visual="td"]')
 assert '4.60' in figure.inner_text()
 page.locator('[data-tb-fig="td"]').fill('50')
 assert '3.00' in figure.inner_text()
 go(page,'book/os')
 page.wait_for_selector('[data-tb-fig="schedule"]')
 assert '4.67' in page.locator('[data-tb-visual="schedule"]').inner_text()
 page.locator('[data-tb-fig="schedule"]').fill('1')
 assert '2.33' in page.locator('[data-tb-visual="schedule"]').inner_text()
 go(page,'course/databases')
 page.wait_for_selector('.c-hero',timeout=12000)
 assert page.locator('a[href="#/books"]').count()>0
 go(page,'book/islr')
 page.wait_for_selector('[data-tb-visual="bias"]')
 page.screenshot(path=str(root/'tests/artifacts/textbook_companion_desktop.png'),full_page=True)
 mobile=b.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
 load_site(mobile);go(mobile,'books')
 mobile.wait_for_selector('.tb-book')
 assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2')
 mobile.screenshot(path=str(root/'tests/artifacts/textbook_companion_mobile.png'),full_page=False)
 print('PASS: 15 books; chapter search; RL gamma slider; OS algorithm slider; course link; desktop/mobile rendering')
 if errs: print('Page errors:',errs[:8])
 b.close()

