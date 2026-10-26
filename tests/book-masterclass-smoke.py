import re
from pathlib import Path
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from _browser import launch_browser
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parents[1]
html=(root/'index.html').read_text()
scripts=re.findall(r'<script src="(assets/[^"]+\.js)"',html)+[s for g in __import__('json').loads(re.search(r'<script type="application/json" id="lazy-scripts">(.*?)</script>',html,re.S).group(1)).values() for s in g if s.startswith('assets/')]
styles=re.findall(r'<link rel="stylesheet" href="(assets/[^"]+\.css)"',html)
clean=re.sub(r'<script\b[^>]*>.*?</script>','',html,flags=re.I|re.S)
def load(page):
    page.set_content(clean,wait_until='domcontentloaded')
    page.evaluate('''() => {window.__mem={}; Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>window.__mem[k]||null,setItem:(k,v)=>{window.__mem[k]=String(v)},removeItem:k=>{delete window.__mem[k]}}});window.toggleTheme=()=>{};}''')
    for path in styles:page.add_style_tag(content=(root/path).read_text())
    for path in scripts:page.add_script_tag(content=(root/path).read_text())
    page.wait_for_timeout(50)
def go(page,p):
    page.evaluate('x=>{location.hash="#/"+x}',p);page.wait_for_timeout(75)
with sync_playwright() as p:
 b=launch_browser(p)
 page=b.new_page(viewport={'width':1360,'height':900})
 errors=[];page.on('pageerror',lambda v: errors.append(str(v)))
 load(page)
 for book,num in [('db',16),('rl',8),('d2l',6),('os',15),('network',8)]:
  for n in range(1,num+1):
   go(page,f'book/{book}/chapter/{n}')
   assert page.locator('.bm-unit').count()>=2,(book,n)
   assert page.locator('.bm-sidebar li').count()>0,(book,n)
   assert page.locator('.bm-render svg').count()==1,(book,n)
   assert page.locator('.bm-practice button').count()==1,(book,n)
  print('Chapters render',book,num)
 go(page,'book/db/chapter/10')
 assert 'Serial outcome' in page.locator('.bm-render').inner_text()
 page.locator('[data-book-figure="schedule"]').fill('100')
 assert 'Lost update' in page.locator('.bm-render').inner_text()
 page.locator('#bm-reveal').click();assert page.locator('#bm-answer').is_visible()
 go(page,'book/db');assert page.locator('.bm-book-toc-grid a').count()==16
 go(page,'course/databases');assert page.locator('.bm-course-strip').count()==1
 for book,course,num in [('os','operating-systems',15),('network','computer-networking',8)]:
  go(page,'book/'+book);assert page.locator('.bm-book-toc-grid a').count()==num
  go(page,'course/'+course);assert page.locator('.bm-course-strip').count()==1
  go(page,'course/'+course+'/chapter-1');assert page.locator('.bm-inline').count()==1
  assert page.locator('.quiz .q-opts button').count()>=3
  assert page.locator('.p-lab').count()==1
  print('New course',course,num)
 go(page,'course/databases/why-databases');assert page.locator('.bm-lesson-link').count()==1
 go(page,'book/rl/chapter/6');page.screenshot(path=str(root/'tests/artifacts/bookmaster_rl_desktop.png'),full_page=False)
 go(page,'book/db/chapter/6');page.screenshot(path=str(root/'tests/artifacts/bookmaster_db_desktop.png'),full_page=False)
 mob=b.new_page(viewport={'width':393,'height':844},device_scale_factor=1)
 load(mob);go(mob,'book/db/chapter/6')
 mob.screenshot(path=str(root/'tests/artifacts/bookmaster_db_mobile.png'),full_page=False)
 print('mobile document',mob.evaluate('document.documentElement.scrollWidth'),mob.evaluate('window.innerWidth'))
 if mob.evaluate('document.documentElement.scrollWidth > window.innerWidth + 2'):
  print(mob.evaluate("""() => [...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:e.className?.baseVal||e.className,r:e.getBoundingClientRect().right,w:e.getBoundingClientRect().width})).filter(o=>o.r>window.innerWidth+5).sort((a,b)=>b.r-a.r).slice(0,12)"""))
 assert mob.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2')
 if errors:raise Exception('page JS errors '+repr(errors[:10]))
 print('PASS: 53 guided chapters + 2 new courses + SVG controls + mobile')
 b.close()
